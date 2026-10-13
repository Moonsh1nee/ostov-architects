import { describe, expect, it } from "vitest";
import { variantWidths } from "./images";

describe("variantWidths", () => {
  it("never upscales and always includes the original width", () => {
    expect(variantWidths(1757)).toEqual([480, 800, 1200, 1600, 1757]);
  });

  it("caps at the largest breakpoint without duplicating it", () => {
    expect(variantWidths(2400)).toEqual([480, 800, 1200, 1600, 2000, 2400]);
    expect(variantWidths(6000)).toEqual([480, 800, 1200, 1600, 2000, 2400]);
  });

  it("handles originals smaller than the first breakpoint", () => {
    expect(variantWidths(320)).toEqual([320]);
  });
});
