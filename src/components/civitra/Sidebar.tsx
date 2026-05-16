'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PageName } from '@/types';
import {
  Home,
  AlertTriangle,
  CreditCard,
  History,
  User,
  Plus,
  Users,
  BarChart3,
  LogOut,
  FileText,
  Shield,
  Car,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  label: string;
  page: PageName;
  icon: React.ReactNode;
}

const citizenNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'My Violations', page: 'my-violations', icon: <AlertTriangle className="h-4 w-4" /> },
  { label: 'Pay Fines', page: 'pay-fine', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Payment History', page: 'payment-history', icon: <History className="h-4 w-4" /> },
  { label: 'Profile', page: 'profile', icon: <User className="h-4 w-4" /> },
];

const policeNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'Issue Ticket', page: 'issue-ticket', icon: <Plus className="h-4 w-4" /> },
  { label: 'All Violations', page: 'all-violations', icon: <FileText className="h-4 w-4" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'Users', page: 'admin-users', icon: <Users className="h-4 w-4" /> },
  { label: 'All Violations', page: 'all-violations', icon: <FileText className="h-4 w-4" /> },
  { label: 'Add Officer', page: 'issue-ticket', icon: <Shield className="h-4 w-4" /> },
  { label: 'Reports', page: 'reports', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Violation Types', page: 'violation-types', icon: <Car className="h-4 w-4" /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'admin': return adminNav;
    case 'police': return policeNav;
    default: return citizenNav;
  }
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin': return 'default';
    case 'police': return 'secondary';
    default: return 'outline';
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'police': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { user, currentPage, setCurrentPage, logout } = useAuth();

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleNavClick = (page: PageName) => {
    setCurrentPage(page);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">CIVITRA</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Traffic Management</p>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* User Info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-zinc-800" />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-[#111118] border-r border-zinc-800/50 z-30">
      <SidebarContent />
    </aside>
  );
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-60 p-0 bg-[#111118] border-zinc-800/50">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}
