import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm";

function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchString, setSearchString] = useState("");
  const latestRequestRef = useRef(0);

  function fetchImages(query?: string) {
    const reqNumber = ++latestRequestRef.current;
    setLoading(true);
    setError(false);

    const url = query && query.trim().length > 0
      ? `/api/images?name=${encodeURIComponent(query)}`
      : `/api/images`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (reqNumber === latestRequestRef.current) {
          setImages(data);
        }
      })
      .catch((err) => {
        if (reqNumber === latestRequestRef.current) {
          console.error("Image fetch failed:", err);
          setError(true);
        }
      })
      .finally(() => {
        if (reqNumber === latestRequestRef.current) {
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    fetchImages(); // Initial fetch
  }, []);

  const handleImageSearch = () => {
    fetchImages(searchString);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ValidRoutes.HOME} element={<MainLayout />}>
          <Route
            index
            element={
              <AllImages
                images={images}
                loading={loading}
                error={error}
                searchPanel={
                  <ImageSearchForm
                    searchString={searchString}
                    onSearchStringChange={setSearchString}
                    onSearchRequested={handleImageSearch}
                  />
                }
              />
            }
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
