import React, { useState, useMemo } from 'react';
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
    BarChart3,
    FolderArchive,
    AlertTriangle,
    RotateCcw,
    Trash2,
    Star,
    Target,
    Swords,
    Calendar,
    CheckCircle2,
    Folder
} from 'lucide-react';
import { RankCrest, formatSeasonDuration } from '../App';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BattleStatsReport({
    rankInfo,
    matchHistory = [],
    currentSeason,
    archivedSeasons = [],
    onDeleteArchivedSeason,
    onNavigate = () => { },
    onReplayDrillFile,
    onDeleteDrillFile
}) {
    const [viewMode, setViewMode] = useState('current'); // 'current' | 'archived'
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'weak'
    const [selectedArchiveId, setSelectedArchiveId] = useState(
        archivedSeasons[0]?.id || null
    );

    const selectedArchive = useMemo(() => {
        if (archivedSeasons.length === 0) return null;
        return (
            archivedSeasons.find((s) => s.id === selectedArchiveId) || archivedSeasons[0]
        );
    }, [archivedSeasons, selectedArchiveId]);

    const subjectStats = useMemo(() => {
        const map = new Map();
        matchHistory.forEach((m) => {
            const key = m.topic || 'General';
            if (!map.has(key)) map.set(key, { sum: 0, count: 0 });
            const entry = map.get(key);
            entry.sum += m.score;
            entry.count += 1;
        });
        return Array.from(map.entries()).map(([subject, data]) => ({
            subject,
            avg: Math.round(data.sum / data.count),
            count: data.count
        }));
    }, [matchHistory]);

    const kpis = useMemo(() => {
        const total = matchHistory.length;
        const passed = matchHistory.filter((m) => m.score >= 60).length;
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        const avgScore =
            total > 0
                ? Math.round(matchHistory.reduce((s, m) => s + m.score, 0) / total)
                : 0;
        const weakCount = matchHistory.filter((m) => m.score < 60).length;
        return { total, passed, passRate, avgScore, weakCount };
    }, [matchHistory]);

    const filteredDrills = useMemo(() => {
        if (historyFilter === 'weak') {
            return matchHistory.filter((m) => m.score < 60);
        }
        return matchHistory;
    }, [matchHistory, historyFilter]);

    const chartData = {
        labels: subjectStats.map((s) =>
            s.subject.length > 16 ? `${s.subject.slice(0, 16)}…` : s.subject
        ),
        datasets: [
            {
                label: 'Avg Score (%)',
                data: subjectStats.map((s) => s.avg),
                backgroundColor: subjectStats.map((s) =>
                    s.avg >= 60 ? 'rgba(216, 184, 120, 0.82)' : 'rgba(244, 63, 94, 0.78)'
                ),
                borderColor: subjectStats.map((s) => (s.avg >= 60 ? '#F5D78E' : '#FB7185')),
                borderWidth: 1.5,
                borderRadius: 8
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20, color: '#94A3B8', font: { size: 10 } },
                grid: { color: 'rgba(148, 163, 184, 0.14)' }
            },
            x: {
                ticks: { color: '#CBD5E1', font: { size: 10, weight: '600' } },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const handleDeleteArchive = (season) => {
        if (!window.confirm(`Permanently delete archived season "${season.name}"?`)) return;
        if (onDeleteArchivedSeason) onDeleteArchivedSeason(season.id);
    };

    return (
        <div className="game-fit text-slate-800">
            {/* ===== HEADER WITH HIGH-VISIBILITY SEASON BADGE ===== */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Progress & Rank Report
                    </h1>

                    {currentSeason && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3F8A]/90 border border-[#D8B878]/80 shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-[#F5D78E] shrink-0" />
                            <span className="text-xs font-extrabold text-[#FAF6EE]">
                                {currentSeason.name}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#F5D78E]">
                                ({formatSeasonDuration(currentSeason)})
                            </span>
                        </div>
                    )}
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D1F44] border border-[#D8B878]/35 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('current')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition ${viewMode === 'current'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-[#A9B8D6] hover:text-white'
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Current Season</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewMode('archived')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition ${viewMode === 'archived'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-[#A9B8D6] hover:text-white'
                            }`}
                    >
                        <FolderArchive className="w-3.5 h-3.5" />
                        <span>Archives ({archivedSeasons.length})</span>
                    </button>
                </div>
            </div>

            {/* ============================================================
          VIEW 1: CURRENT SEASON REPORT
         ============================================================ */}
            {viewMode === 'current' && (
                <>
                    {/* 4-Card KPI Strip (Consistent with Dashboard Screenshot) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
                        <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Current Stars
                                </span>
                                <div className="text-2xl font-black font-mono text-[#D8B878] mt-0.5">
                                    {rankInfo?.totalStars ?? 0} ★
                                </div>
                            </div>
                            <Star className="w-5 h-5 text-[#D8B878] fill-[#D8B878] shrink-0" />
                        </div>

                        <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Drills Played
                                </span>
                                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                                    {kpis.total}
                                </div>
                            </div>
                            <Swords className="w-5 h-5 text-blue-500 shrink-0" />
                        </div>

                        <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Avg Accuracy
                                </span>
                                <div className="text-2xl font-black font-mono text-emerald-500 mt-0.5">
                                    {kpis.avgScore}%
                                </div>
                            </div>
                            <Target className="w-5 h-5 text-emerald-500 shrink-0" />
                        </div>

                        <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Weak Topics
                                </span>
                                <div className="text-2xl font-black font-mono text-rose-500 mt-0.5">
                                    {kpis.weakCount}
                                </div>
                            </div>
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        </div>
                    </div>

                    {/* Main 2-Column Body */}
                    <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                        {/* LEFT (7 COLS): SUBJECT PERFORMANCE CHART + RANK SUMMARY BAR */}
                        <div className="lg:col-span-7 game-card-sys rounded-2xl p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                            <div className="flex items-center justify-between gap-2 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <RankCrest tierName={rankInfo?.currentTier?.name || 'Warrior'} size="sm" />
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                            Subject Mastery Breakdown
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {rankInfo?.currentTier?.name || 'Warrior'} Division • Pass Rate:{' '}
                                            <strong className="text-emerald-400">{kpis.passRate}%</strong>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#F5D78E] px-2.5 py-1 rounded-lg bg-[#D8B878]/15 border border-[#D8B878]/40">
                                    Target: 60%
                                </span>
                            </div>

                            {subjectStats.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                                    <BarChart3 className="w-9 h-9 text-slate-400" />
                                    <p className="text-xs text-slate-500">
                                        Complete at least one drill to unlock subject accuracy analytics.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate('generator')}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                                    >
                                        Start First Drill
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 min-h-0 relative">
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>

                                    {/* Subject Pills Summary */}
                                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100/15 shrink-0">
                                        {subjectStats.map((s) => (
                                            <span
                                                key={s.subject}
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${s.avg >= 60
                                                        ? 'bg-emerald-500/10 border-emerald-400/35 text-emerald-300'
                                                        : 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                                                    }`}
                                            >
                                                {s.subject}: <strong className="font-mono">{s.avg}%</strong> ({s.count})
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT (5 COLS): DRILL RECORDS & WEAK RADAR WITH FILTER */}
                        <div className="lg:col-span-5 game-card-user rounded-2xl p-4 flex flex-col gap-2.5 min-h-0 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100/15 pb-2 shrink-0 gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                    Battle Records
                                </span>

                                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#09152E] border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setHistoryFilter('all')}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${historyFilter === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-[#A9B8D6] hover:text-white'
                                            }`}
                                    >
                                        All ({matchHistory.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHistoryFilter('weak')}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${historyFilter === 'weak'
                                                ? 'bg-rose-600 text-white'
                                                : 'text-[#A9B8D6] hover:text-white'
                                            }`}
                                    >
                                        Weak ({kpis.weakCount})
                                    </button>
                                </div>
                            </div>

                            {filteredDrills.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 text-xs text-slate-400">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-500/70" />
                                    <span>
                                        {historyFilter === 'weak'
                                            ? 'No weak topics! Every drill passed.'
                                            : 'No drills logged this season.'}
                                    </span>
                                </div>
                            ) : (
                                <div className="game-scroll flex-1 space-y-2 pr-1">
                                    {filteredDrills.map((m) => {
                                        const isWeak = m.score < 60;
                                        return (
                                            <div
                                                key={m.id}
                                                className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${isWeak
                                                        ? 'bg-rose-500/10 border-rose-400/40'
                                                        : 'bg-slate-50 border-slate-200'
                                                    }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-black text-slate-900 truncate">
                                                            {m.topic}
                                                        </span>
                                                        {isWeak && (
                                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white shrink-0">
                                                                Weak
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        {m.subtopic} • {m.date}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                        Score:{' '}
                                                        <strong
                                                            className={isWeak ? 'text-rose-500' : 'text-emerald-500'}
                                                        >
                                                            {m.score}%
                                                        </strong>{' '}
                                                        •{' '}
                                                        <span className="text-[#D8B878] font-bold">
                                                            {(m.starDelta ?? m.starsEarned) >= 0 ? '+' : ''}
                                                            {m.starDelta ?? m.starsEarned}★
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    {onReplayDrillFile && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onReplayDrillFile(m)}
                                                            title="Replay Drill"
                                                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {onDeleteDrillFile && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onDeleteDrillFile(m.id)}
                                                            title="Delete Record"
                                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ============================================================
          VIEW 2: ARCHIVED SEASONS VAULT
         ============================================================ */}
            {viewMode === 'archived' && (
                <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                    {archivedSeasons.length === 0 ? (
                        <div className="lg:col-span-12 game-card-sys rounded-2xl flex flex-col items-center justify-center text-center gap-2 p-6">
                            <FolderArchive className="w-10 h-10 text-slate-400" />
                            <div className="text-sm font-black text-slate-900">No Archived Seasons Yet</div>
                            <p className="text-xs text-slate-500 max-w-sm">
                                Start a New Season from your Dashboard to archive your completed semester rank, folders, and drill history here.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Left (4 cols): Archived Season Selector */}
                            <div className="lg:col-span-4 game-card-sys rounded-2xl p-3.5 flex flex-col gap-2 min-h-0 overflow-hidden">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">
                                    Past Semesters
                                </span>
                                <div className="game-scroll flex-1 space-y-2 pr-1">
                                    {archivedSeasons.map((season) => {
                                        const active = selectedArchive?.id === season.id;
                                        return (
                                            <div
                                                key={season.id}
                                                onClick={() => setSelectedArchiveId(season.id)}
                                                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${active
                                                        ? 'bg-[#1E3F8A]/50 border-[#D8B878]'
                                                        : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <RankCrest tierName={season.finalTier || 'Warrior'} size="sm" />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-black text-slate-900 truncate">
                                                            {season.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">
                                                            Ended {season.endedAt} • {season.finalTier} ({season.finalStars}★)
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteArchive(season);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                                                    title="Delete Archived Season"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right (8 cols): Selected Archive Details */}
                            <div className="lg:col-span-8 game-card-user rounded-2xl p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                                {selectedArchive && (
                                    <>
                                        <div className="flex items-center justify-between border-b border-slate-100/15 pb-3 shrink-0 flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <RankCrest tierName={selectedArchive.finalTier || 'Warrior'} size="md" />
                                                <div>
                                                    <div className="text-base font-black text-slate-900">
                                                        {selectedArchive.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        Final Rank: <strong className="text-slate-900">{selectedArchive.finalTier}</strong> •{' '}
                                                        <span className="font-mono text-[#D8B878] font-bold">
                                                            {selectedArchive.finalStars} ★
                                                        </span>{' '}
                                                        • {(selectedArchive.matchHistory || []).length} Drills
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3F8A]/80 border border-[#D8B878]/70 text-[11px] font-mono font-bold text-[#F5D78E]">
                                                <Calendar className="w-3 h-3" />
                                                {formatSeasonDuration(selectedArchive)}
                                            </span>
                                        </div>

                                        <div className="game-scroll flex-1 space-y-4 pr-1">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                                    Archived Subject Folders
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {(selectedArchive.registeredSubjects || []).length === 0 ? (
                                                        <span className="text-xs text-slate-400">No folders recorded.</span>
                                                    ) : (
                                                        selectedArchive.registeredSubjects.map((sub) => (
                                                            <span
                                                                key={sub.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                                                            >
                                                                <Folder className="w-3.5 h-3.5 text-[#D8B878]" />
                                                                {sub.name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                                    Archived Drills
                                                </span>
                                                <div className="space-y-2">
                                                    {(selectedArchive.matchHistory || []).length === 0 ? (
                                                        <span className="text-xs text-slate-400">No drills recorded.</span>
                                                    ) : (
                                                        selectedArchive.matchHistory.map((m) => (
                                                            <div
                                                                key={m.id}
                                                                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2"
                                                            >
                                                                <div className="min-w-0">
                                                                    <div className="font-black text-slate-900 truncate">
                                                                        {m.topic}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 truncate">
                                                                        {m.subtopic} • {m.date}
                                                                    </div>
                                                                </div>
                                                                <span className="font-mono font-black text-[#D8B878] shrink-0">
                                                                    {m.score}% ({(m.starDelta ?? m.starsEarned) >= 0 ? '+' : ''}
                                                                    {m.starDelta ?? m.starsEarned}★)
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}