import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeFramesAsPng, encodePngCanvas } from './assets/tools/png-encoder.mjs';

function createCanvas(pixelBytes, nativePngBytes = [1, 2, 3, 4]) {
  return {
    width: 1,
    height: 1,
    getContext() {
      return { getImageData: () => ({ data: new Uint8ClampedArray(pixelBytes) }) };
    },
    toBlob(callback) {
      callback(new Blob([new Uint8Array(nativePngBytes)], { type: 'image/png' }));
    }
  };
}

test('quantizes opaque PNG frames using the same quality tier and keeps the smaller encoding', async () => {
  let requestedColors;
  globalThis.UPNG = {
    encode(_frames, width, height, colors) {
      requestedColors = colors;
      assert.equal(width, 1);
      assert.equal(height, 1);
      return new Uint8Array([9, 8]).buffer;
    }
  };

  const result = await encodePngCanvas(createCanvas([10, 20, 30, 255]), 0.8);

  assert.equal(requestedColors, 128);
  assert.deepEqual([...new Uint8Array(await result.blob.arrayBuffer())], [9, 8]);
});

test('keeps transparent PNG pixels lossless and falls back when quantized PNG is larger', async () => {
  let requestedColors;
  globalThis.UPNG = {
    encode(_frames, _width, _height, colors) {
      requestedColors = colors;
      return new Uint8Array([9, 8, 7, 6, 5]).buffer;
    }
  };

  const result = await encodePngCanvas(createCanvas([10, 20, 30, 120]), 0.7);

  assert.equal(requestedColors, 0);
  assert.deepEqual([...new Uint8Array(await result.blob.arrayBuffer())], [1, 2, 3, 4]);
});

test('pre-encodes every animation frame as PNG before handing frames to another format', async () => {
  const drawnFrames = [];
  const encodedPixels = [];
  let activeFrame;
  const context = {
    clearRect() { activeFrame = undefined; },
    drawImage(frame) { activeFrame = frame; drawnFrames.push(frame); },
    getImageData() { return { data: new Uint8ClampedArray([activeFrame, 0, 0, 255]) }; }
  };
  const canvas = {
    width: 1,
    height: 1,
    getContext() { return context; },
    toBlob(callback) { callback(new Blob([new Uint8Array([0, 0, 0, 0])])); }
  };
  globalThis.UPNG = {
    encode([pixels], _width, _height, colors) {
      encodedPixels.push({ pixel: new Uint8Array(pixels)[0], colors });
      return new Uint8Array([new Uint8Array(pixels)[0]]).buffer;
    }
  };

  const outputs = await encodeFramesAsPng([11, 22], canvas, 0.8);

  assert.deepEqual(drawnFrames, [11, 22]);
  assert.deepEqual(encodedPixels, [{ pixel: 11, colors: 128 }, { pixel: 22, colors: 128 }]);
  assert.deepEqual(await Promise.all(outputs.map(async blob => [...new Uint8Array(await blob.arrayBuffer())])), [[11], [22]]);
});
