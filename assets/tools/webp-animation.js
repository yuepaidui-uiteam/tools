(function attachWebPAnimation(root) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  function makeChunk(type, payload) {
    if (payload.length > 0xffffffff) throw new Error('WebP 数据块过大');
    const chunk = new Uint8Array(8 + payload.length + (payload.length & 1));
    chunk.set(textEncoder.encode(type), 0);
    new DataView(chunk.buffer).setUint32(4, payload.length, true);
    chunk.set(payload, 8);
    return chunk;
  }

  function parseStaticWebP(bytes) {
    if (bytes.length < 20 || textDecoder.decode(bytes.subarray(0, 4)) !== 'RIFF' || textDecoder.decode(bytes.subarray(8, 12)) !== 'WEBP') {
      throw new Error('每一帧都必须是有效的静态 WebP');
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(4, true) !== bytes.length - 8) throw new Error('WebP 帧数据长度不完整');
    const chunks = [];
    let hasAlpha = false;
    let offset = 12;
    while (offset < bytes.length) {
      if (offset + 8 > bytes.length) throw new Error('WebP 帧包含不完整的数据块');
      const type = textDecoder.decode(bytes.subarray(offset, offset + 4));
      const size = view.getUint32(offset + 4, true);
      const dataStart = offset + 8;
      const dataEnd = dataStart + size;
      if (dataEnd > bytes.length) throw new Error('WebP 帧数据块长度超出文件范围');
      const payload = bytes.subarray(dataStart, dataEnd);
      if (type === 'VP8X') hasAlpha ||= Boolean(payload[0] & 0x10);
      if (type === 'ALPH') hasAlpha = true;
      if (type === 'VP8L' && payload.length >= 5) hasAlpha ||= Boolean(payload[4] & 0x10);
      if (type === 'ALPH' || type === 'VP8 ' || type === 'VP8L') chunks.push(makeChunk(type, payload));
      offset = dataEnd + (size & 1);
    }
    if (!chunks.some((chunk) => ['VP8 ', 'VP8L'].includes(textDecoder.decode(chunk.subarray(0, 4))))) {
      throw new Error('WebP 帧缺少图像数据');
    }
    return { chunks, hasAlpha };
  }

  function concat(parts) {
    const length = parts.reduce((total, part) => total + part.length, 0);
    if (length > 0xffffffff - 8) throw new Error('动画 WebP 超过 4 GB 限制');
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  function uint24LE(target, offset, value) {
    target[offset] = value & 0xff;
    target[offset + 1] = (value >>> 8) & 0xff;
    target[offset + 2] = (value >>> 16) & 0xff;
  }

  async function assembleAnimatedWebP(frameBlobs, { width, height, fps, loopCount = 0, background = [0, 0, 0, 0] } = {}) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 0x1000000 || height > 0x1000000) {
      throw new Error('WebP 动画画布宽高必须为 1 到 16777216 的整数');
    }
    if (!Array.isArray(frameBlobs) || frameBlobs.length < 1) throw new Error('至少需要一帧才能生成动画 WebP');
    if (!Number.isFinite(fps) || fps < 1 || fps > 1000) throw new Error('帧率必须在 1 到 1000 之间');
    if (!Number.isInteger(loopCount) || loopCount < 0 || loopCount > 0xffff) throw new Error('循环次数必须为 0 到 65535 的整数');
    if (!Array.isArray(background) || background.length !== 4 || background.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
      throw new Error('背景色必须是 4 个 0 到 255 的 RGBA 数值');
    }

    const frames = [];
    let hasAlpha = false;
    for (const blob of frameBlobs) {
      const parsed = parseStaticWebP(new Uint8Array(await blob.arrayBuffer()));
      frames.push(parsed.chunks);
      hasAlpha ||= parsed.hasAlpha;
    }

    const vp8x = new Uint8Array(10);
    vp8x[0] = 0x02 | (hasAlpha ? 0x10 : 0);
    uint24LE(vp8x, 4, width - 1);
    uint24LE(vp8x, 7, height - 1);

    const anim = new Uint8Array(6);
    anim.set([background[2], background[1], background[0], background[3]], 0);
    new DataView(anim.buffer).setUint16(4, loopCount, true);

    const chunks = [makeChunk('VP8X', vp8x), makeChunk('ANIM', anim)];
    for (let index = 0; index < frames.length; index++) {
      const duration = Math.max(1, Math.round((index + 1) * 1000 / fps) - Math.round(index * 1000 / fps));
      if (duration > 0xffffff) throw new Error('单帧时长超出 WebP 格式限制');
      const frameHeader = new Uint8Array(16);
      uint24LE(frameHeader, 6, width - 1);
      uint24LE(frameHeader, 9, height - 1);
      uint24LE(frameHeader, 12, duration);
      frameHeader[15] = 0x03;
      chunks.push(makeChunk('ANMF', concat([frameHeader, ...frames[index]])));
    }

    const body = concat([textEncoder.encode('WEBP'), ...chunks]);
    const riff = new Uint8Array(8 + body.length);
    riff.set(textEncoder.encode('RIFF'), 0);
    new DataView(riff.buffer).setUint32(4, body.length, true);
    riff.set(body, 8);
    return new Blob([riff], { type: 'image/webp' });
  }

  const api = { assembleAnimatedWebP };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.WebPAnimation = api;
})(globalThis);
