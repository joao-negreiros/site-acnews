declare module "opentype.js" {
  export interface Glyph {
    advanceWidth?: number;
  }
  export interface Font {
    unitsPerEm: number;
    charToGlyph(ch: string): Glyph;
  }
  export function parse(buffer: ArrayBuffer): Font;
}
