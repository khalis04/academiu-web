import React from 'react';
import {
    ArrowLeft,
    LogOut,
    Star,
    AlertTriangle,
    LogIn,
    Megaphone,
    Wrench,
    ShieldCheck
} from 'lucide-react';
import { RankCrest, OfficialLogo } from '../App';
import '../game-fit.css';

const SHORT_LABELS = {
    dashboard: 'Home',
    registration: 'Folders',
    generator: 'Drill',
    records: 'Records',
    stats: 'Rank',
    settings: 'Settings'
};

export default function GameShell({
    menuItems,
    activeTab,
    onSelectTab,
    canGoBack = false,
    onGoBack,
    rankInfo,
    currentUser,
    isGuest,
    dashboardReady,
    onLogout,
    systemConfig = null,
    isAdminPreview = false,
    onReturnToAdmin,
    children
}) {
    const hasAnnouncement = Boolean(systemConfig?.announcement?.trim());
    const isMaintenance = Boolean(systemConfig?.maintenanceMode);

    return (
        <div
            className={`game-shell flex flex-col h-screen overflow-hidden transition-all duration-700 ease-out ${dashboardReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            {/* ===== TOP HUD ===== */}
            <header className="game-hud">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Top-Left Back Button */}
                    <button
                        type="button"
                        onClick={onGoBack}
                        disabled={!canGoBack}
                        title="Go back"
                        aria-label="Go back"
                        className="game-icon-btn shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Clickable Logo -> Back to Dashboard */}
                    <button
                        type="button"
                        onClick={() => onSelectTab('dashboard')}
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                        className="game-logo-pill cursor-pointer hover:brightness-105 active:scale-[0.98] transition"
                    >
                        <OfficialLogo variant="full" />
                    </button>

                    {isGuest && (
                        <span className="hidden lg:block text-[11px] font-bold text-[#D8B878]">
                            Guest session
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    {/* Admin Preview Quick Return */}
                    {isAdminPreview && onReturnToAdmin && (
                        <button
                            type="button"
                            onClick={onReturnToAdmin}
                            title="Return to Admin Control Plane"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-[#D8B878] text-[#09152E] hover:brightness-110 transition"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span className="hidden md:inline">Admin Panel</span>
                        </button>
                    )}

                    {/* Rank + Dynamic Tier Progress Bar */}
                    <div
                        className="game-player"
                        onClick={() => onSelectTab('stats')}
                        title="Open rank report"
                    >
                        <RankCrest tierName={rankInfo.currentTier.name} size="sm" />
                        <div className="min-w-0">
                            <div className="text-xs font-black text-[#FAF6EE] truncate max-w-[120px]">
                                {currentUser?.name || 'Guest Player'}
                            </div>
                            <div className="text-[11px] font-bold text-[#D8B878]">
                                {rankInfo.currentTier.name}
                            </div>
                            <div className="w-24 h-1.5 rounded-full bg-white/15 overflow-hidden mt-1">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#F5D78E] to-[#D8B878] transition-all duration-300"
                                    style={{ width: `${rankInfo.progressPct ?? 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="game-stars">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{rankInfo.totalStars}</span>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        title={isGuest ? 'Sign in to save progress' : 'Log out'}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A9B8D6] hover:text-white bg-white/5 border border-white/15 hover:border-[#D8B878] transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">{isGuest ? 'Sign In' : 'Log Out'}</span>
                    </button>
                </div>
            </header>

            {/* ===== FULL-WIDTH STAGE ===== */}
            <main className="game-main flex-1 min-h-0 overflow-hidden flex flex-col">
                {/* Admin Live Broadcast / Maintenance Banner */}
                {(isMaintenance || hasAnnouncement) && (
                    <div
                        className={`mb-2 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shrink-0 ${isMaintenance
                                ? 'bg-rose-500/20 border border-rose-400/50 text-rose-100'
                                : 'bg-blue-500/20 border border-blue-400/40 text-blue-100'
                            }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {isMaintenance ? (
                                <Wrench className="w-4 h-4 text-rose-300 shrink-0" />
                            ) : (
                                <Megaphone className="w-4 h-4 text-[#F5D78E] shrink-0" />
                            )}
                            <span className="truncate">
                                {isMaintenance
                                    ? 'Maintenance Mode Active: Some drill features may be temporarily unavailable.'
                                    : systemConfig.announcement}
                            </span>
                        </div>

                        {isAdminPreview && onReturnToAdmin && (
                            <button
                                type="button"
                                onClick={onReturnToAdmin}
                                className="px-2.5 py-1 rounded-lg bg-[#D8B878] text-[#09152E] text-[11px] font-black shrink-0"
                            >
                                Edit Broadcast
                            </button>
                        )}
                    </div>
                )}

                {/* Guest Mode Notice */}
                {isGuest && (
                    <div className="game-guest-bar">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                                <strong>Guest Mode Active:</strong> Registered folders and drill files are temporary and will be lost on exit.
                            </span>
                        </div>
                        <button type="button" onClick={onLogout} className="game-guest-btn">
                            <LogIn className="w-3.5 h-3.5" />
                            Sign In / Sign Up to Save
                        </button>
                    </div>
                )}

                <div className="flex-1 min-h-0">{children}</div>
            </main>

            {/* ===== BOTTOM DOCK ===== */}
            <nav className="game-dock" aria-label="Main navigation">
                <div className="game-dock-inner">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelectTab(item.id)}
                                title={item.label}
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                                className={`game-dock-btn ${active ? 'is-active' : ''}`}
                            >
                                <span className="game-dock-icon">
                                    <Icon className="w-5 h-5" />
                                </span>
                                <span className="game-dock-label">
                                    {SHORT_LABELS[item.id] || item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}