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
    ArrowUpRight
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

// ERD Table 2.2: ExamResult (ExamID, UserID, SubjectName, Score, MaxScore, Source, ExamDate)
const INITIAL_EXAM_RESULTS = [
    {
        examID: 'EXM-001',
        userID: 'USR-B032410622',
        subjectName: 'Mathematics',
        score: 55,
        maxScore: 100,
        source: 'previous', // Baseline before system usage
        examDate: '2026-08-14'
    },
    {
        examID: 'EXM-002',
        userID: 'USR-B032410622',
        subjectName: 'Mathematics',
        score: 72,
        maxScore: 100,
        source: 'system', // Post-remediation improvement
        examDate: '2026-10-24'
    }
];

// ERD Table 2.5 (Session) joined with Table 2.3 (WeaknessRecord) & Table 2.6 (PracticeAttempt)
const INITIAL_SESSIONS = [
    {
        sessionID: 'SESS-1001',
        userID: 'USR-B032410622',
        sessionAt: '2026-10-18',
        purpose: 'practice', // ERD: 'practice' or 'validation'
        subjectName: 'Data Communication & Networking',
        topic: 'Subnet Masking & IP Arithmetic',
        weaknessType: 'calculation', // ERD: WeaknessRecord.Type ('calculation', 'language', 'problem-solving', 'memorisation')
        validated: true, // ERD: WeaknessRecord.Validated (Boolean)
        totalQuestions: 10,
        correctAttempts: 5, // Count of PracticeAttempt where IsCorrect = true
        timeSpent: '14 mins',
        aiFeedback: 'Response timing indicates calculation hesitation on formula steps. Bitwise conversion errors detected.'
    },
    {
        sessionID: 'SESS-1002',
        userID: 'USR-B032410622',
        sessionAt: '2026-10-16',
        purpose: 'validation',
        subjectName: 'Database Systems',
        topic: 'B-Tree Indexing and 3NF Normalization',
        weaknessType: 'problem-solving',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 8,
        timeSpent: '11 mins',
        aiFeedback: 'Sound relational logic. Solved Boyce-Codd anomalies without errors.'
    },
    {
        sessionID: 'SESS-1003',
        userID: 'USR-B032410622',
        sessionAt: '2026-10-12',
        purpose: 'practice',
        subjectName: 'Workshop 2',
        topic: 'Software Requirements & SRS Ambiguity',
        weaknessType: 'language',
        validated: false,
        totalQuestions: 10,
        correctAttempts: 9,
        timeSpent: '8 mins',
        aiFeedback: 'Strong natural language comprehension and ambiguity resolution across SRS specifications.'
    },
    {
        sessionID: 'SESS-1004',
        userID: 'USR-B032410622',
        sessionAt: '2026-10-09',
        purpose: 'validation',
        subjectName: 'Data Communication & Networking',
        topic: 'OSI Reference Model Architecture',
        weaknessType: 'memorisation',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 8,
        timeSpent: '7 mins',
        aiFeedback: 'Accurate recall of protocol encapsulation layers and header offsets.'
    },
    {
        sessionID: 'SESS-1005',
        userID: 'USR-B032410622',
        sessionAt: '2026-10-04',
        purpose: 'practice',
        subjectName: 'Data Structures',
        topic: 'Recurrence Relations & Master Method',
        weaknessType: 'calculation',
        validated: true,
        totalQuestions: 10,
        correctAttempts: 4,
        timeSpent: '16 mins',
        aiFeedback: 'Critical calculation errors when calculating logarithm base steps in Master Theorem equations.'
    },
];

export default function StudentPerformanceReport({ onNavigate, onNavigateToDrill }) {
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedType, setSelectedType] = useState('All'); // ERD: WeaknessRecord.Type
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionList] = useState(INITIAL_SESSIONS);
    const [examResults] = useState(INITIAL_EXAM_RESULTS);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Calculate comparative improvement from ERD ExamResult (Previous vs System)
    const previousExam = examResults.find(e => e.source === 'previous');
    const systemExam = examResults.find(e => e.source === 'system');
    const examImprovement = systemExam && previousExam ? systemExam.score - previousExam.score : 0;

    // Filter sessions dynamically based on ERD SubjectName, Weakness Type, or Search query
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

    // Weakness dimension cards mapped strictly to ERD WeaknessRecord.Type
    const weaknessDimensions = [
        {
            type: 'calculation',
            label: 'Calculation',
            score: 48,
            status: 'Needs Revision',
            activeRing: 'ring-2 ring-rose-500 bg-rose-50/50',
            barColor: 'bg-rose-500'
        },
        {
            type: 'language',
            label: 'Language',
            score: 90,
            status: 'Mastered',
            activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50',
            barColor: 'bg-emerald-500'
        },
        {
            type: 'problem-solving',
            label: 'Problem-Solving',
            score: 80,
            status: 'Proficient',
            activeRing: 'ring-2 ring-blue-500 bg-blue-50/50',
            barColor: 'bg-blue-500'
        },
        {
            type: 'memorisation',
            label: 'Memorisation',
            score: 85,
            status: 'Proficient',
            activeRing: 'ring-2 ring-indigo-500 bg-indigo-50/50',
            barColor: 'bg-indigo-500'
        },
    ];

    const radarData = {
        labels: ['Calculation', 'Language', 'Problem-Solving', 'Memorisation'],
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
        labels: ['Session 1005', 'Session 1004', 'Session 1003', 'Session 1002', 'Session 1001'],
        datasets: [
            {
                label: 'Session Accuracy (%)',
                data: [40, 80, 90, 80, 50],
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
            {/* Top Header & Two-Step Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
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

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Student Performance Report </h1>
                    <p className="text-sm text-slate-500">
                        Formative diagnostic evaluation mapping Sessions, PracticeAttempts, and Validated Weaknesses.
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

            {/* ERD ExamResult Benchmark Banner: Shows Before vs After System Improvement */}
            <div className="mt-6 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-blue-800/80 rounded-lg text-blue-200">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-800/60 px-2 py-0.5 rounded text-blue-200 border border-blue-700/50">
                                ERD ExamResult Analysis
                            </span>
                            <span className="text-xs text-blue-200 font-mono">Subject: {previousExam?.subjectName}</span>
                        </div>
                        <h3 className="font-bold text-lg mt-0.5">
                            Comparative Gain: +{examImprovement} Points Improvement
                        </h3>
                        <p className="text-xs text-blue-200/90 mt-0.5">
                            Baseline Previous Exam ({previousExam?.score}/100) vs System Post-Practice Score ({systemExam?.score}/100).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 self-start md:self-auto">
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-blue-200">System Result</div>
                        <div className="text-xl font-bold">{systemExam?.score}%</div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </div>
            </div>

            {/* Priority Weakness Call-To-Action Banner */}
            <div className="mt-4 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded">
                                Validated WeaknessRecord
                            </span>
                            <span className="text-xs font-semibold text-rose-700">Type: calculation</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-1">
                            Primary Academic Vulnerability: Calculation (48% Accuracy)
                        </h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                            Subnet arithmetic and logarithm recurrences resulted in multiple failed practice attempts.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigateToDrill ? onNavigateToDrill('calculation') : setSelectedType('calculation')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow transition whitespace-nowrap"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Start Practice Session
                </button>
            </div>

            {/* 3 Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Practice Average</span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">68.0%</div>
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Passing Target: 60%
                    </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Total Sessions</span>
                        <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{sessionList.length} Rounds</div>
                    <p className="text-xs text-slate-500 mt-2">Practice & Validation Sessions</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase">Subject Coverage</span>
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">3 Subjects</div>
                    <p className="text-xs text-slate-500 mt-2">Active curriculum modules</p>
                </div>
            </div>

            {/* WeaknessRecord.Type Mapping Cards */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            WeaknessRecord Dimension Mapping
                        </h2>
                        <p className="text-xs text-slate-500">
                            Filter practice history by clicking a WeaknessRecord type defined in the database.
                        </p>
                    </div>

                    {selectedType !== 'All' && (
                        <button
                            onClick={() => setSelectedType('All')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Filtered by: {selectedType} (Reset)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {weaknessDimensions.map((dim) => {
                        const isSelected = selectedType.toLowerCase() === dim.type;
                        return (
                            <div
                                key={dim.type}
                                onClick={() => setSelectedType(isSelected ? 'All' : dim.type)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isSelected
                                    ? dim.activeRing
                                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700">{dim.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${dim.type === 'calculation'
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
                        <h2 className="text-base font-bold text-slate-900">Cognitive Balance (Radar)</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Proficiency across the 4 ERD WeaknessRecord types.
                        </p>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        <strong>System Diagnostic:</strong> Language and Memorisation are above 85%. Focus on calculation drills.
                    </div>
                </div>

                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Session Progression History</h2>
                        <p className="text-xs text-slate-500 mb-4">Accuracy calculated from PracticeAttempt records across Sessions.</p>
                    </div>
                    <div className="h-64 w-full">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                        <span>Lowest Accuracy: <strong>40% (Recurrence Relations)</strong></span>
                        <span>Highest Accuracy: <strong>90% (SRS Ambiguity)</strong></span>
                    </div>
                </div>
            </div>

            {/* Practice Sessions Log (ERD: Session & PracticeAttempt Mapping) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">Session Practice Log</h2>
                            {selectedType !== 'All' && (
                                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Type: {selectedType}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Session rows with linked PracticeAttempt accuracy and WeaknessRecord validation status.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search session or topic..."
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
                                <option value="Data Communication">Data Communication & Networking</option>
                                <option value="Database">Database Systems</option>
                                <option value="Workshop 2">Workshop 2</option>
                                <option value="Data Structures">Data Structures</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sessions Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                <th className="py-3 px-4">Session Info</th>
                                <th className="py-3 px-4">Subject & Topic</th>
                                <th className="py-3 px-4">Weakness Type</th>
                                <th className="py-3 px-4 text-center">Validated?</th>
                                <th className="py-3 px-4 text-center">Accuracy</th>
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
                                            className="hover:bg-blue-50/50 transition cursor-pointer group"
                                            title="Click to view practice session breakdown"
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-mono font-semibold text-slate-800">{session.sessionID}</div>
                                                <div className="text-[11px] text-slate-400 capitalize">{session.purpose} • {session.sessionAt}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                                                    {session.topic}
                                                </div>
                                                <div className="text-[11px] text-slate-500">{session.subjectName}</div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedType(session.weaknessType);
                                                    }}
                                                    title={`Click to filter by ${session.weaknessType}`}
                                                    className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 border border-slate-200 transition capitalize"
                                                >
                                                    {session.weaknessType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${session.validated ? 'text-rose-600' : 'text-slate-400'
                                                    }`}>
                                                    {session.validated ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                                                            Confirmed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                                            Unconfirmed
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`font-bold ${accuracyPercent < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {accuracyPercent}%
                                                </span>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {session.correctAttempts}/{session.totalQuestions} Correct
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedRecord(session);
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
                                    <td colSpan="6" className="text-center py-8 text-slate-400">
                                        No matching sessions found for "{selectedType}".{' '}
                                        <button
                                            onClick={() => setSelectedType('All')}
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
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Session Breakdown</h3>
                                <span className="text-[10px] text-slate-400 font-mono">SessionID: {selectedRecord.sessionID}</span>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-4 space-y-3 text-xs">
                            <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Topic & Focus</span>
                                <p className="font-semibold text-slate-800 text-sm">{selectedRecord.topic}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Subject Name</span>
                                    <p className="font-medium text-slate-800">{selectedRecord.subjectName}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Weakness Type</span>
                                    <p className="font-medium text-slate-800 capitalize">{selectedRecord.weaknessType}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Session Purpose</span>
                                    <p className="font-medium text-slate-800 capitalize">{selectedRecord.purpose}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Validation Status</span>
                                    <p className={`font-semibold ${selectedRecord.validated ? 'text-rose-600' : 'text-slate-600'}`}>
                                        {selectedRecord.validated ? 'Weakness Validated' : 'Unvalidated'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                <span>Attempt Accuracy: <strong>{Math.round((selectedRecord.correctAttempts / selectedRecord.totalQuestions) * 100)}%</strong></span>
                                <span>PracticeAttempts: <strong>{selectedRecord.correctAttempts} / {selectedRecord.totalQuestions}</strong></span>
                            </div>

                            <div className="text-slate-700 bg-blue-50 border border-blue-200 p-3 rounded-lg leading-relaxed">
                                <strong>AI Diagnostic Reasoning:</strong> {selectedRecord.aiFeedback}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    if (onNavigateToDrill) onNavigateToDrill(selectedRecord.weaknessType);
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