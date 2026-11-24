import React, { useState, useMemo } from 'react';
import {
    Trophy,
    Swords,
    ArrowRight,
    Star,
    BarChart3,
    Folder,
    AlertTriangle,
    FolderArchive,
    Calendar,
    Pencil,
    Check,
    X,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';
import { RankCrest, getSeasonDurationParts, formatSeasonDuration } from '../App';

export default function DashboardOverview({
    user,
    rankInfo,
    matchHistory = [],
    currentSeason = null,
    onUpdateSeason,
    onStartNewSeason,
    onNavigate = () => { },
}) {
    const [isEditingSeason, setIsEditingSeason] = useState(false);
    const [seasonDraft, setSeasonDraft] = useState('');
    const [yearsDraft, setYearsDraft] = useState('0');
    const [monthsDraft, setMonthsDraft] = useState('0');

    const playerName = user?.name || 'Player';
    const totalMatches = matchHistory.length;
    const avgScore =
        totalMatches > 0
            ? Math.round(matchHistory.reduce((sum, m) => sum + m.score, 0) / totalMatches)
            : 0;

    const starsLeft = rankInfo.nextTier ? rankInfo.starsNeeded - rankInfo.starsInTier : 0;

    // Detect unique weak subjects & subtopics (< 60%)
    const weakItems = useMemo(() => {
        const seen = new Set();
        return matchHistory
            .filter((m) => m.score < 60)
            .filter((m) => {
                const key = `${m.topic}::${m.subtopic}`.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }, [matchHistory]);

    const parsedYearsDraft = Math.max(0, parseInt(yearsDraft, 10) || 0);
    const parsedMonthsDraft = Math.max(0, parseInt(monthsDraft, 10) || 0);
    const canSaveSeasonEdit =
        seasonDraft.trim().length > 0 && (parsedYearsDraft > 0 || parsedMonthsDraft > 0);

    const startSeasonEdit = () => {
        if (!currentSeason) return;
        const { years, months } = getSeasonDurationParts(currentSeason);
        setSeasonDraft(currentSeason.name);
        setYearsDraft(String(years));
        setMonthsDraft(String(months));
        setIsEditingSeason(true);
    };

    const saveSeasonEdit = (e) => {
        if (e) e.preventDefault();
        if (!canSaveSeasonEdit) return;
        if (onUpdateSeason) {
            onUpdateSeason({
                name: seasonDraft.trim(),
                durationYears: parsedYearsDraft,
                durationMonths: parsedMonthsDraft
            });
        }
        setIsEditingSeason(false);
    };

    return (
        <div className="game-fit text-slate-800">
            {/* Compact Lobby Header */}
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
                        Lobby — {playerName}
                    </h1>
                    <p className="text-xs text-slate-500">Season standing, active folder, and quick launch</p>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#0A1630] border border-[#8FB4FF]/50" />
                        System Info
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1C3872] border border-[#D8B878]" />
                        Your Content
                    </span>
                </div>
            </div>

            {/* Main 2-Column Command Grid */}
            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* LEFT COLUMN (7 cols): SYSTEM TELEMETRY + RANK ARENA HERO */}
                <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
                    {/* Top Telemetry Strip: Average Score & Total Stars */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        <div className="game-card-sys px-4 py-3.5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Average Score
                                </span>
                                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                                    {totalMatches > 0 ? `${avgScore}%` : '—'}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="game-card-sys px-4 py-3.5 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Total Stars
                                </span>
                                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                                    {rankInfo.totalStars}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Star className="w-5 h-5 fill-amber-500" />
                            </div>
                        </div>
                    </div>

                    {/* Primary Hero: Rank Crest + Tier Progress + Play CTA */}
                    <div className="flex-1 min-h-0 game-card-sys rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-5">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <RankCrest tierName={rankInfo.currentTier.name} size="xl" />

                            <div className="space-y-2.5 max-w-sm w-full">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                    {rankInfo.currentTier.name} Division
                                </span>

                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                    {rankInfo.nextTier
                                        ? `${starsLeft} ${starsLeft === 1 ? 'Star' : 'Stars'} to ${rankInfo.nextTier.name}`
                                        : 'Mythic Division Reached'}
                                </h2>

                                {/* Tier Progress Bar */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                                        <span>
                                            {rankInfo.nextTier
                                                ? `Progress to ${rankInfo.nextTier.name}`
                                                : 'Mythic (∞)'}
                                        </span>
                                        <span className="text-[#D8B878]">
                                            {rankInfo.nextTier
                                                ? `${rankInfo.starsInTier} / ${rankInfo.starsNeeded} ★`
                                                : `${rankInfo.totalStars} ★`}
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#F5D78E] to-[#D8B878] transition-all duration-300"
                                            style={{ width: `${rankInfo.progressPct ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-500">
                                    60%+ = 1 Star • 80%+ = 2 Stars • 100% = 3 Stars
                                </p>
                            </div>
                        </div>

                        <div className="w-full max-w-sm pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => onNavigate('generator')}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition"
                            >
                                <Swords className="w-4 h-4" />
                                <span>Start Ranked Drill</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (5 cols): SEASON FOLDER + WEAKNESS + SHORTCUTS */}
                <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
                    {/* USER CONTENT: Active Season Big Folder */}
                    {currentSeason && (
                        <div className="game-card-user rounded-2xl p-4 flex flex-col gap-3 shrink-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#D8B878] inline-flex items-center gap-1.5">
                                    <FolderArchive className="w-3.5 h-3.5" />
                                    Active Season Folder
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    {formatSeasonDuration(currentSeason)}
                                </span>
                            </div>

                            {isEditingSeason ? (
                                <form onSubmit={saveSeasonEdit} className="space-y-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                            Season Name
                                        </label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={seasonDraft}
                                            onChange={(e) => setSeasonDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') setIsEditingSeason(false);
                                            }}
                                            placeholder="e.g. Tingkatan 1, Sem 1"
                                            className="w-full px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                                Years
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                value={yearsDraft}
                                                onChange={(e) => setYearsDraft(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                                Months
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={monthsDraft}
                                                onChange={(e) => setMonthsDraft(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {parsedYearsDraft > 0 || parsedMonthsDraft > 0
                                                ? formatSeasonDuration({
                                                    durationYears: parsedYearsDraft,
                                                    durationMonths: parsedMonthsDraft
                                                })
                                                : 'Enter at least 1 month or year'}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingSeason(false)}
                                                title="Cancel"
                                                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!canSaveSeasonEdit}
                                                title="Save Changes"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold disabled:opacity-40 shrink-0"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <h3 className="text-base font-black text-slate-900 truncate">
                                                {currentSeason.name}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={startSeasonEdit}
                                                title="Edit Season Name & Duration"
                                                className="p-1 rounded-md text-slate-400 hover:text-[#D8B878] transition shrink-0"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={onStartNewSeason}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shrink-0"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            New Season
                                        </button>
                                    </div>

                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Stores all subject folders, drills, and rank progress. Starting a new season archives this folder to your Season Report.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ALERT / STATUS: Weakness Radar */}
                    {weakItems.length > 0 ? (
                        <div className="game-card-alert rounded-2xl p-4 flex flex-col gap-2.5 shrink-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 inline-flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                    Weak Topics ({weakItems.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onNavigate('records')}
                                    className="text-[11px] font-bold text-rose-200 hover:text-white underline underline-offset-2"
                                >
                                    Fix in Vault
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {weakItems.slice(0, 3).map((item) => (
                                    <span
                                        key={item.id}
                                        className="text-[11px] font-bold bg-rose-950/60 border border-rose-400/40 text-rose-100 px-2.5 py-1 rounded-lg"
                                    >
                                        {item.topic}: <span className="text-rose-300">{item.subtopic}</span> ({item.score}%)
                                    </span>
                                ))}
                                {weakItems.length > 3 && (
                                    <span className="text-[11px] font-bold text-rose-300 self-center">
                                        +{weakItems.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="game-card-sys rounded-2xl px-4 py-3 flex items-center gap-2.5 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">
                                All practiced topics are above the 60% target.
                            </span>
                        </div>
                    )}

                    {/* USER CONTENT: Side-by-Side Workspace Shortcuts */}
                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onNavigate('records')}
                            className="text-left game-card-user p-4 rounded-2xl transition group flex flex-col justify-between"
                        >
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#D8B878] transition">
                                        Subject Vault
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Saved drills & weak topics
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#D8B878]">
                                <span>Open</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => onNavigate('stats')}
                            className="text-left game-card-user p-4 rounded-2xl transition group flex flex-col justify-between"
                        >
                            <div className="space-y-2.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#D8B878] transition">
                                        Season Report
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Rank ladder & archives
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#D8B878]">
                                <span>View</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}