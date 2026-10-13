// Shared by the build-time sharp pipeline and <Picture>, so the srcset
// can never reference a variant the pipeline did not produce.
export const IMAGE_WIDTHS = [480, 800, 1200, 1600, 2000, 2400] as const;
const MAX_WIDTH = IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1] as number;
export const IMAGE_FORMATS = ["avif", "webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export const IMAGE_OUTPUT_DIR = "img";
export const OG_OUTPUT_DIR = "og";
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Widths to generate for an original: never upscale, always include the original width. */
export function variantWidths(originalWidth: number): number[] {
  const largest = Math.min(originalWidth, MAX_WIDTH);
  return [...IMAGE_WIDTHS.filter((w) => w < largest), largest];
}

export function variantFile(key: string, width: number, format: ImageFormat): string {
  return `${IMAGE_OUTPUT_DIR}/${key}-${width}.${format}`;
}

// Full-bleed landscape shots shown in a phone-height frame would otherwise make
// the browser fetch a 2400w file just to fill the height. A real portrait crop
// is both sharper and several times lighter.
// Tuned to real phones: 412px at DPR 1.75 needs 721w, 390px at DPR 3 needs 1170w.
export const PORTRAIT_WIDTHS = [480, 750, 1080] as const;
export const PORTRAIT_ASPECT = { width: 9, height: 16 } as const;
export const PORTRAIT_MEDIA = "(max-aspect-ratio: 4/5)";

export const needsPortraitCrop = (image: { width: number; height: number }) => image.width > image.height;

export function portraitFile(key: string, width: number, format: ImageFormat): string {
  return `${IMAGE_OUTPUT_DIR}/${key}-portrait-${width}.${format}`;
}

export function ogFile(key: string): string {
  return `${OG_OUTPUT_DIR}/${key}.jpg`;
}
