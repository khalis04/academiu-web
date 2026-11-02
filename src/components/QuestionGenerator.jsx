import React, { useState } from 'react';
import {
    Sparkles, Loader2, Bookmark, BookmarkCheck, Eye, EyeOff, RefreshCw,
    Upload, FileText, X, TrendingUp, TrendingDown, Minus, BookOpen, BarChart3,
} from 'lucide-react';

// ---------- Fake data for the prototype (a real AI/API replaces this later) ----------
const BANK = {
    'Database Design': [
        { id: 'db1', type: 'mcq', q: 'Which normal form removes partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1, explain: '2NF removes partial dependencies on part of a composite key.' },
        { id: 'db2', type: 'mcq', q: 'What does a foreign key do?', options: ['Uniquely identifies a row', 'Links a row to a row in another table', 'Encrypts a column', 'Speeds up queries'], answer: 1, explain: 'A foreign key references the primary key of another table.' },
        { id: 'db3', type: 'short', q: 'Explain the difference between a primary key and a candidate key.', explain: 'A candidate key is any column set that could uniquely identify a row. The primary key is the one candidate chosen for that role.' },
        { id: 'db4', type: 'short', q: 'Why is an ERD drawn before creating tables?', explain: 'It shows entities, attributes and relationships, so design mistakes are caught before implementation.' },
    ],
    'Programming': [
        { id: 'pg1', type: 'mcq', q: 'What does the useState hook return in React?', options: ['A single value', 'A value and a setter function', 'A promise', 'A component'], answer: 1, explain: 'useState returns the current state and a function to update it.' },
        { id: 'pg2', type: 'mcq', q: 'Which keyword declares a constant in JavaScript?', options: ['var', 'let', 'const', 'static'], answer: 2, explain: 'const declares a binding that cannot be reassigned.' },
        { id: 'pg3', type: 'short', q: 'What is the difference between a function and a method?', explain: 'A method is a function that belongs to an object or class.' },
        { id: 'pg4', type: 'short', q: 'Describe what a loop is and give one use case.', explain: 'A loop repeats code until a condition ends it, e.g. listing every student in an array.' },
    ],
    'Software Engineering': [
        { id: 'se1', type: 'mcq', q: 'Which SDLC model is iterative and delivers in short cycles?', options: ['Waterfall', 'Agile', 'V-Model', 'Big Bang'], answer: 1, explain: 'Agile works in short iterations (sprints) with frequent feedback.' },
        { id: 'se2', type: 'mcq', q: 'What is the purpose of a use case diagram?', options: ['Show database tables', 'Show how users interact with the system', 'Show network layout', 'Show source code'], answer: 1, explain: 'It models actors and the functions they perform in the system.' },
        { id: 'se3', type: 'short', q: 'State two differences between functional and non-functional requirements.', explain: 'Functional = what the system does. Non-functional = how well it does it (performance, security, usability).' },
        { id: 'se4', type: 'short', q: 'Why is version control useful in a group project?', explain: 'It tracks changes, lets members work in parallel on branches, and allows rollback.' },
    ],
};

// Used to "detect" the subject of an uploaded file from its file name
const TOPIC_KEYWORDS = {
    'Database Design': ['database', 'sql', 'erd', 'normal', 'db', 'data'],
    'Programming': ['program', 'react', 'javascript', 'js', 'code', 'java', 'python'],
    'Software Engineering': ['software', 'agile', 'uml', 'requirement', 'sdlc', 'engineering'],
};

// Fake "key concepts" the AI would extract from the materials
const CONCEPTS = {
    'Database Design': ['Normalization', 'Primary & foreign keys', 'ERD', 'SQL joins', 'Transactions'],
    'Programming': ['Functions', 'Loops & arrays', 'React hooks', 'Async / promises', 'OOP basics'],
    'Software Engineering': ['SDLC models', 'Agile & Scrum', 'UML diagrams', 'Requirements', 'Testing'],
};

// Past-year papers available in the system, and marks per sub-topic in each one
const PAPER_YEARS = [2022, 2023, 2024, 2025];
const TRENDS = {
    'Database Design': [
        { name: 'Normalization', marks: [10, 12, 15, 18] },
        { name: 'ERD & Modelling', marks: [20, 18, 16, 15] },
        { name: 'SQL Queries', marks: [15, 15, 18, 20] },
        { name: 'Transactions', marks: [5, 8, 6, 5] },
        { name: 'Indexing', marks: [0, 5, 6, 10] },
    ],
    'Programming': [
        { name: 'Functions & Scope', marks: [10, 10, 9, 8] },
        { name: 'Arrays & Loops', marks: [20, 18, 15, 14] },
        { name: 'React Hooks', marks: [0, 6, 12, 18] },
        { name: 'Async / Promises', marks: [5, 8, 12, 14] },
        { name: 'OOP', marks: [15, 14, 13, 12] },
    ],
    'Software Engineering': [
        { name: 'Agile / Scrum', marks: [8, 12, 15, 18] },
        { name: 'UML Diagrams', marks: [20, 18, 18, 15] },
        { name: 'Requirements', marks: [15, 15, 14, 14] },
        { name: 'Testing', marks: [10, 12, 14, 17] },
        { name: 'Version Control', marks: [5, 5, 8, 10] },
    ],
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const formatSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function QuestionGenerator({ onNavigate, initialTopic }) {
    const startTopic = initialTopic && BANK[initialTopic] ? initialTopic : 'Database Design';

    const [mode, setMode] = useState('topic'); // 'topic' | 'upload' | 'trends'

    // Shared settings
    const [topic, setTopic] = useState(startTopic);
    const [difficulty, setDifficulty] = useState('Medium');
    const [type, setType] = useState('mcq');
    const [count, setCount] = useState(2);

    // Results
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [lastRun, setLastRun] = useState(null); // { topic, source }
    const [picked, setPicked] = useState({});
    const [revealed, setRevealed] = useState({});
    const [saved, setSaved] = useState([]);

    // Upload tab
    const [files, setFiles] = useState([]);
    const [analysing, setAnalysing] = useState(false);
    const [analysis, setAnalysis] = useState(null); // { topic, concepts }

    // Trends tab
    const [trendTopic, setTrendTopic] = useState(startTopic);
    const [years, setYears] = useState(PAPER_YEARS);

    // ---------- Actions ----------
    const generate = (t, source) => {
        setLoading(true);
        setPicked({});
        setRevealed({});
        setLastRun({ topic: t, source });
        setTimeout(() => {
            const pool = BANK[t].filter((x) => x.type === type);
            setQuestions(shuffle(pool).slice(0, count).map((x) => ({ ...x, difficulty })));
            setLoading(false);
        }, 1500);
    };

    const switchMode = (m) => {
        setMode(m);
        setQuestions([]);
        setLastRun(null);
    };

    const toggleSave = (id) =>
        setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const handleFiles = (e) => {
        const picked = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
        setFiles((prev) => [...prev, ...picked]);
        setAnalysis(null);
        e.target.value = '';
    };

    const removeFile = (i) => {
        setFiles((prev) => prev.filter((_, idx) => idx !== i));
        setAnalysis(null);
    };

    const analyse = () => {
        setAnalysing(true);
        setTimeout(() => {
            const names = files.map((f) => f.name.toLowerCase()).join(' ');
            let detected = topic;
            for (const [t, kws] of Object.entries(TOPIC_KEYWORDS)) {
                if (kws.some((k) => names.includes(k))) { detected = t; break; }
            }
            setAnalysis({ topic: detected, concepts: CONCEPTS[detected] });
            setAnalysing(false);
        }, 1800);
    };

    const toggleYear = (y) =>
        setYears((prev) => {
            const next = prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y];
            return next.length ? next.sort() : prev; // keep at least one year
        });

    // Trend analysis for the selected papers
    const maxLast = years.length - 1;
    const rows = TRENDS[trendTopic]
        .map((r) => {
            const vals = years.map((y) => r.marks[PAPER_YEARS.indexOf(y)]);
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            const change = vals[maxLast] - vals[0];
            const dir = change >= 3 ? 'up' : change <= -3 ? 'down' : 'steady';
            return { ...r, vals, avg, change, dir, score: avg + change };
        })
        .sort((a, b) => b.score - a.score);
    const maxMark = Math.max(...rows.flatMap((r) => r.vals), 1);
    const likely = rows.slice(0, 3);

    // ---------- Styles ----------
    const selectClass =
        'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';

    const TrendBadge = ({ dir }) => {
        if (dir === 'up') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-2 py-0.5"><TrendingUp className="w-3 h-3" /> Rising</span>;
        if (dir === 'down') return <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 rounded px-2 py-0.5"><TrendingDown className="w-3 h-3" /> Falling</span>;
        return <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 rounded px-2 py-0.5"><Minus className="w-3 h-3" /> Steady</span>;
    };

    // Question settings (type / count / difficulty), shared by every tab
    const settings = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
                <span className="text-xs font-semibold text-slate-500">Question type</span>
                <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="mcq">Multiple choice</option>
                    <option value="short">Short answer</option>
                </select>
            </label>
            <label className="block">
                <span className="text-xs font-semibold text-slate-500">Number of questions</span>
                <select className={selectClass} value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    {[1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
            </label>
            <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Difficulty</span>
                <div className="flex gap-1">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                        <button key={d} onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const generateBtn = (label, onClick, disabled) => (
        <button onClick={onClick} disabled={disabled || loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : label}
        </button>
    );

    const tabs = [
        { id: 'topic', label: 'Selected Topic', icon: BookOpen },
        { id: 'upload', label: 'Uploaded Materials', icon: Upload },
        { id: 'trends', label: 'Past-Year Trends', icon: BarChart3 },
    ];

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
                        <div className="flex items-start justify-between mb-6">
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
                        <span className="font-semibold text-blue-600">AI Question Generator</span>
                    </nav>

                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">AI Question Generator</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Generate questions from a topic, your own learning materials, or past-year exam trends. (Prototype: sample data only)
                    </p>
                </div>
                <div className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-3 py-1 shrink-0">
                    {saved.length} saved
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6 w-full md:w-fit">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => switchMode(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${mode === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <Icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ---------- TAB 1: Selected topic ---------- */}
            {mode === 'topic' && (
                <div className="bg-white rounded-xl shadow p-5 mb-6 space-y-4">
                    <label className="block md:w-1/3">
                        <span className="text-xs font-semibold text-slate-500">Topic</span>
                        <select className={selectClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
                            {Object.keys(BANK).map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </label>
                    {settings}
                    {generateBtn('Generate Questions', () => generate(topic, `Topic: ${topic}`))}
                </div>
            )}

            {/* ---------- TAB 2: Uploaded materials ---------- */}
            {mode === 'upload' && (
                <div className="bg-white rounded-xl shadow p-5 mb-6 space-y-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl py-8 cursor-pointer transition">
                        <Upload className="w-7 h-7 text-blue-600 mb-2" />
                        <span className="text-sm font-semibold text-slate-700">Click to upload learning materials</span>
                        <span className="text-xs text-slate-400 mt-1">Lecture notes, slides, or tutorials (PDF, DOCX, PPTX, TXT)</span>
                        <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFiles} className="hidden" />
                    </label>

                    {files.length > 0 && (
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                                    <span className="flex items-center gap-2 text-sm text-slate-700">
                                        <FileText className="w-4 h-4 text-blue-600" /> {f.name}
                                        <span className="text-xs text-slate-400">{formatSize(f.size)}</span>
                                    </span>
                                    <button onClick={() => removeFile(i)} title="Remove" className="text-slate-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {files.length > 0 && !analysis && (
                        <button onClick={analyse} disabled={analysing}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
                            {analysing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {analysing ? 'Reading your materials...' : 'Analyse Materials'}
                        </button>
                    )}

                    {analysis && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-blue-700 mb-2">
                                AI detected the subject: <span className="font-bold">{analysis.topic}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.concepts.map((c) => (
                                    <span key={c} className="text-[11px] font-semibold bg-white text-blue-700 border border-blue-200 rounded-full px-3 py-1">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <>
                            {settings}
                            {generateBtn('Generate from Materials', () =>
                                generate(analysis.topic, `Uploaded: ${files.map((f) => f.name).join(', ')}`))}
                        </>
                    )}

                    {files.length === 0 && (
                        <p className="text-xs text-slate-400">Upload at least one file to continue. (Prototype: files are not actually read or sent anywhere.)</p>
                    )}
                </div>
            )}

            {/* ---------- TAB 3: Past-year trends ---------- */}
            {mode === 'trends' && (
                <div className="space-y-6 mb-6">
                    <div className="bg-white rounded-xl shadow p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-500">Subject</span>
                                <select className={selectClass} value={trendTopic} onChange={(e) => setTrendTopic(e.target.value)}>
                                    {Object.keys(TRENDS).map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </label>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 block mb-1">Past-year papers to analyse</span>
                                <div className="flex flex-wrap gap-2">
                                    {PAPER_YEARS.map((y) => (
                                        <button key={y} onClick={() => toggleYear(y)}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${years.includes(y) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            <FileText className="w-3.5 h-3.5" /> {y} Final
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Likely focus areas */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-800 mb-2">
                                🔮 Likely focus areas for the next paper (based on {years.length} paper{years.length > 1 ? 's' : ''})
                            </p>
                            <ol className="space-y-1">
                                {likely.map((r, i) => (
                                    <li key={r.name} className="text-sm text-slate-700">
                                        <span className="font-semibold">{i + 1}. {r.name}</span>
                                        <span className="text-xs text-slate-500"> avg {r.avg.toFixed(1)} marks, {r.dir === 'up' ? 'rising' : r.dir === 'down' ? 'falling' : 'steady'}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Trend chart */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-bold text-slate-900 mb-1">Marks per sub-topic</h2>
                        <p className="text-xs text-slate-400 mb-4">Each bar is one paper, in year order ({years.join(', ')}).</p>
                        <div className="space-y-4">
                            {rows.map((r) => (
                                <div key={r.name} className="flex items-center gap-4">
                                    <div className="w-40 shrink-0">
                                        <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                        <p className="text-[11px] text-slate-400">avg {r.avg.toFixed(1)} marks</p>
                                    </div>
                                    <div className="flex items-end gap-2 h-12 flex-1">
                                        {r.vals.map((v, i) => (
                                            <div key={i} className="flex flex-col items-center justify-end h-full w-10">
                                                <span className="text-[10px] text-slate-500 leading-none mb-0.5">{v}</span>
                                                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(v / maxMark) * 100 * 0.7}%`, minHeight: v > 0 ? 2 : 0 }} />
                                            </div>
                                        ))}
                                    </div>
                                    <TrendBadge dir={r.dir} />
                                    <button onClick={() => generate(trendTopic, `Trend focus: ${r.name} (${trendTopic})`)}
                                        disabled={loading}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap disabled:opacity-50">
                                        Practise ➔
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 space-y-4">
                        <h2 className="font-bold text-slate-900">Generate questions from the trends</h2>
                        {settings}
                        {generateBtn('Generate for Likely Topics', () =>
                            generate(trendTopic, `Trend focus: ${likely.map((l) => l.name).join(', ')}`))}
                    </div>
                </div>
            )}

            {/* ---------- Results (shared by all tabs) ---------- */}
            {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Loader2 className="w-4 h-4 animate-spin" /> AI is preparing your questions...
                </div>
            )}

            {questions.length > 0 && !loading && lastRun && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">Generated questions</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Source: {lastRun.source}</p>
                        </div>
                        <button onClick={() => generate(lastRun.topic, lastRun.source)}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                    </div>

                    {questions.map((item, i) => (
                        <div key={item.id} className="bg-white rounded-xl shadow p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded px-2 py-0.5">{lastRun.topic}</span>
                                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded px-2 py-0.5">{item.difficulty}</span>
                                    </div>
                                    <p className="font-semibold text-slate-900">{i + 1}. {item.q}</p>
                                </div>
                                <button onClick={() => toggleSave(item.id)} title="Save to question bank"
                                    className="text-slate-400 hover:text-blue-600 shrink-0">
                                    {saved.includes(item.id) ? <BookmarkCheck className="w-5 h-5 text-blue-600" /> : <Bookmark className="w-5 h-5" />}
                                </button>
                            </div>

                            {item.type === 'mcq' ? (
                                <div className="mt-3 space-y-2">
                                    {item.options.map((opt, idx) => {
                                        const chosen = picked[item.id] !== undefined;
                                        const isRight = idx === item.answer;
                                        const isPicked = picked[item.id] === idx;
                                        let style = 'border-slate-200 hover:bg-slate-50';
                                        if (chosen && isRight) style = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                        else if (chosen && isPicked) style = 'border-red-400 bg-red-50 text-red-700';
                                        return (
                                            <button key={idx} disabled={chosen}
                                                onClick={() => setPicked((p) => ({ ...p, [item.id]: idx }))}
                                                className={`w-full text-left text-sm border rounded-lg px-3 py-2 transition ${style}`}>
                                                {String.fromCharCode(65 + idx)}. {opt}
                                            </button>
                                        );
                                    })}
                                    {picked[item.id] !== undefined && (
                                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3">💡 {item.explain}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <button onClick={() => setRevealed((r) => ({ ...r, [item.id]: !r[item.id] }))}
                                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                                        {revealed[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {revealed[item.id] ? 'Hide model answer' : 'Show model answer'}
                                    </button>
                                    {revealed[item.id] && (
                                        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mt-2">{item.explain}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button onClick={() => onNavigate && onNavigate('diagnostic')}
                className="mt-8 text-xs text-blue-600 font-semibold underline hover:text-blue-800">
                ← Back to AI Weakness Diagnostic
            </button>
        </div>
    );
}