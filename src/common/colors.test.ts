import { RGBToHex, normalizeColor } from "./colors";

describe("RGBToHex", () => {
  it("should return the correct hex color code", () => {
    expect(RGBToHex(255, 255, 255)).toBe("#ffffff");
    expect(RGBToHex(0, 0, 0)).toBe("#000000");
    expect(RGBToHex(255, 0, 0)).toBe("#ff0000");
    expect(RGBToHex(0, 255, 0)).toBe("#00ff00");
    expect(RGBToHex(0, 0, 255)).toBe("#0000ff");
  });

  it("should return the correct hex color code for string arguments", () => {
    expect(RGBToHex("255", "255", "255")).toBe("#ffffff");
    expect(RGBToHex("0", "0", "0")).toBe("#000000");
    expect(RGBToHex("255", "0", "0")).toBe("#ff0000");
    expect(RGBToHex("0", "255", "0")).toBe("#00ff00");
    expect(RGBToHex("0", "0", "255")).toBe("#0000ff");
  });
});

describe("normalizeColor", () => {
  it("should return the correct Figma-specific color object", () => {
    expect(normalizeColor({ r: 1, g: 1, b: 1 })).toEqual({
      r: 255,
      g: 255,
      b: 255
    });
    expect(normalizeColor({ r: 0, g: 0, b: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0
    });
    expect(normalizeColor({ r: 1, g: 0, b: 0, a: 0.5 })).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5
    });
    expect(normalizeColor({ r: 0, g: 1, b: 0, a: 0.8 })).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 0.8
    });
    expect(normalizeColor({ r: 0, g: 0, b: 1, a: 0.3 })).toEqual({
      r: 0,
      g: 0,
      b: 255,
      a: 0.3
    });
  });
});
