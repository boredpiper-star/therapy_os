'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock analytics data
  const stats = {
    totalPatients: 248,
    activeSessions: 42,
    completedSessions: 1856,
    revenue: 127500,
    growth: {
      patients: 12.5,
      sessions: 8.3,
      revenue: 15.2,
    },
  };

  const sessionsByTherapist = [
    { name: 'Dr. Sarah Johnson', sessions: 156, rating: 4.8 },
    { name: 'Dr. Michael Chen', sessions: 142, rating: 4.9 },
    { name: 'Dr. Emily Rodriguez', sessions: 138, rating: 4.7 },
    { name: 'Dr. James Wilson', sessions: 124, rating: 4.6 },
  ];

  const sessionsByType = [
    { type: 'Speech Therapy', count: 420, percentage: 32 },
    { type: 'Occupational Therapy', count: 380, percentage: 29 },
    { type: 'Physical Therapy', count: 320, percentage: 24 },
    { type: 'Behavioral Therapy', count: 200, percentage: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Track performance and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Patients"
          value={stats.totalPatients}
          change={stats.growth.patients}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Active Sessions"
          value={stats.activeSessions}
          change={stats.growth.sessions}
          icon="📅"
          color="green"
        />
        <MetricCard
          title="Completed Sessions"
          value={stats.completedSessions}
          change={stats.growth.sessions}
          icon="✅"
          color="purple"
        />
        <MetricCard
          title="Revenue"
          value={`₹${(stats.revenue / 1000).toFixed(1)}k`}
          change={stats.growth.revenue}
          icon="💰"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Therapist Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Therapist Performance</h2>
          <div className="space-y-4">
            {sessionsByTherapist.map((therapist, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {therapist.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{therapist.name}</p>
                      <p className="text-sm text-gray-500">{therapist.sessions} sessions</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-gray-900">{therapist.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sessions by Type</h2>
          <div className="space-y-4">
            {sessionsByType.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">{item.type}</span>
                  <span className="text-gray-900 font-semibold">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[65, 78, 82, 90, 88, 95, 92, 98, 105, 112, 108, 120].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg hover:from-purple-600 hover:to-purple-400 transition-all cursor-pointer"
                style={{ height: `${(value / 120) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/analytics/patients" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Patient Analytics</h3>
          <p className="text-gray-600 text-sm">Detailed patient insights and trends</p>
        </Link>
        <Link href="/dashboard/analytics/revenue" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
          <div className="text-3xl mb-3">💵</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue Reports</h3>
          <p className="text-gray-600 text-sm">Financial performance and forecasts</p>
        </Link>
        <Link href="/dashboard/analytics/therapists" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer">
          <div className="text-3xl mb-3">👨‍⚕️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Therapist Metrics</h3>
          <p className="text-gray-600 text-sm">Performance and utilization stats</p>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
