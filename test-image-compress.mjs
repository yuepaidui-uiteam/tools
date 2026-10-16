import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildZipPath, getFileRelativePath, readDroppedFiles } from './assets/tools/image-compress.mjs';

test('uses the browser-provided relative path for folder uploads', () => {
  assert.equal(getFileRelativePath({ name: '001.png', webkitRelativePath: '素材/角色/001.png' }), '素材/角色/001.png');
  assert.equal(getFileRelativePath({ name: '001.png' }), '001.png');
});

test('changes only the filename while preserving the folder path', () => {
  assert.equal(buildZipPath('素材\\角色\\001.png', '001.webp'), '素材/角色/001.webp');
  assert.equal(buildZipPath('001.png', '001.jpg'), '001.jpg');
});

test('loads the PNG encoder wrapper with browser ES module semantics', async () => {
  const encoderSource = await readFile(new URL('./assets/tools/png-encoder.js', import.meta.url), 'utf8');
  const wrapperSource = await readFile(new URL('./assets/tools/png-encoder.mjs', import.meta.url), 'utf8');
  const encoderUrl = `data:text/javascript;base64,${Buffer.from(encoderSource).toString('base64')}`;
  const browserWrapperSource = wrapperSource.replace('./png-encoder.js', encoderUrl);
  const wrapperUrl = `data:text/javascript;base64,${Buffer.from(browserWrapperSource).toString('base64')}`;
  const encoder = await import(wrapperUrl);

  assert.equal(typeof encoder.encodePngCanvas, 'function');
  assert.equal(typeof encoder.encodeFramesAsPng, 'function');
  assert.equal(typeof encoder.drawPngFrameToCanvas, 'function');
});

test('recursively reads folders exposed through the modern file system handle API', async () => {
  const image = new File(['image'], '001.png', { type: 'image/png' });
  const imageHandle = { kind: 'file', name: image.name, getFile: async () => image };
  const nestedFolder = {
    kind: 'directory', name: '角色',
    async *entries() { yield ['001.png', imageHandle]; }
  };
  const rootFolder = {
    kind: 'directory', name: '素材',
    async *entries() { yield ['角色', nestedFolder]; }
  };
  const files = await readDroppedFiles({
    items: [{ getAsFileSystemHandle: async () => rootFolder }],
    files: []
  });

  assert.equal(files.length, 1);
  assert.equal(getFileRelativePath(files[0]), '素材/角色/001.png');
});

test('recursively reads folders exposed through the legacy WebKit entry API', async () => {
  const image = new File(['image'], '002.png', { type: 'image/png' });
  const imageEntry = {
    name: image.name, isFile: true,
    file(resolve) { resolve(image); }
  };
  const folderEntry = {
    name: '素材', isDirectory: true,
    createReader() {
      let read = false;
      return { readEntries(resolve) { resolve(read ? [] : (read = true, [imageEntry])); } };
    }
  };
  const files = await readDroppedFiles({
    items: [{ webkitGetAsEntry: () => folderEntry }],
    files: []
  });

  assert.equal(files.length, 1);
  assert.equal(getFileRelativePath(files[0]), '素材/002.png');
});
