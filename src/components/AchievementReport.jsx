import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Radar, Line } from 'react-chartjs-2';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Download,
    Trophy,
    Target,
    BookOpen,
    Sparkles,
    Play,
    Eye,
    Lock,
    CheckCircle2,
    Info,
    Award,
    Flame,
    Star,
    ChevronRight,
    RotateCcw,
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA                                                        */
/*  "before" = previous exam result recorded at student registration.  */
/*  "sessions" = practice scores after joining ACADEMIU (these match   */
/*  the Performance Report history, so both pages tell the same story).*/
/*  Replace with API / database data later.                            */
/* ------------------------------------------------------------------ */
const PASS_MARK = 60;

const SUBJECTS = [
    {
        code: 'BITS1313',
        name: 'Data Comm & Networking',
        before: 58,
        sessions: [
            { date: '2026-10-09', topic: 'OSI Reference Model Architecture', score: 85 },
            { date: '2026-10-18', topic: 'Subnet Masking & IP Arithmetic', score: 55 },
        ],
        weakDimension: 'Calculation',
        aiNote: 'Strong recall of protocol layers, but subnet calculations still lose marks. Practise bitwise IP conversions.',
    },
    {
        code: 'BITE2223',
        name: 'Database Systems',
        before: 62,
        sessions: [{ date: '2026-10-16', topic: 'B-Tree Indexing and 3NF Normalization', score: 80 }],
        weakDimension: 'Problem-Solving',
        aiNote: 'Sound relational logic. Normalization anomalies were solved without errors.',
    },
    {
        code: 'BITU3923',
        name: 'Workshop 2',
        before: 64,
        sessions: [{ date: '2026-10-12', topic: 'Software Requirements & SRS Ambiguity', score: 90 }],
        weakDimension: 'Language Comprehension',
        aiNote: 'Excellent requirement identification and ambiguity resolution. Biggest improvement overall.',
    },
    {
        code: 'BITC2113',
        name: 'Data Structures',
        before: 52,
        sessions: [{ date: '2026-10-04', topic: 'Recurrence Relations & Master Method', score: 40 }],
        weakDimension: 'Calculation',
        aiNote: 'Logarithm base steps in Master Theorem equations are the main gap. Needs a focused calculation drill.',
    },
];

// "before" = initial AI diagnostic at registration, "after" = current practice average
const DIMENSIONS = [
    { name: 'Calculation', before: 35, after: 48 },
    { name: 'Language Comprehension', before: 62, after: 90 },
    { name: 'Problem-Solving', before: 55, after: 80 },
    { name: 'Memorisation', before: 60, after: 85 },
];

// Past-year paper trends (2022–2025) vs. how the student is doing on each topic
const TOPIC_TRENDS = [
    { topic: 'Recurrence Relations & Master Method', subject: 'BITC2113', years: 4, score: 40 },
    { topic: 'Subnet Masking & IP Arithmetic', subject: 'BITS1313', years: 4, score: 55 },
    { topic: 'B-Tree Indexing & 3NF Normalization', subject: 'BITE2223', years: 4, score: 80 },
    { topic: 'OSI Reference Model', subject: 'BITS1313', years: 3, score: 85 },
    { topic: 'Software Requirements & SRS', subject: 'BITU3923', years: 2, score: 90 },
];
const TOTAL_PAPER_YEARS = 4;

/* ------------------------------ helpers ----------------------------- */
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// Indicative grade only (not the official university grading scheme)
const toGrade = (s) =>
    s >= 80 ? 'A' : s >= 75 ? 'A-' : s >= 70 ? 'B+' : s >= 65 ? 'B' : s >= 60 ? 'B-' : s >= 55 ? 'C+' : s >= 50 ? 'C' : s >= 40 ? 'D' : 'F';

const fmtDelta = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`;

const deltaStyle = (d) =>
    d > 0
        ? { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: TrendingUp, label: 'Improved' }
        : d < 0
            ? { text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200', Icon: TrendingDown, label: 'Declined' }
            : { text: 'text-slate-500', badge: 'bg-slate-100 text-slate-600 border-slate-200', Icon: Minus, label: 'No change' };

const shortDate = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const readiness = (score) =>
    score >= 75
        ? { label: 'Exam ready', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' }
        : score >= PASS_MARK
            ? { label: 'Almost there', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' }
            : { label: 'Revise now', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' };

/* --------------------------- derived data --------------------------- */
const SUBJECT_ROWS = SUBJECTS.map((s) => {
    const after = Math.round(mean(s.sessions.map((x) => x.score)));
    return { ...s, after, change: after - s.before, gradeBefore: toGrade(s.before), gradeAfter: toGrade(after) };
});

const ALL_SESSIONS = SUBJECTS.flatMap((s) => s.sessions.map((x) => ({ ...x, code: s.code })))
    .sort((a, b) => a.date.localeCompare(b.date));

const DIM_ROWS = DIMENSIONS.map((d) => ({ ...d, change: d.after - d.before }));

export default function AchievementReport({ onNavigate, onNavigateToDrill }) {
    const [subjectFilter, setSubjectFilter] = useState('All'); // All | Improved | Declined
    const [selectedSubject, setSelectedSubject] = useState(null);

    /* ---------- headline numbers ---------- */
    const stats = useMemo(() => {
        const avgBefore = mean(SUBJECT_ROWS.map((s) => s.before));
        const avgAfter = mean(SUBJECT_ROWS.map((s) => s.after));
        const change = avgAfter - avgBefore;
        const improved = SUBJECT_ROWS.filter((s) => s.change > 0);
        const declined = SUBJECT_ROWS.filter((s) => s.change < 0);
        const bestSubject = [...SUBJECT_ROWS].sort((a, b) => b.change - a.change)[0];
        const worstSubject = [...SUBJECT_ROWS].sort((a, b) => a.change - b.change)[0];
        const bestSession = Math.max(...ALL_SESSIONS.map((s) => s.score));
        const dimsPassingBefore = DIM_ROWS.filter((d) => d.before >= PASS_MARK).length;
        const dimsPassingAfter = DIM_ROWS.filter((d) => d.after >= PASS_MARK).length;
        const weakestDim = [...DIM_ROWS].sort((a, b) => a.after - b.after)[0];
        const bestDim = [...DIM_ROWS].sort((a, b) => b.change - a.change)[0];
        return {
            avgBefore, avgAfter, change,
            relative: (change / avgBefore) * 100,
            improved, declined, bestSubject, worstSubject, bestSession,
            dimsPassingBefore, dimsPassingAfter, weakestDim, bestDim,
        };
    }, []);

    const filteredSubjects = useMemo(() => {
        if (subjectFilter === 'Improved') return SUBJECT_ROWS.filter((s) => s.change > 0);
        if (subjectFilter === 'Declined') return SUBJECT_ROWS.filter((s) => s.change < 0);
        return SUBJECT_ROWS;
    }, [subjectFilter]);

    /* ---------- derived achievements (unlock automatically from data) ---------- */
    const achievements = [
        { id: 'first', title: 'First Steps', desc: 'Complete your first practice drill', icon: Play, progress: Math.min(ALL_SESSIONS.length, 1), target: 1 },
        { id: 'five', title: 'Consistent Learner', desc: 'Complete 5 practice sessions', icon: Flame, progress: ALL_SESSIONS.length, target: 5 },
        { id: 'top', title: 'Top Scorer', desc: 'Score 90% or higher in a session', icon: Star, progress: stats.bestSession >= 90 ? 1 : 0, target: 1, hint: `Best so far: ${stats.bestSession}%` },
        { id: 'rise', title: 'On the Rise', desc: 'Improve in at least 3 subjects', icon: TrendingUp, progress: stats.improved.length, target: 3 },
        { id: 'steady', title: 'Steady Progress', desc: 'No subject below its previous exam result', icon: Target, progress: SUBJECT_ROWS.length - stats.declined.length, target: SUBJECT_ROWS.length },
        { id: 'allround', title: 'All-Rounder', desc: `Reach ${PASS_MARK}% in all 4 weakness dimensions`, icon: Award, progress: stats.dimsPassingAfter, target: DIM_ROWS.length },
    ].map((a) => ({ ...a, unlocked: a.progress >= a.target }));
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    /* ---------- charts ---------- */
    const legendOpts = { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } };

    const subjectBarData = {
        labels: SUBJECT_ROWS.map((s) => s.code),
        datasets: [
            { label: 'Before (previous exam)', data: SUBJECT_ROWS.map((s) => s.before), backgroundColor: '#CBD5E1', borderRadius: 4 },
            { label: 'After (with ACADEMIU)', data: SUBJECT_ROWS.map((s) => s.after), backgroundColor: '#2563EB', borderRadius: 4 },
            {
                type: 'line',
                label: `Pass mark (${PASS_MARK}%)`,
                data: SUBJECT_ROWS.map(() => PASS_MARK),
                borderColor: '#F59E0B',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    };
    const subjectBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
        plugins: { legend: legendOpts },
    };

    const radarData = {
        labels: DIM_ROWS.map((d) => d.name),
        datasets: [
            {
                label: 'Before (initial diagnostic)',
                data: DIM_ROWS.map((d) => d.before),
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                borderColor: '#94A3B8',
                borderWidth: 2,
                pointBackgroundColor: '#94A3B8',
            },
            {
                label: 'After (current)',
                data: DIM_ROWS.map((d) => d.after),
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563EB',
                borderWidth: 2,
                pointBackgroundColor: '#2563EB',
            },
        ],
    };
    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { stepSize: 20 } } },
        plugins: { legend: legendOpts },
    };

    const runningAvg = ALL_SESSIONS.map((_, i) => Math.round(mean(ALL_SESSIONS.slice(0, i + 1).map((s) => s.score)) * 10) / 10);
    const trendData = {
        labels: ALL_SESSIONS.map((s) => shortDate(s.date)),
        datasets: [
            {
                label: 'Running average (%)',
                data: runningAvg,
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Single session score (%)',
                data: ALL_SESSIONS.map((s) => s.score),
                borderColor: '#A5B4FC',
                backgroundColor: '#A5B4FC',
                borderWidth: 1.5,
                tension: 0.2,
                pointRadius: 3,
            },
            {
                label: `Previous exam average (${stats.avgBefore.toFixed(0)}%)`,
                data: ALL_SESSIONS.map(() => stats.avgBefore),
                borderColor: '#94A3B8',
                borderDash: [5, 5],
                pointRadius: 0,
            },
        ],
    };
    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100 } },
        plugins: { legend: legendOpts },
    };

    const overallUp = stats.change >= 0;
    const priorityTopic = [...TOPIC_TRENDS].sort(
        (a, b) => (b.years / TOTAL_PAPER_YEARS) * (100 - b.score) - (a.years / TOTAL_PAPER_YEARS) * (100 - a.score)
    )[0];

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            {/* Header & two-step breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-1.5 text-slate-500">
                        <button
                            type="button"
                            onClick={() => (onNavigate ? onNavigate('dashboard') : null)}
                            className="font-medium text-slate-500 hover:text-blue-600 transition hover:underline"
                        >
                            Home
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Student Achievement Report
                        </span>
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Achievement Report 🏆</h1>
                    <p className="text-sm text-slate-500">
                        Compare your previous exam results with your results after using ACADEMIU.
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium transition"
                >
                    <Download className="w-4 h-4 text-slate-500" />
                    Save as PDF
                </button>
            </div>

            {/* Overall verdict banner */}
            <div
                className={`mt-6 border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm bg-gradient-to-r ${overallUp ? 'from-emerald-50 to-blue-50 border-emerald-200' : 'from-rose-50 to-amber-50 border-rose-200'
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${overallUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {overallUp ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">
                            Your overall average moved from {stats.avgBefore.toFixed(1)}% to {stats.avgAfter.toFixed(1)}% ({fmtDelta(stats.change)} points)
                        </h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                            {stats.improved.length} of {SUBJECT_ROWS.length} subjects improved.{' '}
                            {stats.declined.length > 0 &&
                                `${stats.worstSubject.code} dropped ${Math.abs(stats.worstSubject.change)} points and needs attention.`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => (onNavigateToDrill ? onNavigateToDrill(stats.weakestDim.name) : null)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow transition whitespace-nowrap"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Start {stats.weakestDim.name} Drill
                </button>
            </div>

            {/* 4 summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Before ACADEMIU</span>
                        <BookOpen className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.avgBefore.toFixed(1)}%</div>
                    <span
                        className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded border ${stats.avgBefore >= PASS_MARK
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}
                    >
                        {stats.avgBefore >= PASS_MARK ? 'Passing' : `Below ${PASS_MARK}% pass mark`}
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">After ACADEMIU</span>
                        <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.avgAfter.toFixed(1)}%</div>
                    <span
                        className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded border ${stats.avgAfter >= PASS_MARK
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}
                    >
                        {stats.avgAfter >= PASS_MARK ? `Passing (target is ${PASS_MARK}%)` : `Below ${PASS_MARK}% pass mark`}
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Overall Change</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className={`text-2xl font-bold ${deltaStyle(stats.change).text}`}>{fmtDelta(stats.change)} pts</div>
                    <p className="text-xs text-slate-500 mt-2">{fmtDelta(stats.relative)}% relative to your baseline</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Subjects Improved</span>
                        <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats.improved.length} / {SUBJECT_ROWS.length}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Weak dimensions at {PASS_MARK}%+: {stats.dimsPassingBefore} → {stats.dimsPassingAfter} of {DIM_ROWS.length}
                    </p>
                </div>
            </div>

            {/* Charts: subject before/after + dimension radar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Before vs After by Subject</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Previous exam result recorded at registration, compared with your practice average now.
                        </p>
                    </div>
                    <div className="h-64 w-full">
                        <Bar data={subjectBarData} options={subjectBarOptions} />
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        <strong>Insight:</strong> Biggest gain is {stats.bestSubject.code} ({fmtDelta(stats.bestSubject.change)} points).{' '}
                        {stats.declined.length > 0 && `${stats.worstSubject.code} is the only subject below its earlier result.`}
                    </div>
                </div>

                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Weakness Dimensions Compared</h2>
                        <p className="text-xs text-slate-500 mb-4">Initial AI diagnostic versus your current proficiency.</p>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        <strong>Insight:</strong> {stats.bestDim.name} improved most ({fmtDelta(stats.bestDim.change)}). {stats.weakestDim.name} is
                        still your lowest at {stats.weakestDim.after}%.
                    </div>
                </div>
            </div>

            {/* Dimension progress cards */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Weakness Progress by Dimension
                    </h2>
                    <p className="text-xs text-slate-500">
                        The grey bar is where you started. The coloured bar is where you are now.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {DIM_ROWS.map((d) => {
                        const st = deltaStyle(d.change);
                        const passing = d.after >= PASS_MARK;
                        return (
                            <div key={d.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-700 truncate">{d.name}</span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${st.badge}`}>
                                        <st.Icon className="w-3 h-3" />
                                        {fmtDelta(d.change)}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="w-10">Before</span>
                                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400" style={{ width: `${d.before}%` }} />
                                        </div>
                                        <span className="w-8 text-right font-semibold">{d.before}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-700">
                                        <span className="w-10">After</span>
                                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${passing ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                style={{ width: `${d.after}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-right font-bold">{d.after}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 text-[11px]">
                                    <span className={passing ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                                        {passing ? 'Above pass mark' : 'Still below pass mark'}
                                    </span>
                                    {!passing && onNavigateToDrill && (
                                        <button
                                            onClick={() => onNavigateToDrill(d.name)}
                                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                                        >
                                            Practise <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Trend line + past-year topic readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Progress Since You Joined</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Your running practice average against the exam average you started with.
                        </p>
                    </div>
                    <div className="h-64 w-full">
                        <Line data={trendData} options={trendOptions} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                        <span>
                            First session: <strong>{ALL_SESSIONS[0].score}%</strong>
                        </span>
                        <span>
                            Latest running average: <strong>{runningAvg[runningAvg.length - 1]}%</strong>
                        </span>
                    </div>
                </div>

                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h2 className="text-base font-bold text-slate-900">Past-Year Topic Readiness</h2>
                    <p className="text-xs text-slate-500 mb-4">
                        How often each topic appeared in 2022–2025 papers, and how you score on it now.
                    </p>

                    <div className="space-y-3 flex-1">
                        {TOPIC_TRENDS.map((t) => {
                            const r = readiness(t.score);
                            return (
                                <div key={t.topic}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-slate-900 truncate">{t.topic}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {t.subject} • in {t.years} of {TOTAL_PAPER_YEARS} past papers
                                            </div>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${r.badge}`}>{r.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${r.bar}`} style={{ width: `${t.score}%` }} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700 w-8 text-right">{t.score}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                        <strong>Priority:</strong> {priorityTopic.topic} appeared in {priorityTopic.years} of {TOTAL_PAPER_YEARS} past papers and you
                        scored {priorityTopic.score}%. Revise it first.
                    </div>
                </div>
            </div>

            {/* Subject comparison table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">Subject Comparison</h2>
                            {subjectFilter !== 'All' && (
                                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Showing {subjectFilter}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">Click any row to see the full breakdown for that subject.</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {['All', 'Improved', 'Declined'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setSubjectFilter(f)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${subjectFilter === f
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                <th className="py-3 px-4">Subject</th>
                                <th className="py-3 px-4 text-center">Before</th>
                                <th className="py-3 px-4 text-center">After</th>
                                <th className="py-3 px-4 text-center">Change</th>
                                <th className="py-3 px-4 text-center">Grade</th>
                                <th className="py-3 px-4 text-center">Sessions</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSubjects.length > 0 ? (
                                filteredSubjects.map((s) => {
                                    const st = deltaStyle(s.change);
                                    return (
                                        <tr
                                            key={s.code}
                                            onClick={() => setSelectedSubject(s)}
                                            className="hover:bg-blue-50/50 transition cursor-pointer group"
                                            title="Click to view subject breakdown"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{s.name}</div>
                                                <div className="text-[11px] text-slate-500">{s.code}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600 font-medium">{s.before}%</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-900">{s.after}%</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${st.text}`}>
                                                    <st.Icon className="w-3.5 h-3.5" />
                                                    {fmtDelta(s.change)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className="text-slate-500">{s.gradeBefore}</span>
                                                <span className="mx-1 text-slate-300">→</span>
                                                <span className="font-bold text-slate-900">{s.gradeAfter}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600">{s.sessions.length}</td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSubject(s);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-blue-600 group-hover:text-blue-800 font-semibold"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-400">
                                        No subjects match "{subjectFilter}".{' '}
                                        <button onClick={() => setSubjectFilter('All')} className="text-blue-600 underline font-semibold ml-1">
                                            Show all
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400">
                    Grades are indicative only and may differ from the official university grading scheme.
                </div>
            </div>

            {/* Achievements */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Milestones Unlocked
                        </h2>
                        <p className="text-xs text-slate-500">Milestones unlock automatically as your results improve.</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start">
                        {unlockedCount} of {achievements.length} unlocked
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {achievements.map((a) => {
                        const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
                        return (
                            <div
                                key={a.id}
                                className={`p-4 rounded-xl border flex items-start gap-3 ${a.unlocked ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/60'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 ${a.unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {a.unlocked ? <a.icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs font-bold text-slate-900">{a.title}</div>
                                        {a.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{a.desc}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${a.unlocked ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-600">
                                            {a.unlocked ? 'Done' : a.hint || `${a.progress}/${a.target}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI summary & next steps */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Progress Summary & Next Steps
                </h2>
                <div className="mt-3 text-slate-700 bg-blue-50 border border-blue-200 p-4 rounded-lg text-xs leading-relaxed">
                    <strong>Gemini AI Feedback:</strong> Since joining ACADEMIU your average rose from {stats.avgBefore.toFixed(1)}% to{' '}
                    {stats.avgAfter.toFixed(1)}%. {stats.bestSubject.code} shows the strongest gain ({fmtDelta(stats.bestSubject.change)} points).{' '}
                    {stats.declined.length > 0 &&
                        `${stats.worstSubject.code} fell ${Math.abs(stats.worstSubject.change)} points. ${stats.worstSubject.aiNote} `}
                    Your {stats.weakestDim.name.toLowerCase()} score ({stats.weakestDim.after}%) is the main gap holding back an all-round pass.
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => (onNavigateToDrill ? onNavigateToDrill(stats.weakestDim.name) : null)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start {stats.weakestDim.name} Drill
                    </button>
                    <button
                        onClick={() => (onNavigate ? onNavigate('performance') : null)}
                        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        View Full Performance Report
                    </button>
                </div>

                <p className="mt-4 flex items-start gap-1.5 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
                    Weakness types are a study guide, not a formal diagnosis. "Before" comes from your registered exam results; "After" is your
                    practice average, so treat the comparison as a progress indicator rather than a predicted exam mark.
                </p>
            </div>

            {/* Subject breakdown modal */}
            {selectedSubject && (
                <div
                    onClick={() => setSelectedSubject(null)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
                    >
                        <div className="flex items-center justify-between pb-3 border-b">
                            <h3 className="font-bold text-slate-900 text-base">Subject Achievement Breakdown</h3>
                            <button
                                onClick={() => setSelectedSubject(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-4 space-y-3 text-xs">
                            <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Subject</span>
                                <p className="font-semibold text-slate-800 text-sm">
                                    {selectedSubject.code} - {selectedSubject.name}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-[10px] uppercase font-semibold text-slate-400">Before</div>
                                    <div className="text-lg font-bold text-slate-700">{selectedSubject.before}%</div>
                                    <div className="text-[11px] text-slate-500">Grade {selectedSubject.gradeBefore}</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <div className="text-[10px] uppercase font-semibold text-blue-400">After</div>
                                    <div className="text-lg font-bold text-blue-700">{selectedSubject.after}%</div>
                                    <div className="text-[11px] text-slate-500">Grade {selectedSubject.gradeAfter}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-[10px] uppercase font-semibold text-slate-400">Change</div>
                                    <div className={`text-lg font-bold ${deltaStyle(selectedSubject.change).text}`}>
                                        {fmtDelta(selectedSubject.change)}
                                    </div>
                                    <div className="text-[11px] text-slate-500">{deltaStyle(selectedSubject.change).label}</div>
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Practice sessions</span>
                                <ul className="mt-1 space-y-1">
                                    {selectedSubject.sessions.map((x) => (
                                        <li key={x.date + x.topic} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                            <span className="text-slate-700 truncate pr-2">
                                                {shortDate(x.date)} • {x.topic}
                                            </span>
                                            <strong className="text-slate-900">{x.score}%</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-slate-700 bg-blue-50 border border-blue-200 p-3 rounded-lg leading-relaxed">
                                <strong>Gemini AI Feedback:</strong> {selectedSubject.aiNote}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    const dim = selectedSubject.weakDimension;
                                    setSelectedSubject(null);
                                    if (onNavigateToDrill) onNavigateToDrill(dim);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                            >
                                Practise This Subject
                            </button>
                            <button
                                onClick={() => setSelectedSubject(null)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
