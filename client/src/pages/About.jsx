// pages/About.jsx - About FIXIT AI and Academic Project Context
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  GraduationCap,
  Layers,
  Database,
  Cpu,
  CheckCircle,
  Shield,
  Clock,
} from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          Academic M.Sc. IT Project
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About FixIt AI
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          An AI-Powered Complaint & Maintenance Management System designed to
          revolutionize how educational campuses and commercial enterprises report,
          track, and resolve physical facility problems.
        </p>
      </div>

      {/* Project Mission & Objective */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mission & Purpose</h2>
            <p className="text-xs text-slate-500">Why this system was conceived</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Facility issues—such as leaking pipes, non-functional air conditioning,
          electrical faults, or damaged classroom furniture—frequently lead to academic
          disruption and productivity loss. FixIt AI eliminates delays and lack of
          accountability by replacing scattered informal complaints with an automated,
          role-governed lifecycle with complete transparency.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">User Role</h4>
            <p className="text-xs text-slate-500">
              Submit tickets with photos, track status in real-time, view notifications, and update pending complaints.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Staff Role</h4>
            <p className="text-xs text-slate-500">
              Manage assigned tasks, update operational statuses, and file completion notes with audit timestamps.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Admin Role</h4>
            <p className="text-xs text-slate-500">
              Oversee campus facilities, dispatch technicians, manage user accounts, manage categories, and inspect analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 text-center">
          Technology Architecture
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Frontend</h4>
            <p className="text-xs text-slate-500">
              React.js, Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Backend</h4>
            <p className="text-xs text-slate-500">
              Node.js, Express.js, REST API architecture, JWT Authentication, Multer file upload.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Database</h4>
            <p className="text-xs text-slate-500">
              MongoDB, Mongoose ODM schemas, relational references, automated indexes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Security</h4>
            <p className="text-xs text-slate-500">
              Bcrypt password hashing, Role-Based Access Control (RBAC), Protected routes.
            </p>
          </div>
        </div>
      </div>

      {/* Stage Roadmap */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white space-y-4">
        <h3 className="text-xl font-bold">Project Development Phases</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Current Stage:</strong> Full Responsive Website UI + Real MongoDB CRUD + Role-based Dashboards & Notifications.
            </span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Upcoming Stage:</strong> AI Auto-categorization, Computer Vision Image Severity Assessment, and Automated Priority Scoring.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
