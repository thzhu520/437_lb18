import { useParams } from "react-router-dom";
// import { MainLayout } from "../MainLayout";
import type { IImageData } from "../MockAppData";
import "./Images.css";

interface ImageDetailsProps {
  images: IImageData[];
}

export function ImageDetails({ images }: ImageDetailsProps) {
  const { imageId } = useParams();

  const image = images.find((img) => img.id === imageId);

  if (!image) {
    return (
      // <MainLayout>
      <>
        <h2>Image not found</h2>
      </>
      // </MainLayout>
    );
  }

  return (
      // <MainLayout>
      <>
        <h2>{image.name}</h2>
        <p>By {image.author.username}</p>
        <img className="ImageDetails-img" src={image.src} alt={image.name} />
      </>
      // </MainLayout>
  );
}