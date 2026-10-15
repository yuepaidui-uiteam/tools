import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleAnimatedWebP } from './assets/tools/webp-animation.mjs';

function makeChunk(type, bytes) {
  const paddedLength = bytes.length + (bytes.length % 2);
  const chunk = new Uint8Array(8 + paddedLength);
  chunk.set(new TextEncoder().encode(type), 0);
  new DataView(chunk.buffer).setUint32(4, bytes.length, true);
  chunk.set(bytes, 8);
  return chunk;
}

function makeStaticWebP({ alpha = true } = {}) {
  const vp8x = new Uint8Array(10);
  vp8x[0] = alpha ? 0x10 : 0;
  const imageChunk = makeChunk('VP8L', new Uint8Array([0x2f, 0, 0, 0, alpha ? 0x10 : 0, 1]));
  const chunks = [makeChunk('VP8X', vp8x), imageChunk];
  const bodyLength = chunks.reduce((sum, chunk) => sum + chunk.length, 4);
  const output = new Uint8Array(8 + bodyLength);
  output.set(new TextEncoder().encode('RIFF'), 0);
  new DataView(output.buffer).setUint32(4, bodyLength, true);
  output.set(new TextEncoder().encode('WEBP'), 8);
  let offset = 12;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return new Blob([output], { type: 'image/webp' });
}

function readAnimation(blob) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    assert.equal(new TextDecoder().decode(bytes.subarray(0, 4)), 'RIFF');
    assert.equal(new TextDecoder().decode(bytes.subarray(8, 12)), 'WEBP');
    assert.equal(view.getUint32(4, true), bytes.length - 8);
    const chunks = [];
    let offset = 12;
    while (offset < bytes.length) {
      const type = new TextDecoder().decode(bytes.subarray(offset, offset + 4));
      const length = view.getUint32(offset + 4, true);
      chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) });
      offset += 8 + length + (length % 2);
    }
    return { bytes, chunks };
  });
}

test('assembles static WebP frames into one transparent animated WebP with timing and loop settings', async () => {
  const output = await assembleAnimatedWebP(
    [makeStaticWebP(), makeStaticWebP()],
    { width: 4, height: 3, fps: 15, loopCount: 0 }
  );

  assert.equal(output.type, 'image/webp');
  const { chunks } = await readAnimation(output);
  assert.deepEqual(chunks.map(({ type }) => type), ['VP8X', 'ANIM', 'ANMF', 'ANMF']);
  assert.equal(chunks[0].data[0], 0x12); // animation + alpha
  assert.deepEqual([...chunks[0].data.subarray(4, 10)], [3, 0, 0, 2, 0, 0]); // 4x3 canvas
  assert.deepEqual([...chunks[1].data], [0, 0, 0, 0, 0, 0]); // transparent bg, infinite loop
  assert.equal(chunks[2].data[12] | (chunks[2].data[13] << 8) | (chunks[2].data[14] << 16), 67);
  assert.equal(chunks[3].data[12] | (chunks[3].data[13] << 8) | (chunks[3].data[14] << 16), 66);
  assert.equal(chunks[2].data[15], 0x03); // replace full frame, then dispose to transparent bg
});

test('rejects a non-WebP input frame instead of returning a mislabeled file', async () => {
  await assert.rejects(
    assembleAnimatedWebP([new Blob(['not a webp'])], { width: 2, height: 2, fps: 10 }),
    /有效的静态 WebP/
  );
});

test('rejects dimensions and frame counts outside the WebP container limits', async () => {
  await assert.rejects(assembleAnimatedWebP([], { width: 0, height: 2, fps: 10 }), /宽高/);
  await assert.rejects(assembleAnimatedWebP([makeStaticWebP()], { width: 2, height: 2, fps: 0 }), /帧率/);
});
