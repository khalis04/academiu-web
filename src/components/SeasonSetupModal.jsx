import React, { useState } from 'react';
import { Calendar, FolderArchive, Sparkles, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { OfficialLogo, formatSeasonDuration } from '../App';

export default function SeasonSetupModal({
    mode = 'onboarding', // 'onboarding' | 'new-season'
    currentSeason = null,
    onCreateSeason,
    onClose
}) {
    const [seasonName, setSeasonName] = useState('');
    const [durationYears, setDurationYears] = useState('0');
    const [durationMonths, setDurationMonths] = useState('6');

    const isOnboarding = mode === 'onboarding';
    const parsedYears = Math.max(0, parseInt(durationYears, 10) || 0);
    const parsedMonths = Math.max(0, parseInt(durationMonths, 10) || 0);
    const hasValidDuration = parsedYears > 0 || parsedMonths > 0;
    const canSubmit = seasonName.trim().length > 0 && hasValidDuration;

    const durationPreview = hasValidDuration
        ? formatSeasonDuration({ durationYears: parsedYears, durationMonths: parsedMonths })
        : 'Set at least 1 month or year';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onCreateSeason({
            name: seasonName.trim(),
            durationYears: parsedYears,
            durationMonths: parsedMonths
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09152E]/95 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl bg-[#152C5B] border border-[#D8B878]/50 shadow-2xl overflow-hidden text-[#FAF6EE]">
                {/* Top Bar */}
                <div className="px-6 py-4 bg-[#0D1F44] border-b border-[#D8B878]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isOnboarding ? (
                            <div className="bg-[#FFFDF9] px-2.5 py-1 rounded-xl">
                                <OfficialLogo variant="full" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[#D8B878] font-black text-sm uppercase tracking-wider">
                                <FolderArchive className="w-4 h-4" />
                                <span>Start New Season</span>
                            </div>
                        )}
                    </div>

                    {!isOnboarding && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-[#A9B8D6] hover:text-white hover:bg-white/10 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Description Box */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D8B878] bg-[#D8B878]/10 border border-[#D8B878]/30 px-2.5 py-1 rounded-full">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isOnboarding ? 'Step 1 — Create Your Season Folder' : 'Archive & Reset'}
                        </div>
                        <h2 className="text-xl font-black text-white">
                            {isOnboarding ? 'Set Up Your Academic Season' : 'Begin a Fresh Season'}
                        </h2>
                        <p className="text-xs text-[#A9B8D6] leading-relaxed">
                            A <strong className="text-white">Season</strong> acts as your main academic folder (such as <em>"Tingkatan 1"</em> or <em>"Sem 1"</em>). All subject folders, practice drills, and rank stars you earn are saved inside it. When you start a new season later, your current season is safely archived in the <strong className="text-white">Season Report</strong>, and your rank resets for a fresh climb.
                        </p>
                    </div>

                    {!isOnboarding && currentSeason && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-2.5 text-xs text-amber-200">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                                <strong>"{currentSeason.name}"</strong> (all subject folders, drills, and final rank) will be archived to your Season Report. Your active Rank, Records, and Report will reset to 0.
                            </span>
                        </div>
                    )}

                    {/* Season Name */}
                    <div>
                        <label className="block text-xs font-bold text-[#D6DEF0] mb-1.5">
                            Season Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            autoFocus
                            required
                            value={seasonName}
                            onChange={(e) => setSeasonName(e.target.value)}
                            placeholder="e.g. Tingkatan 1, Sem 1 2026, Final Year..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#09152E] border border-[#D8B878]/35 text-sm text-white placeholder-[#7F90B5] focus:outline-none focus:border-[#D8B878]"
                        />
                    </div>

                    {/* Combined Duration: Years & Months */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-[#D6DEF0]">
                                Season Duration <span className="text-rose-400">*</span>
                            </label>
                            <span
                                className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${hasValidDuration
                                        ? 'bg-[#D8B878]/15 border-[#D8B878]/40 text-[#F5D78E]'
                                        : 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                                    }`}
                            >
                                <Calendar className="w-3 h-3" />
                                {durationPreview}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] mb-1">
                                    Years
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={durationYears}
                                    onChange={(e) => setDurationYears(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09152E] border border-[#D8B878]/35 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#D8B878]"
                                />
                            </div>

                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A9B8D6] mb-1">
                                    Months
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09152E] border border-[#D8B878]/35 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#D8B878]"
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-[#7F90B5]">
                            You can combine both — for example, 1 Year and 3 Months, or 0 Years and 6 Months.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        {!isOnboarding && onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-[#A9B8D6] hover:text-white transition"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#3B6FE0] to-[#1E3F8A] border-b-2 border-[#0D1F44] text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                        >
                            <span>{isOnboarding ? 'Create Season & Enter' : 'Archive & Start Season'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}