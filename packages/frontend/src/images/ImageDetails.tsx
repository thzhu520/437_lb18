import { useParams } from "react-router-dom";
import { ImageNameEditor } from "../ImageNameEditor";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";

import "./Images.css";

interface ImageDetailsProps {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
  onRename: (id: string, newName: string) => void;
}

export function ImageDetails({ images, loading, error, onRename }: ImageDetailsProps) {
  const { imageId } = useParams();

  if (loading) {
    return (
      <>
        <p>Loading image...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <p style={{ color: "red" }}>Error loading image.</p>
      </>
    );
  }

  const image = images.find((img) => img.id === imageId);

  if (!image) {
    return (
      <>
        <h2>Image not found</h2>
      </>
    );
  }

  return (
    <>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
      <ImageNameEditor
        imageId={image.id}
        initialValue={image.name}
        onRename={(newName) => onRename(image.id, newName)}
      />
    </>
  );
}
