import React, { useState } from 'react';
import {
    GraduationCap,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    User,
    BookOpen,
    Sparkles
} from 'lucide-react';

export default function FrontPage({ onEnterApp }) {
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [matric, setMatric] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onEnterApp({
            name: name || 'Muhammad Nabil',
            matric: matric || 'B032410622',
            email: email || 'student@utem.edu.my'
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
            {/* Top Navbar */}
            <header className="px-6 py-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo & Branding */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black tracking-tight text-white">ACADEMIU</span>
                                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                                    v2.0
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block">
                                Intelligent Academic Tracking & Diagnostic
                            </span>
                        </div>
                    </div>

                    {/* Top Skip Button */}
                    <button
                        onClick={() => onEnterApp({ name: 'Muhammad Nabil', matric: 'B032410622' })}
                        className="flex items-center gap-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-700 transition"
                    >
                        <span>Skip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Main Hero & Auth Container */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: System Value Proposition */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            UTeM Workshop 2 Academic Diagnostic Engine
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                            Master Your Weaknesses. <br />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                                Elevate Your Performance.
                            </span>
                        </h1>

                        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                            An intelligent learning companion designed to diagnose calculation, language,
                            and problem-solving bottlenecks through targeted AI drills and adaptive performance reports.
                        </p>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
                            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Automated Weakness Validation</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Formative Performance Radar</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>AI Practice Question Generator</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Official Transcripts & Badges</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sign In / Sign Up Form Card */}
                    <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
                        {/* Tab Switcher */}
                        <div className="flex rounded-xl bg-slate-900/80 p-1 mb-6 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setAuthMode('login')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'login'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthMode('signup')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authMode === 'signup'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'signup' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Full Student Name
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                                            Matric Number
                                        </label>
                                        <div className="relative">
                                            <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={matric}
                                                onChange={(e) => setMatric(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Student Email
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                            >
                                <span>{authMode === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Bottom Skip Option */}
                        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
                            <p className="text-[11px] text-slate-400">
                                Want to test features right away without typing credentials?
                            </p>
                            <button
                                type="button"
                                onClick={() => onEnterApp({ name: 'Muhammad Nabil', matric: 'B032410622' })}
                                className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition inline-flex items-center gap-1"
                            >
                                Skip ➔
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
                © 2026 ACADEMIU — Universiti Teknikal Malaysia Melaka (UTeM) Workshop 2 Group 42
            </footer>
        </div>
    );
}