import React, { useState, useEffect } from 'react';
import './game-theme.css';
import RankUpModal from './components/RankUpModal';
import SeasonSetupModal from './components/SeasonSetupModal';
import FrontPage from './components/FrontPage';
import DashboardOverview from './components/DashboardOverview';
import BattleStatsReport from './components/BattleStatsReport';
import QuestionGenerator from './components/QuestionGenerator';
import AcademicRecords from './components/AcademicRecords';
import SettingsTab from './components/SettingsTab';
import Registration from './components/Registration';
import GameShell from './components/GameShell';
import AdminPanel from './components/AdminPanel';
import {
  LayoutDashboard,
  Database,
  Swords,
  Trophy,
  Settings,
  FolderPlus
} from 'lucide-react';

export function OfficialLogo({
  variant = 'full',
  size = 'md',
  className = '',
  imgClassName = ''
}) {
  const logoSrc = '/logo.png'; // Place your renamed logo inside public/logo.png

  const sizeClasses = {
    sm: 'h-9',
    md: 'h-11 md:h-12',         // Compact size for GameShell & AdminPanel HUD
    lg: 'h-24 sm:h-28 md:h-32', // Large size for Front Page
    xl: 'h-44 sm:h-52 md:h-56'  // Extra-large centerpiece for Loading Screen
  };

  if (variant === 'icon-only') {
    return (
      <div className={`relative overflow-hidden w-10 h-10 ${className}`}>
        <img
          src={logoSrc}
          alt="Clutchup Arena Icon"
          className="w-full h-full object-contain"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoSrc}
        alt="Clutchup Arena Logo"
        className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain drop-shadow-[0_8px_20px_rgba(216,184,120,0.3)] ${imgClassName}`}
        style={{ imageRendering: '-webkit-optimize-contrast' }}
      />
    </div>
  );
}

export function RankCrest({ tierName = 'Warrior', size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32 md:w-36 md:h-36'
  };

  const rankImages = {
    Warrior: '/ranks/warrior.png',
    Elite: '/ranks/elite.png',
    Master: '/ranks/master.png',
    Grandmaster: '/ranks/grandmaster.png',
    Epic: '/ranks/epic.png',
    Legend: '/ranks/legend.png',
    Mythic: '/ranks/mythic.png',
  };

  useEffect(() => {
    setImgError(false);
  }, [tierName]);

  const imgSrc = rankImages[tierName] || rankImages.Warrior;

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center shrink-0 select-none relative`}
      title={`${tierName} Rank`}
    >
      {!imgError ? (
        <img
          src={imgSrc}
          alt={`${tierName} Rank Crest`}
          onError={() => setImgError(true)}
          draggable={false}
          decoding="async"
          style={{
            imageRendering: '-webkit-optimize-contrast',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
          className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-md border border-blue-400/40">
          {tierName.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

const SYSTEM_CONFIG_KEY = 'academiu_system_config';

export const DEFAULT_SYSTEM_CONFIG = {
  tiers: [
    { name: 'Warrior', accent: 'text-amber-800', badgeBg: 'bg-amber-100 border-amber-300', min: 0 },
    { name: 'Elite', accent: 'text-slate-700', badgeBg: 'bg-slate-100 border-slate-300', min: 15 },
    { name: 'Master', accent: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-300', min: 30 },
    { name: 'Grandmaster', accent: 'text-sky-700', badgeBg: 'bg-sky-50 border-sky-300', min: 45 },
    { name: 'Epic', accent: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-300', min: 60 },
    { name: 'Legend', accent: 'text-orange-700', badgeBg: 'bg-orange-50 border-orange-300', min: 75 },
    { name: 'Mythic', accent: 'text-purple-700', badgeBg: 'bg-purple-50 border-purple-300', min: 100 }
  ],
  passTarget: 60,
  winStreakTrigger: 5,
  lossStreakTrigger: 2,
  minQuestions: 10,
  countdownMinutes: 5,
  announcement: '',
  maintenanceMode: false
};

const loadSystemConfig = () => {
  try {
    const raw = localStorage.getItem(SYSTEM_CONFIG_KEY);
    if (!raw) return DEFAULT_SYSTEM_CONFIG;
    return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SYSTEM_CONFIG;
  }
};

const getRankInfo = (stars, tiers = DEFAULT_SYSTEM_CONFIG.tiers) => {
  let currentTier = tiers[0];
  let nextTier = tiers[1];
  for (let i = 0; i < tiers.length; i++) {
    if (stars >= tiers[i].min) {
      currentTier = tiers[i];
      nextTier = tiers[i + 1] || null;
    }
  }

  const starsInTier = stars - currentTier.min;
  const starsNeeded = nextTier ? nextTier.min - currentTier.min : 0;
  const progressPct = nextTier
    ? Math.min(100, Math.round((starsInTier / starsNeeded) * 100))
    : 100;

  return {
    currentTier,
    nextTier,
    starsInTier,
    starsNeeded,
    progressPct,
    totalStars: stars,
    allTiers: tiers
  };
};

export const getSeasonDurationParts = (season) => {
  if (!season) return { years: 0, months: 0 };
  if (season.durationYears !== undefined || season.durationMonths !== undefined) {
    return {
      years: Number(season.durationYears) || 0,
      months: Number(season.durationMonths) || 0
    };
  }
  const val = Number(season.durationValue) || 0;
  if (season.durationUnit === 'Years') return { years: val, months: 0 };
  return { years: 0, months: val };
};

export const formatSeasonDuration = (season) => {
  const { years, months } = getSeasonDurationParts(season);
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
  return parts.length > 0 ? parts.join(' ') : '0 Months';
};

const DEFAULT_SUBJECT_FOLDERS = [
  { id: 'SUB-1', name: 'Data Comm & Networking' },
  { id: 'SUB-2', name: 'Database Systems' },
  { id: 'SUB-3', name: 'Data Structures' },
  { id: 'SUB-4', name: 'Workshop 2' },
];

const DEFAULT_DRILL_FILES = [
  {
    id: 'DRILL-104',
    date: '19 Nov 2026',
    topic: 'Data Comm & Networking',
    subtopic: 'Subnet Masking & IP Arithmetic',
    fileName: 'Chapter4_Subnetting_Notes.pdf',
    format: 'MCQ',
    correct: 3,
    total: 5,
    score: 60,
    starsEarned: 1,
    timeSpent: '04:12',
    note: 'Passed 60% target. Review /26 and /28 host calculations.',
    questions: [
      { id: 1, question: '[Subnet Masking & IP Arithmetic] Which subnet mask corresponds to a /26 prefix?', options: ['255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.240'], answer: '255.255.255.192', explanation: '/26 uses 2 bits in the fourth octet (128 + 64 = 192).' },
      { id: 2, question: '[Subnet Masking & IP Arithmetic] How many usable host addresses are in a /26 subnet?', options: ['30', '62', '64', '126'], answer: '62', explanation: '2^6 - 2 = 62 usable host addresses.' },
      { id: 3, question: '[Subnet Masking & IP Arithmetic] Which layer of the OSI model handles IP routing?', options: ['Data Link', 'Network', 'Transport', 'Session'], answer: 'Network', explanation: 'Layer 3 (Network Layer) manages logical IP addressing and routing.' },
      { id: 4, question: '[Subnet Masking & IP Arithmetic] How many bits are in an IPv4 address?', options: ['16', '32', '64', '128'], answer: '32', explanation: 'IPv4 consists of 4 octets = 32 bits.' },
      { id: 5, question: '[Subnet Masking & IP Arithmetic] What is the Transport Layer PDU called?', options: ['Frame', 'Packet', 'Segment', 'Bit'], answer: 'Segment', explanation: 'Layer 4 encapsulates data into TCP/UDP Segments.' }
    ]
  },
  {
    id: 'DRILL-103',
    date: '17 Nov 2026',
    topic: 'Database Systems',
    subtopic: '3NF Normalization & B-Trees',
    fileName: 'DB_Normalization_Slides.pptx',
    format: 'Fill-in-the-Blank',
    correct: 5,
    total: 5,
    score: 100,
    starsEarned: 3,
    timeSpent: '03:10',
    note: 'Perfect 100% score! Earned 3 Stars.',
    questions: [
      { id: 1, question: 'Which normal form removes transitive dependencies? (1NF, 2NF, or 3NF)', answer: '3NF', explanation: 'Third Normal Form (3NF) eliminates transitive dependency.' },
      { id: 2, question: 'What is the lookup time complexity of a balanced B-Tree in Big-O?', answer: 'O(log n)', explanation: 'B-Tree indexing keeps searches balanced at O(log n).' },
      { id: 3, question: 'Which key uniquely identifies each row in a relational table? (Two words)', answer: 'Primary Key', explanation: 'A Primary Key uniquely identifies every record.' },
      { id: 4, question: 'Which SQL command retrieves data from a table?', answer: 'SELECT', explanation: 'SELECT queries records from database tables.' },
      { id: 5, question: 'Does 2NF eliminate partial dependencies? (Yes or No)', answer: 'Yes', explanation: 'Second Normal Form (2NF) removes partial dependencies on composite keys.' }
    ]
  },
  {
    id: 'DRILL-102',
    date: '14 Nov 2026',
    topic: 'Data Structures',
    subtopic: 'Recurrence Relations & Master Method',
    fileName: 'Algo_Week5_MasterTheorem.pdf',
    format: 'MCQ',
    correct: 2,
    total: 5,
    score: 40,
    starsEarned: 0,
    timeSpent: '05:40',
    note: 'Weak subtopic! Practice Master Theorem Case 2 again.',
    questions: [
      { id: 1, question: '[Master Method] For T(n) = 2T(n/2) + n, what is the asymptotic bound?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], answer: 'O(n log n)', explanation: 'Case 2 applies when a = 2, b = 2, f(n) = n => O(n log n).' },
      { id: 2, question: '[Master Method] What is the time complexity of binary search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 'O(log n)', explanation: 'Binary search halves the input size every iteration.' },
      { id: 3, question: '[Master Method] Which data structure follows LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Heap'], answer: 'Stack', explanation: 'A Stack is Last-In, First-Out (LIFO).' },
      { id: 4, question: '[Master Method] What is the worst-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], answer: 'O(n^2)', explanation: 'Unbalanced partitions lead to O(n^2) worst-case runtime.' },
      { id: 5, question: '[Master Method] Which traversal visits Left, Root, Right?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], answer: 'In-order', explanation: 'In-order traversal visits Left subtree, Root, then Right subtree.' }
    ]
  }
];

const SESSION_USER_KEY = 'academiu_active_user';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Admin System Config & Mode
  const [systemConfig, setSystemConfig] = useState(loadSystemConfig);
  const [adminViewMode, setAdminViewMode] = useState('admin'); // 'admin' | 'student'

  // Core Data + Season System
  const [currentSeason, setCurrentSeason] = useState(null);
  const [archivedSeasons, setArchivedSeasons] = useState([]);
  const [showNewSeasonModal, setShowNewSeasonModal] = useState(false);

  const [registeredSubjects, setRegisteredSubjects] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [winStreak, setWinStreak] = useState(0);   // Consecutive 3-star (100%) drills
  const [lossStreak, setLossStreak] = useState(0); // Consecutive 0-star (<passTarget) drills

  const [replayDrillFile, setReplayDrillFile] = useState(null);
  const [rankUpData, setRankUpData] = useState(null);

  useEffect(() => {
    const savedUserRaw = localStorage.getItem(SESSION_USER_KEY);
    if (savedUserRaw) {
      try {
        const savedUser = JSON.parse(savedUserRaw);
        const currentCfg = loadSystemConfig();
        if (currentCfg.maintenanceMode && savedUser?.role !== 'admin') {
          localStorage.removeItem(SESSION_USER_KEY);
          return;
        }
        if (savedUser && !savedUser.isGuest && savedUser.email) {
          loadAccountProgress(savedUser);
          setAdminViewMode('admin');
          setIsAuthenticated(true);
          setDashboardReady(true);
        }
      } catch {
        localStorage.removeItem(SESSION_USER_KEY);
      }
    }
  }, []);

  const handleUpdateSystemConfig = (nextConfig) => {
    setSystemConfig(nextConfig);
    localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(nextConfig));
  };

  const persistAccountData = (email, data) => {
    if (!email) return;
    localStorage.setItem(`academiu_progress_${email}`, JSON.stringify(data));
  };

  const saveAll = (overrides = {}) => {
    if (!currentUser || currentUser.isGuest || !currentUser.email) return;
    persistAccountData(currentUser.email, {
      totalStars: overrides.totalStars ?? totalStars,
      winStreak: overrides.winStreak ?? winStreak,
      lossStreak: overrides.lossStreak ?? lossStreak,
      matchHistory: overrides.matchHistory ?? matchHistory,
      registeredSubjects: overrides.registeredSubjects ?? registeredSubjects,
      currentSeason: overrides.currentSeason !== undefined ? overrides.currentSeason : currentSeason,
      archivedSeasons: overrides.archivedSeasons ?? archivedSeasons
    });
  };

  const loadAccountProgress = (userData) => {
    const storageKey = `academiu_progress_${userData.email}`;
    const savedRaw = localStorage.getItem(storageKey);

    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        setTotalStars(parsed.totalStars ?? 24);
        setWinStreak(parsed.winStreak ?? 0);
        setLossStreak(parsed.lossStreak ?? 0);
        setMatchHistory(parsed.matchHistory ?? DEFAULT_DRILL_FILES);
        setRegisteredSubjects(parsed.registeredSubjects ?? DEFAULT_SUBJECT_FOLDERS);
        setCurrentSeason(parsed.currentSeason ?? null);
        setArchivedSeasons(parsed.archivedSeasons ?? []);
      } catch {
        setTotalStars(24);
        setWinStreak(0);
        setLossStreak(0);
        setMatchHistory(DEFAULT_DRILL_FILES);
        setRegisteredSubjects(DEFAULT_SUBJECT_FOLDERS);
        setCurrentSeason(null);
        setArchivedSeasons([]);
      }
    } else {
      const initial = {
        totalStars: 24,
        winStreak: 0,
        lossStreak: 0,
        matchHistory: DEFAULT_DRILL_FILES,
        registeredSubjects: DEFAULT_SUBJECT_FOLDERS,
        currentSeason: null,
        archivedSeasons: []
      };
      persistAccountData(userData.email, initial);
      setTotalStars(24);
      setWinStreak(0);
      setLossStreak(0);
      setMatchHistory(DEFAULT_DRILL_FILES);
      setRegisteredSubjects(DEFAULT_SUBJECT_FOLDERS);
      setCurrentSeason(null);
      setArchivedSeasons([]);
    }

    setCurrentUser(userData);
  };

  const rankInfo = getRankInfo(totalStars, systemConfig.tiers);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registration', label: 'Subject Folders', icon: FolderPlus },
    { id: 'generator', label: 'Question Generator', icon: Swords },
    { id: 'records', label: 'Academic Records', icon: Database },
    { id: 'stats', label: 'Progress & Rank Report', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleEnterApp = (userData) => {
    if (systemConfig.maintenanceMode && userData.role !== 'admin') {
      return;
    }

    if (userData.isGuest) {
      const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      localStorage.removeItem(SESSION_USER_KEY);
      setCurrentUser(userData);
      setTotalStars(14);
      setWinStreak(0);
      setLossStreak(0);
      setMatchHistory([]);
      setRegisteredSubjects([]);
      setArchivedSeasons([]);
      // Guests skip onboarding and enter directly with a temporary season
      setCurrentSeason({
        id: 'SEASON-GUEST',
        name: 'Guest Session',
        durationYears: 0,
        durationMonths: 1,
        createdAt: today
      });
    } else {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
      loadAccountProgress(userData);
    }

    setAdminViewMode('admin');
    setTabHistory([]);
    setIsTransitioning(true);
    setLoadingProgress(15);
    setDashboardReady(false);

    setTimeout(() => setLoadingProgress(65), 500);
    setTimeout(() => setLoadingProgress(100), 1300);

    setTimeout(() => {
      setActiveTab('dashboard');
      setIsAuthenticated(true);
      setIsTransitioning(false);
      setLoadingProgress(0);
      setTimeout(() => setDashboardReady(true), 80);
    }, 1800);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_USER_KEY);
    setDashboardReady(false);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminViewMode('admin');
    setTotalStars(0);
    setWinStreak(0);
    setLossStreak(0);
    setMatchHistory([]);
    setRegisteredSubjects([]);
    setCurrentSeason(null);
    setArchivedSeasons([]);
    setShowNewSeasonModal(false);
    setReplayDrillFile(null);
    setTabHistory([]);
    setActiveTab('dashboard');
  };

  // Create initial season OR archive current season & reset everything for a new one
  const handleCreateSeason = ({ name, durationYears, durationMonths }) => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const newSeason = {
      id: `SEASON-${Date.now()}`,
      name,
      durationYears: Number(durationYears) || 0,
      durationMonths: Number(durationMonths) || 0,
      createdAt: today
    };

    if (currentSeason) {
      const archivedEntry = {
        ...currentSeason,
        endedAt: today,
        finalStars: totalStars,
        finalTier: getRankInfo(totalStars, systemConfig.tiers).currentTier.name,
        registeredSubjects,
        matchHistory
      };

      const updatedArchived = [archivedEntry, ...archivedSeasons];
      setArchivedSeasons(updatedArchived);
      setCurrentSeason(newSeason);
      setTotalStars(0);
      setWinStreak(0);
      setLossStreak(0);
      setRegisteredSubjects([]);
      setMatchHistory([]);
      setReplayDrillFile(null);
      setTabHistory([]);
      setShowNewSeasonModal(false);

      saveAll({
        currentSeason: newSeason,
        archivedSeasons: updatedArchived,
        totalStars: 0,
        winStreak: 0,
        lossStreak: 0,
        registeredSubjects: [],
        matchHistory: []
      });
    } else {
      // First-time onboarding season creation right after Sign In / Sign Up
      setCurrentSeason(newSeason);
      setShowNewSeasonModal(false);
      saveAll({ currentSeason: newSeason });
    }
  };

  const handleUpdateSeason = ({ name, durationYears, durationMonths }) => {
    const trimmed = name.trim();
    const years = Math.max(0, Number(durationYears) || 0);
    const months = Math.max(0, Number(durationMonths) || 0);
    if (!trimmed || (years === 0 && months === 0) || !currentSeason) return;

    const updatedSeason = {
      ...currentSeason,
      name: trimmed,
      durationYears: years,
      durationMonths: months
    };
    setCurrentSeason(updatedSeason);
    saveAll({ currentSeason: updatedSeason });
  };

  const handleDeleteArchivedSeason = (seasonId) => {
    const updatedArchived = archivedSeasons.filter((s) => s.id !== seasonId);
    setArchivedSeasons(updatedArchived);
    saveAll({ archivedSeasons: updatedArchived });
  };

  const handleAddSubjectFolder = (name) => {
    const newFolder = {
      id: `SUB-${Date.now()}`,
      name: name.trim()
    };
    const updatedSubjects = [...registeredSubjects, newFolder];
    setRegisteredSubjects(updatedSubjects);
    saveAll({ registeredSubjects: updatedSubjects });
  };

  const handleDeleteSubjectFolder = (id) => {
    const targetFolder = registeredSubjects.find((s) => s.id === id);
    const updatedSubjects = registeredSubjects.filter((s) => s.id !== id);
    const updatedHistory = targetFolder
      ? matchHistory.filter(
        (m) => m.topic.trim().toLowerCase() !== targetFolder.name.trim().toLowerCase()
      )
      : matchHistory;

    setRegisteredSubjects(updatedSubjects);
    setMatchHistory(updatedHistory);
    saveAll({ registeredSubjects: updatedSubjects, matchHistory: updatedHistory });
  };

  const handleRenameSubjectFolder = (id, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const targetFolder = registeredSubjects.find((s) => s.id === id);
    if (!targetFolder) return;

    const oldNameLower = targetFolder.name.trim().toLowerCase();
    const updatedSubjects = registeredSubjects.map((s) =>
      s.id === id ? { ...s, name: trimmedName } : s
    );
    const updatedHistory = matchHistory.map((m) =>
      m.topic.trim().toLowerCase() === oldNameLower ? { ...m, topic: trimmedName } : m
    );

    setRegisteredSubjects(updatedSubjects);
    setMatchHistory(updatedHistory);
    saveAll({ registeredSubjects: updatedSubjects, matchHistory: updatedHistory });
  };

  const handleCompleteDrill = (newMatch) => {
    const oldTierName = getRankInfo(totalStars, systemConfig.tiers).currentTier.name;
    const winTrigger = Number(systemConfig.winStreakTrigger) || 5;
    const lossTrigger = Number(systemConfig.lossStreakTrigger) || 2;

    let nextWinStreak = winStreak;
    let nextLossStreak = lossStreak;
    let starDelta = newMatch.starsEarned;
    let streakEvent = null;

    if (newMatch.starsEarned === 3) {
      // Full 3-star win
      nextWinStreak = winStreak + 1;
      nextLossStreak = 0;

      if (nextWinStreak >= winTrigger) {
        starDelta = newMatch.starsEarned * 2; // Double stars (+6★)
        streakEvent = `${winTrigger}+ Win Streak! Double Stars (+${starDelta} ★)`;
      }
    } else if (newMatch.starsEarned > 0) {
      // 1 or 2 stars: passed, resets both streaks
      nextWinStreak = 0;
      nextLossStreak = 0;
    } else {
      // 0 stars: loss
      nextWinStreak = 0;
      nextLossStreak = lossStreak + 1;

      if (nextLossStreak >= lossTrigger) {
        starDelta = -1; // Deduct 1 star
        nextLossStreak = 0; // Reset after penalty
        streakEvent = `${lossTrigger}-Loss Streak Penalty (-1 ★)`;
      }
    }

    const updatedStars = Math.max(0, totalStars + starDelta);
    const newTierName = getRankInfo(updatedStars, systemConfig.tiers).currentTier.name;

    const enrichedMatch = {
      ...newMatch,
      starDelta,
      streakEvent,
      note: streakEvent ? `${streakEvent} • ${newMatch.note}` : newMatch.note
    };

    const updatedHistory = [enrichedMatch, ...matchHistory];

    setWinStreak(nextWinStreak);
    setLossStreak(nextLossStreak);
    setTotalStars(updatedStars);
    setMatchHistory(updatedHistory);

    if (starDelta > 0 && oldTierName !== newTierName) {
      setRankUpData({
        oldTier: oldTierName,
        newTier: newTierName,
        starsEarned: starDelta,
        totalStars: updatedStars
      });
    }

    saveAll({
      totalStars: updatedStars,
      matchHistory: updatedHistory,
      winStreak: nextWinStreak,
      lossStreak: nextLossStreak
    });

    return enrichedMatch;
  };

  const handleDeleteDrillFile = (drillId) => {
    const updatedHistory = matchHistory.filter((m) => m.id !== drillId);
    setMatchHistory(updatedHistory);
    saveAll({ matchHistory: updatedHistory });
  };

  // Navigation History Controls
  const navigateToTab = (nextTab, { clearReplay = false } = {}) => {
    if (nextTab === activeTab) return;
    setTabHistory((prev) => [...prev, activeTab]);
    if (clearReplay) setReplayDrillFile(null);
    setActiveTab(nextTab);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const previousTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, -1));
      setReplayDrillFile(null);
      setActiveTab(previousTab);
    } else if (activeTab !== 'dashboard') {
      setReplayDrillFile(null);
      setActiveTab('dashboard');
    }
  };

  const handleReplaySavedFile = (drillFile) => {
    setReplayDrillFile(drillFile);
    navigateToTab('generator');
  };

  const handleSelectTab = (id) => {
    navigateToTab(id, { clearReplay: id === 'generator' });
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#09152E] overflow-hidden">
        <div
          className={`transition-all duration-700 ease-in-out ${isTransitioning
            ? 'opacity-0 scale-105 blur-sm pointer-events-none'
            : 'opacity-100 scale-100 blur-0'
            }`}
        >
          <FrontPage onEnterApp={handleEnterApp} systemConfig={systemConfig} />
        </div>

        {isTransitioning && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09152E]/95 backdrop-blur-md p-4">
            <div className="rounded-3xl bg-[#0D1F44]/90 border border-[#D8B878]/30 shadow-2xl flex flex-col items-center px-10 py-10 max-w-md w-full text-center">
              <div className="animate-pulse mb-3">
                <OfficialLogo variant="full" size="xl" />
              </div>
              <div className="mt-2 text-lg font-black text-[#FAF6EE] tracking-wide">
                Welcome, {currentUser?.name || 'Student'}
              </div>
              <div className="text-xs text-[#A9B8D6] mt-1 px-4 leading-relaxed">
                {currentUser?.role === 'admin'
                  ? 'Loading Admin Control Plane...'
                  : currentUser?.isGuest
                    ? 'Preparing your temporary arena...'
                    : `Loading your ${rankInfo.currentTier.name} rank & files...`}
              </div>

              <div className="mt-6 w-full max-w-[240px] bg-[#09152E] rounded-full overflow-hidden border border-[#D8B878]/20 h-2.5">
                <div
                  className="h-full bg-gradient-to-r from-[#F5D78E] to-[#D8B878] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B878] mt-3 block animate-pulse">
                Entering Arena...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isGuest = Boolean(currentUser?.isGuest);
  const isAdmin = currentUser?.role === 'admin';

  // Admin Control Plane View
  if (isAdmin && adminViewMode === 'admin') {
    return (
      <AdminPanel
        currentUser={currentUser}
        systemConfig={systemConfig}
        onUpdateConfig={handleUpdateSystemConfig}
        onSwitchToStudent={() => setAdminViewMode('student')}
        onLogout={handleLogout}
      />
    );
  }

  // Dedicated Season Setup step right after Sign In / Sign Up
  if (!isGuest && !currentSeason) {
    return (
      <div className="min-h-screen bg-[#09152E]">
        <SeasonSetupModal
          mode="onboarding"
          onCreateSeason={handleCreateSeason}
        />
      </div>
    );
  }

  return (
    <>
      <GameShell
        menuItems={menuItems}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        canGoBack={tabHistory.length > 0 || activeTab !== 'dashboard'}
        onGoBack={handleGoBack}
        rankInfo={rankInfo}
        currentUser={currentUser}
        isGuest={isGuest}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        dashboardReady={dashboardReady}
        onLogout={handleLogout}
        systemConfig={systemConfig}
        isAdminPreview={isAdmin}
        onReturnToAdmin={() => setAdminViewMode('admin')}
      >
        {activeTab === 'dashboard' && (
          <DashboardOverview
            user={currentUser}
            rankInfo={rankInfo}
            matchHistory={matchHistory}
            currentSeason={currentSeason}
            onUpdateSeason={handleUpdateSeason}
            onStartNewSeason={() => setShowNewSeasonModal(true)}
            onNavigate={(tab) => navigateToTab(tab)}
          />
        )}

        {activeTab === 'registration' && (
          <Registration
            registeredSubjects={registeredSubjects}
            matchHistory={matchHistory}
            onAddSubject={handleAddSubjectFolder}
            onDeleteSubject={handleDeleteSubjectFolder}
            onNavigate={(tab) => navigateToTab(tab)}
          />
        )}

        {activeTab === 'generator' && (
          <QuestionGenerator
            rankInfo={rankInfo}
            registeredSubjects={registeredSubjects}
            replayDrillFile={replayDrillFile}
            onClearReplay={() => setReplayDrillFile(null)}
            onCompleteDrill={handleCompleteDrill}
            onNavigate={(tab) => navigateToTab(tab)}
          />
        )}

        {activeTab === 'records' && (
          <AcademicRecords
            registeredSubjects={registeredSubjects}
            matchHistory={matchHistory}
            onReplayDrillFile={handleReplaySavedFile}
            onDeleteDrillFile={handleDeleteDrillFile}
            onDeleteSubjectFolder={handleDeleteSubjectFolder}
            onRenameSubjectFolder={handleDeleteSubjectFolder}
            onNavigate={(tab) => navigateToTab(tab)}
          />
        )}

        {activeTab === 'stats' && (
          <BattleStatsReport
            rankInfo={rankInfo}
            matchHistory={matchHistory}
            currentSeason={currentSeason}
            archivedSeasons={archivedSeasons}
            onDeleteArchivedSeason={handleDeleteArchivedSeason}
            onNavigate={(tab) => navigateToTab(tab)}
            onReplayDrillFile={handleReplaySavedFile}
            onDeleteDrillFile={handleDeleteDrillFile}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            user={currentUser}
            isGuest={isGuest}
            onRequireSignIn={handleLogout}
            onNavigate={(tab) => navigateToTab(tab)}
          />
        )}
      </GameShell>

      {/* Start New Season Modal (triggered from Dashboard) */}
      {currentSeason && showNewSeasonModal && (
        <SeasonSetupModal
          mode="new-season"
          currentSeason={currentSeason}
          onCreateSeason={handleCreateSeason}
          onClose={() => setShowNewSeasonModal(false)}
        />
      )}

      <RankUpModal
        rankUpData={rankUpData}
        onClose={() => setRankUpData(null)}
      />
    </>
  );
}