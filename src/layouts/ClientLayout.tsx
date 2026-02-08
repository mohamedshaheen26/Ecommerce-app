import { Outlet } from "react-router-dom";
import ClientFooter from "./ClientFooter";
import ClientHeader from "./ClientHeader";

export default function ClientLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <ClientHeader />

      {/* Main content */}
      <main className='w-full'>
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}
