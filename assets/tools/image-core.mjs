export const MAX_FILES = Number.POSITIVE_INFINITY;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const SUPPORTED_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

const FORMAT_TYPES = Object.freeze({
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
});

function finitePositive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function normalizeFormat(format, fallback = 'png') {
  const value = String(format || fallback).toLowerCase().replace(/^image\//, '');
  return value === 'jpeg' ? 'jpg' : (FORMAT_TYPES[value] ? value : fallback);
}

export function validateImageFile(file, index = 0) {
  if (!file || typeof file !== 'object') {
    return { ok: false, code: 'invalid_file' };
  }
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { ok: false, code: 'unsupported_type' };
  }
  if (!Number.isFinite(file.size) || file.size < 0) {
    return { ok: false, code: 'invalid_file' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, code: 'file_too_large' };
  }
  return { ok: true };
}

export function computeOutputSize(width, height, resize = {}) {
  const sourceWidth = finitePositive(width, 1);
  const sourceHeight = finitePositive(height, 1);
  const mode = resize?.mode;
  const value = finitePositive(resize?.value, null);
  let scale = 1;

  if (value && mode === 'width') scale = value / sourceWidth;
  if (value && mode === 'height') scale = value / sourceHeight;
  if (value && mode === 'percent') scale = value / 100;

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale))
  };
}

export function computeCanvasSize(width, height, options = {}) {
  const sourceWidth = Math.round(finitePositive(width, 1));
  const sourceHeight = Math.round(finitePositive(height, 1));
  const readDimension = (value, original) => {
    const number = Number(value);
    if (options.relative) return Math.max(1, original + (Number.isFinite(number) ? Math.round(number) : 0));
    return Math.max(1, Math.round(finitePositive(number, original)));
  };
  const outputWidth = readDimension(options.width, sourceWidth);
  const outputHeight = readDimension(options.height, sourceHeight);
  const anchorValue = (value) => Number.isFinite(Number(value)) ? Math.min(1, Math.max(0, Number(value))) : 0.5;
  const anchorX = anchorValue(options.anchorX);
  const anchorY = anchorValue(options.anchorY);

  return {
    width: outputWidth,
    height: outputHeight,
    offsetX: Math.round((outputWidth - sourceWidth) * anchorX),
    offsetY: Math.round((outputHeight - sourceHeight) * anchorY)
  };
}

export function outputFileName(name, format, usedNames = new Set()) {
  const safeName = String(name || 'image').trim() || 'image';
  const stem = safeName.replace(/\.[^.]+$/, '') || 'image';
  const extension = normalizeFormat(format);
  const base = stem;
  let candidate = `${base}.${extension}`;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${base}-${suffix}.${extension}`;
    suffix += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

export function percentSaved(before, after) {
  const original = Number(before);
  const result = Number(after);
  if (!Number.isFinite(original) || !Number.isFinite(result) || original <= 0) return 0;
  return Math.round(((original - result) / original) * 100);
}

export function selectNonExpandingBlob(original, encoded) {
  return encoded.size < original.size
    ? { blob: encoded, compressed: true }
    : { blob: original, compressed: false };
}

export function getResizeUnit(mode) {
  if (mode === 'percent') return '%';
  if (mode === 'width' || mode === 'height') return 'px';
  return '';
}

export function getCanvasExtensionModes(format) {
  return normalizeFormat(format) === 'jpg' ? ['color'] : ['transparent', 'color'];
}

export function compositeRgbaOnBackground(rgba, color = '#ffffff') {
  if (!(rgba instanceof Uint8ClampedArray) || rgba.length % 4 !== 0) {
    throw new TypeError('rgba must be a Uint8ClampedArray with four channels per pixel');
  }
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color));
  if (!match) throw new TypeError('color must be a 3- or 6-digit hexadecimal color');
  const hex = match[1].length === 3
    ? match[1].split('').map((part) => part + part).join('')
    : match[1];
  const background = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const output = new Uint8ClampedArray(rgba.length);

  for (let index = 0; index < rgba.length; index += 4) {
    const alpha = rgba[index + 3] / 255;
    output[index] = Math.round(rgba[index] * alpha + background[0] * (1 - alpha));
    output[index + 1] = Math.round(rgba[index + 1] * alpha + background[1] * (1 - alpha));
    output[index + 2] = Math.round(rgba[index + 2] * alpha + background[2] * (1 - alpha));
    output[index + 3] = 255;
  }
  return output;
}

export function buildOutputPlan(meta = {}, settings = {}) {
  const format = normalizeFormat(settings.format || meta.format || meta.type, 'png');
  const resize = settings.resize || {};
  const dimensions = resize.mode === 'canvas'
    ? computeCanvasSize(meta.width, meta.height, resize)
    : { ...computeOutputSize(meta.width, meta.height, resize), offsetX: 0, offsetY: 0 };
  const usedNames = settings.usedNames || new Set();
  const background = format === 'jpg'
    ? (settings.background || (resize.mode === 'canvas' && resize.extensionColor) || '#ffffff')
    : null;
  const extensionTransparent = resize.mode === 'canvas' && resize.extensionTransparent === true;

  return {
    format,
    mimeType: FORMAT_TYPES[format],
    quality: settings.quality,
    ...dimensions,
    fileName: outputFileName(meta.name, format, usedNames),
    preserveTransparency: format === 'png' || format === 'webp',
    background,
    canvasExtensionTransparent: extensionTransparent && format !== 'jpg',
    canvasExtensionColor: extensionTransparent
      ? (format === 'jpg' ? background : null)
      : (resize.extensionColor || '#ffffff')
  };
}
