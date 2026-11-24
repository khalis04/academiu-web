import React, { useState, useMemo } from 'react';
import {
    Folder, FolderOpen, FolderPlus, FileText, Play, Trash2, ArrowLeft,
    Swords, AlertTriangle, Star, Clock, CheckCircle2, Pencil, Check, X
} from 'lucide-react';

export default function AcademicRecords({
    registeredSubjects = [],
    matchHistory = [],
    onReplayDrillFile,
    onDeleteDrillFile,
    onDeleteSubjectFolder,
    onRenameSubjectFolder,
    onNavigate
}) {
    const [openFolderId, setOpenFolderId] = useState(null);
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editName, setEditName] = useState('');

    const folders = useMemo(() => {
        return registeredSubjects.map((sub) => {
            const files = matchHistory.filter(
                (m) => m.topic.trim().toLowerCase() === sub.name.trim().toLowerCase()
            );
            const avgScore =
                files.length > 0 ? Math.round(files.reduce((sum, f) => sum + f.score, 0) / files.length) : null;
            const weakSubtopics = Array.from(new Set(files.filter((f) => f.score < 60).map((f) => f.subtopic)));
            const isWeakSubject = (avgScore !== null && avgScore < 60) || weakSubtopics.length > 0;
            return { ...sub, files, avgScore, weakSubtopics, isWeakSubject };
        });
    }, [registeredSubjects, matchHistory]);

    const overallStats = useMemo(() => ({
        totalFolders: folders.length,
        totalFiles: matchHistory.length,
        totalWeakTopics: folders.reduce((sum, f) => sum + f.weakSubtopics.length, 0)
    }), [folders, matchHistory]);

    const activeFolder = folders.find((f) => f.id === openFolderId) || null;

    const startEditing = (folder, e) => {
        if (e) e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditName(folder.name);
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingFolderId(null);
        setEditName('');
    };

    const saveEdit = (folderId, e) => {
        if (e) e.stopPropagation();
        const trimmed = editName.trim();
        if (trimmed && onRenameSubjectFolder) onRenameSubjectFolder(folderId, trimmed);
        setEditingFolderId(null);
        setEditName('');
    };

    const confirmDeleteFolder = (folder, e) => {
        if (e) e.stopPropagation();
        if (window.confirm(`Delete "${folder.name}" and its ${folder.files.length} drill file(s)?`)) {
            if (onDeleteSubjectFolder) onDeleteSubjectFolder(folder.id);
            if (openFolderId === folder.id) setOpenFolderId(null);
        }
    };

    if (registeredSubjects.length === 0) {
        return (
            <div className="game-fit items-center justify-center">
                <div className="game-card-sys rounded-2xl p-8 max-w-md text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <FolderPlus className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Vault Empty</h2>
                    <p className="text-xs text-slate-500">Create a subject folder to store drills and track weak topics.</p>
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

    // VIEW 1: OPEN SUBJECT FOLDER
    if (activeFolder) {
        const isEditingActive = editingFolderId === activeFolder.id;

        return (
            <div className="game-fit text-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            type="button"
                            onClick={() => { setEditingFolderId(null); setOpenFolderId(null); }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-blue-400 transition shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="min-w-0 flex-1">
                            {isEditingActive ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit(activeFolder.id, e);
                                            if (e.key === 'Escape') cancelEditing(e);
                                        }}
                                        className="w-full max-w-xs px-3 py-1.5 rounded-xl border text-sm font-bold focus:outline-none"
                                    />
                                    <button type="button" onClick={(e) => saveEdit(activeFolder.id, e)} className="p-2 rounded-xl bg-emerald-600 text-white">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={cancelEditing} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg md:text-xl font-black text-slate-900 truncate">{activeFolder.name}</h1>
                                    <button
                                        type="button"
                                        onClick={(e) => startEditing(activeFolder, e)}
                                        title="Rename"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition shrink-0"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-slate-500">{activeFolder.creditHours} Credits • {activeFolder.files.length} Files</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={(e) => confirmDeleteFolder(activeFolder, e)}
                            className="inline-flex items-center gap-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold transition"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate('generator')}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                            <Swords className="w-3.5 h-3.5" /> New Drill
                        </button>
                    </div>
                </div>

                {/* SYSTEM INFO: Folder Telemetry (No GPA) */}
                <div className="grid grid-cols-3 gap-3 shrink-0">
                    <div className="game-card-sys px-4 py-3 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Score</span>
                        <div className="text-xl font-black text-slate-900">
                            {activeFolder.avgScore !== null ? `${activeFolder.avgScore}%` : '—'}
                        </div>
                    </div>
                    <div className="game-card-sys px-4 py-3 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Saved Files</span>
                        <div className="text-xl font-black text-slate-900">{activeFolder.files.length}</div>
                    </div>
                    <div className="game-card-sys px-4 py-3 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                        {activeFolder.weakSubtopics.length > 0 ? (
                            <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-1">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{activeFolder.weakSubtopics.length} Weak Topic(s)</span>
                            </div>
                        ) : (
                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>On Track</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ALERT: Weak Subtopics */}
                {activeFolder.weakSubtopics.length > 0 && (
                    <div className="game-card-alert rounded-2xl px-4 py-3 flex items-start gap-3 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <span className="font-black text-rose-200 uppercase tracking-wide">
                                Weak Subtopics in {activeFolder.name} (Below 60%):
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {activeFolder.weakSubtopics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="bg-rose-950/60 border border-rose-400/40 text-rose-100 font-bold px-2.5 py-0.5 rounded-lg text-[11px]"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* USER CONTENT: Saved Drill Files */}
                <div className="flex-1 min-h-0 game-card-user rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black uppercase tracking-wider text-[#D8B878]">Your Saved Drills</span>
                        <span className="text-xs font-bold text-slate-400">{activeFolder.files.length} Total</span>
                    </div>

                    {activeFolder.files.length === 0 ? (
                        <div className="flex-1 p-6 text-center flex flex-col items-center justify-center gap-2">
                            <FileText className="w-8 h-8 text-slate-400" />
                            <div className="text-sm font-bold text-slate-900">No drills saved here</div>
                            <button
                                type="button"
                                onClick={() => onNavigate('generator')}
                                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                            >
                                <Swords className="w-3.5 h-3.5" /> Start First Drill
                            </button>
                        </div>
                    ) : (
                        <div className="game-scroll flex-1 divide-y divide-slate-100">
                            {activeFolder.files.map((file) => {
                                const passed = file.score >= 60;
                                return (
                                    <div key={file.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${passed ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-black text-slate-900">{file.subtopic}</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{file.format}</span>
                                                    {!passed && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                                                            Weak (&lt;60%)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">{file.fileName}</div>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                                    <span>{file.date}</span>
                                                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {file.timeSpent}</span>
                                                    <span>{file.correct}/{file.total}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                                            <div className="text-left md:text-right">
                                                <div className={`text-base font-black ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{file.score}%</div>
                                                <div className="inline-flex items-center gap-0.5">
                                                    {[1, 2, 3].map((s) => (
                                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= file.starsEarned ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onReplayDrillFile && onReplayDrillFile(file)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-current" /> Redo
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete File"
                                                    onClick={() => onDeleteDrillFile && onDeleteDrillFile(file.id)}
                                                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VIEW 2: MAIN VAULT GRID (No GPA)
    return (
        <div className="game-fit text-slate-800">
            <div className="flex items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Academic Records</h1>
                    <p className="text-xs text-slate-500">Subject vaults, saved drills, and weak topics</p>
                </div>
                <button
                    type="button"
                    onClick={() => onNavigate('registration')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shrink-0"
                >
                    <FolderPlus className="w-4 h-4" /> New Folder
                </button>
            </div>

            {/* SYSTEM INFO: Vault Telemetry */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Subject Folders</span>
                        <div className="text-2xl font-black text-blue-600">{overallStats.totalFolders}</div>
                    </div>
                    <Folder className="w-5 h-5 text-blue-600 hidden sm:block" />
                </div>
                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Saved Drills</span>
                        <div className="text-2xl font-black text-slate-900">{overallStats.totalFiles}</div>
                    </div>
                    <FileText className="w-5 h-5 text-slate-400 hidden sm:block" />
                </div>
                <div className="game-card-sys px-4 py-3 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Weak Topics</span>
                        <div className={`text-2xl font-black ${overallStats.totalWeakTopics > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {overallStats.totalWeakTopics}
                        </div>
                    </div>
                    <AlertTriangle className={`w-5 h-5 hidden sm:block ${overallStats.totalWeakTopics > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
                </div>
            </div>

            {/* USER CONTENT: Subject Folders Grid */}
            <div className="game-scroll flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start pr-1">
                {folders.map((folder) => {
                    const isEditing = editingFolderId === folder.id;
                    return (
                        <div
                            key={folder.id}
                            onClick={() => { if (!isEditing) setOpenFolderId(folder.id); }}
                            className={`group rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between gap-3 ${folder.isWeakSubject ? 'game-card-alert' : 'game-card-user'
                                }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${folder.isWeakSubject
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                        }`}>
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    {folder.isWeakSubject && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                                            Weak Subject
                                        </span>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div onClick={(e) => e.stopPropagation()} className="mt-3 flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(folder.id, e);
                                                if (e.key === 'Escape') cancelEditing(e);
                                            }}
                                            className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border text-sm font-bold focus:outline-none"
                                        />
                                        <button type="button" onClick={(e) => saveEdit(folder.id, e)} className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button type="button" onClick={cancelEditing} className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <h3 className="text-sm font-black text-slate-900 mt-3 group-hover:text-[#D8B878] transition truncate">
                                        {folder.name}
                                    </h3>
                                )}

                                <p className="text-xs text-slate-500">
                                    {folder.creditHours} Cr • {folder.avgScore !== null ? `Avg ${folder.avgScore}%` : 'No drills yet'}
                                </p>

                                {folder.weakSubtopics.length > 0 && (
                                    <div className="mt-2.5 p-2 rounded-xl bg-rose-950/50 border border-rose-400/40 text-[11px] font-bold text-rose-200 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        <span className="truncate">
                                            Weak Topic: {folder.weakSubtopics[0]}
                                            {folder.weakSubtopics.length > 1 ? ` (+${folder.weakSubtopics.length - 1})` : ''}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#D8B878]">
                                <span className="inline-flex items-center gap-1.5">
                                    <FolderOpen className="w-4 h-4" />
                                    <span>{folder.files.length} {folder.files.length === 1 ? 'File' : 'Files'}</span>
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        title="Rename"
                                        onClick={(e) => startEditing(folder, e)}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete"
                                        onClick={(e) => confirmDeleteFolder(folder, e)}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}