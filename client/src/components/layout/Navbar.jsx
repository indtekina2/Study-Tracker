import React from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

const Navbar = ({ setIsSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-[var(--background)] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-[var(--foreground)] lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {/* Search or breadcrumbs could go here */}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
