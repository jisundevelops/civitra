'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppLayout from '@/components/civitra/AppLayout';
import LandingPage from '@/components/civitra/LandingPage';
import LoginPage from '@/components/civitra/LoginPage';
import RegisterPage from '@/components/civitra/RegisterPage';
import ForgotPasswordPage from '@/components/civitra/ForgotPasswordPage';
import DashboardPage from '@/components/civitra/DashboardPage';
import MyViolationsPage from '@/components/civitra/MyViolationsPage';
import AllViolationsPage from '@/components/civitra/AllViolationsPage';
import PayFinePage from '@/components/civitra/PayFinePage';
import PaymentHistoryPage from '@/components/civitra/PaymentHistoryPage';
import IssueTicketPage from '@/components/civitra/IssueTicketPage';
import AdminUsersPage from '@/components/civitra/AdminUsersPage';
import AddOfficerPage from '@/components/civitra/AddOfficerPage';
import ReportsPage from '@/components/civitra/ReportsPage';
import ViolationTypesPage from '@/components/civitra/ViolationTypesPage';
import ProfilePage from '@/components/civitra/ProfilePage';

function AppContent() {
  const { user, loading, currentPage, setCurrentPage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-[var(--c-accent-bg)] border border-[var(--c-accent-border)] flex items-center justify-center mx-auto animate-pulse">
            <div className="h-6 w-6 rounded bg-[var(--c-accent)]/40" />
          </div>
          <p className="text-[var(--c-text-subtle)] text-sm">Loading Civitra...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show landing or auth pages
  if (!user) {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'register':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      default:
        return <LoginPage />;
    }
  }

  // Logged in - show app layout with page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'my-violations':
        return <MyViolationsPage />;
      case 'all-violations':
        return <AllViolationsPage />;
      case 'pay-fine':
        return <PayFinePage />;
      case 'payment-history':
        return <PaymentHistoryPage />;
      case 'issue-ticket':
        return <IssueTicketPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'add-officer':
        return <AddOfficerPage />;
      case 'reports':
        return <ReportsPage />;
      case 'violation-types':
        return <ViolationTypesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderPage()}</AppLayout>;
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
