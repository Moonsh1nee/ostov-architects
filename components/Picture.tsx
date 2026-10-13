import type { ImageAsset } from "@/lib/types";
import {
  type ImageFormat,
  IMAGE_FORMATS,
  PORTRAIT_MEDIA,
  PORTRAIT_WIDTHS,
  needsPortraitCrop,
  portraitFile,
  variantFile,
  variantWidths,
} from "@/lib/images";
import { asset } from "@/lib/paths";

interface PictureProps {
  image: ImageAsset;
  /** Rendered width hints, e.g. "(min-width: 768px) 50vw, 100vw". */
  sizes: string;
  /** Above-the-fold LCP image: eager, high fetch priority. Everything else lazy-loads. */
  priority?: boolean;
  /** Full-bleed frame: serve a 9:16 crop of landscape shots on portrait screens. */
  artDirected?: boolean;
  className?: string;
  imgClassName?: string;
  /** Extra attributes for motion hooks on the <img>. */
  imgProps?: Record<`data-${string}`, string>;
}

const srcSet = (widths: readonly number[], file: (w: number) => string) =>
  widths.map((w) => `${asset(`/${file(w)}`)} ${w}w`).join(", ");

export function Picture({
  image,
  sizes,
  priority = false,
  artDirected = false,
  className,
  imgClassName,
  imgProps,
}: PictureProps) {
  const widths = variantWidths(image.width);
  // Mid-size WebP as the <img> fallback for browsers without <source> support.
  const fallbackWidth = widths.find((w) => w >= 1200) ?? widths[widths.length - 1]!;
  const portrait = artDirected && needsPortraitCrop(image);
  const variant = (format: ImageFormat) => (w: number) => variantFile(image.key, w, format);
  const crop = (format: ImageFormat) => (w: number) => portraitFile(image.key, w, format);

  return (
    <picture className={className}>
      {portrait &&
        IMAGE_FORMATS.map((format) => (
          <source
            key={`p-${format}`}
            media={PORTRAIT_MEDIA}
            type={`image/${format}`}
            srcSet={srcSet(PORTRAIT_WIDTHS, crop(format))}
            sizes="100vw"
          />
        ))}
      {IMAGE_FORMATS.map((format) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet(widths, variant(format))} sizes={sizes} />
      ))}
      <img
        src={asset(`/${variant("webp")(fallbackWidth)}`)}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        // Never "sync": it holds the whole first paint until the hero has downloaded and decoded.
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={imgClassName}
        {...imgProps}
      />
    </picture>
  );
}
