import React, { useState, useEffect } from 'react';
import {
    Upload,
    Clock,
    Star,
    CheckCircle2,
    XCircle,
    RotateCcw,
    FastForward,
    LogOut,
    Eye,
    AlertCircle,
    FileCheck,
    FolderPlus,
    RefreshCw,
    X,
    FileText,
    Trash2,
    Lock,
    Swords,
    Sparkles,
    Folder,
    Flame
} from 'lucide-react';
import { RankCrest } from '../App';

const COUNTDOWN_LIMIT = 300; // 5 minutes countdown

const MATCH_TIPS = [
    'Score 100% (3 Stars) 5 times in a row to trigger Double Stars (+6 ★).',
    'Losing 2 drills in a row (below 60%) deducts 1 Star from your season total.',
    'Use Review Answers after a match to lock in missed concepts.',
    'Redo weak subtopics in Records to turn them green and climb faster.'
];

const buildDrillQuestions = (subject, subtopic, format) => {
    const topicLabel = subtopic.trim() || 'General Course Material';

    if (format === 'Fill-in-the-Blank') {
        return [
            {
                id: 1,
                question: `In ${subject} (${topicLabel}), a /26 subnet mask provides how many usable host addresses?`,
                answer: '62',
                explanation: '2^6 - 2 = 62 usable hosts.'
            },
            {
                id: 2,
                question: `Regarding ${topicLabel}, which normal form removes transitive dependencies? (1NF, 2NF, or 3NF)`,
                answer: '3NF',
                explanation: 'Third Normal Form (3NF) removes transitive dependency.'
            },
            {
                id: 3,
                question: 'What is the time complexity of binary search in Big-O notation?',
                answer: 'O(log n)',
                explanation: 'Binary search cuts the search space in half each step: O(log n).'
            },
            {
                id: 4,
                question: 'In the OSI model, which layer manages logical IP addressing?',
                answer: 'Network',
                explanation: 'The Network layer (Layer 3) handles logical IP routing.'
            },
            {
                id: 5,
                question: 'How many bits are in a standard IPv4 address?',
                answer: '32',
                explanation: 'IPv4 addresses consist of 4 bytes = 32 bits.'
            },
            {
                id: 6,
                question: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?',
                answer: 'Stack',
                explanation: 'A Stack pushes and pops elements from the top (LIFO).'
            },
            {
                id: 7,
                question: 'What SQL keyword is used to eliminate duplicate rows in a query result?',
                answer: 'DISTINCT',
                explanation: 'SELECT DISTINCT returns only unique values.'
            },
            {
                id: 8,
                question: 'Which protocol is connection-oriented at the Transport Layer? (TCP or UDP)',
                answer: 'TCP',
                explanation: 'TCP uses a 3-way handshake to establish a reliable connection.'
            },
            {
                id: 9,
                question: 'What is the default port number for HTTPS traffic?',
                answer: '443',
                explanation: 'HTTPS runs over TLS/SSL on TCP port 443.'
            },
            {
                id: 10,
                question: 'In Big-O notation, what is the worst-case time complexity of Bubble Sort?',
                answer: 'O(n^2)',
                explanation: 'Nested loops comparing adjacent elements yield quadratic O(n^2) time.'
            }
        ];
    }

    return [
        {
            id: 1,
            question: `[${subject} — ${topicLabel}] Which subnet mask corresponds to a /26 prefix?`,
            options: ['255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.240'],
            answer: '255.255.255.192',
            explanation: '/26 uses 2 bits in the fourth octet (128 + 64 = 192).'
        },
        {
            id: 2,
            question: `[${topicLabel}] For T(n) = 2T(n/2) + n, what is the Master Theorem time complexity?`,
            options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
            answer: 'O(n log n)',
            explanation: 'Case 2 applies when a = 2, b = 2, and f(n) = n, giving O(n log n).'
        },
        {
            id: 3,
            question: `[${topicLabel}] Why are B-Trees used for database indexing?`,
            options: [
                'To encrypt rows',
                'To keep lookup times balanced at O(log n)',
                'To delete foreign keys',
                'To compress images'
            ],
            answer: 'To keep lookup times balanced at O(log n)',
            explanation: 'B-Tree nodes stay balanced so searches run in logarithmic time.'
        },
        {
            id: 4,
            question: `[${topicLabel}] Which requirement statement is clear and testable?`,
            options: [
                'The page should be fast',
                'The dashboard shall load within 1.5 seconds',
                'The layout should look nice',
                'The system must handle high traffic'
            ],
            answer: 'The dashboard shall load within 1.5 seconds',
            explanation: 'A testable requirement includes a specific target metric (1.5 seconds).'
        },
        {
            id: 5,
            question: `[${topicLabel}] What is the Transport Layer (Layer 4) data unit called?`,
            options: ['Frame', 'Packet', 'Segment', 'Bit'],
            answer: 'Segment',
            explanation: 'Layer 4 packages data into TCP/UDP Segments.'
        },
        {
            id: 6,
            question: `[${topicLabel}] Which normal form eliminates partial dependencies on a composite primary key?`,
            options: ['1NF', '2NF', '3NF', 'BCNF'],
            answer: '2NF',
            explanation: 'Second Normal Form (2NF) ensures all non-key attributes depend on the full primary key.'
        },
        {
            id: 7,
            question: `[${topicLabel}] Which data structure is used for Breadth-First Search (BFS)?`,
            options: ['Stack', 'Queue', 'Binary Heap', 'Hash Map'],
            answer: 'Queue',
            explanation: 'BFS explores nodes level by level using a FIFO Queue.'
        },
        {
            id: 8,
            question: `[${topicLabel}] Which HTTP status code indicates a resource was successfully created?`,
            options: ['200 OK', '201 Created', '204 No Content', '400 Bad Request'],
            answer: '201 Created',
            explanation: '201 Created confirms that a POST request created a new resource.'
        },
        {
            id: 9,
            question: `[${topicLabel}] Which SQL clause filters grouped records after aggregation?`,
            options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
            answer: 'HAVING',
            explanation: 'WHERE filters individual rows; HAVING filters aggregated groups.'
        },
        {
            id: 10,
            question: `[${topicLabel}] What is the primary purpose of DNS in networking?`,
            options: [
                'Encrypting packets',
                'Translating domain names to IP addresses',
                'Assigning MAC addresses',
                'Routing VLAN traffic'
            ],
            answer: 'Translating domain names to IP addresses',
            explanation: 'DNS resolves human-readable hostnames into IP addresses.'
        }
    ];
};

export default function QuestionGenerator({
    rankInfo,
    registeredSubjects = [],
    replayDrillFile,
    onClearReplay,
    onCompleteDrill,
    onNavigate
}) {
    const [selectedSubject, setSelectedSubject] = useState(
        registeredSubjects.length > 0 ? registeredSubjects[0].name : ''
    );
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [activeFileName, setActiveFileName] = useState('');
    const [format, setFormat] = useState('MCQ');
    const [subtopic, setSubtopic] = useState('');
    const [timerOn, setTimerOn] = useState(true);
    const [formError, setFormError] = useState('');
    const [redoSourceFile, setRedoSourceFile] = useState(null);

    // Phases: 'setup' | 'loading' | 'playing' | 'result' | 'review'
    const [phase, setPhase] = useState('setup');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [matchTip, setMatchTip] = useState(MATCH_TIPS[0]);

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [seconds, setSeconds] = useState(COUNTDOWN_LIMIT);
    const [lastResult, setLastResult] = useState(null);

    const isRedoMode = Boolean(redoSourceFile);
    const isReadyToStart = Boolean(selectedSubject) && attachedFiles.length > 0;

    useEffect(() => {
        if (!selectedSubject && registeredSubjects.length > 0) {
            setSelectedSubject(registeredSubjects[0].name);
        }
    }, [registeredSubjects, selectedSubject]);

    useEffect(() => {
        if (replayDrillFile) {
            setRedoSourceFile(replayDrillFile);
            setSelectedSubject(replayDrillFile.topic);
            setSubtopic(replayDrillFile.subtopic || '');
            setFormat(replayDrillFile.format || 'MCQ');

            const savedNames = (replayDrillFile.fileName || 'Saved_Drill_File.pdf')
                .split(' + ')
                .map((n) => n.trim())
                .filter(Boolean);

            setAttachedFiles(
                savedNames.map((name, idx) => ({
                    id: `saved-${Date.now()}-${idx}`,
                    name,
                    isSaved: true,
                    file: null
                }))
            );

            setActiveFileName(replayDrillFile.fileName || 'Saved_Drill_File.pdf');
            setFormError('');
            setPhase('setup');
            if (onClearReplay) onClearReplay();
        }
    }, [replayDrillFile, onClearReplay]);

    // Match Loading Sequence (6.5s)
    useEffect(() => {
        if (phase !== 'loading') return;

        setLoadingProgress(8);
        setMatchTip(MATCH_TIPS[Math.floor(Math.random() * MATCH_TIPS.length)]);

        const t1 = setTimeout(() => setLoadingProgress(28), 1400);
        const t2 = setTimeout(() => setLoadingProgress(56), 2900);
        const t3 = setTimeout(() => setLoadingProgress(84), 4400);
        const t4 = setTimeout(() => setLoadingProgress(100), 5400);
        const t5 = setTimeout(() => {
            setSeconds(timerOn ? COUNTDOWN_LIMIT : 0);
            setPhase('playing');
        }, 6500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, [phase, timerOn]);

    const formatTime = (secs) => {
        const safeSecs = Math.max(0, secs);
        const mins = String(Math.floor(safeSecs / 60)).padStart(2, '0');
        const rem = String(safeSecs % 60).padStart(2, '0');
        return `${mins}:${rem}`;
    };

    useEffect(() => {
        if (phase !== 'playing') return;
        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (timerOn) {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase, timerOn]);

    useEffect(() => {
        if (phase === 'playing' && timerOn && seconds === 0) {
            handleFinishDrill(true);
        }
    }, [seconds, phase, timerOn]);

    const handleAddFiles = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        const newEntries = selected.map((file, idx) => ({
            id: `upload-${Date.now()}-${idx}-${file.name}`,
            name: file.name,
            isSaved: false,
            file
        }));

        setAttachedFiles((prev) => [...prev, ...newEntries]);
        if (formError) setFormError('');
        e.target.value = '';
    };

    const handleRemoveFile = (fileId) => {
        setAttachedFiles((prev) => prev.filter((item) => item.id !== fileId));
    };

    const handleStartDrill = (e) => {
        if (e) e.preventDefault();
        if (!isReadyToStart) {
            setFormError('Select a folder and attach at least one study file.');
            return;
        }

        setFormError('');
        const combinedFileNames = attachedFiles.map((f) => f.name).join(' + ');
        setActiveFileName(combinedFileNames);

        const hasNewOrModifiedFiles =
            !redoSourceFile ||
            attachedFiles.some((f) => !f.isSaved) ||
            combinedFileNames !== redoSourceFile.fileName;

        const canReuseSavedQuestions =
            redoSourceFile &&
            !hasNewOrModifiedFiles &&
            format === redoSourceFile.format &&
            redoSourceFile.questions &&
            redoSourceFile.questions.length >= 10;

        const drillQuestions = canReuseSavedQuestions
            ? redoSourceFile.questions
            : buildDrillQuestions(selectedSubject, subtopic, format);

        setQuestions(drillQuestions);
        setUserAnswers({});
        setCurrentIdx(0);
        setPhase('loading');
    };

    const handleFinishDrill = (autoSubmitted = false) => {
        let correctCount = 0;
        questions.forEach((q) => {
            const given = (userAnswers[q.id] || '').trim().toLowerCase();
            const expected = q.answer.trim().toLowerCase();
            if (given === expected) correctCount++;
        });

        const percentage = Math.round((correctCount / questions.length) * 100);
        const starsEarned = percentage === 100 ? 3 : percentage >= 80 ? 2 : percentage >= 60 ? 1 : 0;
        const timeUsedSeconds = timerOn ? COUNTDOWN_LIMIT - seconds : seconds;
        const resolvedSubtopic = subtopic.trim() || 'Full Material Overview';
        const today = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const record = {
            id: `DRILL-${Math.floor(110 + Math.random() * 890)}`,
            date: today,
            topic: selectedSubject,
            subtopic: resolvedSubtopic,
            fileName: activeFileName || 'Study_Material.pdf',
            format,
            questions,
            correct: correctCount,
            total: questions.length,
            score: percentage,
            starsEarned,
            timeSpent: formatTime(timeUsedSeconds),
            note: autoSubmitted
                ? 'Time expired — auto-submitted.'
                : starsEarned === 3
                    ? 'Perfect score! Earned 3 Stars.'
                    : starsEarned >= 1
                        ? 'Passed target. Saved to folder.'
                        : 'Below 60%. Saved for retry.'
        };

        const finalRecord = onCompleteDrill ? onCompleteDrill(record) : record;
        setLastResult(finalRecord || record);
        setRedoSourceFile(null);
        setPhase('result');
    };

    const handleRetry = () => {
        setUserAnswers({});
        setCurrentIdx(0);
        setPhase('loading');
    };

    const handleNextDrill = () => {
        setRedoSourceFile(null);
        setSubtopic('');
        setAttachedFiles([]);
        setPhase('setup');
    };

    // GATEKEEPER (SYSTEM INFO)
    if (phase === 'setup' && registeredSubjects.length === 0) {
        return (
            <div className="game-fit items-center justify-center">
                <div className="game-card-sys rounded-2xl p-8 max-w-md text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <FolderPlus className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">No Subject Folders</h2>
                    <p className="text-xs text-slate-500">
                        Create a subject folder first so your drills have a home.
                    </p>
                    <button
                        type="button"
                        onClick={() => onNavigate('registration')}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                    >
                        Create Subject Folder
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------
    // PHASE 1: SETUP (USER CONTENT)
    // -----------------------------------------------------------------
    if (phase === 'setup') {
        return (
            <div className="game-fit text-slate-800">
                <div className="flex items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            {isRedoMode ? 'Redo Saved Drill' : 'Match Setup'}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {isRedoMode
                                ? 'Adjust materials, format, or timer'
                                : 'Configure rules and attach study notes (10 Questions per drill)'}
                        </p>
                    </div>
                    {isRedoMode && (
                        <button
                            type="button"
                            onClick={() => {
                                setRedoSourceFile(null);
                                setSubtopic('');
                                setAttachedFiles([]);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-blue-400 transition"
                        >
                            <X className="w-3.5 h-3.5" />
                            New Drill
                        </button>
                    )}
                </div>

                {isRedoMode && (
                    <div className="game-card-sys rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0">
                        <RefreshCw className="w-4 h-4 text-[#D8B878] shrink-0" />
                        <div className="text-xs text-slate-200">
                            Redoing <strong className="text-white">{redoSourceFile.subtopic}</strong> • Previous
                            Score: <strong className="text-[#D8B878]">{redoSourceFile.score}%</strong>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleStartDrill}
                    noValidate
                    className="flex-1 min-h-0 game-card-user rounded-2xl p-5 flex flex-col gap-4"
                >
                    {formError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shrink-0">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="game-fit-body grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Match Rules */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700">Subject Folder</label>
                                    {isRedoMode ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                            <Lock className="w-3 h-3" /> Locked
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onNavigate('registration')}
                                            className="text-[11px] font-bold text-[#D8B878] hover:underline"
                                        >
                                            + New Folder
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={selectedSubject}
                                    disabled={isRedoMode}
                                    onChange={(e) => {
                                        setSelectedSubject(e.target.value);
                                        if (formError) setFormError('');
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                                >
                                    {registeredSubjects.map((sub) => (
                                        <option key={sub.id} value={sub.name}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700">Subtopic Focus</label>
                                    <span className="text-[11px] text-slate-400">
                                        {isRedoMode ? 'Locked' : 'Optional'}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={subtopic}
                                    disabled={isRedoMode}
                                    onChange={(e) => setSubtopic(e.target.value)}
                                    placeholder="e.g. Subnet Masking, 3NF Normalization"
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Question Format
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {['MCQ', 'Fill-in-the-Blank'].map((fmt) => (
                                        <button
                                            type="button"
                                            key={fmt}
                                            onClick={() => setFormat(fmt)}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${format === fmt
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Timer Mode</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setTimerOn(true)}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${timerOn
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                    >
                                        <Clock className="w-3.5 h-3.5" /> 5m Countdown
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimerOn(false)}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${!timerOn
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                    >
                                        <Clock className="w-3.5 h-3.5" /> Count Up
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Materials */}
                        <div className="flex flex-col min-h-[200px] lg:min-h-0">
                            <div className="flex items-center justify-between mb-1.5 shrink-0">
                                <label className="text-xs font-bold text-slate-700">Study Materials</label>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {attachedFiles.length} attached
                                </span>
                            </div>

                            <label
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition shrink-0 ${attachedFiles.length > 0
                                    ? 'border-emerald-400 bg-emerald-50/30'
                                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/60'
                                    }`}
                            >
                                {attachedFiles.length > 0 ? (
                                    <FileCheck className="w-6 h-6 text-emerald-600 mb-1.5" />
                                ) : (
                                    <Upload className="w-6 h-6 text-[#D8B878] mb-1.5" />
                                )}
                                <span className="text-xs font-bold text-slate-900">
                                    {attachedFiles.length > 0 ? 'Add more notes' : 'Drop or click to upload notes'}
                                </span>
                                <span className="text-[11px] text-slate-500 mt-0.5">PDF, PPTX, DOCX, TXT</span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                    onChange={handleAddFiles}
                                    className="hidden"
                                />
                            </label>

                            {attachedFiles.length > 0 && (
                                <div className="game-scroll mt-3 space-y-2 flex-1 pr-1 max-h-48 lg:max-h-none">
                                    {attachedFiles.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                                <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                                                {item.isSaved && (
                                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md shrink-0">
                                                        Saved
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(item.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                        <span className="text-[11px] text-slate-500">
                            {isReadyToStart ? 'Ready to enter arena (10 Questions)' : 'Attach at least 1 file to start'}
                        </span>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setRedoSourceFile(null);
                                    setAttachedFiles([]);
                                    onNavigate(isRedoMode ? 'records' : 'dashboard');
                                }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isReadyToStart}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isRedoMode ? 'Start Redo' : 'Start Ranked Drill'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // -----------------------------------------------------------------
    // PHASE 1.5: MATCH LOADING
    // -----------------------------------------------------------------
    if (phase === 'loading') {
        const displaySubtopic = subtopic.trim() || 'Full Material Overview';
        const stageText =
            loadingProgress < 45
                ? 'Scanning study materials...'
                : loadingProgress < 80
                    ? `Building ${questions.length} ${format} questions...`
                    : loadingProgress < 100
                        ? 'Entering Arena...'
                        : 'Match Ready';

        return (
            <div className="game-fit items-center justify-center text-white">
                <div className="w-full max-w-2xl game-card-sys rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
                            <Swords className="w-3.5 h-3.5" />
                            Match Loading
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                            {loadingProgress}%
                        </span>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="flex flex-col items-center text-center space-y-1">
                            <div className="animate-pulse">
                                <RankCrest tierName={rankInfo.currentTier.name} size="lg" />
                            </div>
                            <div className="text-sm font-black text-white">{rankInfo.currentTier.name}</div>
                            <div className="text-[11px] text-amber-400 font-bold">
                                {rankInfo.totalStars} Stars
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-lg">
                                VS
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                                {questions.length} Qs
                            </span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase text-blue-400 block truncate">
                                {selectedSubject}
                            </span>
                            <div className="text-sm font-black text-white line-clamp-2">{displaySubtopic}</div>
                            <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                                <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                    {format}
                                </span>
                                <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                    {timerOn ? '05:00' : 'Count Up'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{stageText}</span>
                            <span className="text-slate-400 font-mono">{attachedFiles.length} File(s)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{matchTip}</span>
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------
    // PHASE 2: PLAYING
    // -----------------------------------------------------------------
    if (phase === 'playing') {
        const currentQ = questions[currentIdx];
        const displaySubtopic = subtopic.trim() || 'Full Material Overview';
        const isLowTime = timerOn && seconds <= 30;

        return (
            <div className="game-fit text-slate-800 max-w-4xl w-full mx-auto">
                {/* SYSTEM INFO: Match HUD */}
                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shrink-0">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-blue-600 inline-flex items-center gap-1">
                            <Folder className="w-3 h-3" /> {selectedSubject}
                        </span>
                        <h2 className="text-sm font-black text-slate-900 truncate">{displaySubtopic}</h2>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${isLowTime
                                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                                : 'bg-slate-100 border-slate-200 text-slate-800'
                                }`}
                        >
                            <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-rose-600' : 'text-blue-600'}`} />
                            <span>{formatTime(seconds)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setPhase('setup')}
                            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Quit
                        </button>
                    </div>
                </div>

                {/* USER CONTENT: Question Arena */}
                <div className="flex-1 min-h-0 game-card-user p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-400 shrink-0">
                        <span className="font-mono">
                            Question {currentIdx + 1} / {questions.length}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            {questions.map((q, i) => (
                                <span
                                    key={q.id}
                                    className={`h-1.5 w-5 sm:w-6 rounded-full transition ${i === currentIdx
                                        ? 'bg-[#D8B878]'
                                        : userAnswers[q.id]
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-300/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="game-scroll flex-1 space-y-5 pr-1">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                            {currentQ.question}
                        </h3>

                        {format === 'MCQ' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentQ.options.map((opt) => {
                                    const selected = userAnswers[currentQ.id] === opt;
                                    return (
                                        <button
                                            type="button"
                                            key={opt}
                                            onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: opt })}
                                            className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-semibold transition ${selected
                                                ? 'bg-blue-50 border-[#D8B878] text-white'
                                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={userAnswers[currentQ.id] || ''}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })}
                                placeholder="Type your answer..."
                                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx((i) => i - 1)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {currentIdx < questions.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentIdx((i) => i + 1)}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleFinishDrill(false)}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                                Submit Drill
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------
    // PHASE 3 & 4: RESULT & SIDE-BY-SIDE REVIEW
    // -----------------------------------------------------------------
    const passed = lastResult.score >= 60;
    const isReviewing = phase === 'review';
    const finalStarDelta = lastResult.starDelta ?? lastResult.starsEarned;

    return (
        <div
            className={`game-fit text-slate-800 w-full mx-auto ${isReviewing ? 'max-w-7xl' : 'max-w-3xl justify-center'
                }`}
        >
            <div
                className={`grid gap-3 min-h-0 ${isReviewing ? 'flex-1 grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
                    }`}
            >
                {/* LEFT COLUMN (or centered solo card): Match Result */}
                <div
                    className={`${isReviewing ? 'lg:col-span-5' : ''} ${passed ? 'game-card-sys' : 'game-card-alert'
                        } rounded-2xl p-5 flex flex-col justify-between gap-4 min-h-0`}
                >
                    <div className="space-y-4">
                        {/* Header + Rank Crest */}
                        <div className="flex items-center gap-4">
                            <RankCrest tierName={rankInfo.currentTier.name} size="lg" />
                            <div className="min-w-0 flex-1">
                                <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${passed
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}
                                >
                                    <Folder className="w-3 h-3" /> {lastResult.topic}{' '}
                                    {!passed && '• Weak Topic'}
                                </span>
                                <h1 className="text-lg md:text-xl font-black text-slate-900 mt-1 truncate">
                                    {lastResult.subtopic}
                                </h1>
                                <p className="text-xs text-slate-500 truncate">{lastResult.fileName}</p>
                            </div>
                        </div>

                        {/* Earned Stars */}
                        <div className="flex flex-col items-center justify-center gap-1.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-9 h-9 ${star <= lastResult.starsEarned
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            {lastResult.streakEvent && (
                                <div
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full ${finalStarDelta < 0
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                                        : 'bg-amber-500/20 text-[#F5D78E] border border-[#D8B878]/50'
                                        }`}
                                >
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>{lastResult.streakEvent}</span>
                                </div>
                            )}
                        </div>

                        {/* KPI Grid */}
                        <div
                            className={`grid gap-2.5 text-center ${isReviewing ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                                }`}
                        >
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Correct</span>
                                <div className="text-lg font-black font-mono text-slate-900">
                                    {lastResult.correct}/{lastResult.total}
                                </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                                <div
                                    className={`text-lg font-black font-mono ${passed ? 'text-blue-600' : 'text-rose-600'
                                        }`}
                                >
                                    {lastResult.score}%
                                </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
                                <div className="text-lg font-black font-mono text-slate-900">
                                    {lastResult.timeSpent}
                                </div>
                            </div>
                            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                                <span className="text-[10px] uppercase font-bold text-amber-700">Stars</span>
                                <div
                                    className={`text-lg font-black font-mono ${finalStarDelta < 0 ? 'text-rose-600' : 'text-amber-600'
                                        }`}
                                >
                                    {finalStarDelta > 0 ? `+${finalStarDelta}` : finalStarDelta}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setPhase(isReviewing ? 'result' : 'review')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                        >
                            <Eye className="w-4 h-4 text-blue-600" />
                            {isReviewing ? 'Hide Review' : 'Review Answers'}
                        </button>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                        >
                            <RotateCcw className="w-4 h-4" /> Retry
                        </button>
                        <button
                            type="button"
                            onClick={handleNextDrill}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                        >
                            <FastForward className="w-4 h-4" /> Next Drill
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate('records')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                        >
                            <Folder className="w-4 h-4" /> Records
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Expanded Answer Breakdown */}
                {isReviewing && (
                    <div className="lg:col-span-7 min-h-0 game-card-user rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                                Your Answer Breakdown
                            </h3>
                            <span className="text-xs font-mono font-bold text-slate-400">
                                {lastResult.correct}/{lastResult.total} Correct
                            </span>
                        </div>

                        <div className="game-scroll flex-1 space-y-3 pr-1">
                            {questions.map((q, idx) => {
                                const userAns = (userAnswers[q.id] || '').trim();
                                const isCorrect = userAns.toLowerCase() === q.answer.trim().toLowerCase();
                                return (
                                    <div
                                        key={q.id}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="font-bold text-slate-900 leading-snug">
                                                Q{idx + 1}. {q.question}
                                            </span>
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                            <span>
                                                Yours:{' '}
                                                <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-600'}>
                                                    {userAns || 'Blank'}
                                                </strong>
                                            </span>
                                            <span>
                                                Correct: <strong className="text-blue-700">{q.answer}</strong>
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                                            {q.explanation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}