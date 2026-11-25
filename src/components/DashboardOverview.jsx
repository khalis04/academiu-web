import React, { useState, useMemo } from 'react';
import {
    Swords,
    FolderPlus,
    Trophy,
    Star,
    AlertTriangle,
    Calendar,
    Pencil,
    Check,
    X,
    PlusCircle,
    Target,
    Database,
    CheckCircle2,
    Lock,
    Settings,
    User,
    ListOrdered,
    ArrowRight
} from 'lucide-react';
import { RankCrest, formatSeasonDuration, getSeasonDurationParts } from '../App';

export default function DashboardOverview({
    user,
    rankInfo,
    matchHistory = [],
    currentSeason,
    onUpdateSeason,
    onStartNewSeason,
    onNavigate = () => { }
}) {
    const [editingSeason, setEditingSeason] = useState(false);
    const [showLadderModal, setShowLadderModal] = useState(false);

    const initialParts = getSeasonDurationParts(currentSeason);
    const [seasonNameDraft, setSeasonNameDraft] = useState(currentSeason?.name || '');
    const [yearsDraft, setYearsDraft] = useState(initialParts.years);
    const [monthsDraft, setMonthsDraft] = useState(initialParts.months);

    const stats = useMemo(() => {
        const totalDrills = matchHistory.length;
        const avgScore =
            totalDrills > 0
                ? Math.round(matchHistory.reduce((sum, m) => sum + m.score, 0) / totalDrills)
                : 0;
        const weakDrills = matchHistory.filter((m) => m.score < 60);
        const uniqueWeakTopics = Array.from(
            new Set(weakDrills.map((m) => (m.topic || '').trim()).filter(Boolean))
        );

        return {
            totalDrills,
            avgScore,
            weakCount: weakDrills.length,
            uniqueWeakTopics
        };
    }, [matchHistory]);

    const openSeasonEditor = () => {
        const parts = getSeasonDurationParts(currentSeason);
        setSeasonNameDraft(currentSeason?.name || '');
        setYearsDraft(parts.years);
        setMonthsDraft(parts.months);
        setEditingSeason(true);
    };

    const handleSaveSeason = (e) => {
        e.preventDefault();
        if (!seasonNameDraft.trim()) return;
        if (onUpdateSeason) {
            onUpdateSeason({
                name: seasonNameDraft,
                durationYears: yearsDraft,
                durationMonths: monthsDraft
            });
        }
        setEditingSeason(false);
    };

    const allTiers = rankInfo?.allTiers || [];
    const currentTierName = rankInfo?.currentTier?.name || 'Warrior';
    const currentStars = rankInfo?.totalStars ?? 0;

    // Cap visible weak topic pills so the Weak Topics frame never scrolls
    const MAX_WEAK_CHIPS = 4;
    const visibleWeakTopics = stats.uniqueWeakTopics.slice(0, MAX_WEAK_CHIPS);
    const extraWeakCount = Math.max(0, stats.uniqueWeakTopics.length - MAX_WEAK_CHIPS);

    const lobbyBgStyle = {
        backgroundColor: '#0E2452',
        backgroundImage:
            'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), ' +
            'linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), ' +
            'linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), ' +
            'linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%), ' +
            'radial-gradient(circle at 50% 45%, #1B4291 0%, #09183B 80%)',
        backgroundSize: '44px 44px, 44px 44px, 44px 44px, 44px 44px, 100% 100%',
        backgroundPosition: '0 0, 0 22px, 22px -22px, -22px 0, 0 0'
    };

    const frameClass =
        'rounded-xl bg-[#0B1C40]/95 border border-[#D8B878]/45 border-b-[3px] border-b-[#050D21] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_14px_rgba(3,9,24,0.45)] overflow-hidden';

    const frameHeaderClass =
        'px-3 py-1.5 bg-gradient-to-b from-[#173678] to-[#102759] border-b border-[#D8B878]/30 flex items-center justify-between shrink-0';

    return (
        <div
            style={lobbyBgStyle}
            className="game-fit w-full h-full rounded-2xl border-2 border-[#D8B878]/55 p-2.5 sm:p-3 flex flex-col gap-2.5 overflow-hidden relative text-[#FAF6EE]"
        >
            {/* ============================================================
          ROW 1 (12 COLS): PLAYER PROFILE & SEASON HEADER FRAME
         ============================================================ */}
            <div className={`${frameClass} px-3.5 py-2 flex items-center justify-between gap-3 shrink-0`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#07122B] border border-[#D8B878]/70 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-[#F5D78E]" />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                        <span className="text-sm sm:text-base font-black text-[#FAF6EE] tracking-wide leading-tight truncate">
                            {user?.name || 'Challenger'}
                        </span>

                        <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D8B878]/20 border border-[#D8B878]/55 text-[#F5D78E] shrink-0">
                            {currentTierName}
                        </span>

                        {currentSeason && !editingSeason ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E3F8A] border border-[#D8B878]/80 shadow-sm">
                                <Calendar className="w-3 h-3 text-[#F5D78E] shrink-0" />
                                <span className="text-[11px] font-extrabold text-[#FAF6EE] truncate">
                                    {currentSeason.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-[#F5D78E] shrink-0">
                                    ({formatSeasonDuration(currentSeason)})
                                </span>
                                {!user?.isGuest && (
                                    <button
                                        type="button"
                                        onClick={openSeasonEditor}
                                        title="Edit season details"
                                        className="ml-0.5 p-0.5 rounded-full bg-white/15 hover:bg-[#D8B878] text-[#FAF6EE] hover:text-[#09152E] transition"
                                    >
                                        <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                )}
                            </div>
                        ) : editingSeason ? (
                            <form onSubmit={handleSaveSeason} className="flex items-center gap-1 flex-wrap">
                                <input
                                    type="text"
                                    value={seasonNameDraft}
                                    onChange={(e) => setSeasonNameDraft(e.target.value)}
                                    placeholder="Season name"
                                    className="px-2 py-0.5 rounded bg-[#07122B] border border-[#D8B878]/70 text-[#FAF6EE] text-[11px] font-bold w-32 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={yearsDraft}
                                    onChange={(e) => setYearsDraft(e.target.value)}
                                    className="px-1.5 py-0.5 rounded bg-[#07122B] border border-[#D8B878]/70 text-[#FAF6EE] text-[11px] font-mono font-bold w-11 focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-[#F5D78E]">Y</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="11"
                                    value={monthsDraft}
                                    onChange={(e) => setMonthsDraft(e.target.value)}
                                    className="px-1.5 py-0.5 rounded bg-[#07122B] border border-[#D8B878]/70 text-[#FAF6EE] text-[11px] font-mono font-bold w-11 focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-[#F5D78E]">M</span>
                                <button
                                    type="submit"
                                    className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                    title="Save"
                                >
                                    <Check className="w-3 h-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingSeason(false)}
                                    className="p-1 rounded bg-white/15 hover:bg-white/25 text-white"
                                    title="Cancel"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </form>
                        ) : null}
                    </div>
                </div>

                {/* Right: Trophy Stars + Settings */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowLadderModal(true)}
                        title="View 7-Tier Rank Ladder"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07122B] border border-[#D8B878]/70 hover:border-[#F5D78E] transition"
                    >
                        <Trophy className="w-4 h-4 text-[#F5D78E]" />
                        <span className="text-sm font-black font-mono text-[#FAF6EE] leading-none">
                            {currentStars} ★
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        title="Settings"
                        aria-label="Settings"
                        className="w-9 h-9 rounded-lg bg-gradient-to-b from-[#254E9E] to-[#14306B] border border-[#93B8FF]/45 border-b-[3px] border-b-[#071433] flex items-center justify-center hover:brightness-110 active:translate-y-0.5 transition"
                    >
                        <Settings className="w-4 h-4 text-[#FAF6EE]" />
                    </button>
                </div>
            </div>

            {/* ============================================================
          ROW 2 (3 + 6 + 3 COLS): SIDE FRAMES + OPEN FRAMELESS CENTER CREST
         ============================================================ */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
                {/* ---------- LEFT COLUMN (3 COLS): RANK PROGRESS + QUICK ACCESS ---------- */}
                <div className="lg:col-span-3 flex flex-col gap-2.5 min-h-0 overflow-hidden">
                    {/* Frame A: Next Rank Progress */}
                    <div className={`${frameClass} flex-1 min-h-0 flex flex-col justify-between`}>
                        <div className={frameHeaderClass}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5D78E]">
                                Rank Progress
                            </span>
                            <span className="text-[10px] font-mono font-black text-[#FAF6EE]">
                                {rankInfo?.nextTier
                                    ? `${rankInfo.starsInTier}/${rankInfo.starsNeeded} ★`
                                    : 'MAX'}
                            </span>
                        </div>

                        <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-2">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#07122B] border border-[#D8B878]/60 flex items-center justify-center shrink-0">
                                        <Star className="w-4 h-4 text-[#F5D78E] fill-[#F5D78E]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-[#FAF6EE] truncate">
                                            {rankInfo?.nextTier
                                                ? `Next: ${rankInfo.nextTier.name}`
                                                : 'Mythic Champion'}
                                        </div>
                                        <div className="text-[10px] text-[#A9B8D6] truncate">
                                            {rankInfo?.nextTier
                                                ? `${Math.max(0, rankInfo.nextTier.min - currentStars)} ★ needed`
                                                : 'Top division unlocked'}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-2.5 rounded-full bg-[#07122B] border border-white/15 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#D8B878] to-[#F7DC94] transition-all duration-500"
                                        style={{ width: `${rankInfo?.progressPct ?? 0}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowLadderModal(true)}
                                className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-b from-[#234A99] to-[#15316E] border border-[#93B8FF]/40 border-b-[3px] border-b-[#071433] hover:brightness-110 active:translate-y-0.5 flex items-center justify-center gap-1.5 text-[11px] font-black text-[#FAF6EE] transition"
                            >
                                <ListOrdered className="w-3.5 h-3.5 text-[#F5D78E]" />
                                <span>7-Tier Ladder</span>
                            </button>
                        </div>
                    </div>

                    {/* Frame B: Quick Access (Folders + Vault) */}
                    <div className={`${frameClass} flex-1 min-h-0 flex flex-col justify-between`}>
                        <div className={frameHeaderClass}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5D78E]">
                                Quick Access
                            </span>
                        </div>

                        <div className="flex-1 min-h-0 p-2.5 flex flex-col justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => onNavigate('registration')}
                                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-b from-[#1B3C82] to-[#112759] border border-[#D8B878]/35 border-b-[3px] border-b-[#06112B] hover:border-[#F5D78E] hover:brightness-110 flex items-center justify-between gap-2 text-left transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <FolderPlus className="w-4 h-4 text-[#F5D78E] shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-[#FAF6EE] truncate">
                                            Subject Folders
                                        </div>
                                        <div className="text-[10px] text-[#A9B8D6] truncate">
                                            Manage season subjects
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
                            </button>

                            <button
                                type="button"
                                onClick={() => onNavigate('records')}
                                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-b from-[#1B3C82] to-[#112759] border border-[#D8B878]/35 border-b-[3px] border-b-[#06112B] hover:border-[#F5D78E] hover:brightness-110 flex items-center justify-between gap-2 text-left transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Database className="w-4 h-4 text-sky-300 shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-[#FAF6EE] truncate">
                                            Records Vault
                                        </div>
                                        <div className="text-[10px] text-[#A9B8D6] truncate">
                                            Browse & replay drills
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---------- CENTER COLUMN (6 COLS): FRAMELESS RANK CREST & PLAQUE ---------- */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center gap-3 min-h-0 p-2">
                    {/* Frameless & Borderless Rank Crest */}
                    <button
                        type="button"
                        onClick={() => setShowLadderModal(true)}
                        title="Click to inspect all 7 Rank Divisions"
                        className="group bg-transparent border-0 p-0 shadow-none outline-none focus:outline-none flex items-center justify-center shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                    >
                        <div className="scale-110 sm:scale-125">
                            <RankCrest tierName={currentTierName} size="xl" />
                        </div>
                    </button>

                    {/* Compact Division Plaque */}
                    <div className="px-6 py-1.5 rounded-xl bg-gradient-to-b from-[#1A2B52] to-[#0B142B] border border-[#D8B878] border-b-[3px] border-b-[#7A5B22] shadow-lg text-center shrink-0 mt-1">
                        <div className="text-sm sm:text-base font-black text-[#FAF6EE] tracking-wide leading-tight">
                            {currentTierName}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-bold text-[#F5D78E] uppercase tracking-wider mt-0.5">
                            {rankInfo?.nextTier
                                ? `Total: ${currentStars} ★ • ${Math.max(0, rankInfo.nextTier.min - currentStars)} ★ Needed`
                                : `Total: ${currentStars} ★ • Max Rank`}
                        </div>
                    </div>
                </div>

                {/* ---------- RIGHT COLUMN (3 COLS): WEAK TOPICS + SEASON COMMANDS ---------- */}
                <div className="lg:col-span-3 flex flex-col gap-2.5 min-h-0 overflow-hidden">
                    {/* Frame C: Weak Topics (Topic Names Only, Zero Scroll) */}
                    <div className={`${frameClass} flex-1 min-h-0 flex flex-col justify-between`}>
                        <div className={frameHeaderClass}>
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                                    Weak Topics (&lt; 60%)
                                </span>
                            </div>
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-600/80 text-white">
                                {stats.uniqueWeakTopics.length}
                            </span>
                        </div>

                        <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-2 overflow-hidden">
                            {stats.uniqueWeakTopics.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 text-emerald-300">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="text-[11px] font-bold leading-snug">
                                        All completed topics are above 60%!
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap content-start gap-1.5 overflow-hidden">
                                    {visibleWeakTopics.map((topicName) => (
                                        <span
                                            key={topicName}
                                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400/50 text-[11px] font-bold text-rose-100 truncate max-w-full"
                                        >
                                            {topicName}
                                        </span>
                                    ))}
                                    {extraWeakCount > 0 && (
                                        <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/25 text-[10px] font-mono font-bold text-[#F5D78E]">
                                            +{extraWeakCount} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => onNavigate('stats')}
                                className="w-full py-1.5 px-2.5 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-400/50 text-[11px] font-black text-rose-100 transition shrink-0"
                            >
                                Review in Report →
                            </button>
                        </div>
                    </div>

                    {/* Frame D: Season Commands (Report + New Season) */}
                    <div className={`${frameClass} flex-1 min-h-0 flex flex-col justify-between`}>
                        <div className={frameHeaderClass}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5D78E]">
                                Season Commands
                            </span>
                        </div>

                        <div className="flex-1 min-h-0 p-2.5 flex flex-col justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => onNavigate('stats')}
                                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-b from-[#1B3C82] to-[#112759] border border-[#D8B878]/35 border-b-[3px] border-b-[#06112B] hover:border-[#F5D78E] hover:brightness-110 flex items-center justify-between gap-2 text-left transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Trophy className="w-4 h-4 text-[#F5D78E] shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-[#FAF6EE] truncate">
                                            Rank Report
                                        </div>
                                        <div className="text-[10px] text-[#A9B8D6] truncate">
                                            Charts & archives
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
                            </button>

                            {!user?.isGuest && onStartNewSeason ? (
                                <button
                                    type="button"
                                    onClick={onStartNewSeason}
                                    className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-b from-[#1B3C82] to-[#112759] border border-[#D8B878]/35 border-b-[3px] border-b-[#06112B] hover:border-[#F5D78E] hover:brightness-110 flex items-center justify-between gap-2 text-left transition"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <PlusCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-xs font-black text-[#FAF6EE] truncate">
                                                New Season
                                            </div>
                                            <div className="text-[10px] text-[#A9B8D6] truncate">
                                                Archive & reset rank
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onNavigate('generator')}
                                    className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-b from-[#1B3C82] to-[#112759] border border-[#D8B878]/35 border-b-[3px] border-b-[#06112B] hover:border-[#F5D78E] hover:brightness-110 flex items-center justify-between gap-2 text-left transition"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Swords className="w-4 h-4 text-[#F5D78E] shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-xs font-black text-[#FAF6EE] truncate">
                                                Quick Practice
                                            </div>
                                            <div className="text-[10px] text-[#A9B8D6] truncate">
                                                Jump straight into drill
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================
          ROW 3 (3 + 6 + 3 COLS): DRILLS PLAYED | BATTLE | AVG ACCURACY
         ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch shrink-0">
                {/* Bottom Left (3 cols): Drills Played */}
                <button
                    type="button"
                    onClick={() => onNavigate('stats')}
                    className={`${frameClass} lg:col-span-3 flex flex-col text-left hover:brightness-110 transition`}
                >
                    <div className="px-3 py-1 bg-[#14306B] border-b border-[#D8B878]/30 text-[10px] font-black uppercase tracking-widest text-[#B8C7E4] text-center">
                        Drills Played
                    </div>
                    <div className="px-3 py-2 flex items-center justify-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-[#07122B] border border-sky-400/50 flex items-center justify-center shrink-0">
                            <Swords className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                            <div className="text-xl font-black font-mono text-[#FAF6EE] leading-none">
                                {stats.totalDrills}
                            </div>
                            <div className="text-[10px] font-bold uppercase text-[#A9B8D6] mt-0.5">
                                Season Total
                            </div>
                        </div>
                    </div>
                </button>

                {/* Bottom Center (6 cols): Tactile 3D Golden BATTLE Button */}
                <div className="lg:col-span-6 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => onNavigate('generator')}
                        className="w-full max-w-[340px] h-full min-h-[60px] py-3 px-6 rounded-2xl bg-gradient-to-b from-[#FFD44D] via-[#F5A623] to-[#DF8209] border-2 border-[#FFF2B2] border-b-[5px] border-b-[#924E00] shadow-[inset_0_2px_0_rgba(255,255,255,0.45),0_8px_18px_rgba(4,10,26,0.55)] hover:brightness-105 active:translate-y-0.5 active:border-b-2 flex items-center justify-center gap-2.5 cursor-pointer transition"
                    >
                        <Swords className="w-6 h-6 text-white drop-shadow-[0_2px_0_rgba(120,60,0,0.9)]" />
                        <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_0_rgba(120,60,0,0.9)]">
                            Battle
                        </span>
                    </button>
                </div>

                {/* Bottom Right (3 cols): Avg Accuracy */}
                <button
                    type="button"
                    onClick={() => onNavigate('stats')}
                    className="lg:col-span-3 rounded-xl bg-gradient-to-b from-[#0E5440] to-[#083327] border border-emerald-400/60 border-b-[3px] border-b-[#041F17] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_14px_rgba(3,9,24,0.45)] overflow-hidden flex flex-col text-left hover:brightness-110 transition"
                >
                    <div className="px-3 py-1 bg-emerald-800/90 border-b border-emerald-300/30 text-[10px] font-black uppercase tracking-widest text-emerald-100 text-center">
                        Avg Accuracy
                    </div>
                    <div className="px-3 py-2 flex items-center justify-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-emerald-950/90 border border-emerald-400/60 flex items-center justify-center shrink-0">
                            <Target className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div>
                            <div className="text-xl font-black font-mono text-emerald-300 leading-none">
                                {stats.avgScore}%
                            </div>
                            <div className="text-[10px] font-bold uppercase text-emerald-100/80 mt-0.5">
                                Pass Target 60%
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* ============================================================
          7-TIER RANK LADDER MODAL
         ============================================================ */}
            {showLadderModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
                    onClick={() => setShowLadderModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-[#0D1F44] border-2 border-[#D8B878]/70 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3 bg-[#09152E] border-b border-[#D8B878]/35 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#F5D78E]" />
                                <span className="text-sm font-black uppercase tracking-wider text-[#FAF6EE]">
                                    Season Rank Ladder
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLadderModal(false)}
                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF6EE]"
                                aria-label="Close Rank Ladder"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 space-y-2 max-h-[70dvh] overflow-y-auto game-scroll">
                            {allTiers.map((tier) => {
                                const isCurrent = currentTierName === tier.name;
                                const isUnlocked = currentStars >= tier.min;
                                return (
                                    <div
                                        key={tier.name}
                                        className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 ${isCurrent
                                            ? 'bg-[#1E3F8A]/75 border-[#F5D78E]'
                                            : isUnlocked
                                                ? 'bg-[#09152E]/85 border-white/15'
                                                : 'bg-[#09152E]/45 border-white/10 opacity-65'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <RankCrest tierName={tier.name} size="sm" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-[#FAF6EE]">
                                                        {tier.name}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#F5D78E] text-[#09152E]">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-mono text-[#A9B8D6]">
                                                    Requires {tier.min} ★
                                                </span>
                                            </div>
                                        </div>

                                        {isUnlocked ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}