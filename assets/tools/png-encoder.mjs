import './png-encoder.js';

const pngEncoder = globalThis.PngEncoder;
if (!pngEncoder) throw new Error('PNG 编码器脚本未能初始化');

export const { encodePngCanvas, encodeFramesAsPng, drawPngFrameToCanvas } = pngEncoder;
