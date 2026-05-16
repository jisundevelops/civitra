'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar, { MobileSidebar } from './Sidebar';
import { Menu, Bell, Sun, Moon, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'my-violations': 'My Violations',
  'all-violations': 'All Violations',
  'pay-fine': 'Pay Fine',
  'payment-history': 'Payment History',
  'issue-ticket': 'Issue Ticket',
  'admin-users': 'Users',
  'add-officer': 'Add Officer',
  reports: 'Reports',
  'violation-types': 'Violation Types',
  profile: 'My Profile',
};

function ThemeToggle() {
  const { theme, setTheme, allThemes } = useTheme();
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    switch (theme) {
      case 'midnight': return <Moon className="h-4 w-4" />;
      case 'light': return <Sun className="h-4 w-4" />;
      case 'ocean': return <Waves className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-accent-bg)] transition-colors"
        aria-label="Change theme"
      >
        {getIcon()}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-2xl overflow-hidden">
            <div className="p-1.5">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-subtle)]">Theme</p>
              {allThemes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { setTheme(t.name); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === t.name
                      ? 'bg-[var(--c-accent-bg)] text-[var(--c-accent-text)] font-medium'
                      : 'text-[var(--c-text-muted)] hover:bg-[var(--c-accent-bg)] hover:text-[var(--c-text)]'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                  {theme === t.name && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--c-accent)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentPage } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = pageTitles[currentPage] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="md:ml-60">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 md:px-6 bg-[var(--c-header)]/80 backdrop-blur-md border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-base font-semibold text-[var(--c-text)]">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] relative">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
