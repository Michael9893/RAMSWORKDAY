import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Sparkles, Music2 } from "lucide-react";
import { AMBIENT_TRACKS, TrackConfig } from "../types";
import { ambientSynth } from "../utils/audio";

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackConfig>(AMBIENT_TRACKS[0]);
  const [volume, setVolume] = useState(0.4); // 0 to 1
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  // Synchronize play state and track specs
  useEffect(() => {
    if (isPlaying) {
      ambientSynth.start(currentTrack.frequency || 110, currentTrack.waveType || "sine");
      ambientSynth.setVolume(volume);
    } else {
      ambientSynth.stop();
    }
    return () => {
      ambientSynth.stop();
    };
  }, [isPlaying, currentTrack]);

  // Synchronize volume
  useEffect(() => {
    ambientSynth.setVolume(volume);
  }, [volume]);

  // Render a visual responsive wave when playing, to give a beautiful tactile screen presence
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localPhase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.lineWidth = 2;
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.15)"); // Emerald green 1
      gradient.addColorStop(0.5, "rgba(52, 211, 153, 0.8)"); // Vibrant green mid
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.15)"); // Emerald green 2
      ctx.strokeStyle = gradient;

      if (isPlaying) {
        localPhase += 0.05;
        // Draw 3 layers of harmonic sine waves moving horizontally
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          ctx.lineWidth = layer === 1 ? 2.5 : 1;
          ctx.strokeStyle = layer === 1 ? "rgba(16, 185, 129, 0.7)" : `rgba(16, 185, 129, ${0.15 + layer * 0.1})`;
          
          const amp = (layer === 1 ? 14 : 8) * (volume + 0.2); // adaptive amplitude based on volume
          const freqMultiplier = 0.015 + layer * 0.005;

          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * freqMultiplier + localPhase * (1 - layer * 0.2)) * amp;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      } else {
        // Draw a silent straight line that pulses quietly
        ctx.beginPath();
        ctx.strokeStyle = "rgba(168, 162, 158, 0.3)";
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, volume]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTrackChange = (track: TrackConfig) => {
    setCurrentTrack(track);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const playInteractiveChime = () => {
    ambientSynth.playChime("success");
  };

  return (
    <div id="ambient-player-card" className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <Music2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-stone-900 tracking-tight">RAMSWORKDAY Ambient</h3>
            <p className="text-xs text-stone-500 font-sans">Generative soundscapes for deep concentration</p>
          </div>
        </div>
        <button
          onClick={playInteractiveChime}
          className="text-xs px-3 py-1.5 bg-stone-50 font-medium rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center gap-1"
          title="Play a test chime to calm the mind"
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-500" />
          Calm Bell
        </button>
      </div>

      {/* Dynamic Soundwave Feedback Canvas */}
      <div className="relative h-14 bg-stone-50 rounded-xl overflow-hidden border border-stone-100/50 flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={56} className="w-full h-full block" />
        <span className="absolute right-3 bottom-2 text-[9px] font-mono tracking-wider uppercase text-stone-400">
          {isPlaying ? `Synthesizing Wave... ${currentTrack.waveType}` : "Silent"}
        </span>
      </div>

      {/* Tracks Grid Selector */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {AMBIENT_TRACKS.map((track) => {
          const isActive = currentTrack.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-emerald-50/75 border-emerald-200 shadow-xs ring-1 ring-emerald-500/15"
                  : "bg-stone-50/50 hover:bg-stone-50 border-stone-100/80 hover:border-stone-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-xs font-semibold tracking-tight transition-colors ${isActive ? "text-emerald-800" : "text-stone-800"}`}>
                  {track.title}
                </span>
                {isActive && isPlaying && (
                  <div className="flex items-center gap-0.5 h-2">
                    <span className="w-0.5 h-full bg-emerald-500 rounded-sm animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 h-1.5 bg-emerald-500 rounded-sm animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-2 bg-emerald-500 rounded-sm animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-stone-500 leading-normal line-clamp-2">
                {track.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Play Slider Controls */}
      <div className="flex items-center gap-4 bg-stone-50/70 p-4 rounded-xl border border-stone-100/80 mt-1">
        <button
          onClick={togglePlayback}
          className={`p-3.5 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-red-500 text-white shadow-md hover:bg-red-600 scale-102"
              : "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 scale-102"
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-stone-700">
              {isPlaying ? currentTrack.title : "Ready to play"}
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {Math.round(volume * 100)}% Volume
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-stone-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-1 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
