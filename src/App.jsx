import React, { useState } from 'react';
import StudentPerformanceReport from './components/StudentPerformanceReport';
import SettingsTab from './components/SettingsTab';
import {
  LayoutDashboard,
  Database,
  Brain,
  FileQuestion,
  BarChart2,
  Award,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('performance');

  // Updated navigation menu: Admin Portal removed and replaced with Settings
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Academic Records (CRUDS)', icon: Database },
    { id: 'diagnostic', label: 'AI Weakness Diagnostic', icon: Brain },
    { id: 'generator', label: 'AI Question Generator', icon: FileQuestion },
    { id: 'performance', label: 'Student Performance Report', icon: BarChart2 },
    { id: 'achievement', label: 'Student Achievement Report', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* 260px Left Sidebar Shell (Consistent for all team members) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-blue-600 tracking-tight">ACADEMIU</h1>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">
                UTeM Workshop 2 Group 42
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="System Online" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Student Profile Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div
            onClick={() => setActiveTab('settings')}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <div className="text-xs font-bold text-slate-900">Muhammad Nabil</div>
            <div className="text-[10px] text-slate-400 font-mono">B032410622 • BITS</div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            title="Account Settings"
            className="text-slate-400 hover:text-blue-600 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Module 4: Student Performance Report (Your Assigned Module) */}
        {activeTab === 'performance' && (
          <StudentPerformanceReport
            onNavigate={(tab) => setActiveTab(tab)}
            onNavigateToDrill={(dimension) => {
              alert(`Navigating to AI Question Generator for dimension: ${dimension}`);
              setActiveTab('generator');
            }}
          />
        )}

        {/* Settings Module */}
        {activeTab === 'settings' && (
          <SettingsTab onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {/* Dashboard Placeholder */}
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, Muhammad Nabil. Click below to view your performance report.</p>
            <button
              onClick={() => setActiveTab('performance')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              Open Student Performance Report ➔
            </button>
          </div>
        )}

        {/* Teammate Placeholders */}
        {['records', 'diagnostic', 'generator', 'achievement'].includes(activeTab) && (
          <div className="p-8 text-center mt-20">
            <h2 className="text-xl font-bold text-slate-700 capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              This module component can be connected by your teammate here.
            </p>
            <button
              onClick={() => setActiveTab('performance')}
              className="mt-6 text-xs text-blue-600 font-semibold underline hover:text-blue-800"
            >
              Back to My Performance Report
            </button>
          </div>
        )}
      </main>
    </div>
  );
}