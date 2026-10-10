// pages/Home.jsx - Landing Page for FixIt AI
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Droplets,
  Monitor,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Headphones,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getReportLink = () => {
    if (!isAuthenticated) return '/login';
    return '/complaints/create';
  };

  const getTrackLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/complaints';
    if (user?.role === 'staff') return '/staff/complaints';
    return '/complaints';
  };

  const categories = [
    {
      name: 'Electrical & Power',
      icon: Zap,
      desc: 'Breakers, circuit overloads, sparks, and lighting failures.',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      name: 'Plumbing & Drainage',
      icon: Droplets,
      desc: 'Pipe leakages, clogged sinks, water pressure, and sanitaries.',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      name: 'IT & AV Equipment',
      icon: Monitor,
      desc: 'Projectors, lab workstations, Wi-Fi routers, and network switches.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      name: 'HVAC & Cooling',
      icon: Sparkles,
      desc: 'Split air conditioners, central ventilation, and temperature units.',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    },
    {
      name: 'Security & Access',
      icon: ShieldCheck,
      desc: 'CCTV surveillance, entry barrier gates, and access cards.',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      name: 'Civil & Furniture',
      icon: Wrench,
      desc: 'Broken classroom desks, ergonomic chairs, door locks, and glass.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-24 pb-20 bg-gradient-to-b from-indigo-50/80 via-slate-50 to-white">
        {/* Background Decorative Mesh Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-blue-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm backdrop-blur-sm">
              <span className="p-1 bg-indigo-600 text-white rounded-full">
                <Sparkles className="w-3 h-3" />
              </span>
              <span>Next-Gen AI Maintenance & Facility Management Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Report Problems.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
                AI Triaged.
              </span>{' '}
              Resolved Fast.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              FixIt AI leverages intelligent complaint classification to automatically categorize issues, estimate priority levels, and dispatch campus technicians in seconds.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={getReportLink()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Report a Problem
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={getTrackLink()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all duration-200"
              >
                Track Complaint Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Step-by-Step Workflow
          </h2>
          <h3 className="text-3xl font-bold text-slate-900">
            How FixIt AI Resolves Issues
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            A transparent 4-stage lifecycle from problem reporting to verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 relative group">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Submit Ticket</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              User details the malfunction, enters location, and optionally clicks <strong>Analyze with AI</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 relative group">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-lg mb-2">AI Analysis & Review</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              AI suggests category, priority & department. Admin reviews and confirms final dispatch values.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 relative group">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Technician Fix</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Assigned staff accepts the job, sets status to "In Progress", and inspects site equipment.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 relative group">
            <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              4
            </span>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Resolved & Notified</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Staff logs resolution notes, complaint is marked "Resolved", and user receives an instant notification.
            </p>
          </div>
        </div>
      </section>

      {/* 3. COMPLAINT CATEGORIES */}
      <section className="bg-slate-50/80 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Comprehensive Coverage
            </h2>
            <h3 className="text-3xl font-bold text-slate-900">
              Maintenance Categories
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Organized departments ensure complaints reach the right technicians instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${cat.color} shadow-xs`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">
                    {cat.name}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES & WHY FIXIT AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Why FixIt AI
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 tracking-tight">
              A Modern SaaS Approach to Facility Maintenance
            </h3>
            <p className="text-slate-600 mt-4 leading-relaxed text-sm">
              Traditional paper logs and unorganized email threads result in lost
              tickets, delayed repairs, and zero accountability. FixIt AI provides
              a centralized digital hub for the entire campus facility ecosystem.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">
                    Real-time Status Tracking
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track complaints from Submission to Assignment, In-Progress, and Resolution with transparent timelines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">
                    Departmental Staff Assignment
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admins can dispatch specialized personnel (Electricians, Plumbers, IT Technicians) in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">
                    Audit Trail & Resolution Notes
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every resolved issue records staff notes and completion timestamps for thorough facility audits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-400">Live Campus Dispatch</span>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  v1.0 Ready
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">#FC1001: AC Unit Malfunction</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                    Assigned
                  </span>
                </div>
                <p className="text-xs text-slate-400">Computer Lab 301, 3rd Floor Science Wing</p>
                <div className="text-[11px] text-indigo-300 flex items-center gap-1.5 pt-1">
                  <Wrench className="w-3 h-3" /> Assigned to: Raj Patel (Electrical Dept.)
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">#FC1004: Switchboard Sparks</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Resolved
                  </span>
                </div>
                <p className="text-xs text-slate-400">Physics Lab 104, 1st Floor</p>
                <p className="text-[11px] text-emerald-300 italic pt-1">
                  Notes: "Burned 32A MCB breaker replaced and verified."
                </p>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                  Create Your Account Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl shadow-indigo-600/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to automate your maintenance workflow?
            </h3>
            <p className="text-lg text-indigo-100 font-medium leading-relaxed max-w-2xl mx-auto">
              Get issues fixed faster with AI-assisted triage, full complaint history tracking, and instant role-based alerts.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-9 py-4 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-2xl text-base shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-9 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl text-base backdrop-blur-xs transition-all duration-200"
              >
                Sign In with Demo Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
