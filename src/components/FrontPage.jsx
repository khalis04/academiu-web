import React, { useState, useEffect } from 'react';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    Swords,
    Trophy,
    FolderArchive,
    AlertCircle,
    X,
    CheckCircle2,
    UserCheck,
    ShieldCheck,
    Wrench
} from 'lucide-react';
import { OfficialLogo, RankCrest } from '../App';

const ACCOUNTS_STORAGE_KEY = 'academiu_registered_accounts';
const GOOGLE_ACCOUNTS_KEY = 'academiu_google_accounts';

const DEFAULT_ADMIN_ACCOUNT = {
    name: 'System Admin',
    email: 'admin@academiu.com',
    password: 'admin123',
    provider: 'email',
    role: 'admin',
    status: 'active'
};

function GoogleIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
        </svg>
    );
}

const getStoredAccounts = () => {
    let accounts = [];
    try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        accounts = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(accounts)) accounts = [];
    } catch {
        accounts = [];
    }

    // Ensure default registered admin exists so Admin Portal is always accessible
    const defaultIdx = accounts.findIndex(
        (acc) => acc.email?.toLowerCase() === DEFAULT_ADMIN_ACCOUNT.email
    );

    if (defaultIdx === -1) {
        accounts = [DEFAULT_ADMIN_ACCOUNT, ...accounts];
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } else if (!accounts[defaultIdx].password) {
        accounts[defaultIdx] = {
            ...DEFAULT_ADMIN_ACCOUNT,
            ...accounts[defaultIdx],
            password: DEFAULT_ADMIN_ACCOUNT.password,
            role: 'admin'
        };
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }

    return accounts;
};

export default function FrontPage({ onEnterApp, systemConfig = null }) {
    const isMaintenance = Boolean(systemConfig?.maintenanceMode);

    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Google Account Chooser Modal State
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [savedGoogleUsers, setSavedGoogleUsers] = useState([]);
    const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
    const [googleName, setGoogleName] = useState('');
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [verifyingGoogleEmail, setVerifyingGoogleEmail] = useState(null);

    useEffect(() => {
        getStoredAccounts();
        try {
            const raw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setSavedGoogleUsers(parsed);
            }
        } catch {
            setSavedGoogleUsers([]);
        }
    }, []);

    const switchToAdminLogin = () => {
        setIsAdminLogin(true);
        setAuthMode('signin');
        setError('');
        setPassword('');
    };

    const switchToStudentLogin = () => {
        setIsAdminLogin(false);
        setError('');
        setPassword('');
    };

    const handleEmailAuth = (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        if (!cleanEmail || !password.trim()) {
            setError('Please enter your email and password.');
            return;
        }

        const accounts = getStoredAccounts();

        // STRICT ADMIN AUTHENTICATION
        if (isAdminLogin) {
            const matched = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

            if (!matched) {
                setError('No registered admin account found with this email.');
                return;
            }
            if (matched.role !== 'admin') {
                setError('Access denied. This account does not have Administrator privileges.');
                return;
            }
            if (matched.status === 'suspended') {
                setError('This administrator account has been suspended.');
                return;
            }
            if (matched.provider === 'google' && !matched.password) {
                setError('This admin account is linked to Google. Use "Sign in with Google" above.');
                return;
            }
            if (matched.password !== password) {
                setError('Incorrect administrator password.');
                return;
            }

            onEnterApp({
                name: matched.name,
                email: matched.email,
                role: 'admin',
                isGuest: false,
                provider: matched.provider || 'email'
            });
            return;
        }

        // BLOCK STUDENTS DURING MAINTENANCE
        if (isMaintenance) {
            setError('Student login is disabled while Maintenance Mode is active.');
            return;
        }

        // STUDENT SIGN UP
        if (authMode === 'signup') {
            if (!cleanName) {
                setError('Please enter your display name.');
                return;
            }
            if (password.length < 4) {
                setError('Password must be at least 4 characters.');
                return;
            }

            const exists = accounts.some((acc) => acc.email.toLowerCase() === cleanEmail);
            if (exists) {
                setError('An account with this email already exists. Please sign in.');
                return;
            }

            const newAccount = {
                name: cleanName,
                email: cleanEmail,
                password,
                provider: 'email',
                role: 'student',
                status: 'active'
            };

            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
            onEnterApp({
                name: newAccount.name,
                email: newAccount.email,
                role: 'student',
                isGuest: false,
                provider: 'email'
            });
            return;
        }

        // STUDENT SIGN IN
        const matched = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);
        if (matched) {
            if (matched.status === 'suspended') {
                setError('This account has been suspended by an administrator.');
                return;
            }
            if (matched.provider === 'google' && !matched.password) {
                setError('This email is linked to Google. Use "Sign in with Google" above.');
                return;
            }
            if (matched.password !== password) {
                setError('Incorrect password. Please try again.');
                return;
            }

            onEnterApp({
                name: matched.name,
                email: matched.email,
                role: matched.role || 'student',
                isGuest: false,
                provider: 'email'
            });
        } else {
            // Quick sign-in for demo student emails not yet registered
            const fallbackName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
            const formattedName = fallbackName.replace(/\b\w/g, (c) => c.toUpperCase());

            onEnterApp({
                name: formattedName || 'Student',
                email: cleanEmail,
                role: 'student',
                isGuest: false,
                provider: 'email'
            });
        }
    };

    const openGoogleChooser = () => {
        if (!isAdminLogin && isMaintenance) {
            setError('Student login is disabled while Maintenance Mode is active.');
            return;
        }

        setError('');
        setGoogleError('');
        setGoogleName('');
        setGoogleEmail('');

        const visibleGoogleList = getVisibleGoogleAccounts();
        setShowCustomGoogleForm(visibleGoogleList.length === 0);
        setShowGoogleModal(true);
    };

    const getVisibleGoogleAccounts = () => {
        if (!isAdminLogin) return savedGoogleUsers;
        const accounts = getStoredAccounts();
        return savedGoogleUsers.filter((gu) => {
            const registered = accounts.find(
                (acc) => acc.email.toLowerCase() === gu.email.toLowerCase()
            );
            return registered && registered.role === 'admin';
        });
    };

    const completeGoogleSignIn = (profile) => {
        const cleanEmail = profile.email.trim().toLowerCase();
        const cleanName = (profile.name || '').trim() || cleanEmail.split('@')[0];

        const accounts = getStoredAccounts();
        const existing = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

        // STRICT ADMIN GOOGLE VERIFICATION
        if (isAdminLogin) {
            if (!existing) {
                setGoogleError(
                    'This Google account is not registered. Only registered Admin accounts can sign in here.'
                );
                return;
            }
            if (existing.role !== 'admin') {
                setGoogleError('Access denied. This registered Google account is not an Administrator.');
                return;
            }
            if (existing.status === 'suspended') {
                setGoogleError('This administrator account has been suspended.');
                return;
            }
        } else {
            if (isMaintenance) {
                setGoogleError('Student login is disabled during Maintenance Mode.');
                return;
            }
            if (existing?.status === 'suspended') {
                setGoogleError('This Google account has been suspended by an administrator.');
                return;
            }
        }

        setGoogleError('');
        setVerifyingGoogleEmail(cleanEmail);

        const assignedRole = existing?.role || 'student';

        // Save to Google account quick-list
        const updatedGoogleList = [
            { name: existing?.name || cleanName, email: cleanEmail },
            ...savedGoogleUsers.filter((u) => u.email.toLowerCase() !== cleanEmail)
        ];
        setSavedGoogleUsers(updatedGoogleList);
        localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updatedGoogleList));

        // Register new Google student account (Admin login never auto-registers)
        if (!existing && !isAdminLogin) {
            localStorage.setItem(
                ACCOUNTS_STORAGE_KEY,
                JSON.stringify([
                    ...accounts,
                    {
                        name: cleanName,
                        email: cleanEmail,
                        provider: 'google',
                        role: 'student',
                        status: 'active'
                    }
                ])
            );
        }

        setTimeout(() => {
            setVerifyingGoogleEmail(null);
            setShowGoogleModal(false);
            onEnterApp({
                name: existing?.name || cleanName,
                email: cleanEmail,
                role: assignedRole,
                isGuest: false,
                provider: 'google'
            });
        }, 550);
    };

    const handleCustomGoogleSubmit = (e) => {
        e.preventDefault();
        setGoogleError('');

        const cleanEmail = googleEmail.trim().toLowerCase();
        const cleanName = googleName.trim();

        if (!isAdminLogin && !cleanName) {
            setGoogleError('Enter your Google profile name.');
            return;
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
            setGoogleError('Enter a valid Google email address.');
            return;
        }

        completeGoogleSignIn({ name: cleanName, email: cleanEmail });
    };

    const handleGuestMode = () => {
        if (isMaintenance) return;
        onEnterApp({
            name: 'Guest Player',
            email: 'guest@academiu.local',
            role: 'student',
            isGuest: true
        });
    };

    const visibleGoogleAccounts = getVisibleGoogleAccounts();

    return (
        <div className="min-h-screen bg-[#09152E] text-[#FAF6EE] flex flex-col lg:flex-row">
            {/* LEFT SHOWCASE PANEL */}
            <div className="lg:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-gradient-to-br from-[#0D1F44] via-[#09152E] to-[#060E20] border-b lg:border-b-0 lg:border-r border-[#D8B878]/20">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="bg-[#FFFDF9] px-3.5 py-1.5 rounded-2xl shadow-md">
                        <OfficialLogo variant="full" />
                    </div>
                    {isMaintenance ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-rose-200 bg-rose-500/20 border border-rose-400/50 px-3 py-1 rounded-full">
                            <Wrench className="w-3.5 h-3.5 text-rose-300" />
                            System Maintenance
                        </span>
                    ) : (
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8B878] bg-[#D8B878]/10 border border-[#D8B878]/30 px-3 py-1 rounded-full">
                            Ranked Study Arena
                        </span>
                    )}
                </div>

                <div className="my-10 lg:my-0 max-w-xl space-y-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                        Turn lecture notes into{' '}
                        <span className="text-[#F5D78E]">ranked drills.</span>
                    </h1>
                    <p className="text-sm sm:text-base text-[#A9B8D6] leading-relaxed">
                        Organize your subjects inside custom Seasons, generate 10-question practice matches from your slides, earn stars, and climb from Warrior to Mythic.
                    </p>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-[#152C5B]/60 border border-[#8FB4FF]/20 space-y-1.5">
                            <FolderArchive className="w-5 h-5 text-[#D8B878]" />
                            <div className="text-xs font-black text-white">Season Vaults</div>
                            <p className="text-[11px] text-[#A9B8D6]">
                                Group subject folders and drill records by semester or year.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#152C5B]/60 border border-[#8FB4FF]/20 space-y-1.5">
                            <Swords className="w-5 h-5 text-blue-400" />
                            <div className="text-xs font-black text-white">10-Question Drills</div>
                            <p className="text-[11px] text-[#A9B8D6]">
                                Timed MCQ and Fill-in-the-Blank matches with instant review.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#152C5B]/60 border border-[#8FB4FF]/20 space-y-1.5">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <div className="text-xs font-black text-white">Streak Multipliers</div>
                            <p className="text-[11px] text-[#A9B8D6]">
                                Hit a 5-win 3★ streak to earn double stars on every match.
                            </p>
                        </div>
                    </div>

                    {/* Rank Crest Preview */}
                    <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F90B5] block mb-2.5">
                            Competitive Rank Divisions
                        </span>
                        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                            {['Warrior', 'Master', 'Epic', 'Legend', 'Mythic'].map((tier) => (
                                <div
                                    key={tier}
                                    className="flex flex-col items-center gap-1 bg-[#0D1F44]/90 border border-white/10 px-3 py-2 rounded-2xl"
                                >
                                    <RankCrest tierName={tier} size="sm" />
                                    <span className="text-[10px] font-bold text-[#D6DEF0]">{tier}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-[11px] text-[#7F90B5]">
                    Sync your Season progress across sessions with a Google or Email account.
                </div>
            </div>

            {/* RIGHT AUTH PANEL */}
            <div className="lg:w-5/12 p-6 sm:p-10 flex items-center justify-center bg-[#FAF6EE] text-slate-800">
                <div className="w-full max-w-md space-y-5">
                    {/* FRONT PAGE MAINTENANCE BANNER */}
                    {isMaintenance && (
                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1.5 shadow-sm">
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-rose-700">
                                <Wrench className="w-4 h-4 shrink-0" />
                                <span>Scheduled Maintenance Active</span>
                            </div>
                            <p className="text-xs text-rose-800 leading-relaxed">
                                {systemConfig?.announcement?.trim()
                                    ? systemConfig.announcement
                                    : 'ACADEMIU is currently undergoing system maintenance. Student sign-in, registration, and guest access are temporarily paused.'}
                            </p>
                        </div>
                    )}

                    {/* ==============================================================
              MODE A: MAINTENANCE LOCK SCREEN FOR STUDENTS
             ============================================================== */}
                    {isMaintenance && !isAdminLogin ? (
                        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                                <Lock className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900">
                                    Student Access Paused
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    All your saved Seasons, subject folders, and rank stars are safe. Please check back once maintenance finishes.
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={switchToAdminLogin}
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0D1F44] hover:bg-[#152C5B] text-[#F5D78E] text-xs font-bold transition"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Administrator Sign In</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ==============================================================
                           MODE B: ADMIN LOGIN OR NORMAL STUDENT LOGIN/SIGNUP
                          ============================================================== */
                        <>
                            {/* Header & Mode Switch */}
                            <div className="space-y-2">
                                {isAdminLogin ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-[#0D1F44] text-[#F5D78E] border border-[#D8B878]/50">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Admin Portal Login
                                        </span>
                                        <button
                                            type="button"
                                            onClick={switchToStudentLogin}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            Back
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-flex rounded-xl bg-slate-200/80 p-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthMode('signin');
                                                setError('');
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'signin'
                                                    ? 'bg-[#0D1F44] text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthMode('signup');
                                                setError('');
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'signup'
                                                    ? 'bg-[#0D1F44] text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                )}

                                <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                                    {isAdminLogin
                                        ? 'Administrator Verification'
                                        : authMode === 'signin'
                                            ? 'Welcome back'
                                            : 'Create your player profile'}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {isAdminLogin
                                        ? 'Sign in with a registered administrator email & password or a registered Admin Google account.'
                                        : authMode === 'signin'
                                            ? 'Sign in to load your active Season, subject folders, and rank.'
                                            : 'Sign up to save your Season folders and climb the ranked ladder.'}
                                </p>
                            </div>

                            {/* Google Sign-In / Sign-Up Button */}
                            <button
                                type="button"
                                onClick={openGoogleChooser}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm text-sm font-bold transition active:scale-[0.99]"
                            >
                                <GoogleIcon className="w-5 h-5 shrink-0" />
                                <span>
                                    {isAdminLogin
                                        ? 'Sign in with Registered Admin Google'
                                        : authMode === 'signin'
                                            ? 'Sign in with Google'
                                            : 'Sign up with Google'}
                                </span>
                            </button>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center">
                                <div className="border-t border-slate-200 w-full" />
                                <span className="bg-[#FAF6EE] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                    or with email
                                </span>
                                <div className="border-t border-slate-200 w-full" />
                            </div>

                            {/* Email / Password Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {!isAdminLogin && authMode === 'signup' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Display Name
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Khalis Fikri"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {isAdminLogin ? 'Admin Email Address' : 'Email Address'}
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={isAdminLogin ? 'admin@academiu.com' : 'student@email.com'}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition ${isAdminLogin
                                            ? 'bg-[#0D1F44] hover:bg-[#152C5B] text-[#F5D78E]'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    <span>
                                        {isAdminLogin
                                            ? 'Verify & Enter Admin Panel'
                                            : authMode === 'signin'
                                                ? 'Sign In'
                                                : 'Create Account'}
                                    </span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Footer Links: Admin Portal & Guest Mode */}
                            {!isAdminLogin && (
                                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={switchToAdminLogin}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#B48A3E]" />
                                        Admin Portal
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleGuestMode}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3F8A] hover:underline"
                                    >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        Continue as Guest
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* =================================================================
          GOOGLE ACCOUNT CHOOSER MODAL
         ================================================================= */}
            {showGoogleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white text-slate-800 shadow-2xl border border-slate-200 overflow-hidden">
                        {/* Google Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <GoogleIcon className="w-5 h-5" />
                                <span className="text-sm font-bold text-slate-800">
                                    {isAdminLogin
                                        ? 'Admin Sign in with Google'
                                        : authMode === 'signin'
                                            ? 'Sign in with Google'
                                            : 'Sign up with Google'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGoogleModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {isAdminLogin ? 'Select a registered Admin account' : 'Choose an account'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {isAdminLogin
                                        ? 'Only Google accounts granted Admin access can continue.'
                                        : 'to continue to ACADEMIU'}
                                </p>
                            </div>

                            {googleError && !showCustomGoogleForm && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{googleError}</span>
                                </div>
                            )}

                            {/* Saved Google Accounts List */}
                            {visibleGoogleAccounts.length > 0 && (
                                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                                    {visibleGoogleAccounts.map((acc) => {
                                        const isVerifying = verifyingGoogleEmail === acc.email;
                                        return (
                                            <button
                                                key={acc.email}
                                                type="button"
                                                disabled={Boolean(verifyingGoogleEmail)}
                                                onClick={() => completeGoogleSignIn(acc)}
                                                className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-blue-50/50 transition text-left disabled:opacity-60"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                                        {acc.name.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-slate-900 truncate">
                                                            {acc.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                                                    </div>
                                                </div>

                                                {isVerifying ? (
                                                    <span className="text-[11px] font-bold text-blue-600 shrink-0">
                                                        Verifying...
                                                    </span>
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Toggle / Form for Entering a Google Account */}
                            {!showCustomGoogleForm ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setGoogleError('');
                                        setShowCustomGoogleForm(true);
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
                                >
                                    <User className="w-4 h-4 text-slate-500" />
                                    {isAdminLogin
                                        ? 'Enter another registered Admin Google email'
                                        : 'Use another Google account'}
                                </button>
                            ) : (
                                <form
                                    onSubmit={handleCustomGoogleSubmit}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                                >
                                    <div className="text-xs font-bold text-slate-800">
                                        {isAdminLogin
                                            ? 'Verify Registered Admin Google Email'
                                            : 'Enter Google Account Details'}
                                    </div>

                                    {googleError && (
                                        <div className="text-[11px] font-bold text-rose-600">{googleError}</div>
                                    )}

                                    {!isAdminLogin && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                Google Display Name
                                            </label>
                                            <input
                                                type="text"
                                                autoFocus
                                                value={googleName}
                                                onChange={(e) => setGoogleName(e.target.value)}
                                                placeholder="e.g. Khalis Fikri"
                                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                            Google Email
                                        </label>
                                        <input
                                            type="email"
                                            autoFocus={isAdminLogin}
                                            value={googleEmail}
                                            onChange={(e) => setGoogleEmail(e.target.value)}
                                            placeholder="yourname@gmail.com"
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        {visibleGoogleAccounts.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGoogleError('');
                                                    setShowCustomGoogleForm(false);
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={Boolean(verifyingGoogleEmail)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50"
                                        >
                                            <span>{isAdminLogin ? 'Verify Admin' : 'Continue'}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}