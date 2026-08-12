import test from 'node:test';
import assert from 'node:assert/strict';
import { outputFileName, validateImageFile } from './assets/tools/image-core.mjs';

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
