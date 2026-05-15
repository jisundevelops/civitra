'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar, { MobileSidebar } from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'my-violations': 'My Violations',
  'all-violations': 'All Violations',
  'pay-fine': 'Pay Fine',
  'payment-history': 'Payment History',
  'issue-ticket': 'Issue Ticket',
  'admin-users': 'Users',
  reports: 'Reports',
  'violation-types': 'Violation Types',
  profile: 'My Profile',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentPage } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = pageTitles[currentPage] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="md:ml-60">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 md:px-6 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white relative">
            <Bell className="h-4 w-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
