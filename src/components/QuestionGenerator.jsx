import React, { useState } from 'react';
import { Sparkles, Loader2, Bookmark, BookmarkCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';

// Fake "AI" question bank for the prototype. A real AI/API replaces this later.
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

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function QuestionGenerator({ onNavigate, initialTopic }) {
    const [topic, setTopic] = useState(initialTopic && BANK[initialTopic] ? initialTopic : 'Database Design');
    const [difficulty, setDifficulty] = useState('Medium');
    const [type, setType] = useState('mcq');
    const [count, setCount] = useState(2);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [picked, setPicked] = useState({});     // MCQ choice per question id
    const [revealed, setRevealed] = useState({}); // short-answer reveal per id
    const [saved, setSaved] = useState([]);       // ids saved to question bank

    const handleGenerate = () => {
        setLoading(true);
        setPicked({});
        setRevealed({});
        // Fake AI delay so it feels real
        setTimeout(() => {
            const pool = BANK[topic].filter((x) => x.type === type);
            setQuestions(shuffle(pool).slice(0, count).map((x) => ({ ...x, difficulty })));
            setLoading(false);
        }, 1500);
    };

    const toggleSave = (id) =>
        setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const selectClass =
        'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Question Generator</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Generate practice questions for any topic. (Prototype: sample data only)
                    </p>
                </div>
                <div className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-3 py-1">
                    {saved.length} saved
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="block">
                    <span className="text-xs font-semibold text-slate-500">Topic</span>
                    <select className={selectClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
                        {Object.keys(BANK).map((t) => <option key={t}>{t}</option>)}
                    </select>
                </label>

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

                <div className="md:col-span-4">
                    <button onClick={handleGenerate} disabled={loading}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {questions.length > 0 && !loading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Generated questions</h2>
                        <button onClick={handleGenerate} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                    </div>

                    {questions.map((item, i) => (
                        <div key={item.id} className="bg-white rounded-xl shadow p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded px-2 py-0.5">{topic}</span>
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

            {/* Link to a teammate's module */}
            <button onClick={() => onNavigate && onNavigate('diagnostic')}
                className="mt-8 text-xs text-blue-600 font-semibold underline hover:text-blue-800">
                ← Back to AI Weakness Diagnostic
            </button>
        </div>
    );
}