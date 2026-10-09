import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutputPlan, computeCanvasSize, getResizeUnit, outputFileName, selectNonExpandingBlob, validateImageFile } from './assets/tools/image-core.mjs';
import * as imageCore from './assets/tools/image-core.mjs';

test('keeps the original filename when compressing to the same format', () => {
  assert.equal(outputFileName('home_page_bg_show.webp', 'webp'), 'home_page_bg_show.webp');
});

test('changes only the extension when converting formats', () => {
  assert.equal(outputFileName('home_page_bg_show.png', 'webp'), 'home_page_bg_show.webp');
});

test('adds a numeric suffix only when names collide', () => {
  const usedNames = new Set();
  assert.equal(outputFileName('slice.webp', 'webp', usedNames), 'slice.webp');
  assert.equal(outputFileName('slice.webp', 'webp', usedNames), 'slice-2.webp');
});

test('accepts more than thirty images when each file is valid', () => {
  assert.deepEqual(validateImageFile({ type: 'image/webp', size: 1024 }, 30), { ok: true });
});

test('keeps the original blob when recompression does not make the file smaller', () => {
  const original = new Blob(['original image bytes']);
  const larger = new Blob(['re-encoded image bytes that are larger']);

  assert.deepEqual(selectNonExpandingBlob(original, larger), { blob: original, compressed: false });
});

test('uses the encoded blob when it is smaller than the original', () => {
  const original = new Blob(['original image bytes']);
  const smaller = new Blob(['small']);

  assert.deepEqual(selectNonExpandingBlob(original, smaller), { blob: smaller, compressed: true });
});

test('shows the correct unit for each resize mode', () => {
  assert.equal(getResizeUnit('percent'), '%');
  assert.equal(getResizeUnit('width'), 'px');
  assert.equal(getResizeUnit('height'), 'px');
  assert.equal(getResizeUnit('original'), '');
});

test('only offers transparent canvas extensions for alpha-capable output formats', () => {
  assert.deepEqual(imageCore.getCanvasExtensionModes?.('jpg'), ['color']);
  assert.deepEqual(imageCore.getCanvasExtensionModes?.('png'), ['transparent', 'color']);
  assert.deepEqual(imageCore.getCanvasExtensionModes?.('webp'), ['transparent', 'color']);
});

test('crops toward the selected anchor without resizing the source image', () => {
  assert.deepEqual(computeCanvasSize(1000, 800, {
    width: 600, height: 400, anchorX: 0.5, anchorY: 0.5
  }), { width: 600, height: 400, offsetX: -200, offsetY: -200 });
});

test('expands the canvas while pinning the source image to the selected edge', () => {
  assert.deepEqual(computeCanvasSize(100, 50, {
    width: 140, height: 90, anchorX: 1, anchorY: 0
  }), { width: 140, height: 90, offsetX: 40, offsetY: 0 });
});

test('uses relative canvas dimensions as pixel deltas', () => {
  assert.deepEqual(computeCanvasSize(100, 80, {
    width: 20, height: -10, relative: true, anchorX: 0.5, anchorY: 0.5
  }), { width: 120, height: 70, offsetX: 10, offsetY: -5 });
});

test('clamps relative cropping so canvas dimensions never reach zero', () => {
  assert.deepEqual(computeCanvasSize(100, 80, {
    width: -200, height: -200, relative: true
  }), { width: 1, height: 1, offsetX: -49, offsetY: -39 });
});

test('builds a canvas output plan with the selected anchor offset and extension color', () => {
  const plan = buildOutputPlan({ name: 'photo.png', width: 100, height: 80 }, {
    format: 'png', resize: { mode: 'canvas', width: 60, height: 40, anchorX: 1, anchorY: 0.5, extensionColor: '#eeddcc' }
  });

  assert.equal(plan.width, 60);
  assert.equal(plan.height, 40);
  assert.equal(plan.offsetX, -40);
  assert.equal(plan.offsetY, -20);
  assert.equal(plan.canvasExtensionColor, '#eeddcc');
});

test('keeps transparent canvas extensions for PNG and WebP but uses the JPG background for JPG', () => {
  const resize = { mode: 'canvas', width: 120, height: 100, extensionTransparent: true };
  const pngPlan = buildOutputPlan({ name: 'photo.png', width: 100, height: 80 }, { format: 'png', resize });
  const webpPlan = buildOutputPlan({ name: 'photo.png', width: 100, height: 80 }, { format: 'webp', resize });
  const jpgPlan = buildOutputPlan({ name: 'photo.png', width: 100, height: 80 }, {
    format: 'jpg', resize, background: '#123456'
  });

  assert.equal(pngPlan.canvasExtensionTransparent, true);
  assert.equal(pngPlan.canvasExtensionColor, null);
  assert.equal(webpPlan.canvasExtensionTransparent, true);
  assert.equal(webpPlan.canvasExtensionColor, null);
  assert.equal(jpgPlan.canvasExtensionTransparent, false);
  assert.equal(jpgPlan.canvasExtensionColor, '#123456');
});

test('uses the shared canvas fill color as the JPG background when no separate background is provided', () => {
  const plan = buildOutputPlan({ name: 'photo.png', width: 100, height: 80 }, {
    format: 'jpg', resize: {
      mode: 'canvas', width: 120, height: 100, extensionColor: '#123456', extensionTransparent: true
    }
  });

  assert.equal(plan.background, '#123456');
  assert.equal(plan.canvasExtensionTransparent, false);
  assert.equal(plan.canvasExtensionColor, '#123456');
});
