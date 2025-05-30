import { Link } from "react-router-dom";
import type { IImageData } from "../MockAppData";
import "./Images.css";

interface Props {
  images: IImageData[];
}

export function ImageGrid({ images }: Props) {
  return (
    <div className="ImageGrid">
      {images.map((image) => (
        <div key={image.id} className="ImageGrid-photo-container">
          <Link to={`/images/${image.id}`}>
            <img src={image.src} alt={image.name} />
          </Link>
        </div>
      ))}
    </div>
  );
}
