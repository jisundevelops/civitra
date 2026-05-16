'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ReportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [period, date]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(period, date);
      setReport(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-amber-400',
    paid: 'text-emerald-400',
    cancelled: 'text-red-400',
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-[var(--c-text)]">Reports</h2>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 bg-[var(--c-card)]" />
          <Skeleton className="h-10 w-44 bg-[var(--c-card)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 bg-[var(--c-card)]" />
          <Skeleton className="h-28 bg-[var(--c-card)]" />
        </div>
        <Skeleton className="h-64 bg-[var(--c-card)]" />
      </div>
    );
  }

  const chartData = report?.byType.map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + '…' : item.name,
    count: item.count,
    revenue: item.revenue,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-[var(--c-text)]">Reports</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-36 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[var(--c-card)] border-[var(--c-input-border)]">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-44 bg-[var(--c-card)] border-[var(--c-input-border)] text-[var(--c-text)]"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--c-text-muted)] mb-1">Total Violations</p>
                <p className="text-2xl font-bold text-[var(--c-text)]">{report?.totalViolations || 0}</p>
              </div>
              <div className="h-11 w-11 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--c-text-muted)] mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--c-text)]">৳{report?.totalRevenue.toLocaleString() || 0}</p>
              </div>
              <div className="h-11 w-11 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--c-accent-text)]" />
              Violations by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                  />
                  <YAxis
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#16161f',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[var(--c-text)]">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {report?.byStatus && report.byStatus.length > 0 ? (
              <div className="space-y-3">
                {report.byStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--c-text)] capitalize">{item.status}</span>
                    <span className={`text-sm font-semibold ${statusColors[item.status] || 'text-[var(--c-text-muted)]'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--c-text-subtle)] text-sm">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="bg-[var(--c-card)] border-[var(--c-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[var(--c-text)] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report?.topLocations && report.topLocations.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {report.topLocations.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--c-text)] truncate mr-3">{item.location}</span>
                    <span className="text-sm font-semibold text-[var(--c-text)] shrink-0">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--c-text-subtle)] text-sm">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
