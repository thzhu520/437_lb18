import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";



function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then((data) => {
        setImages(data);
        setError(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ValidRoutes.HOME} element={<MainLayout />}>
          <Route
            index
            element={<AllImages images={images} loading={loading} error={error} />}
          />
          <Route
            path="images/:imageId"
            element={
              <ImageDetails
                images={images}
                loading={loading}
                error={error}
                onRename={(id, newName) => {
                  setImages(images.map(img =>
                    img.id === id ? { ...img, name: newName } : img
                  ));
                }}
              />
            }
          />
          <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
          <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
