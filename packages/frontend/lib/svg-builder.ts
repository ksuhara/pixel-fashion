import { DecodedImage } from "./types";

/**
 * Decode the RLE image data into a format that's easier to consume in `buildSVG`.
 * @param image The RLE image data
 */
const decodeImage = (image: string): DecodedImage => {
  const data = image.replace(/^0x/, "");
  const paletteIndex = parseInt(data.substring(0, 2), 16);
  const bounds = {
    top: parseInt(data.substring(2, 4), 16),
    right: parseInt(data.substring(4, 6), 16),
    bottom: parseInt(data.substring(6, 8), 16),
    left: parseInt(data.substring(8, 10), 16),
  };
  const rects = data.substring(10);

  return {
    paletteIndex,
    bounds,
    rects:
      rects
        ?.match(/.{1,4}/g)
        ?.map((rect) => [parseInt(rect.substring(0, 2), 16), parseInt(rect.substring(2, 4), 16)]) ?? [],
  };
};

/**
 * Given RLE parts, palette colors, and a background color, build an SVG image.
 * @param parts The RLE part datas
 * @param paletteColors The hex palette colors
 * @param bgColor The hex background color
 */
export const buildSVG = (parts: { data: string }[], paletteColors: string[]): string => {
  const svgWithoutEndTag = parts.reduce((result, part) => {
    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part.data);

    let currentX = bounds.left;
    let currentY = bounds.top;

    rects.forEach((rect, i) => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[colorIndex - 1];

      if (colorIndex !== 0) {
        svgRects.push(
          `<rect width="${length * 10}" height="10" x="${currentX * 10}" y="${currentY * 10}" fill="#${hexColor}" />`
        );
      }

      currentX += length;
      if (currentX === bounds.right) {
        currentX = bounds.left;
        currentY++;
      }
    });
    result += svgRects.join("");
    return result;
  }, `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#${paletteColors[0]}" /><use href="#animated1"/>`);

  return `${svgWithoutEndTag}</svg>`;
};

export const buildSVGWithAccessory = (parts: string[], paletteColors: string[][]): string => {
  console.log(parts, "parts");
  console.log(paletteColors, "paletteColors");
  const svgWithoutEndTag = parts.reduce((result, part, index) => {
    const svgRects: string[] = [];
    const { bounds, rects } = decodeImage(part);

    let currentX = bounds.left;
    let currentY = bounds.top;

    rects.forEach((rect, i) => {
      const [length, colorIndex] = rect;
      const hexColor = paletteColors[index][colorIndex - 1];

      if (colorIndex !== 0) {
        svgRects.push(
          `<rect width="${length * 10}" height="10" x="${currentX * 10}" y="${currentY * 10}" fill="#${hexColor}" />`
        );
      }

      currentX += length;
      if (currentX === bounds.right) {
        currentX = bounds.left;
        currentY++;
      }
    });
    result += svgRects.join("");
    return result;
  }, `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#${paletteColors[0]}" />`);

  return `${svgWithoutEndTag}</svg>`;
};
