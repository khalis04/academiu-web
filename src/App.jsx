import React, { useState } from 'react';
import FrontPage from './components/FrontPage';
import StudentPerformanceReport from './components/StudentPerformanceReport';
import AchievementReport from './components/AchievementReport';
import SettingsTab from './components/SettingsTab';
import AiDiagnostic from './components/AiDiagnostic';
import Registration from './components/Registration';
import QuestionGenerator from './components/QuestionGenerator';
import {
  LayoutDashboard,
  Database,
  Brain,
  FileQuestion,
  BarChart2,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogOut
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState('performance');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // System navigation items
  const menuItems = [
    { id: 'registration', label: 'Registration', icon: UserPlus },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Academic Records (CRUDS)', icon: Database },
    { id: 'diagnostic', label: 'AI Weakness Diagnostic', icon: Brain },
    { id: 'generator', label: 'AI Question Generator', icon: FileQuestion },
    { id: 'performance', label: 'Student Performance Report', icon: BarChart2 },
    { id: 'achievement', label: 'Student Achievement Report', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleEnterApp = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setActiveTab('performance');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Animated Front Page transition
  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        <FrontPage onEnterApp={handleEnterApp} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 animate-fade-in">
      {/* Collapsible Left Sidebar Shell */}
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-64'
          } transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0`}
      >
        <div>
          {/* Brand Header & Toggle Button */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            {!isCollapsed ? (
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-blue-600 tracking-tight">ACADEMIU</h1>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" title="System Online" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block truncate mt-0.5">
                  UTeM Group 42
                </span>
              </div>
            ) : (
              <div className="mx-auto font-black text-blue-600 text-lg tracking-tight">
                AC
              </div>
            )}

            {/* Minimize / Maximize Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition ${isCollapsed ? 'mx-auto mt-2' : ''
                }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items with active click feedback */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Student Profile Footer & Log Out */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div
                onClick={() => setActiveTab('settings')}
                className="cursor-pointer hover:opacity-80 transition overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'Muhammad Nabil'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {currentUser?.matric || 'B032410622'} • BITS
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('settings')}
                  title="Account Settings"
                  className="text-slate-400 hover:text-blue-600 transition p-1"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  title="Log Out to Front Page"
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Log Out to Front Page"
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center font-bold text-xs mx-auto transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area: key={activeTab} triggers animate-slide-in on every module change */}
      <main className="flex-1 overflow-y-auto">
        <div key={activeTab} className="animate-slide-in h-full">
          {/* Module 4: Student Performance Report */}
          {activeTab === 'performance' && (
            <StudentPerformanceReport
              onNavigate={(tab) => setActiveTab(tab)}
              onNavigateToDrill={(weaknessType) => {
                alert(`Navigating to AI Question Generator for: ${weaknessType}`);
                setActiveTab('generator');
              }}
            />
          )}

          {/* Module 5: Student Achievement Report */}
          {activeTab === 'achievement' && (
            <AchievementReport
              onNavigate={(tab) => setActiveTab(tab)}
              onNavigateToDrill={(dimension) => {
                alert(`Navigating to AI Question Generator for dimension: ${dimension}`);
                setActiveTab('generator');
              }}
            />
          )}

          {/* AI Weakness Diagnostic Module */}
          {activeTab === 'diagnostic' && (
            <AiDiagnostic onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* Registration Module */}
          {activeTab === 'registration' && (
            <Registration onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* AI Question Generator Module */}
          {activeTab === 'generator' && (
            <QuestionGenerator onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* Settings Module */}
          {activeTab === 'settings' && (
            <SettingsTab onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back, {currentUser?.name || 'Muhammad Nabil'}. Click below to inspect your diagnostic results and learning progress.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setActiveTab('performance')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Open Student Performance Report ➔
                </button>
                <button
                  onClick={() => setActiveTab('achievement')}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  View Academic Achievement 🏆
                </button>
              </div>
            </div>
          )}

          {/* Unmerged Teammate Modules Fallback */}
          {activeTab === 'records' && (
            <div className="p-8 text-center mt-20">
              <h2 className="text-xl font-bold text-slate-700 capitalize">
                Academic Records (CRUDS)
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                This module slot is ready for your teammate to plug in their component.
              </p>
              <button
                onClick={() => setActiveTab('performance')}
                className="mt-6 text-xs text-blue-600 font-semibold underline hover:text-blue-800"
              >
                Back to My Performance Report
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}