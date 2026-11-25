import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Wrench,
    Mail,
    Lock,
    User,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Swords,
    Trophy,
    Flame,
    Eye,
    EyeOff,
    X,
    LogIn,
    UserPlus,
    LockKeyhole
} from 'lucide-react';
import { OfficialLogo, RankCrest, DEFAULT_SYSTEM_CONFIG } from '../App';
import AnnouncementBanner from './AnnouncementBanner';
import '../game-fit.css';

const ACCOUNTS_STORAGE_KEY = 'academiu_registered_accounts';

const DEFAULT_ADMIN_ACCOUNT = {
    name: 'Arena Admin',
    email: 'admin@academiu.com',
    password: 'admin123',
    provider: 'email',
    role: 'admin',
    status: 'active'
};

function loadAccounts() {
    try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const hasAdmin = parsed.some((acc) => acc.role === 'admin');
        if (!hasAdmin) {
            const seeded = [DEFAULT_ADMIN_ACCOUNT, ...parsed];
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(seeded));
            return seeded;
        }
        return parsed;
    } catch {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN_ACCOUNT]));
        return [DEFAULT_ADMIN_ACCOUNT];
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function GoogleIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.1z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.28 6.61l4 3.1c.95-2.84 3.6-4.96 6.72-4.96z"
            />
        </svg>
    );
}

export default function FrontPage({ onEnterApp, systemConfig = DEFAULT_SYSTEM_CONFIG }) {
    const cfg = { ...DEFAULT_SYSTEM_CONFIG, ...systemConfig };
    const isMaintenance = Boolean(cfg.maintenanceMode);
    const hasBanner = isMaintenance || Boolean(cfg.announcement?.trim());

    const [authMode, setAuthMode] = useState(isMaintenance ? 'admin' : 'signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [infoMsg, setInfoMsg] = useState('');

    // Strict Admin 2-Step Verification
    const [adminStep, setAdminStep] = useState(1);
    const [pendingAdmin, setPendingAdmin] = useState(null);

    // Google Modal State
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [googleContext, setGoogleContext] = useState('student-signin');
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleName, setGoogleName] = useState('');
    const [googleError, setGoogleError] = useState('');

    useEffect(() => {
        loadAccounts();
    }, []);

    useEffect(() => {
        if (isMaintenance) {
            setAuthMode('admin');
            setError('');
            setInfoMsg('');
        }
    }, [isMaintenance]);

    const switchMode = (nextMode) => {
        if (isMaintenance && nextMode !== 'admin') return;
        setAuthMode(nextMode);
        setError('');
        setInfoMsg('');
        setPassword('');
        setConfirmPassword('');
        setAdminStep(1);
        setPendingAdmin(null);
    };

    const handleStudentSignIn = (e) => {
        e.preventDefault();
        setError('');
        setInfoMsg('');

        if (isMaintenance) {
            setError('Student login is disabled during System Maintenance.');
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) {
            setError('Please enter both your email and password.');
            return;
        }

        const accounts = loadAccounts();
        const matched = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

        if (!matched) {
            setError('No account found with that email. Create an account first.');
            return;
        }

        if (matched.role === 'admin') {
            setError('Admin accounts must sign in through the Admin tab.');
            return;
        }

        if (matched.status === 'suspended') {
            setError('This account has been suspended by an administrator.');
            return;
        }

        if (matched.provider === 'google' && !matched.password) {
            setError('This account uses Google Sign-In. Please continue with Google below.');
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
            provider: matched.provider || 'email',
            isGuest: false
        });
    };

    const handleStudentSignUp = (e) => {
        e.preventDefault();
        setError('');
        setInfoMsg('');

        if (isMaintenance) {
            setError('Account registration is paused during System Maintenance.');
            return;
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || !cleanEmail || !password) {
            setError('Please fill in your name, email, and password.');
            return;
        }

        if (!cleanEmail.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const accounts = loadAccounts();
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

        saveAccounts([...accounts, newAccount]);

        onEnterApp({
            name: newAccount.name,
            email: newAccount.email,
            role: 'student',
            provider: 'email',
            isGuest: false
        });
    };

    const handleAdminStepOne = (e) => {
        e.preventDefault();
        setError('');
        setInfoMsg('');

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) {
            setError('Enter your registered Admin email and password.');
            return;
        }

        const accounts = loadAccounts();
        const matched = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

        if (!matched || matched.role !== 'admin') {
            setError('Access denied. This email is not authorized for Admin access.');
            return;
        }

        if (matched.status === 'suspended') {
            setError('This Admin account is currently suspended.');
            return;
        }

        if (matched.password && matched.password !== password) {
            setError('Invalid Admin password.');
            return;
        }

        setPendingAdmin(matched);
        setAdminStep(2);
        setInfoMsg('Credentials verified. Complete Step 2 with your Google account.');
        openGoogleModal('admin-verify', matched.email);
    };

    const openGoogleModal = (context, prefillEmail = '') => {
        if (isMaintenance && context !== 'admin-verify') return;
        setGoogleContext(context);
        setGoogleEmail(prefillEmail);
        setGoogleName('');
        setGoogleError('');
        setShowGoogleModal(true);
    };

    const handleCompleteGoogleAuth = (e) => {
        e.preventDefault();
        setGoogleError('');

        const cleanEmail = googleEmail.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            setGoogleError('Enter a valid Google email address.');
            return;
        }

        const accounts = loadAccounts();

        if (googleContext === 'admin-verify') {
            if (!pendingAdmin) {
                setGoogleError('Admin session expired. Please verify credentials again.');
                return;
            }

            if (cleanEmail !== pendingAdmin.email.toLowerCase()) {
                setGoogleError(
                    `Google account mismatch. Please verify using ${pendingAdmin.email}.`
                );
                return;
            }

            setShowGoogleModal(false);
            onEnterApp({
                name: pendingAdmin.name,
                email: pendingAdmin.email,
                role: 'admin',
                provider: 'google',
                isGuest: false
            });
            return;
        }

        const existing = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

        if (existing) {
            if (existing.role === 'admin') {
                setGoogleError(
                    'Admin accounts require Email + Password + Google verification via the Admin tab.'
                );
                return;
            }
            if (existing.status === 'suspended') {
                setGoogleError('This account has been suspended by an administrator.');
                return;
            }

            setShowGoogleModal(false);
            onEnterApp({
                name: existing.name,
                email: existing.email,
                role: existing.role || 'student',
                provider: 'google',
                isGuest: false
            });
            return;
        }

        if (googleContext === 'student-signin') {
            setGoogleError('No registered account found for this Google email. Switch to Sign Up first.');
            return;
        }

        const resolvedName =
            googleName.trim() ||
            cleanEmail
                .split('@')[0]
                .replace(/[._-]+/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

        const newGoogleStudent = {
            name: resolvedName,
            email: cleanEmail,
            password: '',
            provider: 'google',
            role: 'student',
            status: 'active'
        };

        saveAccounts([...accounts, newGoogleStudent]);
        setShowGoogleModal(false);
        onEnterApp({
            name: newGoogleStudent.name,
            email: newGoogleStudent.email,
            role: 'student',
            provider: 'google',
            isGuest: false
        });
    };

    const handleGuestEnter = () => {
        if (isMaintenance) return;
        onEnterApp({
            name: 'Guest Challenger',
            email: '',
            role: 'student',
            provider: 'guest',
            isGuest: true
        });
    };

    const previewTiers = ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'];

    return (
        <div className="h-dvh max-h-dvh overflow-hidden bg-[#09152E] text-[#FAF6EE] relative flex flex-col px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1E3F8A]/35 blur-3xl" />
                <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#D8B878]/15 blur-3xl" />
            </div>

            {/* Top Pennant Announcement / Maintenance Banner */}
            {hasBanner && (
                <div className="relative z-10 w-full max-w-6xl mx-auto mb-3 shrink-0">
                    <AnnouncementBanner
                        message={cfg.announcement}
                        maintenanceMode={isMaintenance}
                    />
                </div>
            )}

            {/* Main Fixed-Height Stage */}
            <div className="relative z-10 flex-1 min-h-0 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center overflow-hidden">
                {/* ============================================================
            LEFT SHOWCASE PANEL (7 COLS)
           ============================================================ */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-center gap-4 min-h-0">
                    {/* Enlarged Brand Crest + Status Pill */}
                    <div className="flex items-center justify-between gap-4">
                        <OfficialLogo
                            variant="full"
                            size="lg"
                            imgClassName={hasBanner ? 'h-20 xl:h-24' : 'h-24 xl:h-28'}
                        />

                        {isMaintenance ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-rose-200 bg-rose-500/20 border border-rose-400/50 px-3.5 py-1.5 rounded-full">
                                <Wrench className="w-3.5 h-3.5 text-rose-300" />
                                System Maintenance
                            </span>
                        ) : (
                            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D8B878] bg-[#D8B878]/10 border border-[#D8B878]/30 px-3.5 py-1.5 rounded-full">
                                Ranked Study Arena
                            </span>
                        )}
                    </div>

                    {/* Hero Copy */}
                    <div className="space-y-2">
                        <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-[#FAF6EE] leading-[1.1]">
                            Turn Lecture Notes Into{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D78E] to-[#D8B878]">
                                Ranked Arena Battles.
                            </span>
                        </h1>
                        <p className="text-sm text-[#A9B8D6] max-w-xl leading-relaxed">
                            Upload your PDFs, slides, or notes into Clutchup Arena to generate timed practice drills, protect your win streak, and climb from Warrior to Mythic every semester.
                        </p>
                    </div>

                    {/* System Rules Feature Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="rounded-2xl bg-[#0D1F44]/85 border border-[#D8B878]/25 p-3 space-y-1">
                            <div className="w-7 h-7 rounded-lg bg-[#1E3F8A]/70 border border-[#D8B878]/30 flex items-center justify-center text-[#F5D78E]">
                                <Swords className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs font-black text-[#FAF6EE]">Timed AI Drills</div>
                            <p className="text-[11px] text-[#A9B8D6] leading-snug">
                                {cfg.minQuestions}+ questions per match with a {cfg.countdownMinutes}-min timer.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[#0D1F44]/85 border border-[#D8B878]/25 p-3 space-y-1">
                            <div className="w-7 h-7 rounded-lg bg-[#1E3F8A]/70 border border-[#D8B878]/30 flex items-center justify-center text-[#F5D78E]">
                                <Flame className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs font-black text-[#FAF6EE]">Streak Multipliers</div>
                            <p className="text-[11px] text-[#A9B8D6] leading-snug">
                                {cfg.winStreakTrigger}x wins grant 2x stars; {cfg.lossStreakTrigger}x losses deduct 1★.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[#0D1F44]/85 border border-[#D8B878]/25 p-3 space-y-1">
                            <div className="w-7 h-7 rounded-lg bg-[#1E3F8A]/70 border border-[#D8B878]/30 flex items-center justify-center text-[#F5D78E]">
                                <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs font-black text-[#FAF6EE]">Season Archives</div>
                            <p className="text-[11px] text-[#A9B8D6] leading-snug">
                                Track {cfg.passTarget}% pass targets and archive every semester.
                            </p>
                        </div>
                    </div>

                    {/* Rank Progression Preview */}
                    <div className="rounded-2xl bg-[#0D1F44]/70 border border-white/10 px-4 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#D8B878]">
                                7-Tier Competitive Ladder
                            </span>
                            <span className="text-[10px] font-mono text-[#A9B8D6]">
                                Warrior → Mythic
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            {previewTiers.map((tier) => (
                                <div key={tier} className="flex flex-col items-center gap-0.5 shrink-0">
                                    <RankCrest tierName={tier} size="sm" />
                                    <span className="text-[10px] font-bold text-[#D6DEF0]">{tier}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================================================
            RIGHT AUTHENTICATION PORTAL (5 COLS)
           ============================================================ */}
                <div className="lg:col-span-5 w-full max-w-md mx-auto flex flex-col justify-center min-h-0">
                    {/* Compact Mobile Logo (shown only below lg) */}
                    <div className="flex lg:hidden justify-center mb-2 shrink-0">
                        <OfficialLogo variant="full" imgClassName="h-16" />
                    </div>

                    <div className="rounded-3xl bg-[#0D1F44]/95 border border-[#D8B878]/35 shadow-2xl p-5 sm:p-6 space-y-3.5 backdrop-blur-md">
                        {/* Compact Maintenance Lock Notice inside card */}
                        {isMaintenance && (
                            <div className="rounded-xl bg-rose-500/15 border border-rose-400/50 px-3 py-2 flex items-center gap-2">
                                <LockKeyhole className="w-4 h-4 text-rose-400 shrink-0" />
                                <span className="text-[11px] font-bold text-rose-100">
                                    Student login & guest mode are locked. Authorized Admins only.
                                </span>
                            </div>
                        )}

                        {/* Auth Mode Switcher */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#09152E] border border-white/10">
                            <button
                                type="button"
                                disabled={isMaintenance}
                                onClick={() => switchMode('signin')}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${authMode === 'signin'
                                        ? 'bg-[#1E3F8A] text-[#FAF6EE] shadow-sm border border-[#D8B878]/40'
                                        : 'text-[#A9B8D6] hover:text-white disabled:opacity-35 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Sign In</span>
                            </button>

                            <button
                                type="button"
                                disabled={isMaintenance}
                                onClick={() => switchMode('signup')}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${authMode === 'signup'
                                        ? 'bg-[#1E3F8A] text-[#FAF6EE] shadow-sm border border-[#D8B878]/40'
                                        : 'text-[#A9B8D6] hover:text-white disabled:opacity-35 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Sign Up</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode('admin')}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${authMode === 'admin'
                                        ? 'bg-gradient-to-r from-[#D8B878] to-[#F5D78E] text-[#09152E] font-black shadow-sm'
                                        : 'text-[#D8B878] hover:text-[#F5D78E]'
                                    }`}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Admin</span>
                            </button>
                        </div>

                        {/* Panel Heading */}
                        <div>
                            <h2 className="text-lg font-black text-[#FAF6EE]">
                                {authMode === 'signin' && 'Welcome Back, Challenger'}
                                {authMode === 'signup' && 'Create Arena Account'}
                                {authMode === 'admin' && 'Strict Admin Login'}
                            </h2>
                            <p className="text-[11px] text-[#A9B8D6] mt-0.5">
                                {authMode === 'signin' && 'Sign in to sync your season progress, folders, and rank.'}
                                {authMode === 'signup' && 'Start your Warrior-to-Mythic academic climb today.'}
                                {authMode === 'admin' && 'Requires verified Admin Email, Password, and Google check.'}
                            </p>
                        </div>

                        {/* Inline Alerts */}
                        {error && (
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {infoMsg && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{infoMsg}</span>
                            </div>
                        )}

                        {/* MODE 1: STUDENT SIGN IN */}
                        {authMode === 'signin' && !isMaintenance && (
                            <form onSubmit={handleStudentSignIn} className="space-y-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="student@university.edu"
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B8D6] hover:text-white"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 text-[#09152E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
                                >
                                    <span>Enter Arena</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}

                        {/* MODE 2: STUDENT SIGN UP */}
                        {authMode === 'signup' && !isMaintenance && (
                            <form onSubmit={handleStudentSignUp} className="space-y-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                        Full Name / Display Name
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Khalis Fikri"
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="student@university.edu"
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                            Password
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 chars"
                                            className="w-full px-3 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                            Confirm
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat"
                                            className="w-full px-3 py-2 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 text-[#09152E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
                                >
                                    <span>Create Account & Enter</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}

                        {/* MODE 3: STRICT ADMIN LOGIN */}
                        {authMode === 'admin' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <span
                                        className={`px-2.5 py-1 rounded-lg border ${adminStep === 1
                                                ? 'bg-[#1E3F8A] border-[#D8B878] text-[#FAF6EE]'
                                                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                            }`}
                                    >
                                        1. Email & Password
                                    </span>
                                    <span className="text-[#A9B8D6]">→</span>
                                    <span
                                        className={`px-2.5 py-1 rounded-lg border ${adminStep === 2
                                                ? 'bg-[#1E3F8A] border-[#D8B878] text-[#FAF6EE]'
                                                : 'bg-[#09152E] border-white/10 text-[#A9B8D6]'
                                            }`}
                                    >
                                        2. Google Verify
                                    </span>
                                </div>

                                {adminStep === 1 ? (
                                    <form onSubmit={handleAdminStepOne} className="space-y-2.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                                Admin Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-[#D8B878] absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="admin@academiu.com"
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09152E] border border-[#D8B878]/35 focus:border-[#F5D78E] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-[#D6DEF0] mb-1">
                                                Admin Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="w-4 h-4 text-[#D8B878] absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter admin password"
                                                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#09152E] border border-[#D8B878]/35 focus:border-[#F5D78E] text-xs sm:text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B8D6] hover:text-white"
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 text-[#09152E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Verify & Continue to Google</span>
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-2.5 rounded-2xl bg-[#09152E] border border-[#D8B878]/35 p-3.5">
                                        <div className="text-xs text-[#D6DEF0]">
                                            Verified credential for{' '}
                                            <span className="font-mono font-bold text-[#F5D78E]">
                                                {pendingAdmin?.email}
                                            </span>
                                            . Complete Google check to unlock the Admin Portal.
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openGoogleModal('admin-verify', pendingAdmin?.email || '')}
                                            className="w-full py-2 px-4 rounded-xl bg-[#FAF6EE] hover:bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition"
                                        >
                                            <GoogleIcon />
                                            <span>Verify with Google Account</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdminStep(1);
                                                setPendingAdmin(null);
                                                setInfoMsg('');
                                            }}
                                            className="w-full text-[11px] font-bold text-[#A9B8D6] hover:text-white transition"
                                        >
                                            Use a different Admin account
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GOOGLE & GUEST OPTIONS (STUDENT ONLY) */}
                        {authMode !== 'admin' && !isMaintenance && (
                            <div className="space-y-2 pt-0.5">
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-white/10" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A9B8D6]">
                                        Or Continue With
                                    </span>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        openGoogleModal(authMode === 'signup' ? 'student-signup' : 'student-signin')
                                    }
                                    className="w-full py-2 px-4 rounded-xl bg-[#FAF6EE] hover:bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                                >
                                    <GoogleIcon />
                                    <span>
                                        {authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleGuestEnter}
                                    className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#D8B878]/50 text-[#D6DEF0] hover:text-white font-bold text-xs transition"
                                >
                                    Try Guest Mode (Progress Not Saved)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* GOOGLE ACCOUNT VERIFICATION MODAL */}
            {showGoogleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl bg-[#FAF6EE] text-slate-900 shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <GoogleIcon className="w-5 h-5" />
                                <span className="text-sm font-black text-slate-900">
                                    {googleContext === 'admin-verify'
                                        ? 'Admin Google Verification'
                                        : googleContext === 'student-signup'
                                            ? 'Sign up with Google'
                                            : 'Sign in with Google'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGoogleModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCompleteGoogleAuth} className="p-6 space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {googleContext === 'admin-verify'
                                    ? `Confirm ownership of ${pendingAdmin?.email} to finalize strict Admin authentication for Clutchup Arena.`
                                    : 'Continue to Clutchup Arena using your Google account.'}
                            </p>

                            {googleError && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{googleError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Google Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={googleEmail}
                                    onChange={(e) => setGoogleEmail(e.target.value)}
                                    placeholder="yourname@gmail.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-sm font-semibold focus:outline-none"
                                />
                            </div>

                            {googleContext === 'student-signup' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Display Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={googleName}
                                        onChange={(e) => setGoogleName(e.target.value)}
                                        placeholder="Defaults to your email name"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-sm font-semibold focus:outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGoogleModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#1E3F8A] hover:bg-[#16306B] text-white text-xs font-bold transition"
                                >
                                    {googleContext === 'admin-verify' ? 'Verify & Enter Admin' : 'Continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}