import React from 'react';
import {
    Sparkles,
    Flame,
    Trophy,
    Play,
    ArrowRight,
    TrendingUp,
    Brain,
    Award,
    Zap,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function DashboardOverview({ onNavigate = () => { }, onNavigateToDrill }) {
    const user = {
        name: 'Muhammad Nabil',
        streak: 4,
        points: 1240,
        solvedCount: 38,
        projectedGpa: '3.62',
        weakestTopic: 'Subnet Masking & IP Arithmetic',
        weakestDimension: 'Calculation',
    };

    const quickActions = [
        {
            title: 'Performance Report',
            desc: 'See score trends & weakness radar',
            icon: TrendingUp,
            tab: 'performance',
            color: 'from-blue-600 to-indigo-600',
            badge: 'Updated Today'
        },
        {
            title: 'Achievement Badges',
            desc: 'View unlocked milestones & gains',
            icon: Trophy,
            tab: 'achievement',
            color: 'from-amber-500 to-orange-500',
            badge: '4 Unlocked'
        },
        {
            title: 'AI Diagnostic',
            desc: 'Identify new learning blind spots',
            icon: Brain,
            tab: 'diagnostic',
            color: 'from-purple-600 to-pink-600',
            badge: 'AI Active'
        },
        {
            title: 'Question Generator',
            desc: 'Create personalized exam drills',
            icon: Zap,
            tab: 'generator',
            color: 'from-emerald-600 to-teal-600',
            badge: 'Unlimited'
        }
    ];

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-6">
            {/* 1. Header & Quick Habit Chips */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        UTeM Group 42 Study Portal
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                        Welcome back, {user.name}! 🚀
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Ready to knock out your weaknesses today? You're on track for a great semester.
                    </p>
                </div>

                {/* Gamified Habit Chips (Clickable -> maps to achievements) */}
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => onNavigate('achievement')}
                        title="Click to view streak milestones"
                        className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-amber-100/70 transition active:scale-95"
                    >
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                        <span>{user.streak}-Day Streak!</span>
                    </div>
                    <div
                        onClick={() => onNavigate('achievement')}
                        title="Click to view points & badges"
                        className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-indigo-100/70 transition active:scale-95"
                    >
                        <Trophy className="w-4 h-4 text-indigo-500" />
                        <span>{user.points} XP</span>
                    </div>
                </div>
            </div>

            {/* 2. Priority AI Action Card (Clickable -> maps to question generator drill) */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        <span>Today's Recommended Move</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                        Fix Calculation Bottlenecks in {user.weakestTopic}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                        Your recent practice tests flagged a <strong>48% accuracy</strong> on numeric conversions. Take a quick 5-question targeted drill to level up your score.
                    </p>
                </div>

                <button
                    onClick={() => (onNavigateToDrill ? onNavigateToDrill(user.weakestDimension) : onNavigate('generator'))}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition active:scale-95 shrink-0"
                >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start 5-Min Drill Now</span>
                </button>
            </div>

            {/* 3. Four Vital Metric Cards (Clickable -> maps to corresponding modules) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* GPA -> Achievement Module */}
                <div
                    onClick={() => onNavigate('achievement')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-95"
                    title="Click to view academic transcript"
                >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Projected GPA</span>
                        <Award className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{user.projectedGpa}</div>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Top 15% in Cohort
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                    </p>
                </div>

                {/* Questions Solved -> Performance History */}
                <div
                    onClick={() => onNavigate('performance')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-95"
                    title="Click to view full practice log"
                >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Questions Solved</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{user.solvedCount} Questions</div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                        <span>Across 5 practice rounds</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                    </p>
                </div>

                {/* Weakest Skill -> AI Question Generator Drill */}
                <div
                    onClick={() => (onNavigateToDrill ? onNavigateToDrill('Calculation') : onNavigate('generator'))}
                    className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm hover:border-rose-400 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-95"
                    title="Click to drill this weakness"
                >
                    <div className="flex items-center justify-between text-rose-500 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Weakest Skill</span>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-rose-600">Calculation (48%)</div>
                    <p className="text-[11px] font-bold text-rose-600 mt-2 flex items-center justify-between">
                        <span>Needs revision • Practice now</span>
                        <Play className="w-3 h-3 fill-rose-600" />
                    </p>
                </div>

                {/* Strongest Skill -> Performance Radar */}
                <div
                    onClick={() => onNavigate('performance')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-95"
                    title="Click to view cognitive radar"
                >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Strongest Skill</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600">Language (90%)</div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                        <span>Exam ready & mastered</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                    </p>
                </div>
            </div>

            {/* 4. Quick Portal Launchpad (Clickable -> maps to all core modules) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900">Explore System Modules</h3>
                    <span className="text-xs text-slate-400">Click any card to jump straight in</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <div
                                key={action.title}
                                onClick={() => onNavigate(action.tab)}
                                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all duration-200 hover:-translate-y-1 group active:scale-95 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-md shadow-slate-200`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                                            {action.badge}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-sm">
                                        {action.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {action.desc}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                                    <span>Open Module</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 5. Motivational Tip & Mapping Link */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                        <strong>Study Tip:</strong> Solving just 3 questions a day retains 80% more concept clarity than cramming before finals.
                    </span>
                </div>
                <button
                    onClick={() => onNavigate('performance')}
                    className="text-blue-600 font-bold hover:underline shrink-0 text-left sm:text-right"
                >
                    Inspect My Performance Report ➔
                </button>
            </div>
        </div>
    );
}