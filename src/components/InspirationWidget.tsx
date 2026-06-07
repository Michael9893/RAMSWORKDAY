import React, { useState } from "react";
import { Sparkles, RefreshCw, Quote, Heart, Compass, Loader2 } from "lucide-react";
import { FALLBACK_INSPIRATIONS, DevotionalItem } from "../types";

interface InspirationWidgetProps {
  userName?: string;
}

export default function InspirationWidget({ userName = "Workmate" }: InspirationWidgetProps) {
  // Pick first seed item as initial state
  const [item, setItem] = useState<DevotionalItem>(FALLBACK_INSPIRATIONS[0]);
  const [mood, setMood] = useState<string>("peaceful");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Randomize from fallback seed database instantly
  const handleShuffleFallback = () => {
    setErrorMsg(null);
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * FALLBACK_INSPIRATIONS.length);
    } while (FALLBACK_INSPIRATIONS[randomIndex].motivation === item.motivation && FALLBACK_INSPIRATIONS.length > 1);
    
    setItem(FALLBACK_INSPIRATIONS[randomIndex]);
  };

  // Generate dynamic inspiration utilizing our server-side Gemini Proxy API
  const handleGenerateAI = async (selectedMood: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, userName }),
      });

      if (!res.ok) {
        throw new Error("API responded with an error, using local resources instead.");
      }

      const data = await res.json();
      if (data.useFallback || data.error) {
        // Safe graceful resolution to seeded content if API keys aren't added yet
        console.log("No dynamic key or server failure, resorting back to beautiful fallbacks");
        handleShuffleFallback();
        setErrorMsg("Gemini API key is unconfigured. Retrieved high-quality offline inspirational assets instead!");
        setTimeout(() => setErrorMsg(null), 6000);
      } else {
        setItem({
          motivation: data.motivation || "Success is built detail by detail. Enjoy your work!",
          bibleVerse: data.bibleVerse || "Be strong and courageous. Do not be afraid. — Joshua 1:9",
          prayer: data.prayer || "Dear God, fill my mind with focus and tranquility to handle my tasks. Amen."
        });
      }
    } catch (err: any) {
      console.warn("Retrying with preloaded offline content:", err);
      handleShuffleFallback();
      setErrorMsg("Dynamic fetch failed. Loaded seeded offline inspiration smoothly.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const moodsList = [
    { id: "energetic", label: "🔥 Energized", val: "High energy, peak production focus" },
    { id: "weary", label: "🥱 Weary/Fatigued", val: "Tiredness, requesting physical and mental endurance" },
    { id: "anxious", label: "😰 Under Pressure", val: "Stressed about timing or difficult analysis problems" },
    { id: "prayerful", label: "🙏 Devotional", val: "Deep gratitude, peace, and loving-kindness" },
  ];

  return (
    <div id="inspiration-card" className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-stone-900 tracking-tight">Daily Devotional Guide</h3>
            <p className="text-xs text-stone-500 font-sans">Quotes, Bible verses, and prayers for RAMS</p>
          </div>
        </div>
        
        <button
          onClick={handleShuffleFallback}
          disabled={loading}
          className="p-1.5 hover:bg-stone-50 text-stone-500 hover:text-stone-800 rounded-lg border border-stone-200 transition-colors cursor-pointer"
          title="Shuffle from seeded treasures"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Encouragement Display Grid */}
      <div className="space-y-4">
        {/* Quote Block */}
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/30 flex gap-3 relative">
          <Quote className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 opacity-60" />
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700/80 block mb-1">
              Workplace Motivation
            </span>
            <p className="text-stone-800 text-xs md:text-sm leading-relaxed font-sans font-medium">
              "{item.motivation}"
            </p>
          </div>
        </div>

        {/* Bible Verse Block */}
        <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/30 flex gap-3 relative">
          <Heart className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 opacity-60" />
          <div className="flex-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800 block mb-1">
              Bible Verse Of Comfort
            </span>
            <p className="text-stone-800 text-xs md:text-sm leading-relaxed italic font-sans font-medium">
              "{item.bibleVerse.split("—")[0].trim()}"
            </p>
            {item.bibleVerse.includes("—") && (
              <p className="text-[10px] font-mono text-emerald-800 font-semibold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
                {item.bibleVerse.substring(item.bibleVerse.lastIndexOf("—") + 1).trim()}
              </p>
            )}
          </div>
        </div>

        {/* Daily Prayer Block */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100/80 flex gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 opacity-60" />
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-700 block mb-1">
              Shift Prayer
            </span>
            <p className="text-stone-700 text-xs md:text-sm leading-relaxed font-sans font-medium">
              {item.prayer}
            </p>
          </div>
        </div>
      </div>

      {/* Error feedback, if any (graceful alerts) */}
      {errorMsg && (
        <div className="text-[10px] font-medium text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
          💡 {errorMsg}
        </div>
      )}

      {/* AI Inspiration Mood controls */}
      <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-stone-700">Guide the Devotional Mode:</span>
          <span className="text-[10px] font-mono text-stone-400">Powered by Gemini AI</span>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 md:flex md:flex-wrap md:gap-2">
          {moodsList.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMood(m.id);
                  handleGenerateAI(m.val);
                }}
                disabled={loading}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex-1 text-center cursor-pointer ${
                  isSelected
                    ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/80 hover:border-stone-300"
                }`}
              >
                {loading && isSelected ? (
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Seeking...
                  </span>
                ) : (
                  m.label
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
