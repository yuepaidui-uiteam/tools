(function attachPngEncoder(root) {
  async function encodePngCanvas(canvas, quality = 0.8) {
    const nativeBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('当前浏览器不支持 PNG 导出')), 'image/png');
    });

    if (!root.UPNG?.encode) return { blob: nativeBlob, usedOptimizer: false };

    const rgba = canvas.getContext('2d', { willReadFrequently: true })
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = false;
    for (let index = 3; index < rgba.length; index += 4) {
      if (rgba[index] < 255) {
        transparent = true;
        break;
      }
    }

    const colors = transparent ? 0 : quality >= 0.85 ? 192 : quality >= 0.75 ? 128 : 96;
    const encoded = new Uint8Array(root.UPNG.encode([rgba.buffer], canvas.width, canvas.height, colors));
    if (encoded.length >= nativeBlob.size) return { blob: nativeBlob, usedOptimizer: true };
    return { blob: new Blob([encoded], { type: 'image/png' }), usedOptimizer: true };
  }

  async function encodeFramesAsPng(frames, canvas, quality = 0.8, onProgress = () => {}) {
    const context = canvas.getContext('2d');
    const pngFrames = [];
    for (let index = 0; index < frames.length; index++) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frames[index], 0, 0, canvas.width, canvas.height);
      const encoded = await encodePngCanvas(canvas, quality);
      pngFrames.push(encoded.blob);
      onProgress(index + 1, frames.length);
    }
    return pngFrames;
  }

  async function drawPngFrameToCanvas(pngBlob, canvas, decode = root.createImageBitmap) {
    const bitmap = await decode(pngBlob);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
  }

  const api = { encodePngCanvas, encodeFramesAsPng, drawPngFrameToCanvas };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PngEncoder = api;
})(globalThis);
