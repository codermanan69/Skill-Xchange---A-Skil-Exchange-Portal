// ═══════════════════════════════════════════════
// Skill Xchange — App Layout
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DemoSwitcher from './DemoSwitcher';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <DemoSwitcher />
    </div>
  );
}
