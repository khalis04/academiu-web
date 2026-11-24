import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
    ArrowLeft,
    ShieldCheck,
    Users,
    Sliders,
    Megaphone,
    ClipboardList,
    BarChart3,
    AlertTriangle,
    LogOut,
    Search,
    Ban,
    CheckCircle2,
    RotateCcw,
    Save,
    Trash2,
    Swords,
    FolderArchive,
    Trophy,
    Wrench,
    Eye
} from 'lucide-react';
import { OfficialLogo, RankCrest, DEFAULT_SYSTEM_CONFIG } from '../App';
import '../game-fit.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ACCOUNTS_STORAGE_KEY = 'academiu_registered_accounts';
const AUDIT_LOG_KEY = 'academiu_admin_audit_log';

const ADMIN_TABS = [
    { id: 'overview', label: 'Telemetry', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rules', label: 'Rank & Rules', icon: Sliders },
    { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
    { id: 'audit', label: 'Audit Log', icon: ClipboardList }
];

function resolveTierName(stars, tiers) {
    let matched = tiers[0]?.name || 'Warrior';
    for (let i = 0; i < tiers.length; i++) {
        if (stars >= tiers[i].min) matched = tiers[i].name;
    }
    return matched;
}

export default function AdminPanel({
    currentUser,
    systemConfig,
    onUpdateConfig,
    onSwitchToStudent,
    onLogout
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [tabHistory, setTabHistory] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Editable Rule Engine Draft
    const [configDraft, setConfigDraft] = useState(systemConfig);
    const [saveFeedback, setSaveFeedback] = useState('');

    // Audit Log
    const [auditLogs, setAuditLogs] = useState([]);

    const canGoBack = tabHistory.length > 0 || activeTab !== 'overview';

    const navigateToTab = (nextTab) => {
        if (nextTab === activeTab) return;
        setTabHistory((prev) => [...prev, activeTab]);
        setActiveTab(nextTab);
    };

    const handleGoBack = () => {
        if (tabHistory.length > 0) {
            const previousTab = tabHistory[tabHistory.length - 1];
            setTabHistory((prev) => prev.slice(0, -1));
            setActiveTab(previousTab);
        } else if (activeTab !== 'overview') {
            setActiveTab('overview');
        }
    };

    useEffect(() => {
        setConfigDraft(systemConfig);
    }, [systemConfig]);

    const loadAuditLogs = () => {
        try {
            const raw = localStorage.getItem(AUDIT_LOG_KEY);
            setAuditLogs(raw ? JSON.parse(raw) : []);
        } catch {
            setAuditLogs([]);
        }
    };

    const appendAuditLog = (action, target, details = '') => {
        const entry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            adminEmail: currentUser?.email || 'admin@academiu.com',
            action,
            target,
            details
        };
        setAuditLogs((prev) => {
            const updated = [entry, ...prev].slice(0, 100);
            localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const loadUsersFromStorage = () => {
        let registered = [];
        try {
            const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            registered = raw ? JSON.parse(raw) : [];
        } catch {
            registered = [];
        }

        // Merge accounts with their stored progress data
        const accountMap = new Map();
        registered.forEach((acc) => {
            const emailKey = (acc.email || '').toLowerCase();
            if (!emailKey) return;
            accountMap.set(emailKey, {
                name: acc.name || emailKey.split('@')[0],
                email: emailKey,
                provider: acc.provider || 'email',
                role: acc.role || (emailKey === 'admin@academiu.com' ? 'admin' : 'student'),
                status: acc.status || 'active'
            });
        });

        // Also detect any email that has progress saved in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('academiu_progress_')) {
                const emailKey = key.replace('academiu_progress_', '').toLowerCase();
                if (!accountMap.has(emailKey)) {
                    accountMap.set(emailKey, {
                        name: emailKey.split('@')[0],
                        email: emailKey,
                        provider: 'email',
                        role: emailKey === 'admin@academiu.com' ? 'admin' : 'student',
                        status: 'active'
                    });
                }
            }
        }

        const enriched = Array.from(accountMap.values()).map((acc) => {
            let progress = null;
            try {
                const pRaw = localStorage.getItem(`academiu_progress_${acc.email}`);
                progress = pRaw ? JSON.parse(pRaw) : null;
            } catch {
                progress = null;
            }

            const matchHistory = progress?.matchHistory || [];
            const registeredSubjects = progress?.registeredSubjects || [];
            const archivedSeasons = progress?.archivedSeasons || [];
            const totalStars = progress?.totalStars ?? 0;
            const currentSeason = progress?.currentSeason || null;

            const avgScore =
                matchHistory.length > 0
                    ? Math.round(matchHistory.reduce((s, m) => s + m.score, 0) / matchHistory.length)
                    : null;

            const passedCount = matchHistory.filter(
                (m) => m.score >= systemConfig.passTarget
            ).length;

            return {
                ...acc,
                totalStars,
                tierName: resolveTierName(totalStars, systemConfig.tiers),
                currentSeasonName: currentSeason?.name || 'Not Started',
                hasActiveSeason: Boolean(currentSeason),
                archivedCount: archivedSeasons.length,
                folderCount: registeredSubjects.length,
                drillCount: matchHistory.length,
                passedCount,
                avgScore
            };
        });

        setUsersData(enriched);
    };

    useEffect(() => {
        loadUsersFromStorage();
        loadAuditLogs();
    }, [systemConfig]);

    // Platform-wide KPIs
    const telemetry = useMemo(() => {
        const totalUsers = usersData.length;
        const suspendedUsers = usersData.filter((u) => u.status === 'suspended').length;
        const activeSeasons = usersData.filter((u) => u.hasActiveSeason).length;
        const totalArchived = usersData.reduce((s, u) => s + u.archivedCount, 0);
        const totalDrills = usersData.reduce((s, u) => s + u.drillCount, 0);
        const totalPassed = usersData.reduce((s, u) => s + u.passedCount, 0);
        const passRate = totalDrills > 0 ? Math.round((totalPassed / totalDrills) * 100) : 0;

        const tierCounts = systemConfig.tiers.map((tier) => ({
            name: tier.name,
            count: usersData.filter((u) => u.tierName === tier.name).length
        }));

        return {
            totalUsers,
            suspendedUsers,
            activeSeasons,
            totalArchived,
            totalDrills,
            passRate,
            tierCounts
        };
    }, [usersData, systemConfig.tiers]);

    const rankDistributionData = {
        labels: telemetry.tierCounts.map((t) => t.name),
        datasets: [
            {
                label: 'Players',
                data: telemetry.tierCounts.map((t) => t.count),
                backgroundColor: 'rgba(216, 184, 120, 0.75)',
                borderColor: '#F5D78E',
                borderWidth: 1.5,
                borderRadius: 8
            }
        ]
    };

    const rankDistributionOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#A9B8D6', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.08)' }
            },
            x: {
                ticks: { color: '#D6DEF0', font: { size: 11, weight: '600' } },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return usersData.filter((u) => {
            const matchesSearch =
                !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Active' && u.status === 'active') ||
                (statusFilter === 'Suspended' && u.status === 'suspended') ||
                (statusFilter === 'Admins' && u.role === 'admin');
            return matchesSearch && matchesStatus;
        });
    }, [usersData, searchQuery, statusFilter]);

    const updateStoredAccountField = (email, patch, actionLabel) => {
        if (email === currentUser?.email?.toLowerCase() && patch.status === 'suspended') {
            return;
        }

        let registered = [];
        try {
            const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            registered = raw ? JSON.parse(raw) : [];
        } catch {
            registered = [];
        }

        const exists = registered.some((acc) => acc.email.toLowerCase() === email);
        let updated;
        if (exists) {
            updated = registered.map((acc) =>
                acc.email.toLowerCase() === email ? { ...acc, ...patch } : acc
            );
        } else {
            const found = usersData.find((u) => u.email === email);
            updated = [
                ...registered,
                {
                    name: found?.name || email.split('@')[0],
                    email,
                    provider: found?.provider || 'email',
                    role: found?.role || 'student',
                    status: found?.status || 'active',
                    ...patch
                }
            ];
        }

        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
        appendAuditLog(actionLabel, email, JSON.stringify(patch));
        loadUsersFromStorage();
    };

    const handleTierThresholdChange = (tierName, rawValue) => {
        const numeric = Math.max(0, parseInt(rawValue, 10) || 0);
        setConfigDraft((prev) => ({
            ...prev,
            tiers: prev.tiers.map((t) =>
                t.name === tierName ? { ...t, min: tierName === 'Warrior' ? 0 : numeric } : t
            )
        }));
    };

    const handleSaveRules = (e) => {
        e.preventDefault();
        const sortedTiers = [...configDraft.tiers].sort((a, b) => a.min - b.min);
        const cleanedConfig = {
            ...configDraft,
            tiers: sortedTiers,
            passTarget: Math.min(95, Math.max(30, Number(configDraft.passTarget) || 60)),
            winStreakTrigger: Math.max(2, Number(configDraft.winStreakTrigger) || 5),
            lossStreakTrigger: Math.max(1, Number(configDraft.lossStreakTrigger) || 2),
            minQuestions: Math.max(5, Number(configDraft.minQuestions) || 10),
            countdownMinutes: Math.max(1, Number(configDraft.countdownMinutes) || 5)
        };

        onUpdateConfig(cleanedConfig);
        appendAuditLog(
            'Updated Rule Engine',
            'SYSTEM_CONFIG',
            `Pass ${cleanedConfig.passTarget}%, WinStreak ${cleanedConfig.winStreakTrigger}, LossStreak ${cleanedConfig.lossStreakTrigger}, MinQ ${cleanedConfig.minQuestions}`
        );
        setSaveFeedback('Rules saved and synced to student arena.');
        setTimeout(() => setSaveFeedback(''), 3000);
    };

    const handleResetDefaultRules = () => {
        if (!window.confirm('Reset all rank thresholds and streak rules to ACADEMIU defaults?')) return;
        const resetConfig = {
            ...DEFAULT_SYSTEM_CONFIG,
            announcement: configDraft.announcement,
            maintenanceMode: configDraft.maintenanceMode
        };
        setConfigDraft(resetConfig);
        onUpdateConfig(resetConfig);
        appendAuditLog('Reset Rule Engine', 'SYSTEM_CONFIG', 'Restored default rank & streak rules');
        setSaveFeedback('Restored default rules.');
        setTimeout(() => setSaveFeedback(''), 3000);
    };

    const handleSaveBroadcast = (e) => {
        e.preventDefault();
        const cleanedConfig = {
            ...systemConfig,
            announcement: configDraft.announcement.trim(),
            maintenanceMode: Boolean(configDraft.maintenanceMode)
        };
        onUpdateConfig(cleanedConfig);
        appendAuditLog(
            'Updated Broadcast / Maintenance',
            'GAME_SHELL',
            `Maintenance: ${cleanedConfig.maintenanceMode ? 'ON' : 'OFF'}`
        );
        setSaveFeedback('Broadcast settings published.');
        setTimeout(() => setSaveFeedback(''), 3000);
    };

    const handleClearAuditLogs = () => {
        if (!window.confirm('Clear all audit log entries?')) return;
        localStorage.removeItem(AUDIT_LOG_KEY);
        setAuditLogs([]);
    };

    return (
        <div className="game-shell flex flex-col h-screen overflow-hidden">
            {/* ===== ADMIN TOP HUD ===== */}
            <header className="game-hud">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Top-Left Back Button */}
                    <button
                        type="button"
                        onClick={handleGoBack}
                        disabled={!canGoBack}
                        title="Go back"
                        aria-label="Go back"
                        className="game-icon-btn shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Clickable Logo -> Back to Admin Home (Telemetry) */}
                    <button
                        type="button"
                        onClick={() => navigateToTab('overview')}
                        title="Back to Admin Home"
                        aria-label="Back to Admin Home"
                        className="game-logo-pill cursor-pointer hover:brightness-105 active:scale-[0.98] transition"
                    >
                        <OfficialLogo variant="full" />
                    </button>

                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#D8B878]/15 border border-[#D8B878]/50 text-[#F5D78E]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Control Plane
                    </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={onSwitchToStudent}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F5D78E] bg-[#1E3F8A]/70 border border-[#D8B878]/40 hover:border-[#D8B878] transition"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Student View</span>
                    </button>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A9B8D6] hover:text-white bg-white/5 border border-white/15 hover:border-[#D8B878] transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Log Out</span>
                    </button>
                </div>
            </header>

            {/* ===== ADMIN MAIN STAGE ===== */}
            <main className="game-main flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* Global Feedback Toast */}
                {saveFeedback && (
                    <div className="mb-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{saveFeedback}</span>
                    </div>
                )}

                <div className="flex-1 min-h-0">
                    {/* ==========================================================
              TAB 1: SYSTEM TELEMETRY OVERVIEW (ADMIN HOME)
             ========================================================== */}
                    {activeTab === 'overview' && (
                        <div className="game-fit text-slate-800">
                            <div className="flex items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                        Platform Telemetry
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Live overview of accounts, seasons, drills, and rank distribution
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={loadUsersFromStorage}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-400 transition"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Refresh
                                </button>
                            </div>

                            {/* System Alert Banner if Maintenance or Suspensions active */}
                            {(systemConfig.maintenanceMode || telemetry.suspendedUsers > 0) && (
                                <div className="game-card-alert rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                                    <div className="flex items-center gap-2 text-xs font-bold text-rose-100">
                                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>
                                            {systemConfig.maintenanceMode && 'Maintenance Mode is ACTIVE (student login locked). '}
                                            {telemetry.suspendedUsers > 0 &&
                                                `${telemetry.suspendedUsers} account(s) currently suspended.`}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateToTab(systemConfig.maintenanceMode ? 'broadcast' : 'users')
                                        }
                                        className="text-[11px] font-bold text-rose-200 underline underline-offset-2"
                                    >
                                        Manage
                                    </button>
                                </div>
                            )}

                            {/* KPI Strip */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Total Accounts
                                        </span>
                                        <div className="text-2xl font-black font-mono text-slate-900">
                                            {telemetry.totalUsers}
                                        </div>
                                    </div>
                                    <Users className="w-5 h-5 text-blue-500 shrink-0" />
                                </div>

                                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Active Seasons
                                        </span>
                                        <div className="text-2xl font-black font-mono text-slate-900">
                                            {telemetry.activeSeasons}
                                        </div>
                                    </div>
                                    <FolderArchive className="w-5 h-5 text-[#D8B878] shrink-0" />
                                </div>

                                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Drills Completed
                                        </span>
                                        <div className="text-2xl font-black font-mono text-slate-900">
                                            {telemetry.totalDrills}
                                        </div>
                                    </div>
                                    <Swords className="w-5 h-5 text-indigo-400 shrink-0" />
                                </div>

                                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Platform Pass Rate
                                        </span>
                                        <div className="text-2xl font-black font-mono text-emerald-500">
                                            {telemetry.passRate}%
                                        </div>
                                    </div>
                                    <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
                                </div>
                            </div>

                            {/* Chart + Recent Audit Logs */}
                            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                                <div className="lg:col-span-7 game-card-sys rounded-2xl p-4 flex flex-col gap-2 min-h-[220px] lg:min-h-0">
                                    <div className="flex items-center justify-between shrink-0">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                            Player Rank Distribution
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-[#D8B878]">
                                            Target: {systemConfig.passTarget}%
                                        </span>
                                    </div>
                                    <div className="flex-1 min-h-0">
                                        <Bar data={rankDistributionData} options={rankDistributionOptions} />
                                    </div>
                                </div>

                                <div className="lg:col-span-5 game-card-user rounded-2xl p-4 flex flex-col gap-2 min-h-0">
                                    <div className="flex items-center justify-between shrink-0">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                            Recent Admin Actions
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => navigateToTab('audit')}
                                            className="text-[11px] font-bold text-blue-400 hover:underline"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    <div className="game-scroll flex-1 space-y-2 pr-1">
                                        {auditLogs.length === 0 ? (
                                            <div className="text-xs text-slate-500 py-6 text-center">
                                                No admin actions recorded yet.
                                            </div>
                                        ) : (
                                            auditLogs.slice(0, 6).map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-bold text-slate-900">{log.action}</span>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            {log.timestamp}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        Target: {log.target}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================================
              TAB 2: USER & ACCESS MANAGEMENT
             ========================================================== */}
                    {activeTab === 'users' && (
                        <div className="game-fit text-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                        User & Access Control
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Manage registered Email & Google accounts, roles, and suspensions
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search name or email..."
                                            className="pl-8 pr-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none w-48"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none"
                                    >
                                        <option value="All">All Accounts</option>
                                        <option value="Active">Active Only</option>
                                        <option value="Suspended">Suspended</option>
                                        <option value="Admins">Admins Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 game-card-user rounded-2xl overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                        Account Directory
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-400">
                                        {filteredUsers.length} Shown
                                    </span>
                                </div>

                                <div className="game-scroll flex-1">
                                    {filteredUsers.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-slate-500">
                                            No matching accounts found.
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                                    <th className="py-3 px-4">Player</th>
                                                    <th className="py-3 px-4">Season & Rank</th>
                                                    <th className="py-3 px-4 text-center">Activity</th>
                                                    <th className="py-3 px-4 text-center">Role</th>
                                                    <th className="py-3 px-4 text-center">Status</th>
                                                    <th className="py-3 px-4 text-right">Controls</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredUsers.map((u) => {
                                                    const isSelf = u.email === currentUser?.email?.toLowerCase();
                                                    const isSuspended = u.status === 'suspended';
                                                    return (
                                                        <tr key={u.email} className="hover:bg-blue-50/40 transition">
                                                            <td className="py-3 px-4">
                                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                                    <span>{u.name}</span>
                                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                                        {u.provider}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500">{u.email}</div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <RankCrest tierName={u.tierName} size="sm" />
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">
                                                                            {u.tierName}{' '}
                                                                            <span className="font-mono text-[#D8B878]">
                                                                                ({u.totalStars} ★)
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-500">
                                                                            Season: {u.currentSeasonName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-mono">
                                                                <div className="font-bold text-slate-900">
                                                                    {u.drillCount} Drills
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    {u.folderCount} Folders • Avg{' '}
                                                                    {u.avgScore !== null ? `${u.avgScore}%` : '—'}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span
                                                                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${u.role === 'admin'
                                                                            ? 'bg-amber-500/20 text-[#F5D78E] border border-[#D8B878]/50'
                                                                            : 'bg-slate-100 text-slate-600'
                                                                        }`}
                                                                >
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span
                                                                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSuspended
                                                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
                                                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                                                                        }`}
                                                                >
                                                                    {u.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        disabled={isSelf}
                                                                        onClick={() =>
                                                                            updateStoredAccountField(
                                                                                u.email,
                                                                                { role: u.role === 'admin' ? 'student' : 'admin' },
                                                                                u.role === 'admin' ? 'Demoted to Student' : 'Promoted to Admin'
                                                                            )
                                                                        }
                                                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-[#D8B878] disabled:opacity-30 transition"
                                                                    >
                                                                        {u.role === 'admin' ? 'Make Student' : 'Make Admin'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isSelf}
                                                                        onClick={() =>
                                                                            updateStoredAccountField(
                                                                                u.email,
                                                                                { status: isSuspended ? 'active' : 'suspended' },
                                                                                isSuspended ? 'Reactivated Account' : 'Suspended Account'
                                                                            )
                                                                        }
                                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-30 transition ${isSuspended
                                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                                : 'border border-rose-300 text-rose-500 hover:bg-rose-50'
                                                                            }`}
                                                                    >
                                                                        <Ban className="w-3 h-3" />
                                                                        {isSuspended ? 'Reactivate' : 'Suspend'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================================
              TAB 3: RANK & STREAK RULE ENGINE
             ========================================================== */}
                    {activeTab === 'rules' && (
                        <form onSubmit={handleSaveRules} className="game-fit text-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                        Rank & Streak Rule Engine
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Configure star requirements, streak multipliers, and AI drill minimums
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleResetDefaultRules}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                                    >
                                        <Save className="w-3.5 h-3.5" /> Save Rules
                                    </button>
                                </div>
                            </div>

                            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                                {/* Rank Thresholds */}
                                <div className="lg:col-span-7 game-card-user rounded-2xl p-4 flex flex-col gap-3 min-h-0">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#D8B878] shrink-0">
                                        RANK_TIER Minimum Star Requirements
                                    </span>

                                    <div className="game-scroll flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1 content-start">
                                        {configDraft.tiers.map((tier) => (
                                            <div
                                                key={tier.name}
                                                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <RankCrest tierName={tier.name} size="sm" />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-black text-slate-900">{tier.name}</div>
                                                        <div className="text-[10px] text-slate-500">
                                                            {tier.name === 'Warrior'
                                                                ? 'Starting Tier'
                                                                : tier.name === 'Mythic'
                                                                    ? 'Top Tier (∞)'
                                                                    : 'Min Stars'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    disabled={tier.name === 'Warrior'}
                                                    value={tier.min}
                                                    onChange={(e) => handleTierThresholdChange(tier.name, e.target.value)}
                                                    className="w-20 px-2.5 py-1.5 rounded-xl border text-right text-xs font-mono font-black focus:outline-none disabled:opacity-50"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Streak & Drill Settings */}
                                <div className="lg:col-span-5 game-card-user rounded-2xl p-4 flex flex-col gap-4 min-h-0">
                                    <span className="text-xs font-black uppercase tracking-wider text-[#D8B878] shrink-0">
                                        Scoring, Streaks & AI Generator
                                    </span>

                                    <div className="game-scroll flex-1 space-y-3.5 pr-1">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Pass Target Score (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="30"
                                                max="95"
                                                value={configDraft.passTarget}
                                                onChange={(e) =>
                                                    setConfigDraft({ ...configDraft, passTarget: e.target.value })
                                                }
                                                className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                            />
                                            <span className="text-[10px] text-slate-500">
                                                Drills below this score are flagged as Weak Topics.
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    2x Star Win Streak
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    max="20"
                                                    value={configDraft.winStreakTrigger}
                                                    onChange={(e) =>
                                                        setConfigDraft({ ...configDraft, winStreakTrigger: e.target.value })
                                                    }
                                                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                                />
                                                <span className="text-[10px] text-slate-500">Consecutive 3★ wins</span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    -1 Star Loss Streak
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={configDraft.lossStreakTrigger}
                                                    onChange={(e) =>
                                                        setConfigDraft({ ...configDraft, lossStreakTrigger: e.target.value })
                                                    }
                                                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                                />
                                                <span className="text-[10px] text-slate-500">Consecutive 0★ losses</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Min AI Questions
                                                </label>
                                                <input
                                                    type="number"
                                                    min="5"
                                                    max="50"
                                                    value={configDraft.minQuestions}
                                                    onChange={(e) =>
                                                        setConfigDraft({ ...configDraft, minQuestions: e.target.value })
                                                    }
                                                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Countdown (Mins)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={configDraft.countdownMinutes}
                                                    onChange={(e) =>
                                                        setConfigDraft({ ...configDraft, countdownMinutes: e.target.value })
                                                    }
                                                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ==========================================================
              TAB 4: GLOBAL BROADCASTS & MAINTENANCE MODE
             ========================================================== */}
                    {activeTab === 'broadcast' && (
                        <form
                            onSubmit={handleSaveBroadcast}
                            className="game-fit text-slate-800 max-w-4xl mx-auto w-full"
                        >
                            <div className="flex items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                        Broadcasts & Maintenance
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Push announcements to students or lock student login on the Front Page
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                                >
                                    <Save className="w-3.5 h-3.5" /> Publish Changes
                                </button>
                            </div>

                            <div className="game-card-user rounded-2xl p-5 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Global Announcement / Maintenance Message
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={configDraft.announcement}
                                        onChange={(e) =>
                                            setConfigDraft({ ...configDraft, announcement: e.target.value })
                                        }
                                        placeholder="Leave empty to hide banner. When Maintenance Mode is active, this message appears on the Front Page lock screen."
                                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                                    />
                                </div>

                                {/* Maintenance Toggle */}
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <Wrench className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-black text-slate-900">Maintenance Mode</div>
                                            <p className="text-[11px] text-slate-500">
                                                Locks student sign-in, sign-up, and guest mode on the Front Page. Only registered Admins can log in.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfigDraft({
                                                ...configDraft,
                                                maintenanceMode: !configDraft.maintenanceMode
                                            })
                                        }
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 ${configDraft.maintenanceMode
                                                ? 'bg-rose-600 text-white'
                                                : 'bg-slate-200 text-slate-600'
                                            }`}
                                    >
                                        {configDraft.maintenanceMode ? 'ACTIVE' : 'OFF'}
                                    </button>
                                </div>

                                {/* Live Student Preview */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Banner Preview
                                    </span>
                                    {configDraft.maintenanceMode || configDraft.announcement.trim() ? (
                                        <div
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${configDraft.maintenanceMode
                                                    ? 'bg-rose-500/20 border border-rose-400/50 text-rose-200'
                                                    : 'bg-blue-500/20 border border-blue-400/50 text-blue-100'
                                                }`}
                                        >
                                            <Megaphone className="w-4 h-4 shrink-0" />
                                            <span>
                                                {configDraft.maintenanceMode
                                                    ? configDraft.announcement.trim() ||
                                                    'Scheduled Maintenance Active — Student login is temporarily paused.'
                                                    : configDraft.announcement}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic">
                                            No active banner will be shown to students.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ==========================================================
              TAB 5: ADMIN AUDIT LOG
             ========================================================== */}
                    {activeTab === 'audit' && (
                        <div className="game-fit text-slate-800">
                            <div className="flex items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                        Admin Audit Log
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Chronological record of configuration changes and account actions
                                    </p>
                                </div>

                                {auditLogs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearAuditLogs}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-bold transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Clear Log
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 min-h-0 game-card-sys rounded-2xl overflow-hidden flex flex-col">
                                <div className="game-scroll flex-1">
                                    {auditLogs.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-slate-400">
                                            No administrative actions recorded yet.
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                                    <th className="py-3 px-4">Timestamp</th>
                                                    <th className="py-3 px-4">Admin</th>
                                                    <th className="py-3 px-4">Action</th>
                                                    <th className="py-3 px-4">Target</th>
                                                    <th className="py-3 px-4">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {auditLogs.map((log) => (
                                                    <tr key={log.id}>
                                                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                                                            {log.timestamp}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-slate-700">
                                                            {log.adminEmail}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                                                        <td className="py-3 px-4 font-mono text-[#D8B878]">{log.target}</td>
                                                        <td className="py-3 px-4 text-slate-500">{log.details}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ===== ADMIN BOTTOM DOCK ===== */}
            <nav className="game-dock" aria-label="Admin navigation">
                <div className="game-dock-inner">
                    {ADMIN_TABS.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigateToTab(item.id)}
                                className={`game-dock-btn ${active ? 'is-active' : ''}`}
                            >
                                <span className="game-dock-icon">
                                    <Icon className="w-5 h-5" />
                                </span>
                                <span className="game-dock-label">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}