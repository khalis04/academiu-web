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
    ChevronRight,
    Award,
    ArrowUpRight,
    ArrowLeft,
    Info,
    HelpCircle
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

// ERD Table 2.2: ExamResult
const INITIAL_EXAM_RESULTS = [
    {
        examID: 'EXM-001',
        userID: 'USR-B032410622',
        subjectName: 'Mathematics',
        score: 55,
        maxScore: 100,
        source: 'previous',
        examDate: '2026-08-14'
    },
    {
        examID: 'EXM-002',
        userID: 'USR-B032410622',
        subjectName: 'Mathematics',
        score: 72,
        maxScore: 100,
        source: 'system',
        examDate: '2026-10-24'
    }
];

// ERD Session joined with WeaknessRecord & PracticeAttempt
const INITIAL_SESSIONS = [
    {
        sessionID: 'SESS-1001',
        userID: 'USR-B032410622',
        sessionAt: '18 Oct 2026',
        purpose: 'practice',
        subjectName: 'Data Comm & Networking',
        topic: 'Subnet Masking & IP Arithmetic',
        weaknessType: 'calculation',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 5,
        timeSpent: '14 mins',
        aiFeedback: 'You took longer on calculation formulas. Review binary to decimal conversions to speed up.'
    },
    {
        sessionID: 'SESS-1002',
        userID: 'USR-B032410622',
        sessionAt: '16 Oct 2026',
        purpose: 'validation',
        subjectName: 'Database Systems',
        topic: 'B-Tree Indexing and 3NF Normalization',
        weaknessType: 'problem-solving',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 8,
        timeSpent: '11 mins',
        aiFeedback: 'Great job! You solved normalization anomalies with no major errors.'
    },
    {
        sessionID: 'SESS-1003',
        userID: 'USR-B032410622',
        sessionAt: '12 Oct 2026',
        purpose: 'practice',
        subjectName: 'Workshop 2',
        topic: 'Software Requirements & SRS Ambiguity',
        weaknessType: 'language',
        validated: false,
        totalQuestions: 10,
        correctAttempts: 9,
        timeSpent: '8 mins',
        aiFeedback: 'Strong reading comprehension. You easily spotted unclear requirement statements.'
    },
    {
        sessionID: 'SESS-1004',
        userID: 'USR-B032410622',
        sessionAt: '09 Oct 2026',
        purpose: 'validation',
        subjectName: 'Data Comm & Networking',
        topic: 'OSI Reference Model Architecture',
        weaknessType: 'memorisation',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 8,
        timeSpent: '7 mins',
        aiFeedback: 'Accurate memory recall of protocol layers and headers.'
    },
    {
        sessionID: 'SESS-1005',
        userID: 'USR-B032410622',
        sessionAt: '04 Oct 2026',
        purpose: 'practice',
        subjectName: 'Data Structures',
        topic: 'Recurrence Relations & Master Method',
        weaknessType: 'calculation',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 4,
        timeSpent: '16 mins',
        aiFeedback: 'Calculation mistakes occurred in log base calculations. Needs one more drill.'
    },
];

export default function StudentPerformanceReport({ onNavigate, onNavigateToDrill }) {
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionList] = useState(INITIAL_SESSIONS);
    const [examResults] = useState(INITIAL_EXAM_RESULTS);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const previousExam = examResults.find(e => e.source === 'previous');
    const systemExam = examResults.find(e => e.source === 'system');
    const examImprovement = systemExam && previousExam ? systemExam.score - previousExam.score : 0;

    const filteredSessions = useMemo(() => {
        return sessionList.filter((session) => {
            const matchesSubject = selectedSubject === 'All' || session.subjectName.toLowerCase().includes(selectedSubject.toLowerCase());
            const matchesType = selectedType === 'All' || session.weaknessType.toLowerCase() === selectedType.toLowerCase();
            const matchesSearch =
                session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.weaknessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.sessionID.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSubject && matchesType && matchesSearch;
        });
    }, [sessionList, selectedSubject, selectedType, searchQuery]);

    const weaknessDimensions = [
        {
            type: 'calculation',
            label: 'Calculation',
            score: 48,
            status: 'Needs Practice',
            desc: 'Math, formulas, and numeric logic',
            activeRing: 'ring-2 ring-rose-500 bg-rose-50/70',
            badgeColor: 'bg-rose-100 text-rose-700',
            barColor: 'bg-rose-500'
        },
        {
            type: 'language',
            label: 'Language',
            score: 90,
            status: 'Mastered',
            desc: 'Reading questions and vocabulary',
            activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/70',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            barColor: 'bg-emerald-500'
        },
        {
            type: 'problem-solving',
            label: 'Problem-Solving',
            score: 80,
            status: 'Good Shape',
            desc: 'Applying concepts step-by-step',
            activeRing: 'ring-2 ring-blue-500 bg-blue-50/70',
            badgeColor: 'bg-blue-100 text-blue-700',
            barColor: 'bg-blue-500'
        },
        {
            type: 'memorisation',
            label: 'Memorisation',
            score: 85,
            status: 'Good Shape',
            desc: 'Remembering facts and definitions',
            activeRing: 'ring-2 ring-indigo-500 bg-indigo-50/70',
            badgeColor: 'bg-indigo-100 text-indigo-700',
            barColor: 'bg-indigo-500'
        },
    ];

    const radarData = {
        labels: ['Calculation', 'Language', 'Problem-Solving', 'Memorisation'],
        datasets: [
            {
                label: 'Your Current Score (%)',
                data: [48, 90, 80, 85],
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
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
                label: 'Quiz Score (%)',
                data: [40, 80, 90, 80, 50],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Passing Line (60%)',
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

    // -------------------------------------------------------------
    // FULL-PAGE IN-MODULE DETAIL VIEW (CLICKING A ROW)
    // -------------------------------------------------------------
    if (selectedRecord) {
        const accuracyPercent = Math.round((selectedRecord.correctAttempts / selectedRecord.totalQuestions) * 100);

        return (
            <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-6">
                {/* Top return bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <button
                        onClick={() => setSelectedRecord(null)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-blue-300"
                    >
                        <ArrowLeft className="w-4 h-4 text-blue-600" />
                        Back to Report Overview
                    </button>
                    <span className="font-mono text-xs text-slate-400">
                        ID: {selectedRecord.sessionID}
                    </span>
                </div>

                {/* Detailed Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            Practice Session Details
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                            {selectedRecord.topic}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Subject: <strong className="text-slate-700">{selectedRecord.subjectName}</strong>
                        </p>
                    </div>

                    {/* 3 Simple Stat Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                            <span className="text-[11px] uppercase font-bold text-slate-400">Skill Category</span>
                            <div className="text-xl font-bold text-slate-800 capitalize mt-1">
                                {selectedRecord.weaknessType}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {selectedRecord.validated ? 'Confirmed by test' : 'Not confirmed'}
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                            <span className="text-[11px] uppercase font-bold text-blue-500">Your Accuracy</span>
                            <div className="text-2xl font-black text-blue-600 mt-1">{accuracyPercent}%</div>
                            <p className="text-xs text-blue-500 mt-0.5 font-medium">
                                {selectedRecord.correctAttempts} of {selectedRecord.totalQuestions} questions correct
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                            <span className="text-[11px] uppercase font-bold text-slate-400">Time Taken</span>
                            <div className="text-xl font-bold text-slate-800 mt-1">{selectedRecord.timeSpent}</div>
                            <p className="text-xs text-slate-500 mt-0.5">Practiced on {selectedRecord.sessionAt}</p>
                        </div>
                    </div>

                    {/* AI Advice Box */}
                    <div className="text-slate-700 bg-blue-50/50 border border-blue-200/70 p-5 rounded-xl text-xs sm:text-sm leading-relaxed">
                        <strong className="text-blue-900 block mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            AI Advice for Next Time:
                        </strong>
                        {selectedRecord.aiFeedback}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setSelectedRecord(null)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                const type = selectedRecord.weaknessType;
                                setSelectedRecord(null);
                                if (onNavigateToDrill) onNavigateToDrill(type);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Practice {selectedRecord.weaknessType} Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // MAIN DASHBOARD (CLEAN, CLEAR, AND POLISHED)
    // -------------------------------------------------------------
    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-6">

            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-1.5 text-slate-400">
                        <button
                            type="button"
                            onClick={() => onNavigate ? onNavigate('dashboard') : null}
                            className="hover:text-blue-600 transition"
                        >
                            Home
                        </button>
                        <span>/</span>
                        <span className="font-semibold text-blue-600">Performance Report</span>
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Performance Report
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        See where you are doing well and what areas need a quick review.
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold transition"
                >
                    <Download className="w-4 h-4 text-slate-400" />
                    Save PDF
                </button>
            </div>

            {/* 2. Before vs After Banner (Clear Proof of Progress) */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg shadow-blue-500/10">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-blue-200 backdrop-blur-sm shrink-0">
                        <Award className="w-7 h-7 text-yellow-300" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-blue-100">
                            Your Progress So Far
                        </span>
                        <h3 className="font-black text-xl md:text-2xl mt-1 tracking-tight">
                            +{examImprovement} Points Improvement
                        </h3>
                        <p className="text-xs text-blue-100/90 mt-0.5 max-w-xl">
                            You scored <strong>{previousExam?.score}%</strong> before using the system. After practicing, your score reached <strong>{systemExam?.score}%</strong> in {previousExam?.subjectName}.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-xl border border-white/10 self-start md:self-auto backdrop-blur-sm">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-blue-200">Latest Score</div>
                        <div className="text-2xl font-black">{systemExam?.score}%</div>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-emerald-300" />
                </div>
            </div>

            {/* 3. Priority Recommendation Banner */}
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded">
                                Needs Attention
                            </span>
                            <span className="text-xs font-bold text-rose-700">Calculation is your lowest skill</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base mt-1">
                            Your current calculation accuracy is 48%
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Take a short 5-minute drill to turn this weakness into a strength.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigateToDrill ? onNavigateToDrill('calculation') : setSelectedType('calculation')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 transition whitespace-nowrap"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Start Quick Practice Drill
                </button>
            </div>

            {/* 4. Quick Overview Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Average Practice Score</span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">68.0%</div>
                    <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Above the 60% passing mark
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Completed Sessions</span>
                        <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{sessionList.length} Rounds</div>
                    <p className="text-[11px] text-slate-400 mt-2">Short drills and quizzes finished</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Subjects Covered</span>
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">3 Subjects</div>
                    <p className="text-[11px] text-slate-400 mt-2">Active university course modules</p>
                </div>
            </div>

            {/* 5. Four Skill Category Cards (Interactive Filter) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            Skill Breakdown
                        </h2>
                        <p className="text-xs text-slate-500">
                            Click any card below to filter your practice history for that specific skill.
                        </p>
                    </div>

                    {selectedType !== 'All' && (
                        <button
                            onClick={() => setSelectedType('All')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Showing: {selectedType} (Click to Reset)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weaknessDimensions.map((dim) => {
                        const isSelected = selectedType.toLowerCase() === dim.type;
                        return (
                            <div
                                key={dim.type}
                                onClick={() => setSelectedType(isSelected ? 'All' : dim.type)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                                    ? dim.activeRing
                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-800">{dim.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dim.badgeColor}`}>
                                        {dim.score}%
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-400 mb-3">{dim.desc}</p>

                                {/* Visual Progress Bar */}
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full ${dim.barColor} transition-all duration-500`}
                                        style={{ width: `${dim.score}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                                    <span>{dim.status}</span>
                                    <span className="text-blue-600 font-bold flex items-center gap-0.5">
                                        {isSelected ? 'Selected' : 'Filter'} <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 6. Simple Visual Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Radar: Balance */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Skill Balance</h3>
                        <p className="text-xs text-slate-500 mb-3">
                            A wider shape means a more well-rounded student.
                        </p>
                    </div>
                    <div className="h-60 w-full flex items-center justify-center">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                        💡 <strong>Quick Take:</strong> Language and Memorisation are strong (85%+). Spend more time practicing calculation problems.
                    </div>
                </div>

                {/* Line: Progress over time */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Score History</h3>
                        <p className="text-xs text-slate-500 mb-3">
                            Your practice quiz results compared against the 60% passing mark.
                        </p>
                    </div>
                    <div className="h-60 w-full">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                        <span>Lowest Score: <strong>40%</strong></span>
                        <span>Highest Score: <strong>90%</strong></span>
                    </div>
                </div>
            </div>

            {/* 7. History Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">Practice History Log</h2>
                            {selectedType !== 'All' && (
                                <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                                    Filtered: {selectedType}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Click any row to see what questions you got right and AI recommendations.
                        </p>
                    </div>

                    {/* Search & Subject Dropdown Filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search topic or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="All">All Subjects</option>
                                <option value="Data Comm">Data Comm & Networking</option>
                                <option value="Database">Database Systems</option>
                                <option value="Workshop 2">Workshop 2</option>
                                <option value="Data Structures">Data Structures</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Rows */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Subject & Topic</th>
                                <th className="py-3 px-4">Skill Tested</th>
                                <th className="py-3 px-4 text-center">Score</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSessions.length > 0 ? (
                                filteredSessions.map((session) => {
                                    const accuracyPercent = Math.round((session.correctAttempts / session.totalQuestions) * 100);
                                    return (
                                        <tr
                                            key={session.sessionID}
                                            onClick={() => setSelectedRecord(session)}
                                            className="hover:bg-blue-50/40 transition cursor-pointer group"
                                            title="Click to view details"
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                                                {session.sessionAt}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                                                    {session.topic}
                                                </div>
                                                <div className="text-[11px] text-slate-400">{session.subjectName}</div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                                    {session.weaknessType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`font-black ${accuracyPercent < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {accuracyPercent}%
                                                </span>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {session.correctAttempts}/{session.totalQuestions} correct
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <span className="text-blue-600 font-bold text-xs inline-flex items-center gap-1 group-hover:underline">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Details
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-400">
                                        No sessions match "{selectedType}".{' '}
                                        <button
                                            onClick={() => setSelectedType('All')}
                                            className="text-blue-600 underline font-bold ml-1"
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
        </div>
    );
}