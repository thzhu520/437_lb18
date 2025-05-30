
import { ImageGrid } from "./ImageGrid";
import type { IImageData } from "../MockAppData";

interface AllImagesProps {
  images: IImageData[];
}

export function AllImages({ images }: AllImagesProps) {
  return (
    <>
      <h2>All Images</h2>
      <ImageGrid images={images} />
    </>
  );
}