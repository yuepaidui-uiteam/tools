import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { gifQualityFromSlider, prepareGifRgba } = require('./assets/tools/gif-processing.js');

test('keeps the original RGB of partially transparent pixels when making them opaque for GIF', () => {
  const pixels = new Uint8ClampedArray([220, 60, 100, 200]);

  prepareGifRgba(pixels, 1, 1);

  assert.deepEqual([...pixels], [220, 60, 100, 255]);
});

test('replaces transparent pixels with the configured GIF transparency key', () => {
  const pixels = new Uint8ClampedArray([40, 80, 120, 0]);

  prepareGifRgba(pixels, 1, 1, false);

  assert.deepEqual([...pixels], [0, 255, 1, 255]);
});

test('maps higher UI quality to a lower and better GIF sample interval', () => {
  assert.equal(gifQualityFromSlider(0.8), 5);
  assert.equal(gifQualityFromSlider(1), 1);
  assert.equal(gifQualityFromSlider(0.1), 18);
});
