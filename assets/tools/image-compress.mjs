import { initToolShell, downloadBlob } from './common.mjs';
import { LANGS, formatBytes, t } from './i18n.mjs';
import { buildOutputPlan, percentSaved, validateImageFile } from './image-core.mjs';

const QUALITY_PRESETS = { high: 0.9, balanced: 0.8, small: 0.7 };

export function normalizeHexColor(value) {
  const hex = String(value || '').trim().replace(/^#/, '').toUpperCase();
  return /^[0-9A-F]{6}$/.test(hex) ? `#${hex}` : null;
}

export function getCompressActionState(items, processing, lang = 'en-US') {
  const hasFiles = items.length > 0;
  const allReady = hasFiles && items.every((item) => item.status === 'ready');
  const hasReady = items.some((item) => item.status === 'ready');
  return {
    label: t(lang, allReady ? 'recompress' : 'start_compress'),
    clearDisabled: !hasFiles || processing,
    processDisabled: !hasFiles || processing,
    downloadDisabled: !hasReady || processing
  };
}

export class ImageBatchQueue {
  constructor({ processItem, onChange = () => {}, download = downloadBlob } = {}) {
    this.items = [];
    this.processing = false;
    this.processItem = processItem;
    this.onChange = onChange;
    this.download = download;
    this.usedNames = new Set();
    this.cancelToken = 0;
    this.currentRun = null;
  }

  emit() { this.onChange(this); }

  add(files) {
    const added = [];
    const rejected = [];
    for (const file of files || []) {
      const validation = validateImageFile(file, this.items.length);
      if (!validation.ok) { rejected.push({ file, code: validation.code }); continue; }
      const item = { file, status: 'queued', result: null, plan: null, error: '', notice: '' };
      this.items.push(item); added.push(item);
    }
    this.emit();
    return { added, rejected };
  }

  remove(item) {
    if (item?.status === 'processing') return false;
    const index = this.items.indexOf(item);
    if (index < 0) return false;
    this.items.splice(index, 1); this.emit(); return true;
  }

  clear() {
    if (this.processing || !this.items.length) return false;
    this.items = [];
    this.usedNames.clear();
    this.emit();
    return true;
  }

  requeueReady() {
    if (this.processing) return false;
    let changed = false;
    this.items.filter((item) => item.status === 'ready').forEach((item) => {
      item.status = 'queued'; item.result = null; item.plan = null; item.error = ''; item.notice = '';
      changed = true;
    });
    if (changed) { this.usedNames.clear(); this.emit(); }
    return changed;
  }

  retry(item) {
    if (!item || item.status === 'processing') return false;
    item.status = 'queued'; item.error = ''; item.notice = ''; item.result = null; item.plan = null;
    this.emit(); return true;
  }

  invalidateResults() {
    this.usedNames.clear();
    this.items.filter((item) => item.status === 'ready').forEach((item) => {
      item.status = 'queued'; item.result = null; item.plan = null; item.notice = ''; item.noticeKey = 'changed_reprocess';
    });
    this.emit();
  }

  cancelAll() {
    this.cancelToken += 1;
    this.items.filter((item) => item.status === 'processing').forEach((item) => { item.status = 'queued'; item.notice = ''; item.noticeKey = 'cancelled_reprocess'; });
    this.emit();
    return this.currentRun || Promise.resolve();
  }

  async processAll(settings) {
    if (this.processing) return this.currentRun;
    if (typeof this.processItem !== 'function') return undefined;
    this.processing = true; this.usedNames.clear(); this.emit();
    const token = this.cancelToken;
    const pending = this.items.filter((item) => item.status === 'queued');
    let index = 0;
    const worker = async () => {
      while (index < pending.length && token === this.cancelToken) {
        const item = pending[index++]; item.status = 'processing'; this.emit();
        try {
          const processed = await this.processItem(item, settings, this.usedNames);
          if (token !== this.cancelToken) continue;
          item.result = processed.blob; item.plan = processed.plan; item.notice = processed.notice || ''; item.status = 'ready';
        } catch (error) {
          if (token !== this.cancelToken) continue;
          item.status = 'error'; item.error = error?.message || ''; item.errorKey = 'cannot_process_image';
        }
        this.emit();
      }
    };
    const run = Promise.all(Array.from({ length: Math.min(2, pending.length) }, worker)).finally(() => {
      if (this.currentRun === run) {
        this.processing = false;
        this.currentRun = null;
        this.emit();
      }
    });
    this.currentRun = run;
    return run;
  }

  downloadOne(item) {
    if (item?.status !== 'ready' || !item.result || !item.plan) return false;
    this.download(item.result, item.plan.fileName); return true;
  }

  async downloadZip() {
    const ready = this.items.filter((item) => item.status === 'ready' && item.result && item.plan);
    if (!ready.length || !globalThis.JSZip) return false;
    const zip = new globalThis.JSZip();
    ready.forEach((item) => zip.file(item.plan.fileName, item.result));
    this.download(await zip.generateAsync({ type: 'blob' }), 'compressed-images.zip');
    return true;
  }
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('无法读取图片')); };
    image.src = url;
  });
}

async function decodeImage(file) {
  if (globalThis.createImageBitmap) {
    try { return await globalThis.createImageBitmap(file); } catch (_) { /* Fall through to HTMLImageElement. */ }
  }
  return loadImageElement(file);
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('当前浏览器不支持这种图片格式')), mimeType, quality));
}

async function encodeOutput(canvas, plan) {
  if (plan.mimeType !== 'image/png') return { blob: await canvasToBlob(canvas, plan.mimeType, plan.quality) };
  if (globalThis.UPNG?.encode) {
    const rgba = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = plan.quality <= 0.65 ? 64 : plan.quality <= 0.8 ? 256 : 0;
    return { blob: new Blob([globalThis.UPNG.encode([rgba.buffer], canvas.width, canvas.height, colors)], { type: 'image/png' }) };
  }
  return { blob: await canvasToBlob(canvas, 'image/png'), notice: '已使用兼容模式导出 PNG' };
}

async function processBrowserImage(item, settings, usedNames) {
  const image = await decodeImage(item.file);
  try {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const plan = buildOutputPlan({ name: item.file.name, width, height }, { ...settings, usedNames });
    const source = document.createElement('canvas'); source.width = width; source.height = height;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    if (plan.mimeType === 'image/jpeg') { sourceContext.fillStyle = plan.background; sourceContext.fillRect(0, 0, width, height); }
    sourceContext.drawImage(image, 0, 0);
    const canvas = document.createElement('canvas'); canvas.width = plan.width; canvas.height = plan.height;
    if (globalThis.pica && (source.width !== canvas.width || source.height !== canvas.height)) await globalThis.pica().resize(source, canvas);
    else canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return { plan, ...(await encodeOutput(canvas, plan)) };
  } finally { image.close?.(); }
}

const LUCIDE_ICONS = {
  download: [
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
    ['polyline', { points: '7 10 12 15 17 10' }],
    ['line', { x1: '12', x2: '12', y1: '15', y2: '3' }]
  ],
  'trash-2': [
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
    ['path', { d: 'M19 6l-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6' }],
    ['line', { x1: '10', x2: '10', y1: '11', y2: '17' }],
    ['line', { x1: '14', x2: '14', y1: '11', y2: '17' }]
  ]
};

function createLucideIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('lucide', `lucide-${name}`);
  LUCIDE_ICONS[name].forEach(([tag, attributes]) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    svg.append(node);
  });
  return svg;
}

function createFileAction(label, icon, onClick) {
  const button = document.createElement('button');
  button.className = 'icon-button';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.append(createLucideIcon(icon));
  button.addEventListener('click', onClick);
  return button;
}

function compressPageDictionaries() {
  return Object.fromEntries(LANGS.map((lang) => [lang, {
    meta_title: t(lang, 'compress_title'),
    meta_description: t(lang, 'compress_description')
  }]));
}

function initBrowserPage() {
  let currentLang = initToolShell(compressPageDictionaries());
  const $ = (id) => document.getElementById(id);
  const elements = Object.fromEntries(['fileInput', 'dropzone', 'chooseFiles', 'outputFormat', 'qualityPreset', 'customQuality', 'qualityValue', 'resizeMode', 'resizeValue', 'jpgBackground', 'jpgBackgroundHex', 'clearAll', 'processAll', 'downloadZip', 'fileList', 'queueSummary'].map((id) => [id, $(id)]));
  const currentSettings = () => {
    const preset = elements.qualityPreset.value;
    const resizeMode = elements.resizeMode.value;
    return { format: elements.outputFormat.value, quality: preset === 'custom' ? Number(elements.customQuality.value) / 100 : QUALITY_PRESETS[preset], resize: resizeMode === 'original' ? {} : { mode: resizeMode, value: Number(elements.resizeValue.value) }, background: elements.jpgBackground.value };
  };
  const setConditionalControls = () => {
    document.querySelector('.custom-quality').classList.toggle('is-visible', elements.qualityPreset.value === 'custom');
    document.querySelector('.resize-value').classList.toggle('is-visible', elements.resizeMode.value !== 'original');
    document.querySelector('.jpg-options').classList.toggle('is-visible', elements.outputFormat.value === 'jpg');
    elements.qualityValue.value = elements.customQuality.value;
  };
  const itemNotice = (item) => item.noticeKey ? t(currentLang, item.noticeKey) : item.notice;
  const statusText = (item) => item.status === 'ready'
    ? `${formatBytes(item.file.size, currentLang)} → ${formatBytes(item.result.size, currentLang)} (${percentSaved(item.file.size, item.result.size)}% saved)${itemNotice(item) ? ` · ${itemNotice(item)}` : ''}`
    : item.status === 'error'
      ? (item.error || t(currentLang, item.errorKey || 'cannot_process_image'))
      : item.status === 'processing'
        ? t(currentLang, 'processing')
        : itemNotice(item) || formatBytes(item.file.size, currentLang);
  const queue = new ImageBatchQueue({ processItem: processBrowserImage, onChange: render });
  function render() {
    elements.fileList.replaceChildren(...queue.items.map((item) => {
      const row = document.createElement('li'); row.className = 'file-item';
      const info = document.createElement('div'); const name = document.createElement('div'); name.className = 'file-name'; name.textContent = item.file.name;
      const meta = document.createElement('div'); meta.className = 'file-meta'; meta.textContent = item.file.type.replace('image/', '').toUpperCase(); info.append(name, meta);
      const status = document.createElement('div'); status.className = 'file-status'; status.dataset.state = item.status; status.textContent = statusText(item);
      const actions = document.createElement('div'); actions.className = 'file-actions';
      if (item.status === 'ready') actions.append(createFileAction(t(currentLang, 'download'), 'download', () => queue.downloadOne(item)));
      if (item.status === 'error') { const button = document.createElement('button'); button.className = 'icon-button'; button.type = 'button'; button.textContent = t(currentLang, 'retry'); button.addEventListener('click', () => queue.retry(item)); actions.append(button); }
      if (item.status !== 'processing') actions.append(createFileAction(t(currentLang, 'remove'), 'trash-2', () => queue.remove(item)));
      row.append(info, status, actions); return row;
    }));
    const hasFiles = queue.items.length > 0;
    const actionState = getCompressActionState(queue.items, queue.processing, currentLang);
    elements.clearAll.disabled = actionState.clearDisabled;
    elements.processAll.disabled = actionState.processDisabled;
    elements.processAll.textContent = actionState.label;
    elements.downloadZip.disabled = actionState.downloadDisabled;
    elements.queueSummary.textContent = hasFiles ? t(currentLang, 'files_count', { count: queue.items.length }) : t(currentLang, 'no_images_selected');
  }
  document.addEventListener('image-tools:languagechange', (event) => {
    currentLang = event.detail?.lang || currentLang;
    render();
  });
  const addFiles = (files) => queue.add(files);
  elements.chooseFiles.addEventListener('click', (event) => { event.stopPropagation(); elements.fileInput.click(); });
  elements.dropzone.addEventListener('click', () => elements.fileInput.click());
  elements.dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); elements.fileInput.click(); } });
  elements.fileInput.addEventListener('change', () => { addFiles(elements.fileInput.files); elements.fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach((type) => elements.dropzone.addEventListener(type, (event) => { event.preventDefault(); elements.dropzone.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach((type) => elements.dropzone.addEventListener(type, (event) => { event.preventDefault(); elements.dropzone.classList.remove('is-dragging'); }));
  elements.dropzone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
  [elements.outputFormat, elements.qualityPreset, elements.resizeMode, elements.resizeValue].forEach((element) => element.addEventListener('change', () => { setConditionalControls(); queue.invalidateResults(); }));
  elements.jpgBackground.addEventListener('input', () => {
    elements.jpgBackgroundHex.value = elements.jpgBackground.value.slice(1).toUpperCase();
    queue.invalidateResults();
  });
  elements.jpgBackgroundHex.addEventListener('input', () => {
    const sanitized = elements.jpgBackgroundHex.value.replace(/^#/, '').replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase();
    elements.jpgBackgroundHex.value = sanitized;
    const color = normalizeHexColor(sanitized);
    if (color) { elements.jpgBackground.value = color; queue.invalidateResults(); }
  });
  elements.jpgBackgroundHex.addEventListener('change', () => {
    const color = normalizeHexColor(elements.jpgBackgroundHex.value);
    if (color) elements.jpgBackground.value = color;
    elements.jpgBackgroundHex.value = elements.jpgBackground.value.slice(1).toUpperCase();
  });
  elements.customQuality.addEventListener('input', () => { setConditionalControls(); queue.invalidateResults(); });
  elements.clearAll.addEventListener('click', () => queue.clear());
  elements.processAll.addEventListener('click', () => {
    if (queue.items.length && queue.items.every((item) => item.status === 'ready')) queue.requeueReady();
    queue.items.filter((item) => item.status === 'error').forEach((item) => queue.retry(item));
    queue.processAll(currentSettings());
  });
  elements.downloadZip.addEventListener('click', () => queue.downloadZip());
  setConditionalControls(); render();
}

if (typeof document !== 'undefined') initBrowserPage();
