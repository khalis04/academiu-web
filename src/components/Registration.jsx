import React, { useState } from 'react';
import {
    FolderPlus,
    Folder,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Swords,
    Database,
    FileText
} from 'lucide-react';

export default function Registration({
    registeredSubjects = [],
    matchHistory = [],
    onAddSubject,
    onDeleteSubject,
    onNavigate = () => { }
}) {
    const [subjectName, setSubjectName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const trimmed = subjectName.trim();
        if (!trimmed) {
            setError('Please enter a subject folder name.');
            return;
        }

        const isDuplicate = registeredSubjects.some(
            (sub) => sub.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) {
            setError(`"${trimmed}" already exists in this season.`);
            return;
        }

        if (onAddSubject) {
            onAddSubject(trimmed);
        }

        setSubjectName('');
        setSuccessMsg(`Created folder "${trimmed}".`);
        setTimeout(() => setSuccessMsg(''), 2500);
    };

    const handleDelete = (sub, drillCount) => {
        const warning =
            drillCount > 0
                ? `Delete "${sub.name}" and its ${drillCount} saved drill(s)?`
                : `Delete subject folder "${sub.name}"?`;

        if (window.confirm(warning)) {
            if (onDeleteSubject) onDeleteSubject(sub.id);
        }
    };

    return (
        <div className="game-fit text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Subject Folders
                    </h1>
                    <p className="text-xs text-slate-500">
                        Create and manage subject folders for your active season
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onNavigate('records')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                    >
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Vault</span>
                    </button>
                    <button
                        type="button"
                        disabled={registeredSubjects.length === 0}
                        onClick={() => onNavigate('generator')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Swords className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Start Drill</span>
                    </button>
                </div>
            </div>

            {/* Main 2-Column Layout */}
            <div className="game-fit-body grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* LEFT COLUMN (5 cols): Create Folder Form */}
                <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="game-card-user rounded-2xl p-5 flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <FolderPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900">Create Subject Folder</h2>
                                <p className="text-[11px] text-slate-500">
                                    Organize study materials and ranked drills by subject
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Subject Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subjectName}
                                onChange={(e) => {
                                    setSubjectName(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="e.g. Data Comm & Networking, Database Systems"
                                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!subjectName.trim()}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FolderPlus className="w-4 h-4" />
                            <span>Add Subject Folder</span>
                        </button>
                    </form>

                    {/* Compact Folder Summary */}
                    <div className="game-card-sys rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Active Season Folders
                            </span>
                            <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                                {registeredSubjects.length}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Drills Saved
                            </span>
                            <div className="text-2xl font-black font-mono text-[#D8B878] mt-0.5">
                                {matchHistory.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (7 cols): Registered Folders List */}
                <div className="lg:col-span-7 min-h-0 game-card-user rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">
                            Your Subject Folders
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                            {registeredSubjects.length} Total
                        </span>
                    </div>

                    {registeredSubjects.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-2">
                            <Folder className="w-10 h-10 text-slate-400" />
                            <div className="text-sm font-bold text-slate-900">No Subject Folders Yet</div>
                            <p className="text-xs text-slate-500 max-w-xs">
                                Add your first subject folder on the left before starting a ranked drill.
                            </p>
                        </div>
                    ) : (
                        <div className="game-scroll flex-1 space-y-2.5 pr-1">
                            {registeredSubjects.map((sub) => {
                                const folderDrills = matchHistory.filter(
                                    (m) => m.topic.trim().toLowerCase() === sub.name.trim().toLowerCase()
                                );
                                const drillCount = folderDrills.length;
                                const avgScore =
                                    drillCount > 0
                                        ? Math.round(
                                            folderDrills.reduce((sum, m) => sum + m.score, 0) / drillCount
                                        )
                                        : null;

                                return (
                                    <div
                                        key={sub.id}
                                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Folder className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-black text-slate-900 truncate">
                                                    {sub.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                                    <span className="inline-flex items-center gap-1 font-mono">
                                                        <FileText className="w-3 h-3" />
                                                        {drillCount} {drillCount === 1 ? 'Drill' : 'Drills'}
                                                    </span>
                                                    {avgScore !== null && (
                                                        <>
                                                            <span>•</span>
                                                            <span
                                                                className={`font-mono font-bold ${avgScore >= 60 ? 'text-emerald-600' : 'text-rose-600'
                                                                    }`}
                                                            >
                                                                Avg {avgScore}%
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(sub, drillCount)}
                                            title="Delete Subject Folder"
                                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}