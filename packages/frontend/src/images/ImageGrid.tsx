import { Link } from "react-router-dom";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import "./Images.css";

interface Props {
  images: IApiImageData[];
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
