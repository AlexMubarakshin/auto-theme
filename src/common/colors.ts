export function RGBToHex(
  r: number | string,
  g: number | string,
  b: number | string
) {
  let hexR = Number(r).toString(16);
  let hexG = Number(g).toString(16);
  let hexB = Number(b).toString(16);

  if (hexR.length === 1) hexR = "0" + hexR;
  if (hexG.length === 1) hexG = "0" + hexG;
  if (hexB.length === 1) hexB = "0" + hexB;

  return "#" + hexR + hexG + hexB;
}

// Normalizes a color object from a normalized format to a Figma-specific format.
export function normalizeColor(color: {
  r: number;
  g: number;
  b: number;
  a?: number;
}): { r: number; g: number; b: number; a?: number } {
  const figmaColor = { ...color };

  figmaColor.r = Math.round(figmaColor.r * 255);
  figmaColor.g = Math.round(figmaColor.g * 255);
  figmaColor.b = Math.round(figmaColor.b * 255);

  return figmaColor;
}
