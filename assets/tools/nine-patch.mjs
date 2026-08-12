import { initToolShell, downloadBlob } from './common.mjs';
import { LANGS, t } from './i18n.mjs';
import { computeNineSlice, parseNinePatchBorder, renderNinePatchBorder, validateNinePatch } from './nine-patch-core.mjs';

const EMPTY_MODEL = () => ({ stretchX: [], stretchY: [], contentX: [], contentY: [] });
const DENSITY_SCALE = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const GUIDE_COLOR = '#ff2d2d';
const GUIDE_COLOR_ALPHA = 'rgba(255, 45, 45, .95)';

function cloneModel(model) {
  return Object.fromEntries(Object.entries(model).map(([key, ranges]) => [key, ranges.map((range) => [...range])]));
}

function drawableFileName(value) {
  const base = String(value || 'drawable').toLowerCase().replace(/\.9\.png$|\.png$/i, '').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  return `${base || 'drawable'}.9.png`;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('当前浏览器不支持导出 PNG。')), 'image/png'));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function defaultStretchModel(width, height) {
  const stretchWidth = Math.max(1, Math.round(width * 0.08));
  const stretchHeight = Math.max(1, Math.round(height * 0.34));
  const stretchXStart = clamp(Math.floor((width - stretchWidth) / 2), 0, Math.max(0, width - 1));
  const stretchYStart = clamp(Math.floor((height - stretchHeight) / 2), 0, Math.max(0, height - 1));
  return {
    stretchX: [[stretchXStart, clamp(stretchXStart + stretchWidth - 1, stretchXStart, Math.max(0, width - 1))]],
    stretchY: [[stretchYStart, clamp(stretchYStart + stretchHeight - 1, stretchYStart, Math.max(0, height - 1))]],
    contentX: [[0, Math.max(0, width - 1)]],
    contentY: [[0, Math.max(0, height - 1)]]
  };
}

export function fitScaleForFrame(borderWidth, borderHeight, frameWidth, frameHeight, padding = 40) {
  const availableWidth = Math.max(1, frameWidth - padding);
  const availableHeight = Math.max(1, frameHeight - padding);
  const rawScale = Math.min(availableWidth / Math.max(1, borderWidth), availableHeight / Math.max(1, borderHeight));
  return Math.max(1, Math.min(8, Math.floor(rawScale)));
}

export function markerHandleAtPoint(x, y, model, mode, width, height, tolerance = 3) {
  const xKey = mode === 'padding' ? 'contentX' : 'stretchX';
  const yKey = mode === 'padding' ? 'contentY' : 'stretchY';
  const xRange = model[xKey]?.[0];
  const yRange = model[yKey]?.[0];
  const handles = [];

  if (xRange) {
    handles.push({ key: xKey, edge: 'start', axis: 'x', line: xRange[0] + 1, min: 0, max: xRange[1] });
    handles.push({ key: xKey, edge: 'end', axis: 'x', line: xRange[1] + 2, min: xRange[0], max: width - 1 });
  }
  if (yRange) {
    handles.push({ key: yKey, edge: 'start', axis: 'y', line: yRange[0] + 1, min: 0, max: yRange[1] });
    handles.push({ key: yKey, edge: 'end', axis: 'y', line: yRange[1] + 2, min: yRange[0], max: height - 1 });
  }

  return handles.find((handle) => Math.abs((handle.axis === 'x' ? x : y) - handle.line) <= tolerance) || null;
}

export function dragMarkerLine(model, handle, x, y) {
  const next = cloneModel(model);
  const range = next[handle.key]?.[0];
  if (!range) return next;
  const rawCoordinate = handle.axis === 'x' ? x - (handle.edge === 'start' ? 1 : 2) : y - (handle.edge === 'start' ? 1 : 2);
  const coordinate = clamp(Math.round(rawCoordinate), handle.min, handle.max);
  if (handle.edge === 'start') range[0] = coordinate;
  else range[1] = coordinate;
  return next;
}

export function dimensionDistances(coordinate, edge, size) {
  const boundary = coordinate + (edge === 'start' ? 0 : 1);
  return { before: boundary, after: size - boundary };
}

function scaleRanges(ranges, scale, max) {
  return (ranges ?? []).map(([start, end]) => [
    clamp(Math.floor(start * scale), 0, max),
    clamp(Math.max(0, Math.ceil((end + 1) * scale) - 1), 0, max)
  ]).filter(([start, end]) => start <= end);
}

function scaledSourceAndModel(source, model, scale) {
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.drawImage(source.canvas, 0, 0, width, height);
  const data = context.getImageData(0, 0, width, height).data;
  return {
    source: { canvas, width, height, data },
    model: {
      stretchX: scaleRanges(model.stretchX, scale, width - 1),
      stretchY: scaleRanges(model.stretchY, scale, height - 1),
      contentX: scaleRanges(model.contentX, scale, width - 1),
      contentY: scaleRanges(model.contentY, scale, height - 1)
    }
  };
}

async function scaledNinePatchBlob(source, model, scale) {
  const scaled = scaledSourceAndModel(source, model, scale);
  const border = renderNinePatchBorder(scaled.source, scaled.model);
  const output = document.createElement('canvas');
  output.width = border.width;
  output.height = border.height;
  output.getContext('2d').putImageData(new ImageData(border.data, border.width, border.height), 0, 0);
  return canvasBlob(output);
}

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('选择的文件不是可读取的 PNG。')); };
    image.src = url;
  });
}

function initNinePatchPage() {
  const pageDictionaries = Object.fromEntries(LANGS.map((lang) => [lang, {
    meta_title: t(lang, 'nine_title'),
    meta_description: t(lang, 'nine_lead')
  }]));
  let currentLang = initToolShell(pageDictionaries);
  const $ = (id) => document.getElementById(id);
  const elements = Object.fromEntries(['nineFileInput', 'drawableName', 'sourceDensity', 'editCanvas', 'guideCanvas', 'editorCanvasStack', 'editCanvasFrame', 'emptyEditor', 'modeStretch', 'modePadding', 'editorBackground', 'autoStretch', 'previewCanvas', 'previewFrame', 'previewWidth', 'previewHeight', 'exportDensityGroup', 'nineStatus', 'downloadNine'].map((id) => [id, $(id)]));
  const state = { source: null, model: EMPTY_MODEL(), initial: EMPTY_MODEL(), mode: 'stretch', history: [], future: [], dragging: null, previewDragging: null, editorScale: 1 };
  const editorContext = elements.editCanvas.getContext('2d', { willReadFrequently: true });
  const guideContext = elements.guideCanvas.getContext('2d');
  const previewContext = elements.previewCanvas.getContext('2d');

  const dimensions = () => state.source ? { width: state.source.width, height: state.source.height } : { width: 0, height: 0 };
  const currentModel = () => ({ ...state.model, ...dimensions() });

  function status(messages = []) {
    elements.nineStatus.replaceChildren(...messages.map((item) => { const line = document.createElement('div'); line.dataset.severity = item.severity; line.textContent = item.message; return line; }));
  }

  function validation() {
    if (!state.source) return [{ severity: 'warning', message: t(currentLang, 'nine_initial_status') }];
    return validateNinePatch(state.model, state.source.width, state.source.height, drawableFileName(elements.drawableName.value));
  }

  function pushHistory() {
    state.history.push(cloneModel(state.model));
    if (state.history.length > 50) state.history.shift();
    state.future = [];
  }

  function setModel(next, save = true) {
    if (save) pushHistory();
    state.model = cloneModel(next);
    render();
  }

  function applyEditorFit() {
    if (!state.source) return;
    const scale = fitScaleForFrame(state.source.width + 2, state.source.height + 2, elements.editCanvasFrame.clientWidth, elements.editCanvasFrame.clientHeight);
    state.editorScale = scale;
    const displayWidth = (state.source.width + 2) * scale;
    const displayHeight = (state.source.height + 2) * scale;
    elements.editorCanvasStack.style.width = `${displayWidth}px`;
    elements.editorCanvasStack.style.height = `${displayHeight}px`;
    elements.editCanvas.style.width = `${displayWidth}px`;
    elements.editCanvas.style.height = `${displayHeight}px`;
  }

  function updateControls() {
    const loaded = Boolean(state.source);
    const errors = validation().filter((item) => item.severity === 'error');
    elements.autoStretch.disabled = !loaded;
    elements.downloadNine.disabled = !loaded || Boolean(errors.length);
    updateDownloadLabel();
  }

  function selectedExportDensities() {
    return Array.from(elements.exportDensityGroup.querySelectorAll('input[name="exportDensity"]:checked')).map((input) => input.value);
  }

  function updateDownloadLabel() {
    elements.downloadNine.textContent = selectedExportDensities().length > 1 ? t(currentLang, 'zip_download') : t(currentLang, 'download_nine');
  }

  function drawEditorBackground(context, width, height) {
    const background = elements.editorBackground.value;
    context.save();
    context.globalCompositeOperation = 'destination-over';
    if (background === 'checker') {
      const tileSize = Math.max(4, Math.round(8 / Math.max(0.1, state.editorScale)));
      for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
          context.fillStyle = ((x / tileSize + y / tileSize) % 2) ? '#ffffff' : '#e8ebf2';
          context.fillRect(x, y, tileSize, tileSize);
        }
      }
    } else {
      context.fillStyle = background === 'dark' ? '#565656' : '#f2f2f2';
      context.fillRect(0, 0, width, height);
    }
    context.restore();
  }

  function drawMarkerGuides(context, model, mode, width, height, scale, dpr) {
    context.save();
    context.lineWidth = 1;
    context.setLineDash([6 * dpr, 4 * dpr]);
    context.strokeStyle = GUIDE_COLOR_ALPHA;

    const rangesX = mode === 'padding' ? model.contentX : model.stretchX;
    const rangesY = mode === 'padding' ? model.contentY : model.stretchY;

    for (const [start, end] of rangesX) {
      const startX = Math.round((start + 1) * scale * dpr) + 0.5;
      const endX = Math.round((end + 2) * scale * dpr) + 0.5;
      context.beginPath();
      context.moveTo(startX, 0);
      context.lineTo(startX, (height + 2) * scale * dpr);
      context.moveTo(endX, 0);
      context.lineTo(endX, (height + 2) * scale * dpr);
      context.stroke();
    }

    for (const [start, end] of rangesY) {
      const startY = Math.round((start + 1) * scale * dpr) + 0.5;
      const endY = Math.round((end + 2) * scale * dpr) + 0.5;
      context.beginPath();
      context.moveTo(0, startY);
      context.lineTo((width + 2) * scale * dpr, startY);
      context.moveTo(0, endY);
      context.lineTo((width + 2) * scale * dpr, endY);
      context.stroke();
    }

    context.restore();
  }

  function drawDimensionLines(context, model, mode, width, height, scale, dpr) {
    if (!state.dragging) return;
    const xRange = (mode === 'padding' ? model.contentX : model.stretchX)?.[0];
    const yRange = (mode === 'padding' ? model.contentY : model.stretchY)?.[0];
    if (!xRange || !yRange) return;

    const fontSize = 13 * dpr;
    context.save();
    context.setLineDash([]);
    context.lineWidth = Math.max(1, dpr);
    context.strokeStyle = GUIDE_COLOR;
    context.font = `700 ${fontSize}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = GUIDE_COLOR;

    const drawText = (value, x, y) => {
      context.lineWidth = 3 * dpr;
      context.strokeStyle = 'rgba(255,255,255,.92)';
      context.strokeText(String(value), x, y);
      context.fillStyle = GUIDE_COLOR;
      context.fillText(String(value), x, y);
    };
    const drawHorizontalMeasure = (start, end, y, value) => {
      if (end <= start) return;
      const tick = 4 * dpr;
      context.lineWidth = Math.max(1, dpr);
      context.strokeStyle = GUIDE_COLOR;
      context.beginPath();
      context.moveTo(start, y);
      context.lineTo(end, y);
      context.moveTo(start, y - tick);
      context.lineTo(start, y + tick);
      context.moveTo(end, y - tick);
      context.lineTo(end, y + tick);
      context.stroke();
      drawText(value, (start + end) / 2, y - 11 * dpr);
    };
    const drawVerticalMeasure = (start, end, x, value) => {
      if (end <= start) return;
      const tick = 4 * dpr;
      context.lineWidth = Math.max(1, dpr);
      context.strokeStyle = GUIDE_COLOR;
      context.beginPath();
      context.moveTo(x, start);
      context.lineTo(x, end);
      context.moveTo(x - tick, start);
      context.lineTo(x + tick, start);
      context.moveTo(x - tick, end);
      context.lineTo(x + tick, end);
      context.stroke();
      drawText(value, x + 16 * dpr, (start + end) / 2);
    };

    if (state.dragging.axis === 'x') {
      const coordinate = state.dragging.edge === 'start' ? xRange[0] : xRange[1];
      const distances = dimensionDistances(coordinate, state.dragging.edge, width);
      const outerLeft = scale * dpr;
      const outerRight = (width + 1) * scale * dpr;
      const lineX = (coordinate + (state.dragging.edge === 'start' ? 1 : 2)) * scale * dpr;
      const measureY = (height + 2) * scale * dpr / 2;
      drawHorizontalMeasure(outerLeft, lineX, measureY, distances.before);
      drawHorizontalMeasure(lineX, outerRight, measureY, distances.after);
    } else {
      const coordinate = state.dragging.edge === 'start' ? yRange[0] : yRange[1];
      const distances = dimensionDistances(coordinate, state.dragging.edge, height);
      const outerTop = scale * dpr;
      const outerBottom = (height + 1) * scale * dpr;
      const lineY = (coordinate + (state.dragging.edge === 'start' ? 1 : 2)) * scale * dpr;
      const measureX = (width + 2) * scale * dpr / 2;
      drawVerticalMeasure(outerTop, lineY, measureX, distances.before);
      drawVerticalMeasure(lineY, outerBottom, measureX, distances.after);
    }
    context.restore();
  }

  function renderGuides() {
    if (!state.source) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const displayWidth = (state.source.width + 2) * state.editorScale;
    const displayHeight = (state.source.height + 2) * state.editorScale;
    elements.guideCanvas.width = Math.round(displayWidth * dpr);
    elements.guideCanvas.height = Math.round(displayHeight * dpr);
    elements.guideCanvas.style.width = `${displayWidth}px`;
    elements.guideCanvas.style.height = `${displayHeight}px`;
    guideContext.clearRect(0, 0, elements.guideCanvas.width, elements.guideCanvas.height);
    drawMarkerGuides(guideContext, state.model, state.mode, state.source.width, state.source.height, state.editorScale, dpr);
    drawDimensionLines(guideContext, state.model, state.mode, state.source.width, state.source.height, state.editorScale, dpr);
  }

  function renderEditor() {
    if (!state.source) return;
    const border = renderNinePatchBorder(state.source, state.model);
    elements.editCanvas.width = border.width;
    elements.editCanvas.height = border.height;
    editorContext.putImageData(new ImageData(border.data, border.width, border.height), 0, 0);
    drawEditorBackground(editorContext, border.width, border.height);
    applyEditorFit();
    renderGuides();
  }

  function renderPreview() {
    const width = Math.max(1, Number(elements.previewWidth.value) || 1);
    const height = Math.max(1, Number(elements.previewHeight.value) || 1);
    elements.previewCanvas.width = width;
    elements.previewCanvas.height = height;
    elements.previewFrame.className = 'canvas-frame preview-frame';
    previewContext.clearRect(0, 0, width, height);
    if (!state.source) return;
    const result = computeNineSlice(currentModel(), width, height);
    if (result.error) return;
    for (const slice of result.slices) previewContext.drawImage(state.source.canvas, slice.source.x, slice.source.y, slice.source.width, slice.source.height, slice.target.x, slice.target.y, slice.target.width, slice.target.height);
  }

  function render() {
    renderEditor();
    renderPreview();
    status(validation());
    updateControls();
  }

  function canvasPoint(event) {
    const rect = elements.editCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * elements.editCanvas.width / rect.width,
      y: (event.clientY - rect.top) * elements.editCanvas.height / rect.height
    };
  }

  function updateCursor(event) {
    if (!state.source || state.dragging) return;
    const point = canvasPoint(event);
    const handle = markerHandleAtPoint(point.x, point.y, state.model, state.mode, state.source.width, state.source.height, Math.max(3, 6 / state.editorScale));
    elements.editCanvas.style.cursor = handle ? (handle.axis === 'x' ? 'col-resize' : 'row-resize') : 'default';
  }

  function startDrag(event) {
    if (!state.source || event.button !== 0) return;
    const point = canvasPoint(event);
    const handle = markerHandleAtPoint(point.x, point.y, state.model, state.mode, state.source.width, state.source.height, Math.max(3, 6 / state.editorScale));
    if (!handle) return;
    event.preventDefault();
    elements.editCanvas.setPointerCapture(event.pointerId);
    pushHistory();
    state.dragging = handle;
  }

  function continueDrag(event) {
    if (!state.dragging || !state.source) {
      updateCursor(event);
      return;
    }
    const point = canvasPoint(event);
    state.model = dragMarkerLine(state.model, state.dragging, point.x, point.y);
    render();
  }

  function startPreviewResize(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    if (event.pointerId != null && event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
    state.previewDragging = {
      pointerId: event.pointerId ?? null,
      startX: event.clientX,
      startY: event.clientY,
      width: Math.max(1, Number(elements.previewWidth.value) || 1),
      height: Math.max(1, Number(elements.previewHeight.value) || 1)
    };
  }

  function continuePreviewResize(event) {
    if (!state.previewDragging) return;
    if (state.previewDragging.pointerId != null && event.pointerId != null && state.previewDragging.pointerId !== event.pointerId) return;
    event.preventDefault();
    const nextWidth = clamp(Math.round(state.previewDragging.width + event.clientX - state.previewDragging.startX), 24, 1200);
    const nextHeight = clamp(Math.round(state.previewDragging.height + event.clientY - state.previewDragging.startY), 24, 1200);
    elements.previewWidth.value = String(nextWidth);
    elements.previewHeight.value = String(nextHeight);
    render();
  }

  function endPreviewResize(event) {
    if (!state.previewDragging) return;
    if (state.previewDragging.pointerId != null && event.pointerId != null && state.previewDragging.pointerId !== event.pointerId) return;
    state.previewDragging = null;
  }

  async function loadFile(file) {
    if (!file) return;
    if (file.type && file.type !== 'image/png') {
      status([{ severity: 'error', message: '请选择 PNG 文件。' }]);
      return;
    }

    try {
      const image = await decodeImage(file);
      const full = document.createElement('canvas');
      full.width = image.naturalWidth;
      full.height = image.naturalHeight;
      full.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0);
      const isNine = /\.9\.png$/i.test(file.name);
      let model = EMPTY_MODEL();
      let source = full;

      if (isNine) {
        if (full.width < 3 || full.height < 3) throw new Error('这个 .9.png 太小，无法包含边框标记。');
        model = parseNinePatchBorder(full.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, full.width, full.height));
        source = document.createElement('canvas');
        source.width = full.width - 2;
        source.height = full.height - 2;
        source.getContext('2d').drawImage(full, 1, 1, source.width, source.height, 0, 0, source.width, source.height);
      }

      if (!model.stretchX.length || !model.stretchY.length) model = defaultStretchModel(source.width, source.height);
      if (!model.contentX.length) model.contentX = [[0, Math.max(0, source.width - 1)]];
      if (!model.contentY.length) model.contentY = [[0, Math.max(0, source.height - 1)]];

      state.source = { canvas: source, width: source.width, height: source.height, data: source.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, source.width, source.height).data };
      state.model = model;
      state.initial = cloneModel(model);
      state.history = [];
      state.future = [];
      elements.drawableName.value = drawableFileName(file.name).replace(/\.9\.png$/, '');
      elements.editorCanvasStack.hidden = false;
      elements.emptyEditor.hidden = true;
      render();
    } catch (error) {
      status([{ severity: 'error', message: error.message || '无法加载这张图片。' }]);
    }
  }

  function loadDroppedFile(event) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    loadFile(file);
  }

  function prepareDrag(event) {
    event.preventDefault();
  }

  elements.nineFileInput.addEventListener('change', () => { loadFile(elements.nineFileInput.files[0]); elements.nineFileInput.value = ''; });
  [document.body, elements.editCanvasFrame].forEach((target) => {
    target.addEventListener('dragenter', prepareDrag);
    target.addEventListener('dragover', prepareDrag);
    target.addEventListener('drop', loadDroppedFile);
  });
  elements.modeStretch.addEventListener('click', () => { state.mode = 'stretch'; elements.modeStretch.setAttribute('aria-pressed', 'true'); elements.modePadding.setAttribute('aria-pressed', 'false'); renderEditor(); });
  elements.modePadding.addEventListener('click', () => { state.mode = 'padding'; elements.modeStretch.setAttribute('aria-pressed', 'false'); elements.modePadding.setAttribute('aria-pressed', 'true'); renderEditor(); });
  elements.editCanvas.addEventListener('pointerdown', startDrag);
  elements.editCanvas.addEventListener('pointermove', continueDrag);
  ['pointerup', 'pointercancel'].forEach((type) => elements.editCanvas.addEventListener(type, () => { state.dragging = null; elements.editCanvas.style.cursor = 'default'; renderEditor(); }));
  elements.editCanvas.addEventListener('contextmenu', (event) => event.preventDefault());
  elements.previewCanvas.addEventListener('pointerdown', startPreviewResize);
  [elements.previewFrame, elements.previewCanvas].forEach((target) => target.addEventListener('pointermove', continuePreviewResize));
  ['pointerup', 'pointercancel'].forEach((type) => {
    elements.previewFrame.addEventListener(type, endPreviewResize);
    elements.previewCanvas.addEventListener(type, endPreviewResize);
  });
  elements.previewCanvas.addEventListener('mousedown', startPreviewResize);
  document.addEventListener('mousemove', continuePreviewResize);
  document.addEventListener('mouseup', endPreviewResize);
  elements.editorBackground.addEventListener('input', renderEditor);
  elements.exportDensityGroup.addEventListener('change', updateDownloadLabel);
  document.addEventListener('image-tools:languagechange', (event) => {
    currentLang = event.detail?.lang || currentLang;
    status(validation());
    updateDownloadLabel();
  });
  [elements.previewWidth, elements.previewHeight].forEach((element) => element.addEventListener('input', render));
  elements.drawableName.addEventListener('input', render);
  elements.autoStretch.addEventListener('click', () => { if (state.source) setModel(defaultStretchModel(state.source.width, state.source.height)); });
  elements.downloadNine.addEventListener('click', async () => {
    const errors = validation().filter((item) => item.severity === 'error');
    if (errors.length || !state.source) return;
    const densities = selectedExportDensities();
    if (!densities.length) {
      status([{ severity: 'error', message: '请至少选择一个导出倍数。' }]);
      return;
    }
    const sourceDensity = DENSITY_SCALE[elements.sourceDensity.value] || 1;
    const baseName = drawableFileName(elements.drawableName.value);
    try {
      if (densities.length === 1) {
        const density = densities[0];
        const blob = await scaledNinePatchBlob(state.source, state.model, (DENSITY_SCALE[density] || 1) / sourceDensity);
        downloadBlob(blob, `${density}-${baseName}`);
        return;
      }
      const zip = new globalThis.JSZip();
      for (const density of densities) {
        const blob = await scaledNinePatchBlob(state.source, state.model, (DENSITY_SCALE[density] || 1) / sourceDensity);
        zip.file(`drawable-${density}/${baseName}`, blob);
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), `${baseName.replace(/\.9\.png$/, '')}-nine-patch.zip`);
    } catch (error) {
      status([{ severity: 'error', message: error.message }]);
    }
  });
  window.addEventListener('resize', applyEditorFit);
  render();
}

if (typeof document !== 'undefined') initNinePatchPage();
