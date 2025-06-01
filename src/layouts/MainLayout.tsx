import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header>
        <h1>Product Management</h1>
      </header>
      
      <main>
        {children || <Outlet />}
      </main>

      <footer>
        <p>&copy; 2023 Product Management System</p>
      </footer>
    </div>
  );
}
