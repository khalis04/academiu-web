import React, { useState, useMemo, useRef } from 'react';
import {
    Plus, Search, Pencil, Trash2, Download, X, Check, Play,
    ArrowUpRight, ArrowDownRight, RotateCcw, Database, TrendingUp, Award, AlertTriangle,
} from 'lucide-react';

// ERD Table 2.2: ExamResult (ExamID, UserID, SubjectName, Score, MaxScore, Source, ExamDate)
const USER_ID = 'USR-B032410622';
const PASS_MARK = 60;

const SUBJECTS = [
    'Mathematics',
    'Data Comm & Networking',
    'Database Systems',
    'Workshop 2',
    'Data Structures',
];

const INITIAL_RECORDS = [
    { examID: 'EXM-001', userID: USER_ID, subjectName: 'Mathematics', score: 55, maxScore: 100, source: 'previous', examDate: '2026-08-14' },
    { examID: 'EXM-002', userID: USER_ID, subjectName: 'Mathematics', score: 72, maxScore: 100, source: 'system', examDate: '2026-10-24' },
    { examID: 'EXM-003', userID: USER_ID, subjectName: 'Data Comm & Networking', score: 48, maxScore: 100, source: 'previous', examDate: '2026-08-20' },
    { examID: 'EXM-004', userID: USER_ID, subjectName: 'Data Comm & Networking', score: 65, maxScore: 100, source: 'system', examDate: '2026-10-18' },
    { examID: 'EXM-005', userID: USER_ID, subjectName: 'Database Systems', score: 70, maxScore: 100, source: 'previous', examDate: '2026-08-22' },
    { examID: 'EXM-006', userID: USER_ID, subjectName: 'Database Systems', score: 82, maxScore: 100, source: 'system', examDate: '2026-10-16' },
    { examID: 'EXM-007', userID: USER_ID, subjectName: 'Workshop 2', score: 78, maxScore: 100, source: 'system', examDate: '2026-10-12' },
    { examID: 'EXM-008', userID: USER_ID, subjectName: 'Data Structures', score: 28, maxScore: 50, source: 'system', examDate: '2026-10-04' },
];

const todayStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
};

const emptyForm = () => ({
    subjectName: '',
    score: '',
    maxScore: '100',
    examDate: todayStr(),
    source: 'system',
});

const pct = (r) => Math.round((r.score / r.maxScore) * 100);

const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AcademicRecords({ onNavigate }) {
    const [records, setRecords] = useState(INITIAL_RECORDS);

    // Search / filter / sort (the "S" in CRUDS)
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    // Add / edit modal
    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', examID }
    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState({});

    // Delete confirmation + toast
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null); // { message, undo? }
    const toastTimer = useRef(null);

    // ---------- Helpers ----------
    const showToast = (message, undo) => {
        clearTimeout(toastTimer.current);
        setToast({ message, undo });
        toastTimer.current = setTimeout(() => setToast(null), undo ? 6000 : 3000);
    };

    const nextID = () => {
        const max = records.reduce((m, r) => Math.max(m, parseInt(r.examID.split('-')[1], 10) || 0), 0);
        return `EXM-${String(max + 1).padStart(3, '0')}`;
    };

    // Change versus the previous record of the same subject
    const trendFor = useMemo(() => {
        const map = {};
        records.forEach((r) => {
            const earlier = records
                .filter((x) => x.subjectName === r.subjectName && x.examDate < r.examDate)
                .sort((a, b) => b.examDate.localeCompare(a.examDate))[0];
            map[r.examID] = earlier ? pct(r) - pct(earlier) : null;
        });
        return map;
    }, [records]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = records.filter((r) => {
            const matchesSearch = !q || r.subjectName.toLowerCase().includes(q) || r.examID.toLowerCase().includes(q);
            const matchesSubject = subjectFilter === 'All' || r.subjectName === subjectFilter;
            const matchesSource = sourceFilter === 'All' || r.source === sourceFilter;
            return matchesSearch && matchesSubject && matchesSource;
        });
        const sorters = {
            newest: (a, b) => b.examDate.localeCompare(a.examDate),
            oldest: (a, b) => a.examDate.localeCompare(b.examDate),
            highest: (a, b) => pct(b) - pct(a),
            lowest: (a, b) => pct(a) - pct(b),
        };
        return [...list].sort(sorters[sortBy]);
    }, [records, search, subjectFilter, sourceFilter, sortBy]);

    // Summary cards
    const average = records.length ? Math.round(records.reduce((s, r) => s + pct(r), 0) / records.length) : 0;
    const bestSubject = useMemo(() => {
        const groups = {};
        records.forEach((r) => {
            groups[r.subjectName] = groups[r.subjectName] || [];
            groups[r.subjectName].push(pct(r));
        });
        let best = null;
        Object.entries(groups).forEach(([name, vals]) => {
            const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            if (!best || avg > best.avg) best = { name, avg };
        });
        return best;
    }, [records]);

    // ---------- Create / Update ----------
    const openAdd = () => {
        setForm(emptyForm());
        setErrors({});
        setModal({ mode: 'add' });
    };

    const openEdit = (r) => {
        setForm({
            subjectName: r.subjectName,
            score: String(r.score),
            maxScore: String(r.maxScore),
            examDate: r.examDate,
            source: r.source,
        });
        setErrors({});
        setModal({ mode: 'edit', examID: r.examID });
    };

    const closeModal = () => {
        setModal(null);
        setErrors({});
    };

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        const err = {};
        const score = Number(form.score);
        const max = Number(form.maxScore);
        if (!form.subjectName.trim()) err.subjectName = 'Subject is required.';
        if (form.score === '' || Number.isNaN(score) || score < 0) err.score = 'Enter a score of 0 or more.';
        if (form.maxScore === '' || Number.isNaN(max) || max <= 0) err.maxScore = 'Max score must be above 0.';
        if (!err.score && !err.maxScore && score > max) err.score = 'Score cannot be higher than the max score.';
        if (!form.examDate) err.examDate = 'Date is required.';
        else if (form.examDate > todayStr()) err.examDate = 'Date cannot be in the future.';
        return err;
    };

    const handleSave = (e) => {
        e.preventDefault();
        const err = validate();
        setErrors(err);
        if (Object.keys(err).length > 0) return;

        const clean = {
            subjectName: form.subjectName.trim(),
            score: Number(form.score),
            maxScore: Number(form.maxScore),
            examDate: form.examDate,
            source: form.source,
        };

        if (modal.mode === 'add') {
            const id = nextID();
            setRecords((prev) => [...prev, { examID: id, userID: USER_ID, ...clean }]);
            showToast(`Record ${id} added`);
        } else {
            setRecords((prev) => prev.map((r) => (r.examID === modal.examID ? { ...r, ...clean } : r)));
            showToast(`Record ${modal.examID} updated`);
        }
        closeModal();
    };

    // ---------- Delete (with undo) ----------
    const confirmDelete = () => {
        const index = records.findIndex((r) => r.examID === deleteTarget.examID);
        const removed = records[index];
        setRecords((prev) => prev.filter((r) => r.examID !== removed.examID));
        setDeleteTarget(null);
        showToast(`Deleted ${removed.examID}`, () => {
            setRecords((prev) => {
                const copy = [...prev];
                copy.splice(Math.min(index, copy.length), 0, removed);
                return copy;
            });
            showToast(`Record ${removed.examID} restored`);
        });
    };

    // ---------- Export ----------
    const exportCSV = () => {
        const header = ['ExamID', 'UserID', 'SubjectName', 'Score', 'MaxScore', 'Percent', 'Source', 'ExamDate'];
        const lines = filtered.map((r) =>
            [r.examID, r.userID, `"${r.subjectName}"`, r.score, r.maxScore, pct(r), r.source, r.examDate].join(',')
        );
        const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-records.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${filtered.length} record${filtered.length === 1 ? '' : 's'} to CSV`);
    };

    const resetFilters = () => {
        setSearch('');
        setSubjectFilter('All');
        setSourceFilter('All');
    };

    // ---------- Styles ----------
    const fieldClass = (key) =>
        `w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[key] ? 'border-red-400' : 'border-slate-300'
        }`;
    const selectClass =
        'text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
    const fieldError = (key) => (errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null);

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-6">
            {/* Header with breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-1.5 text-slate-400">
                        <button
                            type="button"
                            onClick={() => (onNavigate ? onNavigate('dashboard') : null)}
                            className="hover:text-blue-600 transition"
                        >
                            Home
                        </button>
                        <span>/</span>
                        <span className="font-semibold text-blue-600">Academic Records</span>
                    </nav>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Academic Records
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Add, view, update, delete and search your exam results. (Prototype: sample data only)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold transition"
                    >
                        <Download className="w-4 h-4 text-slate-400" />
                        Export CSV
                    </button>
                    <button
                        onClick={openAdd}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs font-bold transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Record
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
                        <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{records.length}</div>
                    <p className="text-[11px] text-slate-400 mt-2">Exam results stored</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{average}%</div>
                    <p className={`text-[11px] font-semibold mt-2 ${average >= PASS_MARK ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {average >= PASS_MARK ? `Above the ${PASS_MARK}% passing mark` : `Below the ${PASS_MARK}% passing mark`}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Best Subject</span>
                        <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900 truncate">{bestSubject ? bestSubject.name : '-'}</div>
                    <p className="text-[11px] text-slate-400 mt-2">
                        {bestSubject ? `${bestSubject.avg}% average` : 'No records yet'}
                    </p>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Search and filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Exam Results</h2>
                        <p className="text-xs text-slate-500">
                            Showing {filtered.length} of {records.length} record{records.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search subject or exam ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52"
                            />
                        </div>
                        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={selectClass}>
                            <option value="All">All Subjects</option>
                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={selectClass}>
                            <option value="All">All Sources</option>
                            <option value="previous">Previous</option>
                            <option value="system">System</option>
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="highest">Highest score</option>
                            <option value="lowest">Lowest score</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Exam ID</th>
                                <th className="py-3 px-4">Subject</th>
                                <th className="py-3 px-4 text-center">Score</th>
                                <th className="py-3 px-4 text-center">Change</th>
                                <th className="py-3 px-4">Source</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length > 0 ? (
                                filtered.map((r) => {
                                    const percent = pct(r);
                                    const change = trendFor[r.examID];
                                    return (
                                        <tr key={r.examID} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{r.examID}</td>
                                            <td className="py-3 px-4 font-bold text-slate-800">{r.subjectName}</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`font-black ${percent < PASS_MARK ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {percent}%
                                                </span>
                                                <div className="text-[10px] text-slate-400 font-mono">{r.score}/{r.maxScore}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {change === null ? (
                                                    <span className="text-slate-300">-</span>
                                                ) : change >= 0 ? (
                                                    <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">
                                                        <ArrowUpRight className="w-3.5 h-3.5" />+{change}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-0.5 font-bold text-rose-600">
                                                        <ArrowDownRight className="w-3.5 h-3.5" />{change}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${r.source === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {r.source}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(r.examDate)}</td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => onNavigate && onNavigate('generator')}
                                                        title="Practise this subject"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(r)}
                                                        title="Edit"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(r)}
                                                        title="Delete"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400">
                                        {records.length === 0 ? (
                                            <>
                                                No records yet.{' '}
                                                <button onClick={openAdd} className="text-blue-600 underline font-bold">
                                                    Add your first record
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                No records match your search.{' '}
                                                <button onClick={resetFilters} className="text-blue-600 underline font-bold">
                                                    Clear filters
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {modal.mode === 'add' ? 'Add Exam Record' : `Edit ${modal.examID}`}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {modal.mode === 'add' ? `New ID: ${nextID()}` : 'Update the details below.'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4" noValidate>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-600 mb-1 block">Subject</span>
                                <input
                                    list="subject-options"
                                    className={fieldClass('subjectName')}
                                    value={form.subjectName}
                                    onChange={setField('subjectName')}
                                    placeholder="Choose or type a subject"
                                />
                                <datalist id="subject-options">
                                    {SUBJECTS.map((s) => <option key={s} value={s} />)}
                                </datalist>
                                {fieldError('subjectName')}
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600 mb-1 block">Score</span>
                                    <input type="number" min="0" className={fieldClass('score')} value={form.score} onChange={setField('score')} />
                                    {fieldError('score')}
                                </label>
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600 mb-1 block">Max score</span>
                                    <input type="number" min="1" className={fieldClass('maxScore')} value={form.maxScore} onChange={setField('maxScore')} />
                                    {fieldError('maxScore')}
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600 mb-1 block">Exam date</span>
                                    <input type="date" max={todayStr()} className={fieldClass('examDate')} value={form.examDate} onChange={setField('examDate')} />
                                    {fieldError('examDate')}
                                </label>
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600 mb-1 block">Source</span>
                                    <select className={fieldClass('source')} value={form.source} onChange={setField('source')}>
                                        <option value="system">System (practised here)</option>
                                        <option value="previous">Previous (before using Academiu)</option>
                                    </select>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                                >
                                    {modal.mode === 'add' ? 'Add Record' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Delete {deleteTarget.examID}?</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {deleteTarget.subjectName}, {deleteTarget.score}/{deleteTarget.maxScore} on {formatDate(deleteTarget.examDate)}.
                            This will remove it from your records.
                        </p>
                        <div className="flex justify-center gap-2 mt-5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                            >
                                Yes, delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg px-4 py-3">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{toast.message}</span>
                    {toast.undo && (
                        <button
                            onClick={() => { toast.undo(); }}
                            className="flex items-center gap-1 text-blue-300 hover:text-blue-200 underline"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Undo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
