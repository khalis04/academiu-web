import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';
import {
    TrendingUp,
    AlertTriangle,
    Clock,
    BookOpen,
    Download,
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    Play,
    RotateCcw,
    Sparkles,
    ChevronRight
} from 'lucide-react';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
);

const INITIAL_HISTORY = [
    {
        id: 'PRAC-0941',
        date: '2026-10-18',
        subject: 'BITS1313 - Data Comm & Networking',
        topic: 'Subnet Masking & IP Arithmetic',
        dimension: 'Calculation',
        score: 55,
        totalQuestions: 10,
        correctCount: 5,
        timeSpent: '14 mins',
        status: 'Needs Review',
        aiFeedback: 'Response timing indicates calculation hesitation on formula steps. Practice IP address bitwise conversions.'
    },
    {
        id: 'PRAC-0938',
        date: '2026-10-16',
        subject: 'BITE2223 - Database Systems',
        topic: 'B-Tree Indexing and 3NF Normalization',
        dimension: 'Problem-Solving',
        score: 80,
        totalQuestions: 10,
        correctCount: 8,
        timeSpent: '11 mins',
        status: 'Proficient',
        aiFeedback: 'Sound relational logic. Solved Boyce-Codd anomalies without errors.'
    },
    {
        id: 'PRAC-0932',
        date: '2026-10-12',
        subject: 'BITU3923 - Workshop 2',
        topic: 'Software Requirements & SRS Ambiguity',
        dimension: 'Language Comprehension',
        score: 90,
        totalQuestions: 10,
        correctCount: 9,
        timeSpent: '8 mins',
        status: 'Mastered',
        aiFeedback: 'Excellent requirement identification and ambiguity resolution.'
    },
    {
        id: 'PRAC-0925',
        date: '2026-10-09',
        subject: 'BITS1313 - Data Comm & Networking',
        topic: 'OSI Reference Model Architecture',
        dimension: 'Memorisation',
        score: 85,
        totalQuestions: 10,
        correctCount: 8,
        timeSpent: '7 mins',
        status: 'Proficient',
        aiFeedback: 'Accurate recall of protocol encapsulation layers.'
    },
    {
        id: 'PRAC-0919',
        date: '2026-10-04',
        subject: 'BITC2113 - Data Structures',
        topic: 'Recurrence Relations & Master Method',
        dimension: 'Calculation',
        score: 40,
        totalQuestions: 10,
        correctCount: 4,
        timeSpent: '16 mins',
        status: 'Critical Alert',
        aiFeedback: 'Incorrect calculation of logarithm base steps in Master Theorem recurrence equations.'
    },
];

export default function StudentPerformanceReport({ onNavigate, onNavigateToDrill }) {
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedDimension, setSelectedDimension] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [historyList] = useState(INITIAL_HISTORY);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Dynamic filter for search bar, subject, and clicked dimension
    const filteredHistory = useMemo(() => {
        return historyList.filter((item) => {
            const matchesSubject = selectedSubject === 'All' || item.subject.includes(selectedSubject);
            const matchesDimension = selectedDimension === 'All' || item.dimension === selectedDimension;
            const matchesSearch =
                item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.dimension.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subject.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesDimension && matchesSearch;
        });
    }, [historyList, selectedSubject, selectedDimension, searchQuery]);

    const dimensionCards = [
        {
            name: 'Calculation',
            score: 48,
            status: 'Needs Revision',
            activeRing: 'ring-2 ring-rose-500 bg-rose-50/50',
            barColor: 'bg-rose-500'
        },
        {
            name: 'Language Comprehension',
            score: 90,
            status: 'Mastered',
            activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50',
            barColor: 'bg-emerald-500'
        },
        {
            name: 'Problem-Solving',
            score: 80,
            status: 'Proficient',
            activeRing: 'ring-2 ring-blue-500 bg-blue-50/50',
            barColor: 'bg-blue-500'
        },
        {
            name: 'Memorisation',
            score: 85,
            status: 'Proficient',
            activeRing: 'ring-2 ring-indigo-500 bg-indigo-50/50',
            barColor: 'bg-indigo-500'
        },
    ];

    const radarData = {
        labels: ['Calculation', 'Language Comprehension', 'Problem-Solving', 'Memorisation'],
        datasets: [
            {
                label: 'Proficiency Score (%)',
                data: [48, 90, 80, 85],
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
        scales: {
            r: {
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { stepSize: 20 },
            },
        },
    };

    const lineChartData = {
        labels: ['Drill 1', 'Drill 2', 'Drill 3', 'Drill 4', 'Drill 5'],
        datasets: [
            {
                label: 'Practice Score (%)',
                data: [40, 85, 90, 80, 55],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Passing Standard (60%)',
                data: [60, 60, 60, 60, 60],
                borderColor: '#94A3B8',
                borderDash: [5, 5],
                pointRadius: 0,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { min: 0, max: 100 },
        },
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            {/* Top Header & Clickable Two-Step Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
                    {/* TWO-STEP CLICKABLE BREADCRUMB: Home / Student Performance Report */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-1.5 text-slate-500">
                        <button
                            type="button"
                            onClick={() => onNavigate ? onNavigate('dashboard') : alert('Navigating to Dashboard')}
                            className="font-medium text-slate-500 hover:text-blue-600 transition hover:underline"
                        >
                            Home
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Student Performance Report
                        </span>
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Performance Overview 📊</h1>
                    <p className="text-sm text-slate-500">
                        Review practice assessment scores, weak area diagnostics, and learning history.
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

            {/* Priority Weakness Call-To-Action Banner */}
            <div className="mt-6 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">
                            Identified Primary Weakness: Calculation & Math (48%)
                        </h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                            Formulas in Networking and Algorithm recurrences caused frequent mark deductions.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigateToDrill ? onNavigateToDrill('Calculation') : setSelectedDimension('Calculation')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow transition whitespace-nowrap"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Start 5-Min Calculation Drill
                </button>
            </div>

            {/* 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Practice Average</span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">70.0%</div>
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Passing (Target is 60%)
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Time Practiced</span>
                        <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">56 mins</div>
                    <p className="text-xs text-slate-500 mt-2">5 sessions completed</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Topics Evaluated</span>
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">5 Topics</div>
                    <p className="text-xs text-slate-500 mt-2">Across 3 active subjects</p>
                </div>
            </div>

            {/* CLICKABLE WEAKNESS DIMENSION MAPPING */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            Weakness Dimension Mapping
                        </h2>
                        <p className="text-xs text-slate-500">
                            Click any category card below to filter and view related practice questions.
                        </p>
                    </div>

                    {selectedDimension !== 'All' && (
                        <button
                            onClick={() => setSelectedDimension('All')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Showing: {selectedDimension} (Click to Reset)
                        </button>
                    )}
                </div>

                {/* 4 Clickable Dimension Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {dimensionCards.map((dim) => {
                        const isSelected = selectedDimension === dim.name;
                        return (
                            <div
                                key={dim.name}
                                onClick={() => setSelectedDimension(isSelected ? 'All' : dim.name)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isSelected
                                    ? dim.activeRing
                                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 truncate">{dim.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${dim.name === 'Calculation'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {dim.score}%
                                    </span>
                                </div>

                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full ${dim.barColor} transition-all duration-500`}
                                        style={{ width: `${dim.score}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>{dim.status}</span>
                                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                                        {isSelected ? 'Active' : 'Filter'} <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Proficiency Balance (Radar)</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Radar visualization across the 4 proposal dimensions.
                        </p>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        <strong>Insight:</strong> Language and Memorisation are above 85%. Focus revision on Calculation.
                    </div>
                </div>

                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Score Progression Line</h2>
                        <p className="text-xs text-slate-500 mb-4">Historical score trajectory across drills.</p>
                    </div>
                    <div className="h-64 w-full">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                        <span>Lowest: <strong>40% (Recurrence Relations)</strong></span>
                        <span>Highest: <strong>90% (SRS Ambiguity)</strong></span>
                    </div>
                </div>
            </div>

            {/* CLICKABLE PRACTICE HISTORY TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">Learning History Log</h2>
                            {selectedDimension !== 'All' && (
                                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Filtered by {selectedDimension}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Click any row below to open the AI analysis breakdown.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search topic or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="text-xs py-1.5 px-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="All">All Subjects</option>
                                <option value="BITS1313">BITS1313 (Networking)</option>
                                <option value="BITE2223">BITE2223 (Databases)</option>
                                <option value="BITU3923">BITU3923 (Workshop 2)</option>
                                <option value="BITC2113">BITC2113 (Data Structures)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table with Clickable Rows */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Subject & Topic</th>
                                <th className="py-3 px-4">Dimension</th>
                                <th className="py-3 px-4 text-center">Score</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedRecord(item)}
                                        className="hover:bg-blue-50/50 transition cursor-pointer group"
                                        title="Click to view full test details"
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                                            {item.date}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                                                {item.topic}
                                            </div>
                                            <div className="text-[11px] text-slate-500">{item.subject}</div>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDimension(item.dimension);
                                                }}
                                                title={`Click to filter by ${item.dimension}`}
                                                className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 border border-slate-200 transition"
                                            >
                                                {item.dimension}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-900">
                                            {item.score}%
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${item.status === 'Critical Alert'
                                                ? 'text-rose-600'
                                                : item.status === 'Needs Review'
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                                }`}>
                                                {item.status === 'Proficient' || item.status === 'Mastered' ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5" />
                                                )}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRecord(item);
                                                }}
                                                className="inline-flex items-center gap-1 text-blue-600 group-hover:text-blue-800 font-semibold"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400">
                                        No matching records found for "{selectedDimension}".{' '}
                                        <button
                                            onClick={() => setSelectedDimension('All')}
                                            className="text-blue-600 underline font-semibold ml-1"
                                        >
                                            Clear filter
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drill-Down Details Modal */}
            {selectedRecord && (
                <div
                    onClick={() => setSelectedRecord(null)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
                    >
                        <div className="flex items-center justify-between pb-3 border-b">
                            <h3 className="font-bold text-slate-900 text-base">Practice Session Breakdown</h3>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="py-4 space-y-3 text-xs">
                            <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Topic</span>
                                <p className="font-semibold text-slate-800 text-sm">{selectedRecord.topic}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Course</span>
                                    <p className="font-medium text-slate-800">{selectedRecord.subject}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Dimension</span>
                                    <p className="font-medium text-slate-800">{selectedRecord.dimension}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                <span>Final Mark: <strong>{selectedRecord.score}%</strong></span>
                                <span>Accuracy: <strong>{selectedRecord.correctCount} / {selectedRecord.totalQuestions}</strong></span>
                            </div>
                            <div className="text-slate-700 bg-blue-50 border border-blue-200 p-3 rounded-lg leading-relaxed">
                                <strong>Gemini AI Feedback:</strong> {selectedRecord.aiFeedback}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    if (onNavigateToDrill) onNavigateToDrill(selectedRecord.dimension);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                            >
                                Retake Similar Drill
                            </button>
                            <button
                                onClick={() => setSelectedRecord(null)}
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