import test from 'node:test';
import assert from 'node:assert/strict';
import { buildZipPath, getFileRelativePath } from './assets/tools/image-compress.mjs';

test('uses the browser-provided relative path for folder uploads', () => {
  assert.equal(getFileRelativePath({ name: '001.png', webkitRelativePath: '素材/角色/001.png' }), '素材/角色/001.png');
  assert.equal(getFileRelativePath({ name: '001.png' }), '001.png');
});

test('changes only the filename while preserving the folder path', () => {
  assert.equal(buildZipPath('素材\\角色\\001.png', '001.webp'), '素材/角色/001.webp');
  assert.equal(buildZipPath('001.png', '001.jpg'), '001.jpg');
});
