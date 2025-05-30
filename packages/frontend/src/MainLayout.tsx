import { Outlet } from "react-router-dom";
import { Header } from "./Header";


interface MainLayoutProps{
  children?: React.ReactNode;
}
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Header />
      <div style={{ padding: "0 2em" }}>
        <Outlet />
        {children}
      </div>
    </div>
  );
}
