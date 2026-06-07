/**
 * Define data models and pre-seeded companion resources for RAMSWORKDAY
 */

export interface WorkLog {
  date: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "Monday, Jun 8, 2026"
  morningIn: string | null; // HH:MM:SS AM/PM or ISO
  morningOut: string | null;
  afternoonIn: string | null;
  afternoonOut: string | null;
  morningLateMsg?: string;
  afternoonLateMsg?: string;
  isCompleted: boolean;
}

export interface DevotionalItem {
  motivation: string;
  bibleVerse: string;
  prayer: string;
}

export interface TrackConfig {
  id: string;
  title: string;
  description: string;
  type: "ambient" | "sound" | "synth";
  frequency?: number;
  waveType?: "sine" | "triangle" | "sawtooth";
  subWave?: string;
}

// Rich seed databases for robust offline functionality
export const FALLBACK_INSPIRATIONS: DevotionalItem[] = [
  {
    motivation: "Excellence is not a singular act, but a habit. Keep pushing forward with clarity and dedication today.",
    bibleVerse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters. — Colossians 3:23",
    prayer: "Heavenly Father, Grant me a calm heart and clear focus. Guide my hands to produce exceptional work, and shield my mind from stress as I handle today's tasks."
  },
  {
    motivation: "Do not let what you cannot do interfere with what you can accomplish. Step by step, victory is built.",
    bibleVerse: "Commit to the Lord whatever you do, and he will establish your plans. — Proverbs 16:3",
    prayer: "Lord, I offer my day's labor to You. May Your wisdom steer my decisions, and Your grace guide my collaborations with my teammates today."
  },
  {
    motivation: "Your energy is a precious resource. Direct it toward building, supporting, and solving matters with high purpose.",
    bibleVerse: "Let the favor of the Lord our God be upon us, and establish the work of our hands! — Psalm 90:17",
    prayer: "Sovereign Lord, fill my space with quiet joy today. Dispel any anxiety about workload, and show me how to represent kindness and energy to my colleagues."
  },
  {
    motivation: "Hard work beats talent when talent fails to work hard. Bring your absolute best version to this hours.",
    bibleVerse: "But as for you, be strong and do not give up, for your work will be rewarded. — 2 Chronicles 15:7",
    prayer: "Dear God, instill in me a spirit of persistence. When fatigue sets in during the afternoon, renew my strength and let me finish my shift with integrity."
  },
  {
    motivation: "Peace comes from knowing you did your best to improve someone's life or solve a complex problem.",
    bibleVerse: "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future. — Jeremiah 29:11",
    prayer: "Father, protect my peace of mind. Help me organize my time carefully so that I observe my breaks and maintain perfect harmony between work and rest."
  },
  {
    motivation: "The only limit to our realization of tomorrow is our doubts of today. Work with absolute courage.",
    bibleVerse: "The Lord will command the blessing on you in your storehouses and in all to which you set your hand. — Deuteronomy 28:8",
    prayer: "Lord Jesus, I thank You for the gift of employment and technology. Let my speech be encouraging, my analysis be accurate, and my spirit remain bright."
  }
];

export const AMBIENT_TRACKS: TrackConfig[] = [
  {
    id: "generator-morning",
    title: "Golden Hour Pulse",
    description: "Generative warming ambient synth loop designed to trigger creative brainwaves and focus.",
    type: "synth",
    frequency: 144, // d chord root
    waveType: "triangle"
  },
  {
    id: "generator-peace",
    title: "Tranquil Garden Drones",
    description: "Deep, soothing ocean-like pad synth that calms working stress and releases mental tension.",
    type: "synth",
    frequency: 110, // A chord root
    waveType: "sine"
  },
  {
    id: "generator-afternoon",
    title: "Afternoon Focus Bell",
    description: "Gentle shimmering synth chime generator designed to combat afternoon laziness.",
    type: "synth",
    frequency: 220, // A high chord root
    waveType: "sine"
  },
  {
    id: "generator-solace",
    title: "Selah Sanctuary",
    description: "A highly tranquil, echoing resonant acoustic wave that eases continuous screen work.",
    type: "synth",
    frequency: 196, // G chord
    waveType: "triangle"
  }
];
