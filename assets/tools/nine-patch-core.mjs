const BLACK_MARKER = [0, 0, 0, 255];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isBlackMarker(data, width, x, y) {
  const offset = (y * width + x) * 4;
  return BLACK_MARKER.every((value, index) => data[offset + index] === value);
}

function markerRanges(imageData, points) {
  const ranges = [];
  let start = null;

  for (const point of points) {
    if (isBlackMarker(imageData.data, imageData.width, point.x, point.y)) {
      if (start === null) start = point.coordinate;
    } else if (start !== null) {
      ranges.push([start, point.coordinate - 1]);
      start = null;
    }
  }

  if (start !== null && points.length > 0) ranges.push([start, points.at(-1).coordinate]);
  return ranges;
}

export function normalizeRanges(ranges, max) {
  if (!Number.isFinite(max) || max < 0) return [];

  const normalized = ranges
    .filter((range) => Array.isArray(range) && range.length >= 2)
    .map(([start, end]) => [clamp(Math.min(start, end), 0, max), clamp(Math.max(start, end), 0, max)])
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && start <= end)
    .sort((a, b) => a[0] - b[0]);

  return normalized.reduce((merged, range) => {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1] + 1) previous[1] = Math.max(previous[1], range[1]);
    else merged.push(range);
    return merged;
  }, []);
}

export function paintRange(ranges, start, end, max) {
  return normalizeRanges([...ranges, [start, end]], max);
}

export function eraseRange(ranges, start, end) {
  const from = Math.min(start, end);
  const to = Math.max(start, end);

  return ranges.flatMap(([rangeStart, rangeEnd]) => {
    if (to < rangeStart || from > rangeEnd) return [[rangeStart, rangeEnd]];
    return [
      rangeStart < from ? [rangeStart, from - 1] : null,
      rangeEnd > to ? [to + 1, rangeEnd] : null
    ].filter(Boolean);
  });
}

export function parseNinePatchBorder(imageData) {
  const { width, height } = imageData;
  if (width < 3 || height < 3) {
    return { stretchX: [], stretchY: [], contentX: [], contentY: [] };
  }

  return {
    stretchX: markerRanges(imageData, Array.from({ length: width - 2 }, (_, index) => ({ x: index + 1, y: 0, coordinate: index }))),
    stretchY: markerRanges(imageData, Array.from({ length: height - 2 }, (_, index) => ({ x: 0, y: index + 1, coordinate: index }))),
    contentX: markerRanges(imageData, Array.from({ length: width - 2 }, (_, index) => ({ x: index + 1, y: height - 1, coordinate: index }))),
    contentY: markerRanges(imageData, Array.from({ length: height - 2 }, (_, index) => ({ x: width - 1, y: index + 1, coordinate: index })))
  };
}

export function renderNinePatchBorder(source, model) {
  const width = source.width + 2;
  const height = source.height + 2;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < source.height; y += 1) {
    const sourceOffset = y * source.width * 4;
    const targetOffset = ((y + 1) * width + 1) * 4;
    data.set(source.data.subarray(sourceOffset, sourceOffset + source.width * 4), targetOffset);
  }

  const paintMarkers = (ranges, pointForCoordinate, max) => {
    for (const [start, end] of normalizeRanges(ranges ?? [], max)) {
      for (let coordinate = start; coordinate <= end; coordinate += 1) {
        const { x, y } = pointForCoordinate(coordinate);
        data.set(BLACK_MARKER, (y * width + x) * 4);
      }
    }
  };

  paintMarkers(model.stretchX, (x) => ({ x: x + 1, y: 0 }), source.width - 1);
  paintMarkers(model.stretchY, (y) => ({ x: 0, y: y + 1 }), source.height - 1);
  paintMarkers(model.contentX, (x) => ({ x: x + 1, y: height - 1 }), source.width - 1);
  paintMarkers(model.contentY, (y) => ({ x: width - 1, y: y + 1 }), source.height - 1);

  return { width, height, data };
}

export function validateNinePatch(model, width, height, name = 'image') {
  const errors = [];
  const validateRanges = (key, max) => {
    for (const [start, end] of model[key] ?? []) {
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end >= max) {
        errors.push({ severity: 'error', code: `invalid_${key}`, message: `${name}: ${key} 标记范围超出图片边界。` });
        break;
      }
    }
  };

  if (!(model.stretchX ?? []).length) errors.push({ severity: 'error', code: 'missing_stretch_x', message: `${name}: 缺少横向拉伸区。` });
  if (!(model.stretchY ?? []).length) errors.push({ severity: 'error', code: 'missing_stretch_y', message: `${name}: 缺少纵向拉伸区。` });
  validateRanges('stretchX', width);
  validateRanges('contentX', width);
  validateRanges('stretchY', height);
  validateRanges('contentY', height);
  return errors;
}

export function computeNineSlice(model, targetWidth, targetHeight) {
  const sourceWidth = model.width;
  const sourceHeight = model.height;
  const [stretchXStart, stretchXEnd] = model.stretchX?.[0] ?? [];
  const [stretchYStart, stretchYEnd] = model.stretchY?.[0] ?? [];

  if (!Number.isInteger(sourceWidth) || !Number.isInteger(sourceHeight) || !Number.isInteger(stretchXStart) || !Number.isInteger(stretchXEnd) || !Number.isInteger(stretchYStart) || !Number.isInteger(stretchYEnd)) {
    return { error: { code: 'invalid_model', message: '.9 图需要图片尺寸和拉伸区标记。' }, slices: [] };
  }

  const sourceColumns = [
    { start: 0, size: stretchXStart, stretch: false },
    { start: stretchXStart, size: stretchXEnd - stretchXStart + 1, stretch: true },
    { start: stretchXEnd + 1, size: sourceWidth - stretchXEnd - 1, stretch: false }
  ];
  const sourceRows = [
    { start: 0, size: stretchYStart, stretch: false },
    { start: stretchYStart, size: stretchYEnd - stretchYStart + 1, stretch: true },
    { start: stretchYEnd + 1, size: sourceHeight - stretchYEnd - 1, stretch: false }
  ];
  const fixedWidth = sourceColumns[0].size + sourceColumns[2].size;
  const fixedHeight = sourceRows[0].size + sourceRows[2].size;

  if (targetWidth < fixedWidth || targetHeight < fixedHeight) {
    return {
      error: {
        code: 'target_too_small',
        message: '预览尺寸小于 .9 图固定区域。',
        fixedWidth,
        fixedHeight,
        targetWidth,
        targetHeight
      },
      slices: []
    };
  }

  const targetColumns = [
    { start: 0, size: sourceColumns[0].size },
    { start: sourceColumns[0].size, size: targetWidth - fixedWidth },
    { start: targetWidth - sourceColumns[2].size, size: sourceColumns[2].size }
  ];
  const targetRows = [
    { start: 0, size: sourceRows[0].size },
    { start: sourceRows[0].size, size: targetHeight - fixedHeight },
    { start: targetHeight - sourceRows[2].size, size: sourceRows[2].size }
  ];
  const slices = [];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      slices.push({
        source: { x: sourceColumns[column].start, y: sourceRows[row].start, width: sourceColumns[column].size, height: sourceRows[row].size },
        target: { x: targetColumns[column].start, y: targetRows[row].start, width: targetColumns[column].size, height: targetRows[row].size },
        stretchX: sourceColumns[column].stretch,
        stretchY: sourceRows[row].stretch
      });
    }
  }

  return { error: null, slices };
}
