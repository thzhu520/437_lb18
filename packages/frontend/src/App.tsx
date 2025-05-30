import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { fetchDataFromServer } from "./MockAppData";
import type { IImageData } from "./MockAppData";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";


function App() {
  const [images ] = useState<IImageData[]>(fetchDataFromServer());
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ValidRoutes.HOME} element={<MainLayout />}>
        <Route index element={<AllImages images={images} />} />
        <Route path={ValidRoutes.IMAGE_DETAIL} element={<ImageDetails images={images} />} />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
