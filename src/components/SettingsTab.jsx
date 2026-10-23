import React, { useState } from 'react';
import {
    User,
    Brain,
    Bell,
    Shield,
    Save,
    Check,
    Sparkles,
    Sliders
} from 'lucide-react';

export default function SettingsTab({ onNavigate }) {
    // Profile settings state (aligned with student proposal credentials)
    const [studentName, setStudentName] = useState('MUHAMMAD NABIL BIN MOHD ISA');
    const [matricNo, setMatricNo] = useState('B032410622');
    const [courseCode, setCourseCode] = useState('BITS - Software Development');
    const [email, setEmail] = useState('B032410622@student.utem.edu.my');

    // AI & Diagnostic preferences
    const [diagnosticSensitivity, setDiagnosticSensitivity] = useState('Adaptive');
    const [includePastYearTrends, setIncludePastYearTrends] = useState(true);
    const [autoWeaknessRemediation, setAutoWeaknessRemediation] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    // Save notification toast state
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            {/* Header & Two-step Breadcrumb */}
            <div className="pb-6 border-b border-slate-200">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-1.5 text-slate-500">
                    <button
                        type="button"
                        onClick={() => onNavigate ? onNavigate('dashboard') : null}
                        className="font-medium text-slate-500 hover:text-blue-600 transition hover:underline"
                    >
                        Home
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        System Settings
                    </span>
                </nav>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings & Preferences ⚙️</h1>
                <p className="text-sm text-slate-500">
                    Manage your student profile, configure AI diagnostic criteria, and adjust study alerts.
                </p>
            </div>

            <form onSubmit={handleSave} className="mt-6 max-w-4xl space-y-6">
                {/* Section 1: Student Profile Information */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Student Profile Information</h2>
                            <p className="text-xs text-slate-500">Your verified academic credentials in ACADEMIU.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Full Student Name</label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Student Matric Number</label>
                            <input
                                type="text"
                                value={matricNo}
                                disabled
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Enrolled Course / Specialisation</label>
                            <input
                                type="text"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Student Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: AI Diagnostic & Question Generator Settings */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Brain className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">AI Diagnostic & Exam Trends Settings</h2>
                            <p className="text-xs text-slate-500">Configure how the Google Gemini engine analyzes weaknesses and suggests questions.</p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Diagnostic Weakness Sensitivity</label>
                            <select
                                value={diagnosticSensitivity}
                                onChange={(e) => setDiagnosticSensitivity(e.target.value)}
                                className="w-full md:w-72 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="Adaptive">Adaptive (Default - Balances speed and accuracy)</option>
                                <option value="Strict">Strict (Flags errors on first calculation failure)</option>
                                <option value="Forgiving">Forgiving (Requires two consecutive failed drills)</option>
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">Controls how fast a learning dimension is marked as "Needs Revision".</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includePastYearTrends}
                                    onChange={(e) => setIncludePastYearTrends(e.target.checked)}
                                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <div>
                                    <div className="font-semibold text-slate-800">Prioritize Past-Year Exam Paper Topics</div>
                                    <div className="text-[11px] text-slate-500">
                                        Automatically align practice question difficulty with recurring topics from 2022–2025 past papers.
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoWeaknessRemediation}
                                    onChange={(e) => setAutoWeaknessRemediation(e.target.checked)}
                                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <div>
                                    <div className="font-semibold text-slate-800">Automatic Remediation Prompts</div>
                                    <div className="text-[11px] text-slate-500">
                                        Display the "Start 5-Min Drill" banner whenever accuracy drops below the 60% passing benchmark.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Section 3: Notification & Study Alerts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Study Notifications</h2>
                            <p className="text-xs text-slate-500">Choose when ACADEMIU alerts you about upcoming revision targets.</p>
                        </div>
                    </div>

                    <div className="mt-4 text-xs space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailAlerts}
                                onChange={(e) => setEmailAlerts(e.target.checked)}
                                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <div>
                                <div className="font-semibold text-slate-800">Weekly Weakness Digest via Email</div>
                                <div className="text-[11px] text-slate-500">
                                    Receive a summary of unremedied calculation or language gaps every Sunday evening.
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button & Feedback Toast */}
                <div className="flex items-center justify-between pt-2">
                    {isSaved ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                            <Check className="w-4 h-4" />
                            Settings saved successfully!
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400">All modifications are stored in local application state.</div>
                    )}

                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition"
                    >
                        <Save className="w-4 h-4" />
                        Save Preferences
                    </button>
                </div>
            </form>
        </div>
    );
}