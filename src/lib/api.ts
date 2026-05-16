'use client';

import type { User, Violation, Payment, AdminStats, ViolationType, ReportData, Vehicle } from '@/types';

const API_BASE = '/api';

// Normalize violation data from backend nested format to flat format
function normalizeViolation(raw: Record<string, unknown>): Violation {
  return {
    id: raw.id as string,
    vehicleId: raw.vehicleId as string,
    officerId: raw.officerId as string,
    violationTypeId: raw.violationTypeId as string,
    location: raw.location as string | undefined,
    dateTime: raw.dateTime as string,
    fineAmount: raw.fineAmount as number,
    status: raw.status as 'pending' | 'paid' | 'cancelled',
    notes: raw.notes as string | undefined,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
    // Flatten nested objects
    registrationNumber: (raw.vehicle as Record<string, string>)?.registrationNumber || (raw.registrationNumber as string),
    violationTypeName: (raw.violationType as Record<string, string>)?.name || (raw.violationTypeName as string),
    officerName: (raw.officer as Record<string, string>)?.name || (raw.officerName as string),
    ownerName: (raw.ownerName as string) || undefined,
  };
}

function normalizePayment(raw: Record<string, unknown>): Payment {
  return {
    id: raw.id as string,
    violationId: raw.violationId as string,
    citizenId: raw.citizenId as string,
    amount: raw.amount as number,
    paymentDate: raw.paymentDate as string,
    receiptNumber: raw.receiptNumber as string,
    status: raw.status as 'success' | 'failed',
    createdAt: raw.createdAt as string,
    // Flatten nested objects
    violationTypeName: (raw.violation as Record<string, string>)?.violationType || (raw.violationTypeName as string),
    registrationNumber: (raw.violation as Record<string, string>)?.registrationNumber || (raw.registrationNumber as string),
  };
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('civitra_token');
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    return data as T;
  }

  // Auth
  async register(data: { name: string; email: string; password: string; phone?: string; nid?: string; vehicle_number?: string }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async forgotPassword(email: string): Promise<{ message: string; otp?: string }> {
    return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });
  }

  // Violations
  async getViolations(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Violation[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const data = await this.request<Record<string, unknown>>(`/violations${qs ? `?${qs}` : ''}`);
    let rawViolations: Record<string, unknown>[] = [];
    if (Array.isArray(data)) rawViolations = data;
    else if (data.violations) rawViolations = data.violations as Record<string, unknown>[];
    else if (data.recentViolations) rawViolations = data.recentViolations as Record<string, unknown>[];
    return rawViolations.map(normalizeViolation);
  }

  async getMyViolations(params?: { status?: string }): Promise<Violation[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    const data = await this.request<Record<string, unknown>>(`/violations/my${qs ? `?${qs}` : ''}`);
    let rawViolations: Record<string, unknown>[] = [];
    if (Array.isArray(data)) rawViolations = data;
    else rawViolations = (data.violations || []) as Record<string, unknown>[];
    return rawViolations.map(normalizeViolation);
  }

  async createViolation(data: { registration_number: string; violation_type_id: string; location: string; notes?: string }) {
    return this.request('/violations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateViolation(id: string, data: { status?: string; notes?: string }) {
    return this.request(`/violations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Payments
  async payFine(violationId: string): Promise<{ message: string; receipt_number: string; amount: number }> {
    return this.request('/payments/pay', { method: 'POST', body: JSON.stringify({ violation_id: violationId }) });
  }

  async getPaymentHistory(): Promise<Payment[]> {
    const data = await this.request<Record<string, unknown>>('/payments/history');
    let rawPayments: Record<string, unknown>[] = [];
    if (Array.isArray(data)) rawPayments = data;
    else rawPayments = (data.payments || []) as Record<string, unknown>[];
    return rawPayments.map(normalizePayment);
  }

  // Admin
  async getUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const data = await this.request<Record<string, unknown>>(`/admin/users${qs ? `?${qs}` : ''}`);
    if (Array.isArray(data)) return data;
    return data.users || data;
  }

  async createOfficer(data: { name: string; email: string; password: string; phone?: string }) {
    return this.request('/admin/create-officer', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUser(id: string, data: { name?: string; email?: string; phone?: string; isActive?: boolean }) {
    return this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async getStats(): Promise<AdminStats> {
    const data = await this.request<Record<string, unknown>>('/admin/stats');
    // Normalize recentViolations - stats endpoint returns flat data with different field names
    if (data.recentViolations && Array.isArray(data.recentViolations)) {
      data.recentViolations = (data.recentViolations as Record<string, unknown>[]).map((v) => ({
        ...normalizeViolation(v),
        // Stats endpoint uses flat field names, override normalized values
        registrationNumber: v.registrationNumber || (v.vehicle as Record<string, string>)?.registrationNumber,
        violationTypeName: v.violationType && typeof v.violationType === 'string' ? v.violationType : (v.violationType as Record<string, string>)?.name || v.violationTypeName,
        officerName: v.officerName || (v.officer as Record<string, string>)?.name,
      }));
    }
    return data as unknown as AdminStats;
  }

  async getViolationTypes(): Promise<ViolationType[]> {
    const data = await this.request<Record<string, unknown>>('/admin/violation-types');
    if (Array.isArray(data)) return data as ViolationType[];
    return (data.violationTypes || data) as ViolationType[];
  }

  async createViolationType(data: { name: string; description?: string; fineAmount: number }) {
    return this.request('/admin/violation-types', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateViolationType(id: string, data: { name?: string; description?: string; fineAmount?: number; isActive?: boolean }) {
    return this.request(`/admin/violation-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteViolationType(id: string) {
    return this.request(`/admin/violation-types/${id}`, { method: 'DELETE' });
  }

  async getReports(type: string, date?: string): Promise<ReportData> {
    const query = new URLSearchParams({ type });
    if (date) query.set('date', date);
    const data = await this.request<Record<string, unknown>>(`/admin/reports?${query.toString()}`);
    // Transform backend format to frontend format
    const typeBreakdown = (data.typeBreakdown || {}) as Record<string, { count: number; revenue: number }>;
    const statusBreakdown = (data.statusBreakdown || {}) as Record<string, number>;
    return {
      totalViolations: (data.totalViolations as number) || 0,
      totalRevenue: (data.totalRevenue as number) || 0,
      byType: Object.entries(typeBreakdown).map(([name, val]) => ({ name, count: val.count, revenue: val.revenue })),
      byStatus: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      topLocations: (data.topLocations || []) as { location: string; count: number }[],
      period: (data.period as { type: string; startDate: string; endDate: string })?.type || type,
    };
  }

  // Profile
  async getProfile(): Promise<{ user: User & { vehicles?: Vehicle[] }; vehicles?: Vehicle[] }> {
    return this.request('/profile');
  }

  async updateProfile(data: { name?: string; phone?: string; nid?: string }) {
    return this.request('/profile', { method: 'PUT', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
