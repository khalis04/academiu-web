import React, { useState, useEffect } from 'react';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import { RankCrest } from '../App';

export default function RankUpModal({ rankUpData, onClose }) {
    const [stage, setStage] = useState('flying'); // 'flying' | 'promoted'

    useEffect(() => {
        if (!rankUpData) return;
        setStage('flying');

        const timer = setTimeout(() => {
            setStage('promoted');
        }, 1150);

        return () => clearTimeout(timer);
    }, [rankUpData]);

    if (!rankUpData) return null;

    const { oldTier, newTier, starsEarned, totalStars } = rankUpData;

    // Starting coordinates for up to 3 flying stars
    const starOrigins = [
        { x: '-110px', y: '140px', delay: '0ms' },
        { x: '0px', y: '165px', delay: '140ms' },
        { x: '110px', y: '140px', delay: '280ms' }
    ];

    const activeStars = starOrigins.slice(0, Math.max(1, starsEarned));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
            <div className="relative w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
                {/* Ambient Glow Behind Crest */}
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${stage === 'promoted' ? 'bg-amber-500/30 scale-125' : 'bg-blue-500/20 scale-90'
                        }`}
                />

                {/* Top Label */}
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        {stage === 'flying' ? 'Charging Rank Stars...' : 'Rank Promoted!'}
                    </span>
                </div>

                {/* Center Crest & Flying Stars Arena */}
                <div className="relative z-10 my-8 flex items-center justify-center h-40">
                    {/* Burst Ring on Promotion */}
                    {stage === 'promoted' && (
                        <div className="absolute w-32 h-32 rounded-full border-4 border-amber-400 animate-ring-burst pointer-events-none" />
                    )}

                    {/* Crest Display (Old -> New) */}
                    <div
                        key={stage}
                        className={stage === 'promoted' ? 'animate-crest-pop' : 'transition-transform duration-300 scale-95'}
                    >
                        <RankCrest tierName={stage === 'promoted' ? newTier : oldTier} size="xl" />
                    </div>

                    {/* Flying Stars Animation */}
                    {stage === 'flying' &&
                        activeStars.map((pos, idx) => (
                            <div
                                key={idx}
                                style={{
                                    '--start-x': pos.x,
                                    '--start-y': pos.y,
                                    animationDelay: pos.delay
                                }}
                                className="absolute animate-star-fly pointer-events-none"
                            >
                                <Star className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                            </div>
                        ))}
                </div>

                {/* Promotion Text */}
                <div className="relative z-10 space-y-2 min-h-[76px]">
                    {stage === 'flying' ? (
                        <div className="text-sm font-bold text-slate-300 animate-pulse">
                            Adding +{starsEarned} ★ to {oldTier} Tier...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                                <span>{oldTier}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-amber-300">{newTier}</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">
                                {newTier} Tier Unlocked!
                            </h2>
                            <p className="text-xs text-slate-300">
                                You now have <strong className="text-amber-400">{totalStars} ★</strong>. Keep practicing to climb higher!
                            </p>
                        </>
                    )}
                </div>

                {/* Claim / Continue Button */}
                <div className="relative z-10 mt-6">
                    <button
                        type="button"
                        disabled={stage === 'flying'}
                        onClick={onClose}
                        className={`w-full py-3 rounded-xl text-xs sm:text-sm font-black transition ${stage === 'promoted'
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-wait'
                            }`}
                    >
                        {stage === 'promoted' ? 'Continue to Results' : 'Ranking Up...'}
                    </button>
                </div>
            </div>
        </div>
    );
}