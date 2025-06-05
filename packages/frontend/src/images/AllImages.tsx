import { ImageGrid } from "./ImageGrid";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";

interface AllImagesProps {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
  searchPanel: React.ReactNode;
}

export function AllImages({ images, loading, error, searchPanel }: AllImagesProps) {
  return (
    <>
      <h2>All Images</h2>
      {searchPanel}
      {loading && <p>Loading images...</p>}
      {error && <p style={{ color: "red" }}>Failed to load images.</p>}
      {!loading && !error && <ImageGrid images={images} />}
    </>
  );
}
