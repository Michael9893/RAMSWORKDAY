import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  AlertTriangle,
  Play,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Inbox,
  AlertCircle,
  HelpCircle,
  Bell,
  Sliders,
  Settings,
  Download,
  Printer,
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  X
} from "lucide-react";
import AmbientPlayer from "./components/AmbientPlayer";
import InspirationWidget from "./components/InspirationWidget";
import DswdRamsLogo from "./components/DswdRamsLogo";
import { WorkLog } from "./types";
import { ambientSynth } from "./utils/audio";

export default function App() {
  // Real-time state representing actual system clock
  const [currentRealTime, setCurrentRealTime] = useState<Date>(new Date());

  // Username
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("ramsworkday_username") || "Michael John";
  });

  // Keep username synchronized with localStorage
  useEffect(() => {
    localStorage.setItem("ramsworkday_username", userName);
  }, [userName]);

  // Notifications or banner messages
  const [notification, setNotification] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "break";
  } | null>(null);

  // RAMSWORKDAY Check click response state
  const [checkStatus, setCheckStatus] = useState<{
    message: string;
    status: "success" | "error" | "idle";
    checkedAt: string | null;
  }>({
    message: "No verification run conducted yet.",
    status: "idle",
    checkedAt: null,
  });

  // Time-in records stored in localStorage
  const [logs, setLogs] = useState<WorkLog[]>(() => {
    const saved = localStorage.getItem("ramsworkday_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local logs:", e);
      }
    }
    // Pre-populate with realistic mock logging history so the page doesn't look barren
    return [
      {
        date: "2026-06-01",
        dateLabel: "Monday, Jun 1, 2026",
        morningIn: "07:01:22 AM",
        morningOut: "12:00:05 PM",
        afternoonIn: "01:00:15 PM",
        afternoonOut: "06:01:10 PM",
        isCompleted: true,
      },
      {
        date: "2026-06-02",
        dateLabel: "Tuesday, Jun 2, 2026",
        morningIn: "07:08:44 AM",
        morningOut: "11:59:45 PM",
        afternoonIn: "01:02:10 PM",
        afternoonOut: "06:00:05 PM",
        morningLateMsg: "Late check-in at 07:08 AM (8 mins late)",
        isCompleted: true,
      },
      {
        date: "2026-06-03",
        dateLabel: "Wednesday, Jun 3, 2026",
        morningIn: "06:58:30 AM",
        morningOut: "12:02:11 PM",
        afternoonIn: "01:12:00 PM",
        afternoonOut: "06:00:15 PM",
        afternoonLateMsg: "Late check-in at 01:12 PM (12 mins late)",
        isCompleted: true,
      }
    ];
  });

  // Keep logs synchronized with localStorage
  useEffect(() => {
    localStorage.setItem("ramsworkday_logs", JSON.stringify(logs));
  }, [logs]);

  // --- LOG EDITING & ERASURES STATES ---
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [deleteConfirmDate, setDeleteConfirmDate] = useState<string | null>(null);
  const [editMIn, setEditMIn] = useState("");
  const [editMOut, setEditMOut] = useState("");
  const [editAIn, setEditAIn] = useState("");
  const [editAOut, setEditAOut] = useState("");
  const [editMorningLateMsg, setEditMorningLateMsg] = useState("");
  const [editAfternoonLateMsg, setEditAfternoonLateMsg] = useState("");

  const handleStartEdit = (log: WorkLog) => {
    setEditingLogDate(log.date);
    setEditMIn(log.morningIn || "");
    setEditMOut(log.morningOut || "");
    setEditAIn(log.afternoonIn || "");
    setEditAOut(log.afternoonOut || "");
    setEditMorningLateMsg(log.morningLateMsg || "");
    setEditAfternoonLateMsg(log.afternoonLateMsg || "");
  };

  const handleSaveEdit = (date: string) => {
    const updated = logs.map(l => {
      if (l.date === date) {
        return {
          ...l,
          morningIn: editMIn || null,
          morningOut: editMOut || null,
          afternoonIn: editAIn || null,
          afternoonOut: editAOut || null,
          morningLateMsg: editMorningLateMsg || undefined,
          afternoonLateMsg: editAfternoonLateMsg || undefined,
          isCompleted: !!(editMIn && editMOut && editAIn && editAOut)
        };
      }
      return l;
    });
    setLogs(updated);
    setEditingLogDate(null);
    ambientSynth.playChime("success");
    setNotification({
      text: "Log row corrected and saved in summary shift report successfully!",
      type: "success"
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Keep live system clock humming
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- DERIVE EFFECTIVE WORKSTATE MATTERS (REAL SYSTEM CLOCK) ---
  const getActiveDayOfWeek = (): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[currentRealTime.getDay()];
  };

  const getActiveTimeParts = (): { hours: number; minutes: number; seconds: number; formatted: string } => {
    const hours = currentRealTime.getHours();
    const minutes = currentRealTime.getMinutes();
    const seconds = currentRealTime.getSeconds();
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const padHours = String(displayHours).padStart(2, "0");
    const padMinutes = String(minutes).padStart(2, "0");
    const padSeconds = String(seconds).padStart(2, "0");
    return {
      hours,
      minutes,
      seconds,
      formatted: `${padHours}:${padMinutes}:${padSeconds} ${ampm}`
    };
  };

  const timeData = getActiveTimeParts();
  const todayDayName = getActiveDayOfWeek();
  const isShiftDay = ["Monday", "Tuesday", "Wednesday", "Thursday"].includes(todayDayName);

  // Today's YYYY-MM-DD key for persistent logs representation
  const getTodayDateKey = (): string => {
    const y = currentRealTime.getFullYear();
    const m = String(currentRealTime.getMonth() + 1).padStart(2, "0");
    const d = String(currentRealTime.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayKey = getTodayDateKey();
  const todayLabel = currentRealTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" });

  // Find or initialize today's work record
  const getTodayRecord = (): WorkLog => {
    const record = logs.find(l => l.date === todayKey);
    if (record) return record;
    return {
      date: todayKey,
      dateLabel: todayLabel,
      morningIn: null,
      morningOut: null,
      afternoonIn: null,
      afternoonOut: null,
      isCompleted: false
    };
  };

  const todayRecord = getTodayRecord();

  // --- 10-MINUTE NEAR TIME-IN REMINDER ---
  const [lastRemindedKey, setLastRemindedKey] = useState<string>("");

  useEffect(() => {
    const hours = currentRealTime.getHours();
    const minutes = currentRealTime.getMinutes();
    
    // Check if near Morning Time-In starting soon (06:30 AM to 06:59 AM)
    const isMorningNear = (hours === 6 && minutes >= 30);
    // Check if near Afternoon Time-In starting soon (12:30 PM to 12:59 PM)
    const isAfternoonNear = (hours === 12 && minutes >= 30);
    
    if (isMorningNear || isAfternoonNear) {
      if (minutes % 10 === 0) {
        const reminderKey = `${hours}-${minutes}`;
        if (lastRemindedKey !== reminderKey) {
          const isMorningTimeInLogged = !!todayRecord?.morningIn;
          const isAfternoonTimeInLogged = !!todayRecord?.afternoonIn;
          
          if (isMorningNear && !isMorningTimeInLogged) {
            setLastRemindedKey(reminderKey);
            ambientSynth.playChime("break-start");
            setNotification({
              text: `⏰ Attention: The Morning Time-In shift begins in ${60 - minutes} minutes. Please prepare to clock in!`,
              type: "warning"
            });
            setTimeout(() => setNotification(null), 8500);
          } else if (isAfternoonNear && !isAfternoonTimeInLogged) {
            setLastRemindedKey(reminderKey);
            ambientSynth.playChime("break-start");
            setNotification({
              text: `⏰ Attention: The Afternoon Time-In shift begins in ${60 - minutes} minutes. Please prepare to clock in!`,
              type: "warning"
            });
            setTimeout(() => setNotification(null), 8500);
          }
        }
      }
    }
  }, [currentRealTime, todayRecord, lastRemindedKey]);

  // Update specific field in today's log
  const saveTodayRecord = (updated: Partial<WorkLog>) => {
    const existing = logs.find(l => l.date === todayKey);
    if (existing) {
      const withUpdates = { ...existing, ...updated };
      // Check if complete
      if (withUpdates.morningIn && withUpdates.morningOut && withUpdates.afternoonIn && withUpdates.afternoonOut) {
        withUpdates.isCompleted = true;
      }
      setLogs(logs.map(l => l.date === todayKey ? withUpdates : l));
    } else {
      const newRec: WorkLog = {
        date: todayKey,
        dateLabel: todayLabel,
        morningIn: null,
        morningOut: null,
        afternoonIn: null,
        afternoonOut: null,
        isCompleted: false,
        ...updated
      };
      setLogs([newRec, ...logs]);
    }
  };

  // --- BREAK REMINDERS DETECTOR (10:00 - 10:15 & 15:00 - 15:30) ---
  const isMorningBreak = () => {
    if (!isShiftDay) return false;
    const { hours, minutes } = timeData;
    const totalMinutes = hours * 60 + minutes;
    const startBreak = 10 * 60; // 10:00 AM
    const endBreak = 10 * 60 + 15; // 10:15 AM
    return totalMinutes >= startBreak && totalMinutes < endBreak;
  };

  const isAfternoonBreak = () => {
    if (!isShiftDay) return false;
    const { hours, minutes } = timeData;
    const totalMinutes = hours * 60 + minutes;
    const startBreak = 15 * 60; // 3:00 PM
    const endBreak = 15 * 60 + 30; // 3:30 PM
    return totalMinutes >= startBreak && totalMinutes < endBreak;
  };

  const activeBreakMessage = isMorningBreak()
    ? { text: "☕ ACTIVE BREAK: Morning Rest Cycle (10:00 AM - 10:15 AM). Rest your eyes!", label: "Morning Break" }
    : isAfternoonBreak()
    ? { text: "☕ ACTIVE BREAK: Afternoon Relaxation Loop (03:00 PM - 03:30 PM). Grab warm coffee!", label: "Afternoon Break" }
    : null;

  // Sound triggering effect upon break boundaries
  useEffect(() => {
    if (isMorningBreak() || isAfternoonBreak()) {
      // Trigger a light warning chiming sound in background on transition
      ambientSynth.playChime("break-start");
    }
  }, [isMorningBreak(), isAfternoonBreak()]);

  // --- LATE DETECTOR & "NEED TIMEOUT" GUIDANCE ENGINE ---
  interface StatusGuidance {
    title: string;
    sub: string;
    level: "green" | "amber" | "rose" | "indigo";
    isLateMorning: boolean;
    isLateAfternoon: boolean;
    needsMorningTimeout: boolean;
    needsAfternoonTimeout: boolean;
  }

  const getAttendanceGuidance = (): StatusGuidance => {
    if (!isShiftDay) {
      return {
        title: "Weekend / Off-Duty Rest Day",
        sub: "RAMSWORKDAY system runs Monday to Thursday only. Restore and rejuvenate!",
        level: "indigo",
        isLateMorning: false,
        isLateAfternoon: false,
        needsMorningTimeout: false,
        needsAfternoonTimeout: false,
      };
    }

    const { hours, minutes } = timeData;
    const totalMinutes = hours * 60 + minutes;

    // Morning shift is 07:00 to 12:00
    // Afternoon shift is 13:00 to 18:00

    const morningInChecked = !!todayRecord.morningIn;
    const morningOutChecked = !!todayRecord.morningOut;
    const afternoonInChecked = !!todayRecord.afternoonIn;
    const afternoonOutChecked = !!todayRecord.afternoonOut;

    let title = "Before Service Shifts Start";
    let sub = "Morning shift opens exactly at 07:00 AM. Prepare to time-in! (Monday - Thursday)";
    let level: "green" | "amber" | "rose" | "indigo" = "indigo";
    let isLateMorning = false;
    let isLateAfternoon = false;
    let needsMorningTimeout = false;
    let needsAfternoonTimeout = false;

    // Phase 1: 07:00 to 12:00
    if (totalMinutes >= 7 * 60 && totalMinutes < 12 * 60) {
      if (!morningInChecked) {
        // Late calculation: Shift begins at 07:00 AM. 5 mins grace or immediate
        const isLate = totalMinutes > 7 * 60 + 5;
        isLateMorning = isLate;
        title = isLate ? "⚠️ Late for Morning Shift!" : "Morning Shift Active";
        sub = isLate 
          ? `You have not checked-in yet. (Shift hour starts or has elapsed since 07:00 AM). Click Time-in IMMEDIATELY.`
          : "Please log in your RAMSWORKDAY Morning attendance.";
        level = isLate ? "rose" : "amber";
      } else if (!morningOutChecked) {
        title = "Morning Work Session Active";
        sub = "You are timed-in and actively working. Keep up the high standard!";
        level = "green";
      } else {
        title = "Morning shift Completed!";
        sub = "Timed out. Lunch period runs 12:00 PM – 01:00 PM. Rest safely!";
        level = "indigo";
      }
    }
    // Phase 2: Lunch and checkout reminders 12:00 to 13:00
    else if (totalMinutes >= 12 * 60 && totalMinutes < 13 * 60) {
      if (morningInChecked && !morningOutChecked) {
        title = "⚠️ Need to TIMEOUT Now!";
        sub = "Your morning shift ended at 12:00 PM! Please click TIMEOUT MORNING to lock your logs.";
        level = "rose";
        needsMorningTimeout = true;
      } else {
        title = "Lunch Break / Mid-Day Off-duty";
        sub = "Enjoy lunch. Afternoon shift check-in opens exactly at 01:00 PM (13:00).";
        level = "indigo";
      }
    }
    // Phase 3: Afternoon shift 13:00 to 18:00
    else if (totalMinutes >= 13 * 60 && totalMinutes < 18 * 60) {
      if (!afternoonInChecked) {
        const isLate = totalMinutes > 13 * 60 + 5;
        isLateAfternoon = isLate;
        title = isLate ? "⚠️ Late for Afternoon Session!" : "Afternoon Shift Active";
        sub = isLate 
          ? `Shift started at 01:00 PM (13:00). You are behind timeline. Click Time-in immediately!`
          : "Afternoon shift started! Click Time-In to start.";
        level = isLate ? "rose" : "amber";
      } else if (!afternoonOutChecked) {
        title = "Afternoon Session Active";
        sub = "Active check-in running. Keep grinding until 6:00 PM.";
        level = "green";
      } else {
        title = "Daily Work Term Completed!";
        sub = "Morning & Afternoon logs checked and submitted correctly. Magnificent efforts!";
        level = "green";
      }
    }
    // Phase 4: Overtime checkout check (18:00 and onwards)
    else if (totalMinutes >= 18 * 60) {
      if (afternoonInChecked && !afternoonOutChecked) {
        title = "⚠️ Need to TIMEOUT Now!";
        sub = "Your afternoon shift ended at 06:00 PM! Please click TIMEOUT AFTERNOON immediately.";
        level = "rose";
        needsAfternoonTimeout = true;
      } else {
        title = "Daily Shifts Successfully Finished";
        sub = "Workspace is closed. Rest well, seek guidance and prayer, and prepare for tomorrow!";
        level = "indigo";
      }
    }

    return { title, sub, level, isLateMorning, isLateAfternoon, needsMorningTimeout, needsAfternoonTimeout };
  };

  const guidance = getAttendanceGuidance();

  // --- ACTIONS ---
  const handleMorningIn = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    // Check if late (07:05 AM is cutoff)
    const { hours, minutes } = timeData;
    const totalMins = hours * 60 + minutes;
    const isLate = totalMins > 7 * 60 + 5;
    const latenessMins = isLate ? totalMins - (7 * 60) : 0;
    
    const lateMsg = isLate 
      ? `Late check-in at ${timeStr} (${latenessMins} mins late for shift)` 
      : undefined;

    saveTodayRecord({
      morningIn: timeStr,
      morningLateMsg: lateMsg
    });
    
    ambientSynth.playChime("success");
    setNotification({
      text: isLate ? `Morning timed-in with a late mark: ${lateMsg}` : "Perfect! Morning shift started successfully.",
      type: isLate ? "warning" : "success"
    });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleMorningOut = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    saveTodayRecord({ morningOut: timeStr });
    ambientSynth.playChime("success");
    setNotification({ text: "Clocked out successfully of morning block. Lunch time!", type: "success" });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAfternoonIn = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    // Check if late (1:05 PM is cutoff - 13:05)
    const { hours, minutes } = timeData;
    const totalMins = hours * 60 + minutes;
    const isLate = totalMins > 13 * 60 + 5;
    const latenessMins = isLate ? totalMins - (13 * 60) : 0;
    
    const lateMsg = isLate 
      ? `Late check-in at ${timeStr} (${latenessMins} mins late for afternoon shift)` 
      : undefined;

    saveTodayRecord({
      afternoonIn: timeStr,
      afternoonLateMsg: lateMsg
    });

    ambientSynth.playChime("success");
    setNotification({
      text: isLate ? `Afternoon starting with lateness recorded: ${lateMsg}` : "Success. Afternoon workday active now.",
      type: isLate ? "warning" : "success"
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAfternoonOut = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    saveTodayRecord({ afternoonOut: timeStr });
    ambientSynth.playChime("success");
    setNotification({ text: "Daily shift logged off! Fantastic work. See you next shift!", type: "success" });
    setTimeout(() => setNotification(null), 6000);
  };

  // --- BUTTON "RAMSWORKDAY" TO NOTIFY & CHECK IF TIMED IN ---
  const handleRamsWorkdayCheck = () => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const { hours } = timeData;
    
    const morningChecked = !!todayRecord.morningIn;
    const afternoonChecked = !!todayRecord.afternoonIn;

    if (!isShiftDay) {
      ambientSynth.playChime("warning");
      setCheckStatus({
        status: "error",
        message: `Oops! Today is ${todayDayName}, which is a resting cycle. No shift is currently in session.`,
        checkedAt: now
      });
      return;
    }

    // Checking morning status if hour is before 13:00 (1:00 PM)
    if (hours < 13) {
      if (morningChecked) {
        ambientSynth.playChime("success");
        setCheckStatus({
          status: "success",
          message: `🟢 Confirmed: Timed in beautifully at ${todayRecord.morningIn}! Lateness state: ${todayRecord.morningLateMsg || "On-Time!"}`,
          checkedAt: now
        });
      } else {
        ambientSynth.playChime("warning");
        setCheckStatus({
          status: "error",
          message: "🚨 Alarm! You have NOT checked-in for this Morning shift yet! Please click Time-In Morning immediately.",
          checkedAt: now
        });
      }
    } 
    // Checking afternoon status
    else {
      if (afternoonChecked) {
        ambientSynth.playChime("success");
        setCheckStatus({
          status: "success",
          message: `🟢 Confirmed: Timed in for afternoon at ${todayRecord.afternoonIn}! Lateness state: ${todayRecord.afternoonLateMsg || "On-Time!"}`,
          checkedAt: now
        });
      } else {
        ambientSynth.playChime("warning");
        setCheckStatus({
          status: "error",
          message: "🚨 Alarm! afternoon shift requires check-in, but none detected. Click Time-In Afternoon!",
          checkedAt: now
        });
      }
    }
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to reset your local clock-in history?")) {
      localStorage.removeItem("ramsworkday_logs");
      setLogs([]);
    }
  };

  // --- MANUAL ATTENDANCE WRITER STATES & HANDLERS ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualMIn, setManualMIn] = useState("07:01:10 AM");
  const [manualMOut, setManualMOut] = useState("12:00:15 PM");
  const [manualAIn, setManualAIn] = useState("01:00:20 PM");
  const [manualAOut, setManualAOut] = useState("06:00:45 PM");
  const [manualLateMsg, setManualLateMsg] = useState("");

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate) {
      alert("Please select a calendar date.");
      return;
    }

    // Parse day name and format nice date label
    const tempDate = new Date(manualDate + "T00:00:00");
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
    const dateLabel = tempDate.toLocaleDateString("en-US", options);

    const duplicateIndex = logs.findIndex(l => l.date === manualDate);
    if (duplicateIndex >= 0) {
      if (!confirm(`An attendance block already exists for ${dateLabel}. Restructure / Overwrite?`)) {
        return;
      }
    }

    const newLogEntry: WorkLog = {
      date: manualDate,
      dateLabel,
      morningIn: manualMIn || null,
      morningOut: manualMOut || null,
      afternoonIn: manualAIn || null,
      afternoonOut: manualAOut || null,
      morningLateMsg: manualLateMsg ? manualLateMsg : undefined,
      isCompleted: !!(manualMIn && manualMOut && manualAIn && manualAOut)
    };

    let updatedLogs = [...logs];
    if (duplicateIndex >= 0) {
      updatedLogs[duplicateIndex] = newLogEntry;
    } else {
      updatedLogs.push(newLogEntry);
    }

    // Sort descending by date
    updatedLogs.sort((a, b) => b.date.localeCompare(a.date));

    setLogs(updatedLogs);
    setShowManualForm(false);
    // Reset manual fields
    setManualDate("");
    setManualLateMsg("");

    ambientSynth.playChime("success");
    setNotification({
      text: `Successfully registered manually entered log for ${dateLabel} in storage!`,
      type: "success"
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Delete a specific entry
  const handleDeleteLog = (date: string) => {
    setLogs(logs.filter(l => l.date !== date));
    setDeleteConfirmDate(null);
    ambientSynth.playChime("warning");
    setNotification({
      text: "Attendance record successfully cleared from summary shift report.",
      type: "warning"
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Structured CSV Exporter
  const handleDownloadCSV = () => {
    if (logs.length === 0) {
      alert("No attendance data found in local storage to export.");
      return;
    }
    const headers = "Date,Date Label,Morning In,Morning Out,Afternoon In,Afternoon Out,Late Remarks,Status\n";
    const csvContent = logs.map(l => {
      const remarks = [l.morningLateMsg, l.afternoonLateMsg].filter(Boolean).join(" | ") || "Perfect On-Time Record";
      const status = l.isCompleted ? "COMPLETED" : "INCOMPLETE";
      return `"${l.date}","${l.dateLabel}","${l.morningIn || "—"}","${l.morningOut || "—"}","${l.afternoonIn || "—"}","${l.afternoonOut || "—"}","${remarks}","${status}"`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DSWD_RAMSWORKDAY_Report_${userName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Download Trigger targeting our print stylesheet
  const handleTriggerPDFPrint = () => {
    if (logs.length === 0) {
      alert("Please ensure you have at least one attendance log logged prior to downloading the PDF report.");
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8 font-sans text-stone-800 flex flex-col items-center">
      
      {/* Outer Bound responsive wrapper */}
      <div className="w-full max-w-[1240px] flex flex-col gap-6">
        
        {/* TOP COMPONENT: Elegant Branded Bento Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white px-6 py-5 sm:px-8 rounded-[2rem] border border-stone-200/90 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Philippine DSWD / RAMSWORKDAY branded SVG logo */}
            <div className="flex items-center justify-center bg-stone-50 p-1.5 rounded-2xl border border-stone-100 shadow-sm shrink-0">
              <DswdRamsLogo size={54} className="hover:scale-105 transition-transform duration-300" />
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 font-display">
                  RAMSWORKDAY
                </h1>
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 rounded-md uppercase tracking-wider border border-amber-500/20">
                  DSWD Compliance
                </span>
              </div>
              <p className="text-stone-500 mt-0.5 text-[11px] sm:text-xs">
                Shift automation • Active rest cycles • Ambient waves
              </p>
            </div>
          </div>

          {/* Quick Stats Live Badge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Profile Info */}
            <div className="bg-stone-50 p-2 px-3.5 rounded-2xl border border-stone-100 flex items-center gap-3">
              <User className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-left">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none">Officer</div>
                <div className="text-xs font-semibold text-stone-700">{userName}</div>
              </div>
            </div>

            {/* Live Clock Display */}
            <div className="flex items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-100 px-4 py-2.5 rounded-2xl">
              <div className="text-right">
                <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none">
                  ⏰ SYSTEM LIVE CLOCK
                </div>
                <div className="text-xs font-bold text-indigo-950 mt-0.5">{todayLabel}</div>
              </div>
              <div className="h-8 w-[1px] bg-indigo-200/60 shrink-0" />
              <div className="text-lg font-mono font-black text-indigo-700 tracking-tighter shrink-0">
                {timeData.formatted.split(" ")[0]} 
                <span className="text-xs ml-1 font-sans font-bold uppercase">{timeData.formatted.split(" ")[1]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
            notification.type === "warning" || notification.type === "break"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs md:text-sm font-medium">{notification.text}</p>
          </div>
        )}

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-max">

          {/* BOX 1: Primary Attendance Controller State (col-span-12 md:col-span-7) */}
          <div id="attendance-controller-box" className="col-span-12 md:col-span-7 bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-stone-200 flex flex-col justify-between gap-6">
            
            {/* Top Indicator Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    guidance.level === "rose" ? "bg-rose-100 text-rose-700" :
                    guidance.level === "amber" ? "bg-amber-100 text-amber-700" :
                    guidance.level === "green" ? "bg-emerald-100 text-emerald-700 animate-pulse" :
                    "bg-indigo-100 text-indigo-700"
                  }`}>
                    {guidance.title}
                  </span>
                  
                  {isShiftDay && (
                    <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase">
                      Shift Cycle
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 font-medium">Weekly Rule: </span> 
                  <span className="text-xs font-bold text-stone-700">Mon - Thu (10hr Shift)</span>
                </div>
              </div>

              {/* Status Header Title */}
              <div className="mt-5">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                  {guidance.level === "green" ? (
                    <>You are <span className="text-emerald-600">Active</span> in Shift Hours</>
                  ) : guidance.level === "rose" ? (
                    <>Action <span className="text-rose-600">Required Now</span></>
                  ) : guidance.level === "amber" ? (
                    <>Time check: <span className="text-amber-600">Pending</span></>
                  ) : (
                    <>Shift state is <span className="text-stone-500">Standby</span></>
                  )}
                </h2>
                <p className="text-stone-500 text-sm mt-2 leading-relaxed">
                  {guidance.sub}
                </p>
              </div>
            </div>

            {/* Split Screen showing current logged hours for morning & afternoon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              
              {/* Morning Shift Card */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                todayRecord.morningIn 
                  ? "bg-emerald-50/40 border-emerald-200" 
                  : "bg-stone-50/50 border-stone-200/60"
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400">
                    🌅 Morning Session
                  </span>
                  <span className="text-xs font-bold text-stone-500">07:00 – 12:00</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Time In:</span>
                    <span className="font-mono font-semibold text-stone-800">
                      {todayRecord.morningIn || "—:—:—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Time Out:</span>
                    <span className="font-mono font-semibold text-stone-800">
                      {todayRecord.morningOut || "—:—:—"}
                    </span>
                  </div>
                </div>

                {todayRecord.morningLateMsg && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-2.5 bg-rose-50 px-2 py-0.5 rounded leading-tight border border-rose-100">
                    {todayRecord.morningLateMsg}
                  </p>
                )}
              </div>

              {/* Afternoon Shift Card */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                todayRecord.afternoonIn 
                  ? "bg-emerald-50/40 border-emerald-200" 
                  : "bg-stone-50/50 border-stone-200/60"
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400">
                    ☀️ Afternoon Session
                  </span>
                  <span className="text-xs font-bold text-stone-500">01:00 – 06:00</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Time In:</span>
                    <span className="font-mono font-semibold text-stone-800">
                      {todayRecord.afternoonIn || "—:—:—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Time Out:</span>
                    <span className="font-mono font-semibold text-stone-800">
                      {todayRecord.afternoonOut || "—:—:—"}
                    </span>
                  </div>
                </div>

                {todayRecord.afternoonLateMsg && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-2.5 bg-rose-50 px-2 py-0.5 rounded leading-tight border border-rose-100">
                    {todayRecord.afternoonLateMsg}
                  </p>
                )}
              </div>

            </div>

            {/* Dynamic Buttons trigger bar mapping exactly user needs */}
            <div className="space-y-3">
              
              {/* Contextual Warning Indicators */}
              {guidance.isLateMorning && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Clock warning: Shift started at 07:00 AM. Please register Time In to prevent further tardiness!
                </div>
              )}

              {guidance.isLateAfternoon && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Clock warning: Afternoon period started at 01:00 PM. Lock attendance immediately!
                </div>
              )}

              {guidance.needsMorningTimeout && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold animate-bounce">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Time-Out cycle required: Past 12:00 PM. Please check-out of morning logs.
                </div>
              )}

              {guidance.needsAfternoonTimeout && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold animate-bounce">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Shift wrap up: Daily shifts completed at 18:00 (06:00 PM). Check-out requested.
                </div>
              )}

              {/* Dynamic Shift Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Morning actions block */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleMorningIn}
                    disabled={!isShiftDay || !!todayRecord.morningIn}
                    className={`w-full py-3 px-4 font-bold rounded-xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      !!todayRecord.morningIn 
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Time-In {todayRecord.morningIn ? "Logged" : "Morning"}
                  </button>
                  
                  <button
                    onClick={handleMorningOut}
                    disabled={!isShiftDay || !todayRecord.morningIn || !!todayRecord.morningOut}
                    className={`w-full py-3 px-4 font-bold rounded-xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      !todayRecord.morningIn || !!todayRecord.morningOut
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-stone-800 hover:bg-stone-900 text-white"
                    }`}
                  >
                    Timeout Morning
                  </button>
                </div>

                {/* Afternoon actions block */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAfternoonIn}
                    disabled={!isShiftDay || !!todayRecord.afternoonIn}
                    className={`w-full py-3 px-4 font-bold rounded-xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      !!todayRecord.afternoonIn 
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Time-In {todayRecord.afternoonIn ? "Logged" : "Afternoon"}
                  </button>
                  
                  <button
                    onClick={handleAfternoonOut}
                    disabled={!isShiftDay || !todayRecord.afternoonIn || !!todayRecord.afternoonOut}
                    className={`w-full py-3 px-4 font-bold rounded-xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      !todayRecord.afternoonIn || !!todayRecord.afternoonOut
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-stone-800 hover:bg-stone-900 text-white"
                    }`}
                  >
                    Timeout Afternoon
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* BOX 2: Break Reminders Slots (col-span-12 md:col-span-5) */}
          <div id="break-slots-box" className={`col-span-12 md:col-span-5 rounded-[2rem] p-7 md:p-8 flex flex-col justify-between transition-all border shadow-sm ${
            activeBreakMessage 
              ? "bg-amber-500 text-white border-amber-400 animate-pulse-ring" 
              : "bg-white text-stone-800 border-stone-200"
          }`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Coffee className={`w-5 h-5 ${activeBreakMessage ? "text-white" : "text-amber-500"}`} />
                  <span className={`text-xs font-bold tracking-widest uppercase ${activeBreakMessage ? "text-amber-100" : "text-stone-400"}`}>
                    Rest Break Windows
                  </span>
                </div>
                {activeBreakMessage && (
                  <span className="px-2 py-0.5 bg-white text-amber-600 text-[10px] font-black rounded-lg uppercase animate-pulse">
                    Right Now
                  </span>
                )}
              </div>

              <p className={`text-sm leading-relaxed mt-2 ${activeBreakMessage ? "text-amber-50" : "text-stone-500"}`}>
                Scientific studies advise stepping away from screens twice daily to regain stamina and protect work focus.
              </p>

              {/* Slots detailed representation */}
              <div className="space-y-3 mt-6">
                
                {/* Morning Slot */}
                <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  isMorningBreak()
                    ? "bg-white text-amber-900 border-white shadow-md scale-102"
                    : activeBreakMessage
                    ? "bg-amber-600/50 text-white border-amber-600"
                    : "bg-stone-50 text-stone-800 border-stone-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">☕</span>
                    <div>
                      <div className="font-bold text-sm">Morning Coffee Break</div>
                      <div className={`text-xs ${isMorningBreak() ? "text-amber-600 font-semibold" : "opacity-60"}`}>15 minutes length</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1.5 font-bold rounded-lg ${
                    isMorningBreak() 
                      ? "bg-amber-500 text-white" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    10:00 – 10:15
                  </span>
                </div>

                {/* Afternoon Slot */}
                <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  isAfternoonBreak()
                    ? "bg-white text-amber-900 border-white shadow-md scale-102"
                    : activeBreakMessage
                    ? "bg-amber-600/50 text-white border-amber-600"
                    : "bg-stone-50 text-stone-800 border-stone-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧘</span>
                    <div>
                      <div className="font-bold text-sm">Afternoon Stretch Break</div>
                      <div className={`text-xs ${isAfternoonBreak() ? "text-amber-600 font-semibold" : "opacity-60"}`}>30 minutes length</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1.5 font-bold rounded-lg ${
                    isAfternoonBreak() 
                      ? "bg-amber-500 text-white" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    03:00 – 03:30
                  </span>
                </div>

              </div>
            </div>

            {/* Bottom notification indicator */}
            {activeBreakMessage ? (
              <div className="mt-5 p-3.5 bg-amber-600 rounded-xl text-xs font-semibold leading-relaxed border border-amber-400 text-white">
                🔊 Chime triggered! Stand up, stretch, sip water, and enjoy your break period.
              </div>
            ) : (
              <div className="mt-5 p-3.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-500 border border-stone-100">
                ℹ️ The system alerts you automatically and plays a soothing wind-chime when break begins.
              </div>
            )}

          </div>

          {/* BOX 3: RAMSWORKDAY Shift Integration Compliance Button (col-span-12 md:col-span-4) */}
          <div id="compliance-check-box" className="col-span-12 md:col-span-4 bg-[#fff1f2] border border-rose-200 rounded-[2rem] p-7 md:p-8 flex flex-col justify-between gap-5 text-center">
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl mb-4 shadow-xs">
                <Bell className="w-6 h-6 animate-swing" />
              </div>

              <h3 className="text-rose-950 font-extrabold uppercase text-xs tracking-widest font-sans">
                RAMSWORKDAY Verification
              </h3>
              <p className="text-stone-500 text-xs mt-1.5 font-sans leading-relaxed px-2">
                Click this official trigger to verify that you have logged on-time and prevent missing shift warnings.
              </p>
            </div>

            {/* Interactive check output box */}
            <div className="bg-white/80 p-4 rounded-xl border border-rose-100 text-left">
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                Compliance Status Report
              </div>
              <p className={`text-xs font-semibold mt-1.5 leading-relaxed ${
                checkStatus.status === "success" ? "text-emerald-700" :
                checkStatus.status === "error" ? "text-rose-700" :
                "text-stone-500 italic"
              }`}>
                {checkStatus.message}
              </p>
              {checkStatus.checkedAt && (
                <div className="text-[9px] text-stone-400 font-mono text-right mt-2">
                  Verified at: {checkStatus.checkedAt}
                </div>
              )}
            </div>

            <button
              onClick={handleRamsWorkdayCheck}
              className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-rose-200/50 uppercase tracking-wide cursor-pointer"
            >
              RAMSWORKDAY
            </button>
          </div>

          {/* BOX 4: Shift Detail Outline & Schedule (col-span-12 md:col-span-4) */}
          <div id="schedule-overview-box" className="md:col-span-4 bg-indigo-950 text-white rounded-[2rem] p-7 md:p-8 flex flex-col justify-between gap-5 shadow-sm border border-indigo-900">
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest leading-none">
                  Weekly Schedule Rules
                </h3>
              </div>

              <div className="space-y-3 mt-4">
                
                <div className="flex justify-between items-center border-b border-indigo-900 pb-2.5">
                  <span className="text-xs font-medium text-emerald-400">Shift Days:</span>
                  <span className="text-xs font-bold text-white bg-indigo-900 px-2 py-0.5 rounded">Monday to Thursday</span>
                </div>

                <div className="flex justify-between items-center border-b border-indigo-900 pb-2.5">
                  <span className="text-xs font-medium text-indigo-200">Morning Shift:</span>
                  <span className="text-xs font-bold text-white font-mono">07:00 AM – 12:00 PM</span>
                </div>

                <div className="flex justify-between items-center border-b border-indigo-900 pb-2.5">
                  <span className="text-xs font-medium text-indigo-200">Afternoon Shift:</span>
                  <span className="text-xs font-bold text-white font-mono">01:00 PM – 06:00 PM</span>
                </div>

                <div className="p-3 bg-indigo-900/40 rounded-xl border border-indigo-800/50 text-[10px] text-indigo-300 italic leading-relaxed">
                  * Break times are scheduled outside shift duration (12:00 PM - 01:00 PM lunch is untracked).
                </div>

              </div>
            </div>

            <div>
              <div className="w-full bg-indigo-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ 
                    width: isShiftDay 
                      ? `${
                          ((todayRecord.morningIn ? 1 : 0) + 
                           (todayRecord.morningOut ? 1 : 0) + 
                           (todayRecord.afternoonIn ? 1 : 0) + 
                           (todayRecord.afternoonOut ? 1 : 0)) * 25
                        }%` 
                      : "0%" 
                  }} 
                />
              </div>
              <p className="text-[10px] mt-2 text-indigo-300 text-right font-medium">
                Daily logs completed: {
                  (todayRecord.morningIn ? 1 : 0) + 
                  (todayRecord.morningOut ? 1 : 0) + 
                  (todayRecord.afternoonIn ? 1 : 0) + 
                  (todayRecord.afternoonOut ? 1 : 0)
                }/4 steps completed
              </p>
            </div>
          </div>

          {/* BOX 5: Officer Profile & Live Settings - No simulation */}
          <div id="sim-controls-box" className="col-span-12 md:col-span-4 bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-stone-200 flex flex-col justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold tracking-widest uppercase text-stone-400">
                    RAMS Live settings
                  </span>
                </div>
                
                {/* Active Live indicator block */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-bold text-emerald-700 uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Live Sync
                </div>
              </div>

              <p className="text-xs text-stone-500 font-sans leading-relaxed">
                Monitoring and recording shift compliance directly through your local computer system clock. 
              </p>

              <div className="mt-4 p-4 bg-emerald-50 rounded-[1.2rem] border border-emerald-100 text-stone-700 text-xs">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
                  Real Time System Active
                </div>
                Your browser is currently synchronizing with the official DSWD server clock coordinates. All logs committed here are persisted permanently in secure client-side storage rules.
              </div>

              {/* Proximity Warning Reminder system */}
              <div className="mt-4 p-4 bg-indigo-50/80 rounded-[1.2rem] border border-indigo-100/80 text-stone-700 text-xs">
                <div className="font-bold text-indigo-950 flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Time-In Proximity Reminder</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-black rounded uppercase tracking-wider">ACTIVE</span>
                </div>
                <p className="text-stone-600 leading-relaxed mb-3">
                  Triggers a chime and notification banner every 10 minutes when within 30 minutes of official daily Time-In (07:00 AM &amp; 01:00 PM) if you haven't clocked in yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    ambientSynth.playChime("break-start");
                    setNotification({
                      text: "⏰ Proximity Warning Siren: Daily Shift Time-In hour is approaching! Please prepare your documents and log your Time-In.",
                      type: "warning"
                    });
                    setTimeout(() => setNotification(null), 8000);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-colors text-center"
                >
                  🔔 Demo Proximity Alarm
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Shift Regulations Overview</div>
                <div className="text-[11px] text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 space-y-1">
                  <div>⏰ <strong>Official Shift hours:</strong> 07:00 AM - 06:00 PM</div>
                  <div>⏳ <strong>Grace period cutoff:</strong> 07:05 AM &amp; 01:05 PM</div>
                  <div>⚖️ <strong>Regulations:</strong> 10-hour daily standard (Mon - Thu)</div>
                </div>
              </div>
            </div>

            {/* Profile Config with real officer customization */}
            <div className="bg-stone-50/50 p-3.5 rounded-xl border border-stone-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Change Officer Name:</span>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="Enter workspace name"
                className="w-1/2 p-1 text-right text-xs bg-transparent focus:underline focus:outline-none font-bold text-indigo-950 placeholder-stone-400 font-display"
              />
            </div>
          </div>

          {/* BOX 6: Workspace Ambient Sounds (col-span-12) */}
          <div className="col-span-12 flex flex-col gap-5">
            <AmbientPlayer />
          </div>

          {/* BOX 7: Daily Devotion (Quotes, scripture, prayers) (col-span-12) */}
          <div className="col-span-12 flex flex-col gap-5">
            <InspirationWidget userName={userName} />
          </div>

        </div>

        {/* BOTTOM SECTION: Shift History Log Ledger */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-200/90 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 pb-2 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <DswdRamsLogo size={32} />
                <h3 className="font-display font-black text-stone-900 text-lg leading-tight">
                  RAMSWORKDAY Log Ledger
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Detailed clock-in events stored client-side in secure local cache
              </p>
            </div>

            {/* Custom Interactive action tray */}
            <div id="history-head-actions" className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs px-3.5 py-2.5 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-all border border-indigo-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 shrink-0" />
                {showManualForm ? "Close Manual Form" : "Add Missed Shift"}
              </button>

              <button
                onClick={handleDownloadCSV}
                className="text-xs px-3.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-all border border-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download spreadsheet-compatible CSV file"
              >
                <Download className="w-4 h-4 shrink-0" />
                Export CSV
              </button>

              <button
                onClick={handleTriggerPDFPrint}
                className="text-xs px-3.5 py-2.5 bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
                title="Saves report beautifully as PDF"
              >
                <Printer className="w-4 h-4 shrink-0" />
                Download PDF / Save Report
              </button>

              <div className="h-6 w-px bg-stone-200/80 mx-1" />

              <button
                onClick={handleClearHistory}
                className="text-xs px-3.5 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-lg hover:bg-rose-100 transition-all border border-rose-100 cursor-pointer"
              >
                Reset History
              </button>
            </div>
          </div>

          {/* Inline Missed Log Addition Form container */}
          {showManualForm && (
            <div id="manual-log-creator-box" className="bg-indigo-50/50 p-6 rounded-[1.5rem] border border-indigo-100 shadow-inner max-w-3xl animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">
                  Time-In / Time-Out Manual Storage Insertion
                </h4>
              </div>

              <form onSubmit={handleAddManualLog} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-stone-700">
                {/* Inputs selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 font-medium">Target Log Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-medium font-sans"
                  />
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-2 font-medium">
                  <label className="block text-[10px] uppercase font-bold text-stone-400">Optional Lateness / Special Justification Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. DSWD Field Visitation assignment delay"
                    value={manualLateMsg}
                    onChange={(e) => setManualLateMsg(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl"
                  />
                </div>

                {/* Times override inputs */}
                <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">🌅 Morning Period</span>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-stone-400 font-medium">Morning Clock-In</label>
                    <input
                      type="text"
                      placeholder="07:01:10 AM"
                      value={manualMIn}
                      onChange={(e) => setManualMIn(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div className="space-y-1.5 font-medium">
                    <label className="block text-[9px] text-stone-400 whitespace-nowrap">Morning Clock-Out</label>
                    <input
                      type="text"
                      placeholder="12:00:15 PM"
                      value={manualMOut}
                      onChange={(e) => setManualMOut(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-2 col-span-1 sm:col-span-2 font-medium">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">☀️ Afternoon Period</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] text-stone-400 whitespace-nowrap">Afternoon Clock-In</label>
                      <input
                        type="text"
                        placeholder="01:00:20 PM"
                        value={manualAIn}
                        onChange={(e) => setManualAIn(e.target.value)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                      />
                    </div>
                    <div className="space-y-1.5 font-medium">
                      <label className="block text-[9px] text-stone-400 whitespace-nowrap">Afternoon Clock-Out</label>
                      <input
                        type="text"
                        placeholder="06:00:45 PM"
                        value={manualAOut}
                        onChange={(e) => setManualAOut(e.target.value)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions submit */}
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-indigo-100 font-medium">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="p-2.5 px-4 font-semibold text-stone-500 hover:text-stone-800 bg-stone-200/50 hover:bg-stone-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="p-2.5 px-6 font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                  >
                    Commit to Web Local Storage
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Log list mapping */}
          {logs.length === 0 ? (
            <div className="p-10 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No attendance entries tracked yet.</p>
              <p className="text-[10px] text-stone-400 mt-1">Clock-in above to write your first daily ledger block.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead>
                  <tr className="border-b border-stone-150 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">🌅 Morning (In / Out)</th>
                    <th className="py-2.5 px-3">☀️ Afternoon (In / Out)</th>
                    <th className="py-2.5 px-3">Lateness Detail / Compliance</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {logs.map((log) => {
                    const hasLate = log.morningLateMsg || log.afternoonLateMsg;
                    
                    if (editingLogDate === log.date) {
                      return (
                        <tr key={log.date} className="bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors font-medium text-stone-700">
                          <td className="py-3 px-3 font-semibold text-stone-900 border-l-2 border-indigo-500">
                            {log.dateLabel}
                            <div className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider mt-1">Corrections Mode</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1.5 w-full min-w-[120px]">
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">AM In</span>
                                <input
                                  type="text"
                                  value={editMIn}
                                  onChange={(e) => setEditMIn(e.target.value)}
                                  className="w-full max-w-[130px] p-1 px-2 text-xs bg-white border border-stone-200 rounded font-mono font-bold text-stone-800"
                                  placeholder="07:00:00 AM"
                                />
                              </div>
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">AM Out</span>
                                <input
                                  type="text"
                                  value={editMOut}
                                  onChange={(e) => setEditMOut(e.target.value)}
                                  className="w-full max-w-[130px] p-1 px-2 text-xs bg-white border border-stone-200 rounded font-mono font-bold text-stone-800"
                                  placeholder="12:00:00 PM"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1.5 w-full min-w-[120px]">
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">PM In</span>
                                <input
                                  type="text"
                                  value={editAIn}
                                  onChange={(e) => setEditAIn(e.target.value)}
                                  className="w-full max-w-[130px] p-1 px-2 text-xs bg-white border border-stone-200 rounded font-mono font-bold text-stone-800"
                                  placeholder="01:00:00 PM"
                                />
                              </div>
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">PM Out</span>
                                <input
                                  type="text"
                                  value={editAOut}
                                  onChange={(e) => setEditAOut(e.target.value)}
                                  className="w-full max-w-[130px] p-1 px-2 text-xs bg-white border border-stone-200 rounded font-mono font-bold text-stone-800"
                                  placeholder="06:00:00 PM"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1.5 w-full min-w-[160px] max-w-xs">
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">AM Remarks</span>
                                <input
                                  type="text"
                                  value={editMorningLateMsg}
                                  onChange={(e) => setEditMorningLateMsg(e.target.value)}
                                  className="w-full p-1 px-2 text-xs bg-white border border-stone-200 rounded text-stone-700"
                                  placeholder="e.g. Late by 8 mins"
                                />
                              </div>
                              <div>
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">PM Remarks</span>
                                <input
                                  type="text"
                                  value={editAfternoonLateMsg}
                                  onChange={(e) => setEditAfternoonLateMsg(e.target.value)}
                                  className="w-full p-1 px-2 text-xs bg-white border border-stone-200 rounded text-stone-700"
                                  placeholder="e.g. Late by 12 mins"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] text-stone-400 font-black tracking-wide uppercase italic">
                              Live Syncing
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(log.date)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all cursor-pointer inline-flex items-center"
                                title="Save corrections"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingLogDate(null)}
                                className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg border border-stone-200 transition-all cursor-pointer inline-flex items-center"
                                title="Discard / Cancel edit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={log.date} className="hover:bg-stone-50/50 transition-colors font-medium text-stone-700">
                        <td className="py-3 px-3 font-semibold text-stone-900">{log.dateLabel}</td>
                        <td className="py-3 px-3 font-mono">
                          <span className={log.morningIn ? "text-stone-800 font-semibold" : "text-stone-300"}>
                            {log.morningIn || "—:—"}
                          </span>
                          <span className="text-stone-300 mx-1.5">/</span>
                          <span className={log.morningOut ? "text-stone-800 font-semibold" : "text-stone-300"}>
                            {log.morningOut || "—:—"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={log.afternoonIn ? "text-stone-800 font-semibold" : "text-stone-300"}>
                            {log.afternoonIn || "—:—"}
                          </span>
                          <span className="text-stone-300 mx-1.5">/</span>
                          <span className={log.afternoonOut ? "text-stone-800 font-semibold" : "text-stone-300"}>
                            {log.afternoonOut || "—:—"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-500 font-sans">
                          {hasLate ? (
                            <div className="flex flex-col gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50/50 p-1.5 px-2 rounded border border-rose-100 max-w-sm">
                              {log.morningLateMsg && <span>🌅 {log.morningLateMsg}</span>}
                              {log.afternoonLateMsg && <span>☀️ {log.afternoonLateMsg}</span>}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                              ✔ Perfect On-Time Record
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${
                            log.isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {log.isCompleted ? "COMPLETED" : "INCOMPLETE"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {deleteConfirmDate === log.date ? (
                            <div className="flex justify-end items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg w-fit ml-auto">
                              <span className="text-[10px] text-rose-700 font-extrabold px-1">Clear?</span>
                              <button
                                onClick={() => handleDeleteLog(log.date)}
                                className="p-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer inline-flex items-center"
                                title="Confirm permanently clear record"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmDate(null)}
                                className="p-1 px-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors cursor-pointer inline-flex items-center"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-1 bg-stone-50/40 p-1 rounded-lg w-fit ml-auto border border-stone-100">
                              <button
                                onClick={() => handleStartEdit(log)}
                                className="p-1 px-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/70 rounded-md transition-colors cursor-pointer inline-flex items-center"
                                title="Correct or Edit this row"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmDate(log.date)}
                                className="p-1 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50/70 rounded-md transition-colors cursor-pointer inline-flex items-center"
                                title="Clear this record from local storage"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PRINTABLE COMPLIANCE SHEET (Isolated exclusively for physical paper or PDF print saves via @media print) */}
        <div id="printable-payroll-compliance-sheet" className="p-8 hidden">
          <div className="flex items-center justify-between border-b-2 border-stone-800 pb-5 mb-8 text-stone-800">
            <div className="flex items-center gap-4">
              <DswdRamsLogo size={74} />
              <div>
                <h1 className="text-lg font-black tracking-tight text-stone-900 font-display">
                  DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT
                </h1>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wide mt-0.5">
                  Republic of the Philippines • Region Field Office Companion
                </p>
                <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                  RAMSWORKDAY INTEGRATED TIMESHEET COMPLIANCE
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-mono font-black rounded uppercase tracking-wider border border-stone-200">
                OFFICIAL RECORD
              </span>
              <p className="text-[9px] text-stone-500 mt-2 font-medium">DTR Reference PIN</p>
              <p className="text-xs font-mono font-bold text-stone-800">#DSWD-RAMS-2026</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-5 rounded-xl border border-stone-200 mb-8 text-xs text-stone-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Employee Details</p>
              <p className="text-sm font-bold text-stone-800 mt-1">{userName}</p>
              <p className="text-stone-500 mt-0.5 font-medium">Field Officer / Compliance Staff</p>
              <p className="text-stone-500 mt-0.5 font-medium">Assigned Shift Rule: Mon - Thu (10hr/day)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-stone-400">Record Specifications</p>
              <p className="font-semibold text-stone-800 mt-1">Exported on: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="text-stone-500 mt-0.5 font-medium">Total Tracks Enrolled: {logs.length} Shift Blocks</p>
              <p className="text-stone-500 mt-0.5 font-medium">Storage Engine: Web Client Database (Offline-safe)</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-stone-300 divide-y divide-stone-300 text-stone-800">
            <thead className="bg-stone-100 text-stone-800 font-bold uppercase tracking-wider border-b border-stone-300">
              <tr>
                <th className="py-2 px-3 border-r border-stone-300">Date/Label</th>
                <th className="py-2 px-3 border-r border-stone-300">Morning (In/Out)</th>
                <th className="py-2 px-3 border-r border-stone-300">Afternoon (In/Out)</th>
                <th className="py-2 px-3 border-r border-stone-300">Compliance Remarks</th>
                <th className="py-2 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono text-stone-800">
              {logs.map((log) => {
                const remarks = [log.morningLateMsg, log.afternoonLateMsg].filter(Boolean).join(" | ");
                return (
                  <tr key={log.date} className="text-[11px] hover:bg-stone-50 text-stone-800">
                    <td className="py-2 px-3 font-semibold text-stone-900 border-r border-stone-200">{log.dateLabel}</td>
                    <td className="py-2 px-3 border-r border-stone-200">{log.morningIn || "—:—"} / {log.morningOut || "—:—"}</td>
                    <td className="py-2 px-3 border-r border-stone-200">{log.afternoonIn || "—:—"} / {log.afternoonOut || "—:—"}</td>
                    <td className="py-2 px-3 border-r border-stone-200 text-stone-600 font-sans italic">{remarks || "✔ Compliance Standard Met"}</td>
                    <td className="py-2 px-3 text-right text-stone-900 font-semibold">{log.isCompleted ? "VERIFIED" : "INCOMPLETE"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signature and Certification blocks */}
          <div className="grid grid-cols-2 gap-12 mt-16 pt-10 border-t border-dashed border-stone-300 text-xs text-center text-stone-800">
            <div>
              <div className="h-10 border-b border-stone-400 mb-2 max-w-xs mx-auto" />
              <p className="font-bold text-stone-800 uppercase">{userName}</p>
              <p className="text-stone-400 uppercase tracking-widest text-[9px] mt-0.5">EMPLOYEE SIGNATURE / DATE</p>
            </div>
            <div>
              <div className="h-10 border-b border-stone-400 mb-2 max-w-xs mx-auto" />
              <p className="font-bold text-stone-800 uppercase">OFFICIAL DSWD SUPERVISOR</p>
              <p className="text-stone-400 uppercase tracking-widest text-[9px] mt-0.5">COMPLIANCE REVIEWER & COMPTROLLER OFFICE</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400 mt-16 leading-relaxed border-t border-stone-100 pt-5">
            * Warning: This document is officially certified for payroll time-keeping and attendance compliance audit. Any unauthorized modification of hours will result in severe civil penalties.
          </div>
        </div>

      </div>
    </div>
  );
}
