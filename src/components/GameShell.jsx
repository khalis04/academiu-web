import React from 'react';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { OfficialLogo } from '../App';
import AnnouncementBanner from './AnnouncementBanner';
import '../game-fit.css';

export default function GameShell({
    menuItems = [],
    activeTab,
    onSelectTab,
    canGoBack = false,
    onGoBack,
    currentUser,
    isGuest = false,
    dashboardReady = true,
    onLogout,
    systemConfig,
    isAdminPreview = false,
    onReturnToAdmin,
    children
}) {
    const showBanner =
        Boolean(systemConfig?.maintenanceMode) || Boolean(systemConfig?.announcement?.trim());

    return (
        <div
            className={`game-shell transition-opacity duration-500 ${dashboardReady ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* ===== TOP HUD ===== */}
            <header className="game-hud">
                <div className="flex items-center gap-2.5 min-w-0">
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

                    <button
                        type="button"
                        onClick={() => onSelectTab('dashboard')}
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                        className="game-logo-pill cursor-pointer hover:brightness-105 active:scale-[0.98] transition shrink-0"
                    >
                        <OfficialLogo variant="full" size="md" />
                    </button>

                    {isGuest && (
                        <span className="hidden md:inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-200">
                            Guest Mode
                        </span>
                    )}
                </div>

                {/* Right HUD Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {isAdminPreview && onReturnToAdmin && (
                        <button
                            type="button"
                            onClick={onReturnToAdmin}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-[#09152E] bg-gradient-to-r from-[#D8B878] to-[#F5D78E] hover:brightness-105 transition"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Admin Portal</span>
                        </button>
                    )}

                    <div className="hidden md:flex flex-col text-right leading-tight max-w-[140px]">
                        <span className="text-xs font-bold text-[#FAF6EE] truncate">
                            {currentUser?.name || 'Challenger'}
                        </span>
                        <span className="text-[10px] text-[#A9B8D6] truncate">
                            {isGuest ? 'Unsaved Session' : currentUser?.email}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A9B8D6] hover:text-white bg-white/5 border border-white/15 hover:border-[#D8B878] transition"
                        title="Log Out"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Log Out</span>
                    </button>
                </div>
            </header>

            {/* ===== MAIN STAGE (FIXED HEIGHT, NO OUTER SCROLL) ===== */}
            <main className="game-main">
                {showBanner && (
                    <AnnouncementBanner
                        message={systemConfig?.announcement}
                        maintenanceMode={Boolean(systemConfig?.maintenanceMode)}
                    />
                )}

                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {children}
                </div>
            </main>

            {/* ===== BOTTOM NAVIGATION DOCK ===== */}
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
                                className={`game-dock-btn ${active ? 'is-active' : ''}`}
                            >
                                <span className="game-dock-icon">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </span>
                                <span className="game-dock-label">
                                    {item.id === 'stats'
                                        ? 'Report'
                                        : item.id === 'generator'
                                            ? 'Arena'
                                            : item.id === 'registration'
                                                ? 'Folders'
                                                : item.id === 'records'
                                                    ? 'Records'
                                                    : item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}