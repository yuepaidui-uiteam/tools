(function attachGifProcessing(root) {
  function gifQualityFromSlider(value) {
    const quality = Math.max(0.1, Math.min(1, Number(value) || 0.8));
    // gif.js quality is a pixel sample interval, so a lower number is better.
    return Math.max(1, Math.min(20, Math.round((1 - quality) * 19) + 1));
  }

  function prepareGifRgba(data, width, height, useAlphaDither = true) {
    const alphaErrors = useAlphaDither ? new Float32Array(width * height) : null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        const offset = pixelIndex * 4;
        const alpha = data[offset + 3];
        const adjustedAlpha = useAlphaDither
          ? Math.max(0, Math.min(255, alpha + alphaErrors[pixelIndex]))
          : alpha;
        const opaque = adjustedAlpha >= 128;

        if (useAlphaDither) {
          const error = adjustedAlpha - (opaque ? 255 : 0);
          if (x + 1 < width) alphaErrors[pixelIndex + 1] += error * 7 / 16;
          if (y + 1 < height) {
            if (x > 0) alphaErrors[pixelIndex + width - 1] += error * 3 / 16;
            alphaErrors[pixelIndex + width] += error * 5 / 16;
            if (x + 1 < width) alphaErrors[pixelIndex + width + 1] += error * 1 / 16;
          }
        }

        if (!opaque) {
          // GIF transparency is binary; use one transparent key color.
          data[offset] = 0;
          data[offset + 1] = 255;
          data[offset + 2] = 1;
          data[offset + 3] = 255;
        } else {
          // Canvas getImageData returns un-premultiplied RGB; keep its source color.
          data[offset + 3] = 255;
        }
      }
    }

    return data;
  }

  const api = { gifQualityFromSlider, prepareGifRgba };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GifProcessing = api;
})(globalThis);
