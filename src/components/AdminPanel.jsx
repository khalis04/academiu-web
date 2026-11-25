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
    LayoutDashboard,
    Users,
    Sliders,
    Megaphone,
    ScrollText,
    ArrowLeft,
    LogOut,
    Eye,
    ShieldCheck,
    Search,
    Ban,
    CheckCircle2,
    Trash2,
    RotateCcw,
    Save,
    Wrench,
    AlertTriangle,
    Star,
    Swords,
    Target,
    UserCheck,
    ShieldAlert,
    Sparkles,
    Download
} from 'lucide-react';
import { OfficialLogo, RankCrest, DEFAULT_SYSTEM_CONFIG } from '../App';
import AnnouncementBanner from './AnnouncementBanner';
import '../game-fit.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ACCOUNTS_STORAGE_KEY = 'academiu_registered_accounts';
const AUDIT_LOG_KEY = 'academiu_admin_audit_logs';

const TIER_BAR_PALETTE = {
    Warrior: { bg: 'rgba(217, 119, 6, 0.8)', border: '#F59E0B' },
    Elite: { bg: 'rgba(148, 163, 184, 0.8)', border: '#CBD5E1' },
    Master: { bg: 'rgba(216, 184, 120, 0.88)', border: '#F5D78E' },
    Grandmaster: { bg: 'rgba(56, 189, 248, 0.8)', border: '#7DD3FC' },
    Epic: { bg: 'rgba(16, 185, 129, 0.8)', border: '#34D399' },
    Legend: { bg: 'rgba(249, 115, 22, 0.82)', border: '#FB923C' },
    Mythic: { bg: 'rgba(168, 85, 247, 0.84)', border: '#C084FC' }
};

function loadAccounts() {
    try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function loadUserProgress(email) {
    if (!email) return null;
    try {
        const raw = localStorage.getItem(`academiu_progress_${email}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function loadAuditLogs() {
    try {
        const raw = localStorage.getItem(AUDIT_LOG_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function resolveTierName(stars, tiers = DEFAULT_SYSTEM_CONFIG.tiers) {
    let current = tiers[0]?.name || 'Warrior';
    for (let i = 0; i < tiers.length; i++) {
        if (stars >= Number(tiers[i].min)) {
            current = tiers[i].name;
        }
    }
    return current;
}

export default function AdminPanel({
    currentUser,
    systemConfig = DEFAULT_SYSTEM_CONFIG,
    onUpdateConfig,
    onSwitchToStudent,
    onLogout
}) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'rules' | 'broadcast' | 'audit'
    const [tabHistory, setTabHistory] = useState([]);

    const [accounts, setAccounts] = useState(loadAccounts);
    const [auditLogs, setAuditLogs] = useState(loadAuditLogs);

    // Editable draft for Rules & Broadcasts
    const [configDraft, setConfigDraft] = useState(() => ({
        ...DEFAULT_SYSTEM_CONFIG,
        ...systemConfig,
        tiers: (systemConfig?.tiers || DEFAULT_SYSTEM_CONFIG.tiers).map((t) => ({ ...t }))
    }));

    // Filters & Feedback
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'admin' | 'suspended'
    const [auditFilter, setAuditFilter] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        setConfigDraft({
            ...DEFAULT_SYSTEM_CONFIG,
            ...systemConfig,
            tiers: (systemConfig?.tiers || DEFAULT_SYSTEM_CONFIG.tiers).map((t) => ({ ...t }))
        });
    }, [systemConfig]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2800);
    };

    const appendAudit = (action, details, severity = 'info') => {
        const entry = {
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            adminEmail: currentUser?.email || 'admin@academiu.com',
            action,
            details,
            severity
        };
        const updated = [entry, ...auditLogs].slice(0, 150);
        setAuditLogs(updated);
        localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
    };

    // Navigation History
    const navigateTab = (nextTab) => {
        if (nextTab === activeTab) return;
        setTabHistory((prev) => [...prev, activeTab]);
        setActiveTab(nextTab);
    };

    const handleGoBack = () => {
        if (tabHistory.length > 0) {
            const prevTab = tabHistory[tabHistory.length - 1];
            setTabHistory((prev) => prev.slice(0, -1));
            setActiveTab(prevTab);
        } else if (activeTab !== 'overview') {
            setActiveTab('overview');
        }
    };

    const canGoBack = tabHistory.length > 0 || activeTab !== 'overview';

    // Enrich accounts with stored progress telemetry
    const enrichedUsers = useMemo(() => {
        const activeTiers = systemConfig?.tiers || DEFAULT_SYSTEM_CONFIG.tiers;
        return accounts.map((acc) => {
            const progress = loadUserProgress(acc.email);
            const stars = progress?.totalStars ?? 0;
            const history = progress?.matchHistory ?? [];
            const folders = progress?.registeredSubjects ?? [];
            const avgScore =
                history.length > 0
                    ? Math.round(history.reduce((s, m) => s + (m.score || 0), 0) / history.length)
                    : 0;
            const tier = resolveTierName(stars, activeTiers);

            return {
                ...acc,
                status: acc.status || 'active',
                role: acc.role || 'student',
                stars,
                tier,
                drillCount: history.length,
                folderCount: folders.length,
                avgScore,
                seasonName: progress?.currentSeason?.name || 'Not Started'
            };
        });
    }, [accounts, systemConfig]);

    // Platform-wide Telemetry
    const telemetry = useMemo(() => {
        const totalUsers = enrichedUsers.length;
        const students = enrichedUsers.filter((u) => u.role !== 'admin');
        const admins = enrichedUsers.filter((u) => u.role === 'admin');
        const suspended = enrichedUsers.filter((u) => u.status === 'suspended');
        const totalDrills = enrichedUsers.reduce((sum, u) => sum + u.drillCount, 0);

        const activePlayers = enrichedUsers.filter((u) => u.drillCount > 0);
        const platformAvg =
            activePlayers.length > 0
                ? Math.round(
                    activePlayers.reduce((sum, u) => sum + u.avgScore, 0) / activePlayers.length
                )
                : 0;

        const tierCounts = (systemConfig?.tiers || DEFAULT_SYSTEM_CONFIG.tiers).map((t) => ({
            name: t.name,
            count: students.filter((s) => s.tier === t.name).length
        }));

        return {
            totalUsers,
            studentCount: students.length,
            adminCount: admins.length,
            suspendedCount: suspended.length,
            totalDrills,
            platformAvg,
            tierCounts
        };
    }, [enrichedUsers, systemConfig]);

    // Bar Chart Data & Options for Student Rank Distribution
    const rankChartData = useMemo(() => {
        return {
            labels: telemetry.tierCounts.map((t) => t.name),
            datasets: [
                {
                    label: 'Students',
                    data: telemetry.tierCounts.map((t) => t.count),
                    backgroundColor: telemetry.tierCounts.map(
                        (t) => TIER_BAR_PALETTE[t.name]?.bg || 'rgba(216, 184, 120, 0.82)'
                    ),
                    borderColor: telemetry.tierCounts.map(
                        (t) => TIER_BAR_PALETTE[t.name]?.border || '#F5D78E'
                    ),
                    borderWidth: 1.5,
                    borderRadius: 8,
                    maxBarThickness: 46
                }
            ]
        };
    }, [telemetry.tierCounts]);

    const rankChartOptions = useMemo(() => {
        const maxCount = Math.max(0, ...telemetry.tierCounts.map((t) => t.count));
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(5, maxCount + 1),
                    ticks: {
                        precision: 0,
                        stepSize: maxCount <= 10 ? 1 : undefined,
                        color: '#94A3B8',
                        font: { size: 11, weight: '600' }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.14)'
                    }
                },
                x: {
                    ticks: {
                        color: '#E2E8F0',
                        font: { size: 11, weight: '700' }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#09152E',
                    borderColor: 'rgba(216, 184, 120, 0.5)',
                    borderWidth: 1,
                    titleColor: '#F5D78E',
                    bodyColor: '#FAF6EE',
                    padding: 10,
                    callbacks: {
                        label: (ctx) => {
                            const count = ctx.parsed.y ?? 0;
                            const pct =
                                telemetry.studentCount > 0
                                    ? Math.round((count / telemetry.studentCount) * 100)
                                    : 0;
                            return ` ${count} ${count === 1 ? 'Student' : 'Students'} (${pct}%)`;
                        }
                    }
                }
            }
        };
    }, [telemetry.tierCounts, telemetry.studentCount]);

    // Filtered Users
    const filteredUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        return enrichedUsers.filter((u) => {
            if (roleFilter === 'student' && u.role !== 'student') return false;
            if (roleFilter === 'admin' && u.role !== 'admin') return false;
            if (roleFilter === 'suspended' && u.status !== 'suspended') return false;
            if (!q) return true;
            return (
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.tier || '').toLowerCase().includes(q)
            );
        });
    }, [enrichedUsers, userSearch, roleFilter]);

    // Filtered Audit Logs
    const filteredLogs = useMemo(() => {
        const q = auditFilter.trim().toLowerCase();
        if (!q) return auditLogs;
        return auditLogs.filter(
            (log) =>
                log.action.toLowerCase().includes(q) ||
                log.details.toLowerCase().includes(q) ||
                log.adminEmail.toLowerCase().includes(q)
        );
    }, [auditLogs, auditFilter]);

    // --- USER MODERATION ACTIONS ---
    const handleToggleSuspend = (target) => {
        if (target.email.toLowerCase() === currentUser?.email?.toLowerCase()) return;
        const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
        const updated = accounts.map((acc) =>
            acc.email.toLowerCase() === target.email.toLowerCase()
                ? { ...acc, status: nextStatus }
                : acc
        );
        setAccounts(updated);
        saveAccounts(updated);
        appendAudit(
            nextStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
            `${target.name} (${target.email}) set to ${nextStatus.toUpperCase()}.`,
            nextStatus === 'suspended' ? 'warn' : 'info'
        );
        showToast(`${target.name} is now ${nextStatus}.`);
    };

    const handleToggleRole = (target) => {
        if (target.email.toLowerCase() === currentUser?.email?.toLowerCase()) return;
        const nextRole = target.role === 'admin' ? 'student' : 'admin';
        if (
            !window.confirm(
                `Change ${target.name} (${target.email}) role to ${nextRole.toUpperCase()}?`
            )
        ) {
            return;
        }
        const updated = accounts.map((acc) =>
            acc.email.toLowerCase() === target.email.toLowerCase()
                ? { ...acc, role: nextRole }
                : acc
        );
        setAccounts(updated);
        saveAccounts(updated);
        appendAudit(
            'ROLE_UPDATED',
            `${target.email} role changed to ${nextRole.toUpperCase()}.`,
            'warn'
        );
        showToast(`Updated ${target.name} to ${nextRole}.`);
    };

    const handleResetProgress = (target) => {
        if (
            !window.confirm(
                `Reset all stars, streaks, folders, and drill history for ${target.name}?`
            )
        ) {
            return;
        }
        localStorage.removeItem(`academiu_progress_${target.email}`);
        setAccounts([...accounts]);
        appendAudit(
            'PROGRESS_RESET',
            `Cleared season progress and drill vault for ${target.email}.`,
            'warn'
        );
        showToast(`Reset progress for ${target.name}.`);
    };

    const handleDeleteAccount = (target) => {
        if (target.email.toLowerCase() === currentUser?.email?.toLowerCase()) return;
        if (
            !window.confirm(
                `Permanently delete account ${target.name} (${target.email}) and all saved data?`
            )
        ) {
            return;
        }
        const updated = accounts.filter(
            (acc) => acc.email.toLowerCase() !== target.email.toLowerCase()
        );
        localStorage.removeItem(`academiu_progress_${target.email}`);
        setAccounts(updated);
        saveAccounts(updated);
        appendAudit(
            'USER_DELETED',
            `Permanently deleted account ${target.email}.`,
            'danger'
        );
        showToast(`Deleted ${target.email}.`);
    };

    // --- RULE ENGINE ACTIONS ---
    const handleTierMinChange = (index, rawVal) => {
        const num = Math.max(0, Number(rawVal) || 0);
        setConfigDraft((prev) => {
            const nextTiers = prev.tiers.map((t, i) =>
                i === index ? { ...t, min: i === 0 ? 0 : num } : t
            );
            return { ...prev, tiers: nextTiers };
        });
    };

    const handleSaveRules = (e) => {
        e.preventDefault();

        const sortedTiers = configDraft.tiers.map((t, idx) => ({
            ...t,
            min: idx === 0 ? 0 : Math.max(1, Number(t.min) || 0)
        }));
        for (let i = 1; i < sortedTiers.length; i++) {
            if (sortedTiers[i].min <= sortedTiers[i - 1].min) {
                sortedTiers[i].min = sortedTiers[i - 1].min + 5;
            }
        }

        const nextConfig = {
            ...systemConfig,
            tiers: sortedTiers,
            passTarget: Math.min(100, Math.max(10, Number(configDraft.passTarget) || 60)),
            winStreakTrigger: Math.max(2, Number(configDraft.winStreakTrigger) || 5),
            lossStreakTrigger: Math.max(2, Number(configDraft.lossStreakTrigger) || 2),
            minQuestions: Math.max(5, Number(configDraft.minQuestions) || 10),
            countdownMinutes: Math.max(1, Number(configDraft.countdownMinutes) || 5)
        };

        if (onUpdateConfig) onUpdateConfig(nextConfig);
        appendAudit(
            'RULES_UPDATED',
            `Pass: ${nextConfig.passTarget}%, Win Streak: ${nextConfig.winStreakTrigger}x, Loss Penalty: ${nextConfig.lossStreakTrigger}x, Min Q: ${nextConfig.minQuestions}, Timer: ${nextConfig.countdownMinutes}m.`,
            'info'
        );
        showToast('System rules saved and applied live.');
    };

    const handleResetRules = () => {
        if (!window.confirm('Restore all rank thresholds and drill rules to defaults?')) return;
        const nextConfig = {
            ...DEFAULT_SYSTEM_CONFIG,
            announcement: systemConfig.announcement || '',
            maintenanceMode: Boolean(systemConfig.maintenanceMode)
        };
        setConfigDraft(nextConfig);
        if (onUpdateConfig) onUpdateConfig(nextConfig);
        appendAudit('RULES_RESET', 'Restored rank thresholds and streak rules to defaults.', 'warn');
        showToast('Default system rules restored.');
    };

    // --- BROADCAST & MAINTENANCE ACTIONS ---
    const handleSaveBroadcast = (e) => {
        e.preventDefault();
        const nextConfig = {
            ...systemConfig,
            announcement: configDraft.announcement.trim(),
            maintenanceMode: Boolean(configDraft.maintenanceMode)
        };
        if (onUpdateConfig) onUpdateConfig(nextConfig);
        appendAudit(
            'BROADCAST_UPDATED',
            `Maintenance: ${nextConfig.maintenanceMode ? 'ON' : 'OFF'} | Banner: "${nextConfig.announcement || 'Cleared'
            }"`,
            nextConfig.maintenanceMode ? 'danger' : 'info'
        );
        showToast('Broadcast & Maintenance settings published.');
    };

    const handleClearAnnouncement = () => {
        const nextConfig = { ...systemConfig, announcement: '' };
        setConfigDraft((prev) => ({ ...prev, announcement: '' }));
        if (onUpdateConfig) onUpdateConfig(nextConfig);
        appendAudit('ANNOUNCEMENT_CLEARED', 'Cleared global announcement banner.', 'info');
        showToast('Announcement banner cleared.');
    };

    const handleToggleMaintenanceImmediate = () => {
        const nextMode = !configDraft.maintenanceMode;
        setConfigDraft((prev) => ({ ...prev, maintenanceMode: nextMode }));
        const nextConfig = {
            ...systemConfig,
            announcement: configDraft.announcement.trim(),
            maintenanceMode: nextMode
        };
        if (onUpdateConfig) onUpdateConfig(nextConfig);
        appendAudit(
            nextMode ? 'MAINTENANCE_ENABLED' : 'MAINTENANCE_DISABLED',
            nextMode
                ? 'Locked Front Page student login & guest access.'
                : 'Re-opened Front Page for student access.',
            nextMode ? 'danger' : 'info'
        );
        showToast(nextMode ? 'Maintenance Mode ENABLED.' : 'Maintenance Mode DISABLED.');
    };

    // --- AUDIT LOG ACTIONS ---
    const handleClearAuditLogs = () => {
        if (!window.confirm('Clear all recorded Admin audit logs?')) return;
        setAuditLogs([]);
        localStorage.removeItem(AUDIT_LOG_KEY);
        showToast('Audit log cleared.');
    };

    const handleExportAuditJson = () => {
        const blob = new Blob([JSON.stringify(auditLogs, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clutchup-arena-audit-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const adminMenu = [
        { id: 'overview', label: 'Telemetry', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'rules', label: 'Rule Engine', icon: Sliders },
        { id: 'broadcast', label: 'Banner', icon: Megaphone },
        { id: 'audit', label: 'Audit Logs', icon: ScrollText }
    ];

    const hasLiveBanner =
        Boolean(systemConfig?.maintenanceMode) || Boolean(systemConfig?.announcement?.trim());

    return (
        <div className="game-shell text-[#FAF6EE]">
            {/* ===== ADMIN TOP HUD ===== */}
            <header className="game-hud">
                <div className="flex items-center gap-2.5 min-w-0">
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

                    <button
                        type="button"
                        onClick={() => navigateTab('overview')}
                        className="game-logo-pill shrink-0 cursor-pointer"
                        title="Admin Telemetry"
                    >
                        <OfficialLogo variant="full" size="md" />
                    </button>

                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[#D8B878]/15 border border-[#D8B878]/45 text-[#F5D78E]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Control Plane
                    </span>

                    {toast && (
                        <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            {toast}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {onSwitchToStudent && (
                        <button
                            type="button"
                            onClick={onSwitchToStudent}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3F8A] hover:bg-[#2751B0] border border-[#D8B878]/40 text-xs font-bold text-[#FAF6EE] transition"
                        >
                            <Eye className="w-3.5 h-3.5 text-[#F5D78E]" />
                            <span className="hidden sm:inline">Student Preview</span>
                        </button>
                    )}

                    <div className="hidden md:flex flex-col text-right leading-tight max-w-[150px]">
                        <span className="text-xs font-bold text-[#FAF6EE] truncate">
                            {currentUser?.name || 'Arena Admin'}
                        </span>
                        <span className="text-[10px] text-[#A9B8D6] truncate">
                            {currentUser?.email}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#A9B8D6] hover:text-white bg-white/5 border border-white/15 hover:border-[#D8B878] transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Log Out</span>
                    </button>
                </div>
            </header>

            {/* ===== FIXED MAIN STAGE (NO OUTER SCROLL) ===== */}
            <main className="game-main">
                {/* Live Banner Indicator (hidden on Broadcast tab since Broadcast has its own live preview) */}
                {hasLiveBanner && activeTab !== 'broadcast' && (
                    <AnnouncementBanner
                        message={systemConfig?.announcement}
                        maintenanceMode={Boolean(systemConfig?.maintenanceMode)}
                    />
                )}

                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {/* ============================================================
              TAB 1: TELEMETRY OVERVIEW
             ============================================================ */}
                    {activeTab === 'overview' && (
                        <div className="game-fit">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-2 shrink-0">
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-[#FAF6EE] tracking-tight">
                                        Arena Telemetry & Status
                                    </h1>
                                    <p className="text-[11px] text-[#A9B8D6]">
                                        Live overview of registered challengers, rank spread, and system rules
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${systemConfig.maintenanceMode
                                            ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                                            : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                                        }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${systemConfig.maintenanceMode ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                                            }`}
                                    />
                                    {systemConfig.maintenanceMode ? 'Maintenance Lock' : 'Arena Online'}
                                </span>
                            </div>

                            {/* KPI Strip */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
                                <div className="rounded-2xl bg-[#0D1F44] border border-white/10 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] block">
                                            Total Accounts
                                        </span>
                                        <div className="text-2xl font-black font-mono text-[#FAF6EE]">
                                            {telemetry.totalUsers}
                                        </div>
                                        <span className="text-[10px] text-[#A9B8D6]">
                                            {telemetry.studentCount} Students • {telemetry.adminCount} Admin
                                        </span>
                                    </div>
                                    <Users className="w-6 h-6 text-[#D8B878] shrink-0" />
                                </div>

                                <div className="rounded-2xl bg-[#0D1F44] border border-white/10 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] block">
                                            Drills Logged
                                        </span>
                                        <div className="text-2xl font-black font-mono text-[#F5D78E]">
                                            {telemetry.totalDrills}
                                        </div>
                                        <span className="text-[10px] text-[#A9B8D6]">Across active seasons</span>
                                    </div>
                                    <Swords className="w-6 h-6 text-sky-400 shrink-0" />
                                </div>

                                <div className="rounded-2xl bg-[#0D1F44] border border-white/10 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] block">
                                            Platform Accuracy
                                        </span>
                                        <div className="text-2xl font-black font-mono text-emerald-400">
                                            {telemetry.platformAvg}%
                                        </div>
                                        <span className="text-[10px] text-[#A9B8D6]">
                                            Target: {systemConfig.passTarget}%
                                        </span>
                                    </div>
                                    <Target className="w-6 h-6 text-emerald-400 shrink-0" />
                                </div>

                                <div className="rounded-2xl bg-[#0D1F44] border border-white/10 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] block">
                                            Suspended Users
                                        </span>
                                        <div className="text-2xl font-black font-mono text-rose-400">
                                            {telemetry.suspendedCount}
                                        </div>
                                        <span className="text-[10px] text-[#A9B8D6]">Restricted accounts</span>
                                    </div>
                                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                                </div>
                            </div>

                            {/* Main 2-Column Body */}
                            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                                {/* Left (7 cols): Student Rank Distribution Bar Graph */}
                                <div className="lg:col-span-7 rounded-2xl bg-[#0D1F44] border border-[#D8B878]/25 p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                                Student Rank Distribution
                                            </span>
                                            <span className="text-[10px] font-mono text-[#A9B8D6]">
                                                ({telemetry.studentCount} Students)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigateTab('rules')}
                                            className="text-[11px] font-bold text-[#F5D78E] hover:underline"
                                        >
                                            Edit Thresholds →
                                        </button>
                                    </div>

                                    <div className="flex-1 min-h-0 relative">
                                        <Bar data={rankChartData} options={rankChartOptions} />
                                    </div>
                                </div>

                                {/* Right (5 cols): Active Rules Snapshot + Recent Audit */}
                                <div className="lg:col-span-5 rounded-2xl bg-[#0D1F44] border border-white/10 p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#A9B8D6]">
                                            Recent Admin Activity
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => navigateTab('audit')}
                                            className="text-[11px] font-bold text-[#F5D78E] hover:underline"
                                        >
                                            View All →
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 shrink-0">
                                        <div className="p-2.5 rounded-xl bg-[#09152E] border border-white/10">
                                            <span className="text-[10px] text-[#A9B8D6] uppercase font-bold block">
                                                Drill Rules
                                            </span>
                                            <div className="text-xs font-mono font-black text-[#FAF6EE] mt-0.5">
                                                {systemConfig.minQuestions}Q • {systemConfig.countdownMinutes} Min
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-[#09152E] border border-white/10">
                                            <span className="text-[10px] text-[#A9B8D6] uppercase font-bold block">
                                                Streak Triggers
                                            </span>
                                            <div className="text-xs font-mono font-black text-[#F5D78E] mt-0.5">
                                                +{systemConfig.winStreakTrigger}W (2x) / -{systemConfig.lossStreakTrigger}L
                                            </div>
                                        </div>
                                    </div>

                                    {auditLogs.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center text-xs text-[#A9B8D6]">
                                            No admin actions logged yet.
                                        </div>
                                    ) : (
                                        <div className="game-scroll flex-1 space-y-2 pr-1">
                                            {auditLogs.slice(0, 8).map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="p-2.5 rounded-xl bg-[#09152E]/80 border border-white/10 space-y-0.5"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-mono font-black text-[#F5D78E]">
                                                            {log.action}
                                                        </span>
                                                        <span className="text-[10px] text-[#A9B8D6]">{log.timestamp}</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#D6DEF0] truncate">{log.details}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 2: USER MODERATION
             ============================================================ */}
                    {activeTab === 'users' && (
                        <div className="game-fit">
                            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-[#FAF6EE]">
                                        User Moderation
                                    </h1>
                                    <p className="text-[11px] text-[#A9B8D6]">
                                        Manage student & admin accounts, inspect ranks, suspend, or reset progress
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            placeholder="Search name, email, rank..."
                                            className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-xs text-[#FAF6EE] placeholder:text-slate-400 focus:outline-none w-52"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0D1F44] border border-white/10">
                                        {['all', 'student', 'admin', 'suspended'].map((f) => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => setRoleFilter(f)}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${roleFilter === f
                                                        ? 'bg-[#1E3F8A] text-[#F5D78E]'
                                                        : 'text-[#A9B8D6] hover:text-white'
                                                    }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="game-fit-body rounded-2xl bg-[#0D1F44] border border-white/10 p-3 flex flex-col min-h-0 overflow-hidden">
                                <div className="game-scroll flex-1 space-y-2 pr-1">
                                    {filteredUsers.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-xs text-[#A9B8D6] py-12">
                                            No accounts match your filter.
                                        </div>
                                    ) : (
                                        filteredUsers.map((u) => {
                                            const isSelf =
                                                u.email.toLowerCase() === currentUser?.email?.toLowerCase();
                                            const isSuspended = u.status === 'suspended';

                                            return (
                                                <div
                                                    key={u.email}
                                                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${isSuspended
                                                            ? 'bg-rose-950/35 border-rose-500/40'
                                                            : 'bg-[#09152E]/85 border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <RankCrest tierName={u.tier} size="sm" />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-black text-[#FAF6EE] truncate">
                                                                    {u.name}
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${u.role === 'admin'
                                                                            ? 'bg-[#D8B878]/20 text-[#F5D78E] border border-[#D8B878]/40'
                                                                            : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                                                                        }`}
                                                                >
                                                                    {u.role}
                                                                </span>
                                                                {isSuspended && (
                                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                                                                        Suspended
                                                                    </span>
                                                                )}
                                                                {isSelf && (
                                                                    <span className="text-[10px] font-bold text-emerald-300">
                                                                        (You)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-[#A9B8D6] truncate">
                                                                {u.email} • {u.tier} ({u.stars}★) • {u.drillCount} Drills • Avg{' '}
                                                                {u.avgScore}% • Season: {u.seasonName}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={isSelf}
                                                            onClick={() => handleToggleSuspend(u)}
                                                            title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition disabled:opacity-30 disabled:cursor-not-allowed ${isSuspended
                                                                    ? 'bg-emerald-600/25 border-emerald-400/40 text-emerald-200 hover:bg-emerald-600/40'
                                                                    : 'bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
                                                                }`}
                                                        >
                                                            {isSuspended ? (
                                                                <>
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    <span>Activate</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Ban className="w-3.5 h-3.5" />
                                                                    <span>Suspend</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={isSelf}
                                                            onClick={() => handleToggleRole(u)}
                                                            title="Toggle Admin/Student Role"
                                                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/15 text-[#D6DEF0] transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 text-[#D8B878]" />
                                                            <span>{u.role === 'admin' ? 'Demote' : 'Make Admin'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleResetProgress(u)}
                                                            title="Reset Student Progress"
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/15 text-[#A9B8D6] hover:text-amber-300 transition"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={isSelf}
                                                            onClick={() => handleDeleteAccount(u)}
                                                            title="Delete Account"
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/25 border border-white/15 text-[#A9B8D6] hover:text-rose-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 3: RULE ENGINE (RANK THRESHOLDS & STREAKS)
             ============================================================ */}
                    {activeTab === 'rules' && (
                        <form onSubmit={handleSaveRules} className="game-fit">
                            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-[#FAF6EE]">
                                        Arena Rule Engine
                                    </h1>
                                    <p className="text-[11px] text-[#A9B8D6]">
                                        Customize Warrior-to-Mythic star thresholds, streak multipliers, and drill limits
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleResetRules}
                                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-[#D6DEF0] inline-flex items-center gap-1.5 transition"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset Defaults</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 text-[#09152E] text-xs font-black inline-flex items-center gap-1.5 transition"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Save Rules</span>
                                    </button>
                                </div>
                            </div>

                            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                                {/* Left (7 cols): Rank Thresholds */}
                                <div className="lg:col-span-7 rounded-2xl bg-[#0D1F44] border border-[#D8B878]/25 p-4 flex flex-col gap-2.5 min-h-0 overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                            Division Star Thresholds
                                        </span>
                                        <span className="text-[10px] font-mono text-[#A9B8D6]">
                                            Warrior locked at 0 ★
                                        </span>
                                    </div>

                                    <div className="game-scroll flex-1 space-y-2 pr-1">
                                        {configDraft.tiers.map((tier, idx) => (
                                            <div
                                                key={tier.name}
                                                className="p-2.5 rounded-xl bg-[#09152E]/80 border border-white/10 flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <RankCrest tierName={tier.name} size="sm" />
                                                    <div>
                                                        <div className="text-sm font-black text-[#FAF6EE]">
                                                            {tier.name}
                                                        </div>
                                                        <div className="text-[10px] text-[#A9B8D6]">
                                                            Tier {idx + 1} of {configDraft.tiers.length}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold text-[#A9B8D6]">
                                                        Min Stars
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min={idx === 0 ? 0 : 1}
                                                            disabled={idx === 0}
                                                            value={tier.min}
                                                            onChange={(e) => handleTierMinChange(idx, e.target.value)}
                                                            className="w-24 pl-3 pr-7 py-1.5 rounded-xl bg-[#0D1F44] border border-[#D8B878]/35 text-sm font-mono font-black text-[#F5D78E] focus:outline-none focus:border-[#F5D78E] disabled:opacity-50"
                                                        />
                                                        <Star className="w-3.5 h-3.5 text-[#D8B878] fill-[#D8B878] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right (5 cols): Streak & Drill Parameters */}
                                <div className="lg:col-span-5 rounded-2xl bg-[#0D1F44] border border-white/10 p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                                    <div className="border-b border-white/10 pb-2 shrink-0">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#A9B8D6]">
                                            Drill & Streak Multipliers
                                        </span>
                                    </div>

                                    <div className="game-scroll flex-1 space-y-3 pr-1">
                                        <div className="p-3 rounded-xl bg-[#09152E]/80 border border-white/10">
                                            <label className="block text-xs font-bold text-[#FAF6EE] mb-1">
                                                Pass Target Accuracy (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="100"
                                                value={configDraft.passTarget}
                                                onChange={(e) =>
                                                    setConfigDraft((p) => ({ ...p, passTarget: e.target.value }))
                                                }
                                                className="w-full px-3 py-2 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-sm font-mono font-bold text-[#FAF6EE] focus:outline-none"
                                            />
                                            <p className="text-[10px] text-[#A9B8D6] mt-1">
                                                Scores below this threshold count as Weak Topics and trigger 0 stars.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="p-3 rounded-xl bg-[#09152E]/80 border border-white/10">
                                                <label className="block text-xs font-bold text-emerald-300 mb-1">
                                                    Win Streak (2x ★)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    max="20"
                                                    value={configDraft.winStreakTrigger}
                                                    onChange={(e) =>
                                                        setConfigDraft((p) => ({
                                                            ...p,
                                                            winStreakTrigger: e.target.value
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-sm font-mono font-bold text-[#FAF6EE] focus:outline-none"
                                                />
                                                <p className="text-[10px] text-[#A9B8D6] mt-1">
                                                    Consecutive 3★ wins
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-xl bg-[#09152E]/80 border border-white/10">
                                                <label className="block text-xs font-bold text-rose-300 mb-1">
                                                    Loss Streak (-1 ★)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    max="10"
                                                    value={configDraft.lossStreakTrigger}
                                                    onChange={(e) =>
                                                        setConfigDraft((p) => ({
                                                            ...p,
                                                            lossStreakTrigger: e.target.value
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-sm font-mono font-bold text-[#FAF6EE] focus:outline-none"
                                                />
                                                <p className="text-[10px] text-[#A9B8D6] mt-1">
                                                    Consecutive 0★ fails
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="p-3 rounded-xl bg-[#09152E]/80 border border-white/10">
                                                <label className="block text-xs font-bold text-[#FAF6EE] mb-1">
                                                    Min Questions
                                                </label>
                                                <input
                                                    type="number"
                                                    min="5"
                                                    max="50"
                                                    value={configDraft.minQuestions}
                                                    onChange={(e) =>
                                                        setConfigDraft((p) => ({ ...p, minQuestions: e.target.value }))
                                                    }
                                                    className="w-full px-3 py-2 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-sm font-mono font-bold text-[#FAF6EE] focus:outline-none"
                                                />
                                            </div>

                                            <div className="p-3 rounded-xl bg-[#09152E]/80 border border-white/10">
                                                <label className="block text-xs font-bold text-[#FAF6EE] mb-1">
                                                    Timer (Minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={configDraft.countdownMinutes}
                                                    onChange={(e) =>
                                                        setConfigDraft((p) => ({
                                                            ...p,
                                                            countdownMinutes: e.target.value
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-sm font-mono font-bold text-[#FAF6EE] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ============================================================
              TAB 4: BROADCAST BANNER & MAINTENANCE MODE
             ============================================================ */}
                    {activeTab === 'broadcast' && (
                        <div className="game-fit">
                            <div className="flex items-center justify-between gap-2 shrink-0">
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-[#FAF6EE]">
                                        Battle Banner & Maintenance Control
                                    </h1>
                                    <p className="text-[11px] text-[#A9B8D6]">
                                        Publish swallowtail announcements across Front Page, Dashboard, and Report screens
                                    </p>
                                </div>
                            </div>

                            {/* Live Swallowtail Pennant Preview */}
                            <div className="rounded-2xl bg-[#0D1F44] border border-[#D8B878]/30 p-4 space-y-2.5 shrink-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-[#D8B878] inline-flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Live Banner Preview
                                    </span>
                                    <span className="text-[10px] font-mono text-[#A9B8D6]">
                                        {configDraft.maintenanceMode
                                            ? 'Maintenance Red Theme'
                                            : configDraft.announcement?.trim()
                                                ? 'Royal Blue & Gold Pennant'
                                                : 'Banner Hidden (Empty)'}
                                    </span>
                                </div>

                                {configDraft.maintenanceMode || configDraft.announcement?.trim() ? (
                                    <AnnouncementBanner
                                        message={configDraft.announcement}
                                        maintenanceMode={Boolean(configDraft.maintenanceMode)}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-white/20 py-4 text-center text-xs text-[#A9B8D6]">
                                        Type an announcement below or enable Maintenance Mode to preview the swallowtail battle banner.
                                    </div>
                                )}
                            </div>

                            {/* Controls 2-Column Body */}
                            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                                {/* Left (7 cols): Announcement Composer */}
                                <form
                                    onSubmit={handleSaveBroadcast}
                                    className="lg:col-span-7 rounded-2xl bg-[#0D1F44] border border-white/10 p-4 flex flex-col justify-between gap-3 min-h-0 overflow-hidden"
                                >
                                    <div className="space-y-3 overflow-y-auto game-scroll pr-1">
                                        <div>
                                            <label className="block text-xs font-bold text-[#FAF6EE] mb-1.5">
                                                Global Announcement Message
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={configDraft.announcement}
                                                onChange={(e) =>
                                                    setConfigDraft((p) => ({ ...p, announcement: e.target.value }))
                                                }
                                                placeholder="e.g. Finals Week Double Star Event is LIVE! Climb to Mythic before Sunday 11:59 PM."
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09152E] border border-white/15 focus:border-[#D8B878] text-sm text-[#FAF6EE] placeholder:text-slate-500 focus:outline-none resize-none"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] block mb-1.5">
                                                Quick Presets
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {[
                                                    'Finals Week Event: Keep your 5x win streak alive for Double Stars!',
                                                    'New Semester Season Started — Archive your past rank in Progress Report.',
                                                    'Scheduled server upgrade tonight at 11:00 PM MYT (15 mins downtime).'
                                                ].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() =>
                                                            setConfigDraft((p) => ({ ...p, announcement: preset }))
                                                        }
                                                        className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#09152E] hover:bg-[#1E3F8A]/50 border border-white/10 text-[#D6DEF0] transition"
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleClearAnnouncement}
                                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-[#D6DEF0] transition"
                                        >
                                            Clear Banner
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 text-[#09152E] text-xs font-black inline-flex items-center gap-1.5 transition"
                                        >
                                            <Megaphone className="w-3.5 h-3.5" />
                                            <span>Publish Banner</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Right (5 cols): Maintenance Kill Switch */}
                                <div className="lg:col-span-5 rounded-2xl bg-[#0D1F44] border border-rose-500/35 p-4 flex flex-col justify-between gap-3 min-h-0">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${configDraft.maintenanceMode
                                                        ? 'bg-rose-500/25 text-rose-300 border border-rose-400/50'
                                                        : 'bg-white/5 text-[#A9B8D6] border border-white/10'
                                                    }`}
                                            >
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-black text-[#FAF6EE]">
                                                    System Maintenance Mode
                                                </h2>
                                                <span className="text-[11px] text-[#A9B8D6]">
                                                    Status:{' '}
                                                    <strong
                                                        className={
                                                            configDraft.maintenanceMode
                                                                ? 'text-rose-400'
                                                                : 'text-emerald-400'
                                                        }
                                                    >
                                                        {configDraft.maintenanceMode ? 'ACTIVE (LOCKED)' : 'INACTIVE (OPEN)'}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#09152E]/85 border border-white/10 text-xs text-[#D6DEF0] space-y-1.5 leading-relaxed">
                                            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                <span>When Enabled:</span>
                                            </div>
                                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#A9B8D6]">
                                                <li>Student Sign In, Sign Up, and Guest Mode are locked on Front Page.</li>
                                                <li>Existing student sessions are automatically signed out on reload.</li>
                                                <li>Only verified Admins (Email + Password + Google) can enter.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleToggleMaintenanceImmediate}
                                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 ${configDraft.maintenanceMode
                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                : 'bg-rose-600 hover:bg-rose-500 text-white'
                                            }`}
                                    >
                                        <Wrench className="w-4 h-4" />
                                        <span>
                                            {configDraft.maintenanceMode
                                                ? 'Disable Maintenance Mode'
                                                : 'Enable Maintenance Mode'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
              TAB 5: AUDIT LOGS
             ============================================================ */}
                    {activeTab === 'audit' && (
                        <div className="game-fit">
                            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-[#FAF6EE]">
                                        Admin Audit Logs
                                    </h1>
                                    <p className="text-[11px] text-[#A9B8D6]">
                                        Chronological trail of all moderation, rule changes, and maintenance events
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-[#A9B8D6] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={auditFilter}
                                            onChange={(e) => setAuditFilter(e.target.value)}
                                            placeholder="Filter action or email..."
                                            className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0D1F44] border border-white/15 focus:border-[#D8B878] text-xs text-[#FAF6EE] placeholder:text-slate-400 focus:outline-none w-48"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        disabled={auditLogs.length === 0}
                                        onClick={handleExportAuditJson}
                                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-[#D6DEF0] inline-flex items-center gap-1.5 disabled:opacity-35"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={auditLogs.length === 0}
                                        onClick={handleClearAuditLogs}
                                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-bold text-rose-200 inline-flex items-center gap-1.5 disabled:opacity-35"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Clear</span>
                                    </button>
                                </div>
                            </div>

                            <div className="game-fit-body rounded-2xl bg-[#0D1F44] border border-white/10 p-3 flex flex-col min-h-0 overflow-hidden">
                                {filteredLogs.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 text-xs text-[#A9B8D6]">
                                        <ScrollText className="w-8 h-8 opacity-40" />
                                        <span>No audit entries found.</span>
                                    </div>
                                ) : (
                                    <div className="game-scroll flex-1 space-y-2 pr-1">
                                        {filteredLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="p-3 rounded-xl bg-[#09152E]/85 border border-white/10 flex flex-wrap items-center justify-between gap-2"
                                            >
                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${log.severity === 'danger'
                                                                    ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                                                                    : log.severity === 'warn'
                                                                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                                                                        : 'bg-[#1E3F8A]/60 text-[#F5D78E] border border-[#D8B878]/35'
                                                                }`}
                                                        >
                                                            {log.action}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-[#A9B8D6]">
                                                            by {log.adminEmail}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#FAF6EE]">{log.details}</p>
                                                </div>

                                                <span className="text-[10px] font-mono text-[#A9B8D6] shrink-0">
                                                    {log.timestamp}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ===== ADMIN BOTTOM NAVIGATION DOCK ===== */}
            <nav className="game-dock" aria-label="Admin navigation">
                <div className="game-dock-inner">
                    {adminMenu.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigateTab(item.id)}
                                className={`game-dock-btn ${active ? 'is-active' : ''}`}
                            >
                                <span className="game-dock-icon">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
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