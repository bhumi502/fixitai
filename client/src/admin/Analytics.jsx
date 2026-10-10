// admin/Analytics.jsx - Deep-Dive Maintenance Analytics
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminService } from '../services/adminService';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Percent,
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner label="Aggregating performance metrics..." />
        </main>
      </div>
    );
  }

  const { summary = {}, charts = {} } = data || {};
  const { byCategory = [], byStatus = [], byPriority = [] } = charts;

  const total = summary.total || 0;
  const resolved = summary.resolved || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round(((summary.pending || 0) / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round(((summary.inProgress || 0) / total) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Maintenance Analytics & Trends
          </h1>
          <p className="text-sm text-slate-500">
            Quantitative analysis of resolution turnaround, department load, and incident severity
          </p>
        </div>

        {/* 3 KPI Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resolution Efficiency
              </span>
              <Percent className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{resolutionRate}%</h3>
              <span className="text-xs text-emerald-600 font-semibold">Of all filed tickets</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Awaiting Triage
              </span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{pendingRate}%</h3>
              <span className="text-xs text-amber-600 font-semibold">
                ({summary.pending || 0} tickets pending)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Operations
              </span>
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{inProgressRate}%</h3>
              <span className="text-xs text-indigo-600 font-semibold">
                ({summary.inProgress || 0} in active repair)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${inProgressRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Workload */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">
                Departmental Malfunction Distribution
              </h3>
              <span className="text-xs text-slate-400">Live Breakdown</span>
            </div>

            {byCategory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No records available.</p>
            ) : (
              <div className="space-y-4">
                {byCategory.map((cat) => {
                  const share = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <span className="text-slate-500 font-mono">
                          {cat.count} tickets ({share}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Severity & SLA Pressure */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">
                Priority & Severity Breakdown
              </h3>
              <span className="text-xs text-slate-400">Risk Assessment</span>
            </div>

            {byPriority.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No records available.</p>
            ) : (
              <div className="space-y-4">
                {byPriority.map((item) => {
                  const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const color =
                    item.priority === 'Critical'
                      ? 'bg-red-500'
                      : item.priority === 'High'
                      ? 'bg-orange-500'
                      : item.priority === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-slate-400';

                  return (
                    <div key={item.priority} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.priority}</span>
                        <span className="text-slate-500 font-mono">
                          {item.count} tickets ({share}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${color} h-3 rounded-full`}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
