import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    Star,
    Swords,
    Filter,
    RotateCcw,
    Eye,
    ArrowLeft,
    Download,
    TrendingUp,
    Play,
    Trash2,
    LayoutDashboard,
    History,
    FolderArchive,
    Info,
    Calendar,
    Folder
} from 'lucide-react';
import { RankCrest, formatSeasonDuration } from '../App';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PASS_TARGET = 60;

export default function BattleStatsReport({
    rankInfo,
    matchHistory = [],
    currentSeason = null,
    archivedSeasons = [],
    onDeleteArchivedSeason,
    onNavigate,
    onReplayDrillFile,
    onDeleteDrillFile
}) {
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [selectedSubtopic, setSelectedSubtopic] = useState('All');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [view, setView] = useState('overview'); // 'overview' | 'history' | 'seasons'

    const topics = useMemo(
        () => ['All', ...Array.from(new Set(matchHistory.map((m) => m.topic)))],
        [matchHistory]
    );

    const subtopics = useMemo(() => {
        const pool =
            selectedTopic === 'All'
                ? matchHistory
                : matchHistory.filter((m) => m.topic === selectedTopic);
        return ['All', ...Array.from(new Set(pool.map((m) => m.subtopic)))];
    }, [matchHistory, selectedTopic]);

    const filteredMatches = useMemo(() => {
        return matchHistory.filter((m) => {
            const topicMatch = selectedTopic === 'All' || m.topic === selectedTopic;
            const subtopicMatch = selectedSubtopic === 'All' || m.subtopic === selectedSubtopic;
            return topicMatch && subtopicMatch;
        });
    }, [matchHistory, selectedTopic, selectedSubtopic]);

    const chronological = useMemo(() => [...filteredMatches].reverse(), [filteredMatches]);

    const firstScore = chronological.length > 0 ? chronological[0].score : 0;
    const latestScore = chronological.length > 0 ? chronological[chronological.length - 1].score : 0;
    const scoreGain = latestScore - firstScore;
    const passCount = filteredMatches.filter((m) => m.score >= PASS_TARGET).length;
    const winRate =
        filteredMatches.length > 0 ? Math.round((passCount / filteredMatches.length) * 100) : 0;

    const kpiCards = [
        {
            label: 'First',
            value: `${firstScore}%`,
            valueClass: 'text-slate-900',
            desc: 'Your very first drill score in this season (baseline).'
        },
        {
            label: 'Latest',
            value: `${latestScore}%`,
            valueClass: 'text-blue-600',
            desc: 'Your most recent completed drill score.'
        },
        {
            label: 'Gain',
            value: scoreGain >= 0 ? `+${scoreGain}%` : `${scoreGain}%`,
            valueClass: scoreGain >= 0 ? 'text-emerald-600' : 'text-rose-600',
            desc: 'Total score difference between your First and Latest drill.'
        },
        {
            label: 'Pass Rate',
            value: `${winRate}%`,
            valueClass: 'text-slate-900',
            desc: `Percentage of drills scoring ${PASS_TARGET}% or higher (${passCount}/${filteredMatches.length}).`
        }
    ];

    const improvementChartData = {
        labels: chronological.map((_, idx) => `Drill #${idx + 1}`),
        datasets: [
            {
                label: 'Score (%)',
                data: chronological.map((m) => m.score),
                borderColor: '#60A5FA',
                backgroundColor: 'rgba(96, 165, 250, 0.18)',
                pointBackgroundColor: '#D8B878',
                pointBorderColor: '#0D1F44',
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.3,
                fill: true,
            },
            {
                label: `Target (${PASS_TARGET}%)`,
                data: chronological.map(() => PASS_TARGET),
                borderColor: '#34D399',
                borderWidth: 2,
                borderDash: [6, 6],
                pointRadius: 0,
                fill: false,
            },
        ],
    };

    const improvementChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: { stepSize: 20, color: '#A9B8D6', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.08)' }
            },
            x: {
                ticks: { color: '#A9B8D6', font: { size: 11 } },
                grid: { display: false }
            },
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11, weight: '600' },
                    color: '#D6DEF0'
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: (ctx) => {
                        const item = chronological[ctx.dataIndex];
                        if (!item) return '';
                        const delta = item.starDelta ?? item.starsEarned;
                        const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
                        return `${item.topic} — ${item.subtopic} (${deltaLabel} ★)`;
                    }
                }
            }
        },
    };

    // ARCHIVED SEASON INSPECTION VIEW
    if (selectedArchive) {
        return (
            <div className="game-fit text-slate-800">
                <div className="flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => setSelectedArchive(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:border-blue-400 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Past Seasons
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm(`Permanently delete archived season "${selectedArchive.name}"?`)) {
                                onDeleteArchivedSeason(selectedArchive.id);
                                setSelectedArchive(null);
                            }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Season
                    </button>
                </div>

                <div className="game-card-sys rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <RankCrest tierName={selectedArchive.finalTier} size="lg" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#D8B878]">
                                Archived Season • {formatSeasonDuration(selectedArchive)}
                            </span>
                            <h1 className="text-xl font-black text-slate-900">{selectedArchive.name}</h1>
                            <p className="text-xs text-slate-500">
                                {selectedArchive.createdAt} — {selectedArchive.endedAt} • Final Rank:{' '}
                                {selectedArchive.finalTier} ({selectedArchive.finalStars} Stars)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span>{selectedArchive.registeredSubjects.length} Folders</span>
                        <span>•</span>
                        <span>{selectedArchive.matchHistory.length} Drills</span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* Archived Subject Folders */}
                    <div className="lg:col-span-4 game-card-user rounded-2xl p-4 flex flex-col gap-2 min-h-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878] shrink-0">
                            Saved Subject Folders ({selectedArchive.registeredSubjects.length})
                        </span>
                        <div className="game-scroll flex-1 space-y-2 pr-1">
                            {selectedArchive.registeredSubjects.length === 0 ? (
                                <div className="text-xs text-slate-500 py-4 text-center">No folders recorded.</div>
                            ) : (
                                selectedArchive.registeredSubjects.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5"
                                    >
                                        <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-900 truncate">{sub.name}</div>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Archived Drill History */}
                    <div className="lg:col-span-8 game-card-user rounded-2xl p-4 flex flex-col gap-2 min-h-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878] shrink-0">
                            Saved Drills ({selectedArchive.matchHistory.length})
                        </span>
                        <div className="game-scroll flex-1 space-y-2 pr-1">
                            {selectedArchive.matchHistory.length === 0 ? (
                                <div className="text-xs text-slate-500 py-4 text-center">No drills recorded.</div>
                            ) : (
                                selectedArchive.matchHistory.map((m) => {
                                    const delta = m.starDelta ?? m.starsEarned;
                                    return (
                                        <div
                                            key={m.id}
                                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 truncate">{m.subtopic}</div>
                                                <div className="text-[11px] text-slate-500">
                                                    {m.topic} • {m.date}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div
                                                    className={`font-black font-mono ${m.score >= PASS_TARGET ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}
                                                >
                                                    {m.score}%
                                                </div>
                                                <div
                                                    className={`text-[10px] font-mono font-bold ${delta < 0 ? 'text-rose-500' : 'text-amber-500'
                                                        }`}
                                                >
                                                    {delta > 0 ? `+${delta}` : delta} Stars
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // DRILL INSPECTION VIEW
    if (selectedMatch) {
        const passed = selectedMatch.score >= PASS_TARGET;
        const matchStarDelta = selectedMatch.starDelta ?? selectedMatch.starsEarned;

        return (
            <div className="game-fit text-slate-800">
                <div className="flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => setSelectedMatch(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:border-blue-400 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <span className="font-mono text-xs text-slate-400">{selectedMatch.id}</span>
                </div>

                <div
                    className={`game-fit-body ${passed ? 'game-card-sys' : 'game-card-alert'
                        } rounded-2xl p-5 flex flex-col gap-4`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                {selectedMatch.topic}
                            </span>
                            <h1 className="text-xl font-black text-slate-900 mt-2">{selectedMatch.subtopic}</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {selectedMatch.format} • {selectedMatch.date}
                                {selectedMatch.fileName ? ` • ${selectedMatch.fileName}` : ''}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-50/70 px-4 py-2 rounded-xl border border-amber-200 self-start">
                            {[1, 2, 3].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-5 h-5 ${s <= selectedMatch.starsEarned
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-slate-300'
                                        }`}
                                />
                            ))}
                            <span
                                className={`ml-1 text-xs font-mono font-black ${matchStarDelta < 0 ? 'text-rose-600' : 'text-amber-800'
                                    }`}
                            >
                                {matchStarDelta > 0 ? `+${matchStarDelta}` : matchStarDelta}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                            <div className="text-2xl font-black font-mono text-slate-900">
                                {selectedMatch.score}%
                            </div>
                            <span className="text-xs font-mono text-slate-500">
                                {selectedMatch.correct}/{selectedMatch.total}
                            </span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                            <div className={`text-lg font-black ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {passed ? 'Passed' : 'Weak (<60%)'}
                            </div>
                            <span className="text-xs text-slate-500">Target: {PASS_TARGET}%</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
                            <div className="text-2xl font-black font-mono text-slate-900">
                                {selectedMatch.timeSpent}
                            </div>
                            <span className="text-xs text-slate-500">Duration</span>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-700">
                        <strong className="text-blue-900 block mb-0.5">Note:</strong>
                        {selectedMatch.note}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                if (onDeleteDrillFile) onDeleteDrillFile(selectedMatch.id);
                                setSelectedMatch(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setSelectedMatch(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const fileToRedo = selectedMatch;
                                    setSelectedMatch(null);
                                    if (onReplayDrillFile) onReplayDrillFile(fileToRedo);
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" /> Redo Drill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-fit text-slate-800">
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Season Report {currentSeason ? `— ${currentSeason.name}` : ''}
                    </h1>
                    <p className="text-xs text-slate-500">Rank ladder, score trend, and archived seasons</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onNavigate('generator')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
                    >
                        <Swords className="w-4 h-4" />
                        <span className="hidden sm:inline">New Drill</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                    >
                        <Download className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                </div>
            </div>

            {/* USER CONTENT: Filter & View Switch */}
            <div className="game-card-user rounded-2xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    {view !== 'seasons' ? (
                        <>
                            <Filter className="w-4 h-4 text-[#D8B878]" />
                            <select
                                value={selectedTopic}
                                onChange={(e) => {
                                    setSelectedTopic(e.target.value);
                                    setSelectedSubtopic('All');
                                }}
                                className="text-xs font-semibold border rounded-xl px-2.5 py-1.5 focus:outline-none max-w-[150px]"
                            >
                                {topics.map((t) => (
                                    <option key={t} value={t}>
                                        {t === 'All' ? 'All Subjects' : t}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedSubtopic}
                                onChange={(e) => setSelectedSubtopic(e.target.value)}
                                className="text-xs font-semibold border rounded-xl px-2.5 py-1.5 focus:outline-none max-w-[150px]"
                            >
                                {subtopics.map((st) => (
                                    <option key={st} value={st}>
                                        {st === 'All' ? 'All Subtopics' : st}
                                    </option>
                                ))}
                            </select>

                            {(selectedTopic !== 'All' || selectedSubtopic !== 'All') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTopic('All');
                                        setSelectedSubtopic('All');
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#D8B878] hover:underline px-2"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                                </button>
                            )}
                        </>
                    ) : (
                        <span className="text-xs font-bold text-[#D8B878] px-2 flex items-center gap-1.5">
                            <FolderArchive className="w-4 h-4" /> Archived Season Vault
                        </span>
                    )}
                </div>

                <div className="inline-flex rounded-xl bg-slate-50 border border-slate-200 p-0.5">
                    <button
                        type="button"
                        onClick={() => setView('overview')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('history')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <History className="w-3.5 h-3.5" /> History ({filteredMatches.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('seasons')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'seasons' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <FolderArchive className="w-3.5 h-3.5" /> Past Seasons ({archivedSeasons.length})
                    </button>
                </div>
            </div>

            {/* VIEW 1: OVERVIEW */}
            {view === 'overview' && (
                <div className="game-fit-body grid gap-3 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] content-start">
                    {/* SYSTEM INFO: Rank Card & Ladder */}
                    <div className="lg:col-span-5 game-card-sys rounded-2xl p-4 flex flex-col gap-3 min-h-0">
                        <div className="flex items-center gap-3">
                            <RankCrest tierName={rankInfo.currentTier.name} size="lg" />
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                    Current Standing
                                </span>
                                <h2 className="text-xl font-black text-slate-900 mt-1">
                                    {rankInfo.currentTier.name}
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    {rankInfo.totalStars} Stars •{' '}
                                    {rankInfo.nextTier
                                        ? `${rankInfo.starsNeeded - rankInfo.starsInTier} to ${rankInfo.nextTier.name}`
                                        : 'Max Rank'}
                                </p>
                            </div>
                        </div>

                        {/* Dynamic Tier Progress Bar */}
                        <div className="bg-slate-50 border border-slate-200/80 px-3 py-2.5 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>
                                    {rankInfo.nextTier ? `Progress to ${rankInfo.nextTier.name}` : 'Mythic Tier (∞)'}
                                </span>
                                <span className="font-mono text-[#D8B878]">
                                    {rankInfo.nextTier
                                        ? `${rankInfo.starsInTier} / ${rankInfo.starsNeeded} ★`
                                        : `${rankInfo.totalStars} ★`}
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#F5D78E] to-[#D8B878] transition-all duration-300"
                                    style={{ width: `${rankInfo.progressPct ?? 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="min-h-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                Rank Ladder
                            </span>
                            <div className="grid grid-cols-4 gap-2">
                                {rankInfo.allTiers.map((tier) => {
                                    const isCurrent = tier.name === rankInfo.currentTier.name;
                                    const isUnlocked = rankInfo.totalStars >= tier.min;
                                    return (
                                        <div
                                            key={tier.name}
                                            className={`p-1.5 rounded-xl border flex flex-col items-center text-center transition ${isCurrent
                                                ? 'bg-blue-50/60 border-[#D8B878] ring-2 ring-blue-500/20'
                                                : isUnlocked
                                                    ? 'bg-white border-slate-200'
                                                    : 'bg-slate-50 border-slate-200/60 opacity-45'
                                                }`}
                                        >
                                            <RankCrest tierName={tier.name} size="sm" />
                                            <span className="text-[10px] font-bold text-slate-800 leading-tight">
                                                {tier.name}
                                            </span>
                                            <span className="text-[9px] font-mono font-semibold text-slate-400">
                                                {tier.min}+
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SYSTEM INFO: Hover-Tooltip KPIs + Chart */}
                    <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                            {kpiCards.map((kpi) => (
                                <div
                                    key={kpi.label}
                                    className="relative group game-card-sys px-3 py-2.5 rounded-2xl cursor-help"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            {kpi.label}
                                        </span>
                                        <Info className="w-3 h-3 text-slate-500 group-hover:text-[#D8B878] transition" />
                                    </div>
                                    <div className={`text-xl font-black font-mono ${kpi.valueClass}`}>
                                        {kpi.value}
                                    </div>

                                    {/* Instant Hover Tooltip */}
                                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-44 p-2.5 rounded-xl bg-[#09152E] border border-[#D8B878]/60 shadow-xl text-[11px] font-medium text-[#FAF6EE] leading-snug text-center">
                                        {kpi.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 min-h-[220px] lg:min-h-0 game-card-sys p-4 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 shrink-0">
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-blue-600" /> Score Trend
                                </h2>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    Pass: {PASS_TARGET}%
                                </span>
                            </div>

                            <div className="flex-1 min-h-0 w-full">
                                {chronological.length > 0 ? (
                                    <Line data={improvementChartData} options={improvementChartOptions} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                        No drills recorded yet in this season.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: DRILL HISTORY */}
            {view === 'history' && (
                <div className="flex-1 min-h-0 game-card-user rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                            Your Completed Drills
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                            {filteredMatches.length} Total
                        </span>
                    </div>

                    <div className="game-scroll flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Subject & Subtopic</th>
                                    <th className="py-3 px-4">Format</th>
                                    <th className="py-3 px-4 text-center">Score</th>
                                    <th className="py-3 px-4 text-center">Stars</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMatches.map((match) => {
                                    const passed = match.score >= PASS_TARGET;
                                    const delta = match.starDelta ?? match.starsEarned;

                                    return (
                                        <tr
                                            key={match.id}
                                            onClick={() => setSelectedMatch(match)}
                                            className="hover:bg-blue-50/40 transition cursor-pointer"
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                                                {match.date}
                                                <div className="text-[10px] font-mono text-slate-400">
                                                    {match.timeSpent}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    <span>{match.subtopic}</span>
                                                    {!passed && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                                            Weak
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500">{match.topic}</div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                                    {match.format}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`font-black font-mono text-sm ${passed ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}
                                                >
                                                    {match.score}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1">
                                                    <div className="inline-flex items-center gap-0.5">
                                                        {[1, 2, 3].map((s) => (
                                                            <Star
                                                                key={s}
                                                                className={`w-3.5 h-3.5 ${s <= match.starsEarned
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-slate-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {delta !== match.starsEarned && (
                                                        <span
                                                            className={`text-[10px] font-mono font-black ${delta < 0 ? 'text-rose-500' : 'text-amber-500'
                                                                }`}
                                                        >
                                                            ({delta > 0 ? `+${delta}` : delta})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onReplayDrillFile) onReplayDrillFile(match);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition"
                                                    >
                                                        <Play className="w-3 h-3 fill-current" /> Redo
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Inspect"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMatch(match);
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onDeleteDrillFile) onDeleteDrillFile(match.id);
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW 3: PAST SEASONS ARCHIVE */}
            {view === 'seasons' && (
                <div className="flex-1 min-h-0 flex flex-col">
                    {archivedSeasons.length === 0 ? (
                        <div className="flex-1 game-card-sys rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                            <FolderArchive className="w-10 h-10 text-slate-400" />
                            <div className="text-sm font-bold text-slate-900">No Archived Seasons Yet</div>
                            <p className="text-xs text-slate-500 max-w-sm">
                                When you start a new season from the Dashboard, your completed season (with all
                                subject folders, drills, and final rank) will be stored here.
                            </p>
                        </div>
                    ) : (
                        <div className="game-scroll flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start pr-1">
                            {archivedSeasons.map((season) => (
                                <div
                                    key={season.id}
                                    onClick={() => setSelectedArchive(season)}
                                    className="group game-card-user rounded-2xl p-4 cursor-pointer flex flex-col justify-between gap-3 transition"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <RankCrest tierName={season.finalTier} size="sm" />
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-slate-900 group-hover:text-[#D8B878] transition truncate">
                                                    {season.name}
                                                </h3>
                                                <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatSeasonDuration(season)}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                                            {season.finalTier} ({season.finalStars} ★)
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-slate-400">
                                        {season.createdAt} — {season.endedAt} • {season.registeredSubjects.length}{' '}
                                        Folders • {season.matchHistory.length} Drills
                                    </div>

                                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#D8B878]">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" /> View Archive
                                        </span>
                                        <button
                                            type="button"
                                            title="Delete Archived Season"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (
                                                    window.confirm(`Permanently delete archived season "${season.name}"?`)
                                                ) {
                                                    onDeleteArchivedSeason(season.id);
                                                }
                                            }}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}