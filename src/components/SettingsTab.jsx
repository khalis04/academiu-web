import React, { useState, useEffect } from 'react';
import { User, Mail, Clock, CheckCircle2, Shield, RotateCcw, Save, Lock, LogIn } from 'lucide-react';

export default function SettingsTab({ user, isGuest = false, onRequireSignIn, onNavigate }) {
    const [username, setUsername] = useState(user?.name || 'Player');
    const [email, setEmail] = useState(user?.email || 'you@example.com');
    const [defaultFormat, setDefaultFormat] = useState('MCQ');
    const [defaultTimer, setDefaultTimer] = useState(true);
    const [dailyReminder, setDailyReminder] = useState(true);
    const [savedToast, setSavedToast] = useState(false);

    useEffect(() => {
        if (user && !isGuest) {
            setUsername(user.name || 'Player');
            setEmail(user.email || '');
        }
    }, [user, isGuest]);

    if (isGuest) {
        return (
            <div className="game-fit items-center justify-center">
                <div className="game-card-sys rounded-2xl p-6 max-w-md w-full text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                        <Lock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                            Guest Mode
                        </span>
                        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
                        <p className="text-xs text-slate-500">
                            Sign in or create an account to save your profile, folders, and rank progression.
                        </p>
                    </div>
                    <div className="space-y-2 pt-1">
                        <button
                            type="button"
                            onClick={onRequireSignIn}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition inline-flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-4 h-4" /> Sign In / Sign Up
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('dashboard')}
                            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSave = (e) => {
        e.preventDefault();
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
    };

    const handleReset = () => {
        setDefaultFormat('MCQ');
        setDefaultTimer(true);
        setDailyReminder(true);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
    };

    return (
        <div className="game-fit text-slate-800">
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Options</h1>
                    <p className="text-xs text-slate-500">Profile, match defaults, and security</p>
                </div>

                {savedToast && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Saved
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col gap-3">
                <div className="game-fit-body grid grid-cols-1 lg:grid-cols-3 gap-3 content-start lg:content-stretch">
                    {/* USER CONTENT: Profile */}
                    <div className="game-card-user rounded-2xl p-5 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-wider text-[#D8B878] flex items-center gap-2 pb-2 border-b border-slate-100">
                            <User className="w-4 h-4" /> Profile
                        </h2>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* USER CONTENT: Drill Defaults */}
                    <div className="game-card-user rounded-2xl p-5 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-wider text-[#D8B878] flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Clock className="w-4 h-4" /> Match Defaults
                        </h2>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Format</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['MCQ', 'Fill-in-the-Blank'].map((fmt) => (
                                    <button
                                        type="button"
                                        key={fmt}
                                        onClick={() => setDefaultFormat(fmt)}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${defaultFormat === fmt ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Timer</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDefaultTimer(true)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${defaultTimer ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}
                                >
                                    Countdown
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDefaultTimer(false)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${!defaultTimer ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}
                                >
                                    Count Up
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-xs font-bold text-slate-800">Daily Reminder</span>
                            <button
                                type="button"
                                onClick={() => setDailyReminder(!dailyReminder)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${dailyReminder ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}
                            >
                                {dailyReminder ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>

                    {/* USER CONTENT: Security */}
                    <div className="game-card-user rounded-2xl p-5 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-wider text-[#D8B878] flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Shield className="w-4 h-4" /> Security
                        </h2>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                    >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}