
import { ImageGrid } from "./ImageGrid";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";


interface AllImagesProps {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
}

// export function AllImages({ images }: AllImagesProps) {
//   return (
//     <>
//       <h2>All Images</h2>
//       <ImageGrid images={images} />
//     </>
//   );
// }

export function AllImages({ images, loading, error }: AllImagesProps) {
  return (
    <>
      <h2>All Images</h2>
      {loading && <p>Loading images...</p>}
      {error && <p style={{ color: "red" }}>Failed to load images.</p>}
      {!loading && !error && <ImageGrid images={images} />}
    </>
  );
}