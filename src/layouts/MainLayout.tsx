import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className='flex h-screen overflow-hidden'>
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
          className='hidden lg:flex absolute -right-4 top-20 h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-primary)] shadow-md border border-[var(--border-color)] cursor-pointer  transition-colors duration-200'
        >
          {isDesktopSidebarOpen ? (
            <MdChevronLeft className='h-5 w-5 text-gray-600' />
          ) : (
            <MdChevronRight className='h-5 w-5 text-gray-600' />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className='overflow-y-auto flex-1 flex flex-col min-w-0 '>
        {/* Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Page content */}
        <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
