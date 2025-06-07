import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm";

function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [authToken, setAuthToken] = useState<string>("");
  const latestRequestRef = useRef(0);

  function fetchImages(query?: string) {
    const reqNumber = ++latestRequestRef.current;
    setLoading(true);
    setError(false);

    const url = query && query.trim().length > 0
      ? `/api/images?name=${encodeURIComponent(query)}`
      : `/api/images`;

    // Add Authorization header if we have a token
    const headers: HeadersInit = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    fetch(url, { headers })
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

  // Fetch images whenever auth token changes
  useEffect(() => {
    if (authToken) {
      fetchImages();
    }
  }, [authToken]);

  const handleImageSearch = () => {
    fetchImages(searchString);
  };

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ValidRoutes.HOME} element={<MainLayout />}>
          <Route
            index
            element={
              <ProtectedRoute authToken={authToken}>
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
              </ProtectedRoute>
            }
          />
          <Route
            path="images/:imageId"
            element={
              <ProtectedRoute authToken={authToken}>
                <ImageDetails
                  images={images}
                  loading={loading}
                  error={error}
                  authToken={authToken}
                  onRename={(id, newName) => {
                    setImages(images.map(img =>
                      img.id === id ? { ...img, name: newName } : img
                    ));
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route 
            path={ValidRoutes.UPLOAD} 
            element={
              <ProtectedRoute authToken={authToken}>
                <UploadPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ValidRoutes.LOGIN} 
            element={
              <LoginPage 
                isRegistering={false} 
                onAuthSuccess={handleAuthSuccess}
              />
            } 
          />
          <Route 
            path={ValidRoutes.REGISTER} 
            element={
              <LoginPage 
                isRegistering={true} 
                onAuthSuccess={handleAuthSuccess}
              />
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;