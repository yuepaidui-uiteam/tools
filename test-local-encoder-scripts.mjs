import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('local classic scripts expose both encoders without file:// dynamic imports', () => {
  const pngEncoder = require('./assets/tools/png-encoder.js');
  const webpEncoder = require('./assets/tools/webp-animation.js');

  assert.equal(globalThis.PngEncoder, pngEncoder);
  assert.equal(globalThis.WebPAnimation, webpEncoder);
  assert.equal(typeof pngEncoder.encodeFramesAsPng, 'function');
  assert.equal(typeof pngEncoder.drawPngFrameToCanvas, 'function');
  assert.equal(typeof webpEncoder.assembleAnimatedWebP, 'function');
});
