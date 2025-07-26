import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-20 bg-black/50 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 bg-white transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isDesktopSidebarOpen ? "w-65" : "w-20"}
        `}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isDesktopOpen={isDesktopSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Desktop toggle button */}
        <button
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className='hidden lg:flex absolute -right-4 top-20 h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50'
        >
          {isDesktopSidebarOpen ? (
            <MdChevronLeft className='h-5 w-5 text-gray-600' />
          ) : (
            <MdChevronRight className='h-5 w-5 text-gray-600' />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Page content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='py-6'>
            <div className='px-4 sm:px-6 lg:px-8'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
