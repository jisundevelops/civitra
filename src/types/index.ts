export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'police' | 'admin';
  phone?: string;
  nid?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  ownerId?: string;
  vehicleType?: string;
  createdAt: string;
  owner?: User;
}

export interface ViolationType {
  id: string;
  name: string;
  description?: string;
  fineAmount: number;
  isActive: boolean;
}

export interface Violation {
  id: string;
  vehicleId: string;
  officerId: string;
  violationTypeId: string;
  location?: string;
  dateTime: string;
  fineAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  registrationNumber?: string;
  violationTypeName?: string;
  officerName?: string;
  ownerName?: string;
  vehicle?: Vehicle;
  violationType?: ViolationType;
  officer?: User;
}

export interface Payment {
  id: string;
  violationId: string;
  citizenId: string;
  amount: number;
  paymentDate: string;
  receiptNumber: string;
  status: 'success' | 'failed';
  createdAt: string;
  violationTypeName?: string;
  registrationNumber?: string;
}

export interface AdminStats {
  totalViolations: number;
  pendingViolations: number;
  totalRevenue: number;
  totalCitizens: number;
  totalPolice: number;
  recentViolations: Violation[];
}

export interface ReportData {
  totalViolations: number;
  totalRevenue: number;
  byType: { name: string; count: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
  topLocations: { location: string; count: number }[];
  period: string;
}

export type PageName =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'my-violations'
  | 'all-violations'
  | 'pay-fine'
  | 'payment-history'
  | 'issue-ticket'
  | 'admin-users'
  | 'reports'
  | 'violation-types'
  | 'profile';
