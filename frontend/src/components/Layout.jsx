import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0 border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(28,16,16,0.35)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-60 z-40 flex flex-col border-r lg:hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
