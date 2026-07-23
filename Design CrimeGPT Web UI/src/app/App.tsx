import React, { useState, useRef, useEffect, createContext, useContext, Component } from "react";
import { useTranslation } from 'react-i18next';
import { createPortal } from "react-dom";
import axios from "axios";
import { jsonrepair } from "jsonrepair";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import gujaratPoliceLogo from "@/imports/images.png";
import html2pdf from "html2pdf.js";
import {
  Shield, Search, FileText, BarChart2, Settings, Send, Paperclip,
  AlertTriangle, CheckCircle, Clock, Eye, Database, Zap, Menu, X,
  TrendingUp, Users, Lock, ChevronRight, ChevronDown, MapPin, Calendar,
  Plus, Download, Fingerprint, Radio, Layers, BookOpen, Cpu, LogOut,
  UserCircle, Key, Activity, Building2, BadgeCheck, Network, Scale,
  FlaskConical, ClipboardList, ScrollText, UserCog, Briefcase, ShieldCheck,
  LayoutDashboard, ScanLine, FileSearch, EyeOff, ChevronLeft, Star,
  Printer, UploadCloud, CheckCircle2, ShieldAlert, DownloadCloud, Loader2, Sun, Moon, Trash, Trash2, List, LayoutGrid
} from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { translations } from "@/utils/translations";
import FloatingChatbot from "@/components/FloatingChatbot";
import { FIRModal } from "@/components/FIRModal";
import { Sec94Modal } from "@/components/Sec94Modal";
import { Sec106Modal } from "@/components/Sec106Modal";
import { SeizureMemoModal } from "@/components/SeizureMemoModal";
import { ArrestMemoModal } from "@/components/ArrestMemoModal";
import { RemandApplicationModal } from "@/components/RemandApplicationModal";
import { ChargesheetModal } from "@/components/ChargesheetModal";
import { BailOppositionModal } from "@/components/BailOppositionModal";
import { SearchWarrantModal } from "@/components/SearchWarrantModal";
import { EvidenceTaggingModal } from "@/components/EvidenceTaggingModal";
import { RolesManagementView } from "@/app/components/RolesManagementView";
import { UserManagement } from "@/components/UserManagement";
import { SystemSettings } from "@/components/Settings";
import { Logbook } from "@/components/Logbook";
import { AIInvestigation } from "@/components/AIInvestigation";
import { logActivity } from "@/utils/logger";

export const LanguageContext = createContext<{
  language: string;
  setLanguage: (lang: string) => void;
  t: Record<string, string>;
}>({ language: 'en', setLanguage: () => {}, t: translations.en });

// ─── Keyframes ────────────────────────────────────────────────────────────────

const STYLES = `
@keyframes authBgFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.05); }
  66% { transform: translate(-20px,15px) scale(0.97); }
}
@keyframes authBgFloat2 {
  0%,100% { transform: translate(0,0) scale(1); }
  40% { transform: translate(-35px,25px) scale(1.08); }
  70% { transform: translate(20px,-15px) scale(0.95); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; } to { opacity:1; }
}
@keyframes goldPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(212,160,23,0); }
  50%      { box-shadow: 0 0 20px 4px rgba(212,160,23,0.25); }
}
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes bounce3 {
  0%,80%,100% { transform:translateY(0); }
  40%          { transform:translateY(-6px); }
}
.anim-fadeup   { animation: fadeUp 0.5s ease both; }
.anim-fadein   { animation: fadeIn 0.4s ease both; }
.anim-goldpulse{ animation: goldPulse 2.5s ease-in-out infinite; }
@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }
  .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; padding: 20px !important; z-index: 9999 !important; }
  .print-area * { color: black !important; box-shadow: none !important; text-shadow: none !important; border-color: #ddd !important; }
}
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 
  | 'Administrator'
  | 'Investigating Officer'
  | 'Senior Officer / Supervisor'
  | 'Legal Officer'
  | 'Forensic Expert';

type NavId = "dashboard" | "cases" | "evidence" | "investigation" | "legal" | "documents" | "users" | "reports" | "analytics" | "audit" | "settings" | "logbook";
type AuthPage = "login" | "register";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  badgeId: string;
  department: string;
  role: UserRole;
  initials: string;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Administrator': [
    'dashboard', 'cases', 'evidence', 'investigation', 'documents', 'settings', 'users', 'logbook'
  ],
  'Senior Officer / Supervisor': [
    'dashboard', 'cases', 'evidence', 'investigation', 'documents'
  ],
  'Investigating Officer': [
    'dashboard', 'cases', 'evidence', 'investigation', 'documents'
  ],
  'Legal Officer': [
    'dashboard', 'cases', 'evidence', 'documents'
  ],
  'Forensic Expert': [
    'dashboard', 'cases', 'evidence', 'investigation'
  ]
};

export const ROLE_LABELS: Record<string, string> = {
  'Administrator': 'Administrator',
  'Senior Officer / Supervisor': 'Senior Officer / Supervisor',
  'Investigating Officer': 'Investigating Officer',
  'Legal Officer': 'Legal Officer',
  'Forensic Expert': 'Forensic Expert'
};

type NavConfig = { id: NavId; label: string; icon: React.ElementType; badge?: number };

const ALL_NAV: NavConfig[] = [
  { id: "dashboard",     label: "Dashboard",         icon: LayoutDashboard },
  { id: "cases",         label: "Cases",              icon: Briefcase },
  { id: "evidence",      label: "Evidence",           icon: ScanLine },
  { id: "investigation", label: "AI Investigation",   icon: Search },
  { id: "legal",         label: "Legal Intelligence", icon: Scale },
  { id: "documents",     label: "Documents",          icon: ScrollText },
  { id: "users",         label: "User Management",    icon: Users },
  { id: "reports",       label: "Reports",            icon: BarChart2 },
  { id: "analytics",     label: "Analytics",          icon: TrendingUp },
  { id: "audit",         label: "Audit Logs",         icon: FileSearch },
  { id: "logbook",       label: "Logbook",            icon: BookOpen },
  { id: "settings",      label: "Settings",           icon: Settings },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

type CaseStatus = "critical" | "active" | "pending" | "closed";
type CasePriority = "high" | "medium" | "low";
type CaseData = {
  id: string;
  case_number?: string;
  title: string;
  location: string;
  status: CaseStatus;
  priority: CasePriority;
  assignee: string;
  progress: number;
  user_id?: string;
  date: string;
};
const CASES_DATA: CaseData[] = [];

const ACTIVITY_DATA = [
  { id: 1, text: "Biometric match confirmed: Suspect ID UKN-0041", time: "3 min ago", severity: "critical" },
  { id: 2, text: "FIR filed for Case ACCB-2024-0847", time: "18 min ago", severity: "warning" },
  { id: 3, text: "Evidence hash verified: SHA-256 ✓", time: "41 min ago", severity: "success" },
  { id: 4, text: "Case ACCB-2024-0773 closed by IO Desai", time: "1h ago", severity: "info" },
  { id: 5, text: "New legal intelligence brief uploaded", time: "2h ago", severity: "info" },
];

const CHART_DATA = [
  { month: "Jun", cases: 14, resolved: 9 },
  { month: "Jul", cases: 22, resolved: 17 },
  { month: "Aug", cases: 18, resolved: 12 },
  { month: "Sep", cases: 27, resolved: 19 },
  { month: "Oct", cases: 31, resolved: 24 },
  { month: "Nov", cases: 19, resolved: 11 },
];

const PRIORITY_DATA = [
  { name: "Critical", value: 3, color: "#dc2626" },
  { name: "High",     value: 8, color: "#D4A017" },
  { name: "Medium",   value: 12, color: "#1D4ED8" },
  { name: "Low",      value: 5, color: "var(--muted-foreground)" },
];


// ─── Auth Context ─────────────────────────────────────────────────────────────

const AuthCtx = createContext<{
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
}>({ user: null, login: () => {}, logout: () => {} });

function useAuth() { return useContext(AuthCtx); }

const ThemeCtx = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

function useTheme() { return useContext(ThemeCtx); }

// ─── Utility ──────────────────────────────────────────────────────────────────

function cls(...a: (string | false | null | undefined)[]) { return a.filter(Boolean).join(" "); }

const getInitials = (name?: string, email?: string) => {
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  }
  if (email && typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  }
  return "IO"; // Default fallback: Investigating Officer
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <ImageWithFallback
      src={gujaratPoliceLogo}
      alt="Gujarat Police — Ahmedabad Cyber Crime Branch"
      style={{ width: size, height: size }}
      className={`object-contain flex-shrink-0 ${className}`}
    />
  );
}

// ─── Security Badge ───────────────────────────────────────────────────────────

function SecBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono"
      style={{ borderColor: "rgba(212,160,23,0.3)", color: "#D4A017", background: "var(--border)" }}>
      <Icon size={10} />
      {label}
    </div>
  );
}

// ─── Status + Priority ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: typeof CASES_DATA[0]["status"] }) {
  const map = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    active:   "bg-blue-500/15 text-blue-300 border-blue-500/30",
    pending:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
    closed:   "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  };
  const dot = { critical:"bg-red-400", active:"bg-blue-400", pending:"bg-amber-400", closed:"bg-slate-400" };
  return (
    <span className={cls("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border", map[status])}>
      <span className={cls("w-1.5 h-1.5 rounded-full mr-1.5", dot[status])} />{status.toUpperCase()}
    </span>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onSwitch, onLogin }: { onSwitch: () => void; onLogin: (u: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let targetEmail = email.trim();
    let badge = "";
    let name = "";

    try {
      if (!targetEmail.includes('@')) {
        const { data: userRecord, error: lookupError } = await supabase
          .from('users')
          .select('email, full_name, badge_number')
          .ilike('badge_number', targetEmail)
          .maybeSingle();

        if (lookupError || !userRecord || !userRecord.email) {
          throw new Error("Invalid Badge Number. No active investigator profile found with this ID.");
        }

        targetEmail = userRecord.email;
        badge = userRecord.badge_number;
        name = userRecord.full_name;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      
      if (!name) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('full_name, badge_number')
          .eq('email', targetEmail)
          .maybeSingle();
        if (userRecord) {
           name = userRecord.full_name;
           badge = userRecord.badge_number;
        }
      }

      await logActivity('System Access: Successful Login');
      toast.success(`Welcome back${name ? `, ${name}` : ''}! ${badge ? `[${badge}]` : ''}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="size-full flex overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-12"
        style={{ background: "var(--sidebar)" }}>
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)", top: "-10%", left: "-10%", animation: "authBgFloat 12s ease-in-out infinite" }} />
          <div className="absolute w-80 h-80 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #D4A017 0%, transparent 70%)", bottom: "5%", right: "0%", animation: "authBgFloat2 15s ease-in-out infinite" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)", top: "50%", left: "50%", animation: "authBgFloat 18s ease-in-out infinite reverse" }} />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#D4A017 1px,transparent 1px),linear-gradient(90deg,#D4A017 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 anim-fadeup">
          <div className="flex items-center gap-3 mb-12">
            <LogoMark size={52} />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-wide">
                Crime<span style={{ color: "#D4A017" }}>GPT</span>
              </div>
              <div className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>SECURE PLATFORM v2.4</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4 font-['Outfit']">
            AI-Powered<br />
            <span style={{ color: "#D4A017" }}>Cyber Crime</span><br />
            Investigation
          </h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--muted-foreground)" }}>
            Ahmedabad Cyber Crime Branch's next-generation intelligence platform.
            Analyze evidence, generate legal documents, and solve cases faster.
          </p>

          {/* Illustration */}
          <div className="rounded-2xl p-6 mb-10 border"
            style={{ background: "var(--input)", borderColor: "var(--border)" }}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {["FIR Analysis", "Evidence Chain", "Chargesheet AI"].map((t) => (
                <div key={t} className="rounded-lg px-3 py-2 text-center text-xs font-mono"
                  style={{ background: "var(--input)", color: "var(--secondary-foreground)", border: "1px solid rgba(29,78,216,0.3)" }}>
                  {t}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg p-3"
              style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)" }}>
              <Cpu size={14} style={{ color: "#D4A017" }} />
              <span className="text-xs font-mono" style={{ color: "#D4A017" }}>CrimeGPT AI — Real-time analysis active</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SecBadge icon={Lock} label="Secure Login" />
            <SecBadge icon={ShieldCheck} label="E2E Encrypted" />
            <SecBadge icon={BadgeCheck} label="SHA-256 Verified" />
            <SecBadge icon={Building2} label="Gov. Network" />
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono" style={{ color: "#2E3F5E" }}>
          © 2024 Ahmedabad Cyber Crime Branch · Government of Gujarat
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #D4A017 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="w-full max-w-md anim-fadeup" style={{ animationDelay: "0.1s" }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <LogoMark size={40} />
            <span className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Crime<span style={{ color: "#D4A017" }}>GPT</span>
            </span>
          </div>

          <div className="rounded-2xl p-8 border bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(29,78,216,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"}}>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">Officer Login</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Access restricted to authorized personnel only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: "var(--secondary-foreground)" }}>
                  Email or Badge Number
                </label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="text"
                  className="w-full rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all font-['DM_Sans']"
                  style={{ background: "var(--secondary)", border: "1px solid rgba(212,160,23,0.2)", color: "var(--foreground)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,160,23,0.5)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  placeholder="mitesh@crimegpt.gov or GUJ-CYB-038" />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: "var(--secondary-foreground)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none pr-10 font-['DM_Sans']"
                    style={{ background: "var(--secondary)", border: "1px solid rgba(212,160,23,0.2)", color: "var(--foreground)" }}
                    onFocus={e => e.target.style.borderColor = "rgba(212,160,23,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                    placeholder="Enter your secure password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--muted-foreground)" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setRemember(v => !v)}
                    className="w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: remember ? "#D4A017" : "transparent",
                      borderColor: remember ? "#D4A017" : "rgba(212,160,23,0.3)",
                    }}>
                    {remember && <CheckCircle size={10} className="text-black" />}
                  </div>
                  <span className="text-xs font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>Remember me</span>
                </label>
                <button type="button" className="text-xs transition-colors font-['DM_Sans']"
                  style={{ color: "#D4A017" }}
                  onMouseOver={e => (e.target as HTMLElement).style.color = "#F4C430"}
                  onMouseOut={e => (e.target as HTMLElement).style.color = "#D4A017"}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-lg py-3 text-sm font-semibold transition-all font-['Outfit'] relative overflow-hidden disabled:opacity-70"
                style={{
                  background: loading ? "#0B1F4D" : "linear-gradient(135deg, #1D4ED8, #1e40af)",
                  color: "white",
                  border: "1px solid rgba(29,78,216,0.5)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(29,78,216,0.35)",
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.7s linear infinite" }} />
                    Authenticating...
                  </span>
                ) : "Login to CrimeGPT"}
              </button>
            </form>
            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                New officer?{" "}
                <button onClick={onSwitch} className="transition-colors font-medium font-['DM_Sans']"
                  style={{ color: "#D4A017" }}>
                  Request Account
                </button>
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <SecBadge icon={Lock} label="Secure Login" />
            <SecBadge icon={ShieldCheck} label="Encrypted" />
            <SecBadge icon={BadgeCheck} label="Gov Verified" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

function RegisterPage({ onSwitch, onLogin }: { onSwitch: () => void; onLogin: (u: AuthUser) => void }) {
  const [form, setForm] = useState({ name: "", badgeId: "", department: "Ahmedabad Cyber Crime Branch", email: "", password: "", confirm: "", role: "investigating_officer" as Role });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Passwords don't match");
      return;
    }
    setLoading(true);
    const parts = (form.name || "").trim().split(" ");
    const initials = parts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
    try {
      console.log("Target Supabase endpoint:", import.meta.env.VITE_SUPABASE_URL);
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            badgeId: form.badgeId,
            department: form.department,
            role: form.role,
            initials
          }
        }
      });
      if (error) {
        console.error("Signup Connection Error:", error);
      } else {
        alert("Registration successful! You may log in now.");
        onSwitch();
      }
    } catch (error) {
      console.error("Signup Connection Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = {
    background: "var(--secondary)", border: "1px solid rgba(212,160,23,0.2)", color: "var(--foreground)",
  };

  return (
    <div className="size-full flex items-center justify-center p-6 overflow-y-auto" style={{ background: "var(--background)" }}>
      <style>{STYLES}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)", top: "-5%", right: "-5%", animation: "authBgFloat 14s ease-in-out infinite" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-08"
          style={{ background: "radial-gradient(circle, #D4A017 0%, transparent 70%)", bottom: "10%", left: "-5%", animation: "authBgFloat2 16s ease-in-out infinite" }} />
      </div>

      <div className="w-full max-w-xl relative anim-fadeup">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <LogoMark size={44} />
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">Crime<span style={{ color: "#D4A017" }}>GPT</span></div>
            <div className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>Officer Registration</div>
          </div>
        </div>

        <div className="rounded-2xl p-8 border bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(29,78,216,0.12)"}}>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-['Outfit']">Create Officer Account</h2>
          <p className="text-xs mb-6 font-mono" style={{ color: "var(--muted-foreground)" }}>All fields required — account subject to supervisor approval</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "name", placeholder: "Rahul Sharma", col: "col-span-2" },
                { label: "Badge ID", key: "badgeId", placeholder: "GUJ-CYB-XXXX" },
                { label: "Department", key: "department", placeholder: "Ahmedabad Cyber Crime Branch" },
                { label: "Email", key: "email", placeholder: "officer@accb.gov.in", col: "col-span-2" },
              ].map(({ label, key, placeholder, col }) => (
                <div key={key} className={col || ""}>
                  <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: "var(--secondary-foreground)" }}>{label}</label>
                  <input value={(form as Record<string, string>)[key]} onChange={set(key)} placeholder={placeholder}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none font-['DM_Sans'] transition-all"
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(212,160,23,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"} />
                </div>
              ))}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono mb-2 uppercase tracking-wider" style={{ color: "var(--secondary-foreground)" }}>Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([r, label]) => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs text-left transition-all font-['DM_Sans'] bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{background: form.role === r ? "var(--sidebar-border)" : "var(--card)",
                      borderColor: form.role === r ? "rgba(212,160,23,0.5)" : "var(--sidebar-border)",
                      color: form.role === r ? "#D4A017" : "var(--secondary-foreground)"}}>
                    <div className="w-3 h-3 rounded-full border flex-shrink-0"
                      style={{ borderColor: form.role === r ? "#D4A017" : "var(--muted-foreground)", background: form.role === r ? "#D4A017" : "transparent" }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[{ label: "Password", key: "password" }, { label: "Confirm Password", key: "confirm" }].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: "var(--secondary-foreground)" }}>{label}</label>
                  <input type="password" value={(form as Record<string, string>)[key]} onChange={set(key)}
                    placeholder="••••••••" className="w-full rounded-lg px-4 py-2.5 text-sm outline-none font-['DM_Sans'] transition-all"
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(212,160,23,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"} />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold transition-all font-['Outfit'] mt-2"
              style={{
                background: "linear-gradient(135deg, #1D4ED8, #1e40af)",
                color: "white", border: "1px solid rgba(29,78,216,0.5)",
                boxShadow: "0 4px 20px rgba(29,78,216,0.3)",
              }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <button onClick={onSwitch} className="text-xs font-['DM_Sans']" style={{ color: "#D4A017" }}>
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileModal({ user, onClose }: { user: AuthUser, onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [badgeId, setBadgeId] = useState(user.badgeId);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthCtx);

  async function handleSave() {
    setLoading(true);
    const updates = { name, badgeId };
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (!error && data.user) {
      login(data.user.user_metadata as AuthUser);
      setEditing(false);
    } else {
      alert(error?.message || "Failed to update profile");
    }
    setLoading(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border p-6 anim-fadeup relative bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{scrollbarWidth: "none"}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><X size={20} /></button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-['Outfit'] flex items-center gap-2"><UserCircle /> Official Credentials</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
            {editing ? (
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-200 dark:border-slate-800" />
            ) : (
              <p className="text-sm text-slate-900 dark:text-white font-['DM_Sans']">{user.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Badge ID</label>
            {editing ? (
              <input type="text" value={badgeId} onChange={e => setBadgeId(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-200 dark:border-slate-800" />
            ) : (
              <p className="text-sm text-slate-900 dark:text-white font-['DM_Sans']">{user.badgeId}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Department</label>
            <p className="text-sm text-slate-900 dark:text-white font-['DM_Sans']">{user.department}</p>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Role / Rank</label>
            <p className="text-sm text-slate-900 dark:text-white font-['DM_Sans']">{ROLE_LABELS[user.role]}</p>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Account Status</label>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm text-green-400 font-bold font-mono">Active / E2E Encrypted</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-lg flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-200 dark:border-slate-800 hover:bg-slate-800 text-slate-900 dark:text-white rounded-lg">Edit Details</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border p-6 anim-fadeup relative bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{scrollbarWidth: "none"}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><X size={20} /></button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-['Outfit'] flex items-center gap-2"><Key /> Change Password</h3>
        
        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-green-400">
            <CheckCircle2 size={48} className="mb-4" />
            <p className="font-bold">Password updated securely!</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border-slate-200 dark:border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-lg flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function ProfileDropdown({ user, onLogout, onNav }: { user: AuthUser; onLogout: () => void; onNav: (v: NavId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{background: open ? "var(--border)" : "var(--card)",
          borderColor: open ? "rgba(212,160,23,0.4)" : "var(--border)"}}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
          style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white" }}>
          {user.initials}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-medium text-slate-900 dark:text-white font-['DM_Sans']">
            {user?.name ? user.name.split(" ")[0] : (user?.email?.split('@')[0] || 'Officer')}
          </div>
          <div className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
            {user?.role && ROLE_LABELS[user.role] ? ROLE_LABELS[user.role].split(" ")[0] : 'Officer'}
          </div>
        </div>
        <ChevronDown size={12} style={{ color: "var(--muted-foreground)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border z-50 overflow-hidden anim-fadein"
          style={{ background: "var(--popover)", borderColor: "var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white" }}>
                {user.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white font-['Outfit']">{user.name}</p>
                <p className="text-xs font-mono" style={{ color: "#D4A017" }}>{user.badgeId}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {[
                { icon: Building2, label: user.department },
                { icon: Shield, label: ROLE_LABELS[user.role] },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={11} style={{ color: "var(--muted-foreground)" }} />
                  <span className="text-xs font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div className="p-2">
            {[
              { icon: UserCircle, label: "My Profile", action: () => { setOpen(false); setIsProfileModalOpen(true); } },
              { icon: Key, label: "Change Password", action: () => { setOpen(false); setIsPasswordModalOpen(true); } },
            ].map(({ icon: Icon, label, badge, action }) => (
              <button key={label} type="button" onClick={(e) => { e.preventDefault(); action(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors font-['DM_Sans'] text-left"
                style={{ color: "var(--secondary-foreground)" }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(212,160,23,0.08)")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
                <Icon size={14} />
                <span className="flex-1">{label}</span>
                {badge && <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(220,38,38,0.15)", color: "#ef4444" }}>{badge}</span>}
              </button>
            ))}
          </div>

          <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors font-['DM_Sans']"
              style={{ color: "#ef4444" }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(220,38,38,0.1)")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
              <LogOut size={14} /><span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {isProfileModalOpen && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />}
      {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, active, onNav, collapsed, onCollapse, isAnalyzing = false }: {
  user: AuthUser; active: NavId; onNav: (v: NavId) => void; collapsed: boolean; onCollapse: () => void; isAnalyzing?: boolean;
}) {
  const { t } = useTranslation();
  const allowedTabIds = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Investigating Officer'];
  const navItems = ALL_NAV.filter(n => allowedTabIds.includes(n.id));

  return (
    <aside className="flex flex-col border-r overflow-hidden shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 56 : 224,
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}>
      {/* Logo */}
      <div className={`flex ${collapsed ? 'flex-col justify-center gap-3' : 'items-center gap-2.5'} px-3 py-4 border-b`} style={{ borderColor: "var(--sidebar-border)" }}>
        <LogoMark size={collapsed ? 28 : 32} className={`flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] whitespace-nowrap">
              Crime<span style={{ color: "#D4A017" }}>GPT</span>
            </div>
            <div className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>ACCB · SECURE</div>
          </div>
        )}
        <button onClick={onCollapse}
          className={`${collapsed ? 'mx-auto mt-1' : 'ml-auto'} p-1 rounded-md transition-colors flex-shrink-0`}
          style={{ color: "var(--muted-foreground)", background: collapsed ? "var(--sidebar-border)" : "transparent" }}
          onMouseOver={e => (e.currentTarget.style.color = "#D4A017")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--muted-foreground)")}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const isActive = active === id;
          return (
            <button key={id} type="button" onClick={(e) => { e.preventDefault(); onNav(id); }}
              title={collapsed ? (t[id] || label) : undefined}
              className={`w-full relative flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-2.5'} py-2 rounded-lg text-sm transition-all`}
              style={{
                background: isActive ? "var(--sidebar-border)" : "transparent",
                color: isActive ? "#D4A017" : "var(--secondary-foreground)",
                border: `1px solid ${isActive ? "rgba(212,160,23,0.3)" : "transparent"}`,
                boxShadow: isActive ? "0 0 12px rgba(212,160,23,0.08)" : "none",
              }}
              onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = "rgba(212,160,23,0.05)"; e.currentTarget.style.color = "var(--foreground)"; } }}
              onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--secondary-foreground)"; } }}>
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="font-['DM_Sans'] whitespace-nowrap text-sm flex-1 text-left">{t(label)}</span>
                  {badge !== undefined && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: isActive ? "var(--border)" : "rgba(29,78,216,0.2)", color: isActive ? "#D4A017" : "var(--secondary-foreground)" }}>
                      {badge}
                    </span>
                  )}
                  {id === "investigation" && isAnalyzing && (
                    <span title="AI Copilot Active: Running Background Forensic Analysis..." className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border flex items-center justify-center animate-pulse"
                      style={{ background: "rgba(212,160,23,0.1)", color: "#D4A017", borderColor: "rgba(212,160,23,0.3)" }}>
                      <Loader2 size={12} className="animate-spin" />
                    </span>
                  )}
                </>
              )}
              {collapsed && id === "investigation" && isAnalyzing && (
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse border border-white dark:border-[#1C2541]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Officer info */}
      {!collapsed && (
        <div className="px-3 py-3 border-t mx-2 mb-2 rounded-lg"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--input)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white" }}>
              {user.initials}
            </div>
            <div className="min-w-0 flex flex-col">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                 <p className="text-[10px] font-bold text-amber-400 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ user, active, onMenuToggle, onLogout, onNav }: {
  user: AuthUser; active: NavId; onMenuToggle: () => void; onLogout: () => void; onNav: (v: NavId) => void;
}) {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [optimisticLang, setOptimisticLang] = useState<string | null>(null);

  const handleLanguageSwitch = (newLang: string) => {
    setOptimisticLang(newLang);
    i18n.changeLanguage(newLang).then(() => {
      setOptimisticLang(null);
    });
    
    supabase
      .from('system_settings')
      .update({ default_language: newLang })
      .eq('id', 1)
      .then(({ error }) => {
        if (error) console.error("Failed to sync language to DB:", error);
      });
  };

  const displayLang = optimisticLang || i18n.language;

  const defaultLabel = ALL_NAV.find(n => n.id === active)?.label ?? "Dashboard";
  const label = t(defaultLabel);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0 relative z-40"
      style={{
        background: "var(--background)", backdropFilter: "blur(12px)",
        borderColor: "var(--sidebar-border)",
      }}>
      <button onClick={onMenuToggle} className="md:hidden p-1.5 rounded-lg transition-colors" style={{ color: "var(--muted-foreground)" }}>
        <Menu size={18} />
      </button>

      <h1 className="text-sm font-semibold text-slate-900 dark:text-white font-['Outfit']">{label}</h1>
      {active === "investigation" && (
        <span className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white dark:bg-[#1C2541] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {[
            { code: 'English', label: 'English' },
            { code: 'Hindi', label: 'हिन्दी' },
            { code: 'Gujarati', label: 'ગુજરાતી' }
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSwitch(lang.code)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${displayLang === lang.code ? 'bg-[#D4A017] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>



        {/* Theme Toggle Slider */}
        <button 
          onClick={toggleTheme}
          className="relative w-12 h-6 rounded-full flex items-center p-1 transition-colors border"
          style={{ background: "var(--switch-background)", borderColor: "var(--border)" }}
        >
          <div className="w-full h-full flex justify-between items-center px-0.5">
            <Moon size={10} className="text-slate-600 dark:text-slate-400" />
            <Sun size={10} className="text-yellow-500" />
          </div>
          <div 
            className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm"
            style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(24px)' }}
          />
        </button>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
          style={{ background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.2)" }}>
          <Zap size={12} className="text-green-400" />
          <span className="text-xs font-mono text-green-400">SYSTEM NOMINAL</span>
        </div>

        {/* Demo Role Switcher */}
        <select 
          value={user.role}
          onChange={(e) => login({ ...user, role: e.target.value as UserRole })}
          className="hidden lg:block text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg px-2 py-1 outline-none cursor-pointer"
        >
          <option value="Administrator">Administrator</option>
          <option value="Senior Officer / Supervisor">Senior Officer / Supervisor</option>
          <option value="Investigating Officer">Investigating Officer</option>
          <option value="Legal Officer">Legal Officer</option>
          <option value="Forensic Expert">Forensic Expert</option>
        </select>

        <ProfileDropdown user={user} onLogout={onLogout} onNav={onNav} />
      </div>
    </header>
  );
}



// ─── Investigation View ───────────────────────────────────────────────────────

function InvestigationView({
  input, setInput, loading, resultData, error, analyzeCase
}: {
  input: string, setInput: (v: string) => void,
  loading: boolean, resultData: any, error: string | null,
  analyzeCase: () => void
}) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function exportInvestigationReport() {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById("investigation-report-pdf");
      const opt = {
        margin: 10,
        filename: `Investigation_Report_${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  // Get status color matching Figma aesthetics
  const getSeverityDetails = (sev: string) => {
    switch(sev?.toUpperCase()) {
      case 'CRITICAL': return { color: '#e11d48', label: 'CRITICAL', glow: 'rgba(225,29,72,0.4)' }; // ruby red
      case 'HIGH': return { color: '#f43f5e', label: 'HIGH', glow: 'rgba(244,63,94,0.4)' }; // rose
      case 'MEDIUM': return { color: '#fbbf24', label: 'MEDIUM', glow: 'rgba(251,191,36,0.4)' }; // amber
      case 'LOW': return { color: '#10b981', label: 'LOW', glow: 'rgba(16,185,129,0.4)' }; // emerald
      default: return { color: '#5E7399', label: sev || 'UNKNOWN', glow: 'rgba(94,115,153,0.4)' };
    }
  };

  const getEntityIcon = (role: string) => {
    switch(role?.toUpperCase()) {
      case 'SUSPECT': 
      case 'VICTIM': return <UserCircle size={14} />;
      case 'WITNESS': return <Shield size={14} />;
      case 'LOCATION': return <MapPin size={14} />;
      default: return <Users size={14} />;
    }
  };
  const getEntityColor = (role: string) => {
    switch(role?.toUpperCase()) {
      case 'SUSPECT': return '#e11d48';
      case 'VICTIM': return '#10b981';
      case 'WITNESS': return '#fbbf24';
      default: return '#5E7399';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Context bar */}
        <div className="flex items-center gap-2 px-6 py-4 border-b flex-shrink-0 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(8px)"}}>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" style={{ boxShadow: "0 0 10px rgba(59,130,246,0.8)" }} />
          <span className="text-xs font-mono tracking-wider font-semibold" style={{ color: "var(--secondary-foreground)" }}>AI-COPILOT-ACTIVE</span>
          <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-sm text-slate-900 dark:text-white font-['DM_Sans'] truncate font-medium">Advanced Narrative Analysis</span>
        </div>

        {/* Input & Results Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8" style={{ scrollbarWidth: "none" }}>
          
          {/* Input Box */}
          <div className="no-print rounded-2xl border p-6 transition-all duration-300 hover:bg-slate-800/20 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={18} style={{ color: "#D4A017" }} />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-['Outfit'] tracking-wide">{t.firNarrative || 'FIR Narrative'}</h3>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={t.placeholder_fir || "e.g., On 15th July, the suspect was seen transferring 50,000 INR using a forged UPI app..."} rows={5}
              className="w-full bg-transparent text-sm outline-none resize-y leading-relaxed font-['DM_Sans'] transition-all focus:ring-2 focus:ring-indigo-500/50 rounded-lg p-3"
              style={{ color: "var(--foreground)", border: "1px solid rgba(212,160,23,0.15)", scrollbarWidth: "none", background: "rgba(15,30,61,0.4)" }} />
            
            <div className="mt-5 flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Auto-extracts entities & maps legal statutes.
              </span>
              <button onClick={analyzeCase} disabled={!input.trim() || loading}
                className="px-6 py-2.5 rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{background: "linear-gradient(135deg,#D4A017,#b4860b)", color: "var(--card)", boxShadow: "0 4px 15px rgba(212,160,23,0.3)"}}>
                <Search size={16} />
                <span className="text-sm font-bold">{loading ? (t.investigating || 'Investigating...') : (t.startAnalysis || 'Start Analysis')}</span>
              </button>
            </div>
            {error && (
              <div className="mt-5 p-4 rounded-xl text-sm flex items-center gap-3 anim-fadein" style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.3)", color: "#f43f5e" }}>
                <AlertTriangle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Elegant Loading Overlay */}
          {loading && (
            <div className="rounded-2xl border p-10 flex flex-col items-center justify-center anim-fadein bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 animate-spin" style={{ borderColor: "#D4A017", animationDuration: '1s' }} />
                <div className="absolute inset-2 rounded-full border-b-2 border-l-2 animate-spin" style={{ borderColor: "#3b82f6", animationDuration: '1.5s', animationDirection: 'reverse' }} />
                <Cpu size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ color: "var(--foreground)" }} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-['Outfit'] mb-2">Compiling Legal Analysis</h3>
              <p className="text-sm font-mono text-center animate-pulse" style={{ color: "var(--secondary-foreground)" }}>Scanning narrative and querying BNS statutes...</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && resultData && (
            <div className="space-y-8 anim-fadeup print-area">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border p-6 flex flex-col justify-center transition-all hover:bg-slate-800/40 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(10px)"}}>
                  <div className="flex items-center gap-2 mb-3">
                    <ScanLine size={16} style={{ color: "#D4A017" }} />
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: "var(--secondary-foreground)" }}>Classification</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">{resultData.analysis?.crime_classification || "Unclassified"}</span>
                </div>
                
                <div className="rounded-2xl border p-6 flex flex-col justify-center transition-all hover:bg-slate-800/40 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(10px)"}}>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={16} style={{ color: "#D4A017" }} />
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: "var(--secondary-foreground)" }}>Severity</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20" 
                      style={{ background: getSeverityDetails(resultData.analysis?.severity_assessment?.split(' ')[0]).color, boxShadow: `0 0 20px ${getSeverityDetails(resultData.analysis?.severity_assessment?.split(' ')[0]).glow}` }} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white uppercase font-['Outfit'] tracking-wide">
                      {getSeverityDetails(resultData.analysis?.severity_assessment?.split(' ')[0]).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-6 transition-all hover:bg-slate-800/40 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(10px)"}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <FileSearch size={18} style={{ color: "#D4A017" }} /> Executive Summary
                  </h3>
                  <button onClick={exportInvestigationReport} disabled={isGeneratingPdf} className="no-print flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-700/50" style={{ border: "1px solid rgba(212,160,23,0.3)", color: "#D4A017", boxShadow: "0 0 10px rgba(212,160,23,0.2)" }}>
                    {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                    {isGeneratingPdf ? "Generating PDF..." : "Export Official Case Report"}
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{resultData.analysis?.summary}</p>
                
                {resultData.analysis?.recommended_immediate_action && (
                  <div className="mt-6 p-5 rounded-xl transition-all" style={{ background: "var(--border)", border: "1px solid rgba(212,160,23,0.25)" }}>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "#D4A017" }}>
                      <Zap size={16} className="anim-goldpulse rounded-full" /> Immediate Action Required
                    </h4>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">{resultData.analysis.recommended_immediate_action}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Scale size={18} style={{ color: "var(--muted-foreground)" }} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest font-mono" style={{ color: "var(--secondary-foreground)" }}>{t.legalMapping || 'Mapped Legal Provisions'}</h3>
                </div>
                <div className="space-y-6">
                  {resultData.legal_intelligence?.recommended_provisions?.map((prov: any, idx: number) => (
                    <div key={idx} className="rounded-2xl border transition-all hover:bg-slate-800/40 overflow-hidden flex bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
                      {/* Accent Left Border */}
                      <div className="w-2 flex-shrink-0" style={{ background: "linear-gradient(to bottom, #D4A017, #b4860b)" }} />
                      
                      <div className="p-6 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide" style={{ background: "var(--border)", color: "#D4A017", border: "1px solid rgba(212,160,23,0.3)" }}>
                            [{prov.act}]
                          </span>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Section {prov.section_number}</h4>
                        </div>
                        <p className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>{prov.offence_title}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6" style={{ borderTop: "1px solid rgba(212,160,23,0.15)" }}>
                          <div>
                            <span className="text-xs font-mono uppercase tracking-widest mb-3 block font-semibold" style={{ color: "var(--secondary-foreground)" }}>Contextual Application</span>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{prov.why_it_applies}</p>
                          </div>
                          <div>
                            <span className="text-xs font-mono uppercase tracking-widest mb-3 block flex items-center gap-2 font-semibold" style={{ color: "var(--secondary-foreground)" }}>
                              <ClipboardList size={14} /> Investigation Checklist
                            </span>
                            <div className="space-y-3">
                              {prov.investigation_checklist?.map((check: string, i: number) => (
                                <label key={i} className="flex items-start gap-3 text-sm cursor-pointer group">
                                  <div className="w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-all group-hover:border-emerald-400 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{borderColor: "rgba(212,160,23,0.4)"}}>
                                    <CheckCircle size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "#10b981" }} />
                                  </div>
                                  <span className="flex-1 leading-relaxed text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">{check}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!resultData.legal_intelligence?.recommended_provisions || resultData.legal_intelligence.recommended_provisions.length === 0) && (
                    <div className="text-center py-8 rounded-2xl border border-dashed" style={{ borderColor: "rgba(94,115,153,0.3)" }}>
                      <Scale size={24} className="mx-auto mb-3 opacity-40" style={{ color: "var(--muted-foreground)" }} />
                      <p className="text-sm italic" style={{ color: "var(--muted-foreground)" }}>No legal provisions mapped yet. Run an analysis.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Right panel - Entities */}
      <div className="hidden xl:flex w-72 border-l flex-col flex-shrink-0" style={{ background: "rgba(11,21,48,0.6)", borderColor: "var(--border)", backdropFilter: "blur(10px)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest font-mono flex items-center gap-2" style={{ color: "var(--secondary-foreground)" }}>
            <Users size={14} /> {t.extractedEntities || 'Extracted Entities'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "none" }}>
          {resultData?.analysis?.extracted_entities?.map((e: any, idx: number) => {
            const color = getEntityColor(e.role);
            return (
              <div key={idx} className="w-full flex flex-col gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] cursor-default anim-fadein"
                style={{ background: `linear-gradient(145deg, rgba(15,30,61,0.8), rgba(11,21,48,0.9))`, border: `1px solid ${color}30`, boxShadow: `0 4px 12px rgba(0,0,0,0.2)`, animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest font-bold" style={{ color }}>
                    {getEntityIcon(e.role)} {e.role}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate font-['Outfit']">{e.name}</span>
                <span className="text-xs font-medium" style={{ color: "var(--secondary-foreground)" }}>{e.entity_type}</span>
              </div>
            );
          })}
          {(!resultData?.analysis?.extracted_entities || resultData.analysis.extracted_entities.length === 0) && (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                <Users size={20} className="opacity-50" style={{ color: "var(--muted-foreground)" }} />
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{t.no_entities || 'No entities extracted yet.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Template for Investigation Report */}
      <div className="hidden">
        <div id="investigation-report-pdf" style={{ padding: "40px", fontFamily: "Arial, sans-serif", color: "#000", background: "#fff", width: "100%", maxWidth: "800px" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
              <Shield size={40} style={{ color: "#000" }} />
            </div>
            <h1 style={{ fontSize: "20px", margin: "0 0 5px 0", fontWeight: "bold" }}>AHMEDABAD CYBER CRIME BRANCH</h1>
            <h2 style={{ fontSize: "14px", margin: "0", fontWeight: "normal", letterSpacing: "1px" }}>OFFICIAL INVESTIGATION REPORT</h2>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "11px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
            <div>
              <p style={{ margin: "2px 0" }}><strong>Investigating Officer:</strong> {user?.name || 'N/A'}</p>
              <p style={{ margin: "2px 0" }}><strong>Badge ID:</strong> {user?.badgeId || 'N/A'}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "2px 0" }}><strong>Date Generated:</strong> {new Date().toLocaleString()}</p>
              <p style={{ margin: "2px 0" }}><strong>Classification:</strong> {resultData?.analysis?.crime_classification || 'N/A'}</p>
            </div>
          </div>

          <div style={{ marginBottom: "15px", padding: "6px 10px", background: "#f8f9fa", border: "1px solid #e9ecef" }}>
            <h3 style={{ fontSize: "12px", margin: "0 0 5px 0", textTransform: "uppercase" }}>Severity Assessment</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold", margin: "0" }}>{resultData?.analysis?.severity_assessment || 'N/A'}</p>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ fontSize: "12px", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "5px", textTransform: "uppercase" }}>Original Complaint Narrative</h3>
            <p style={{ fontSize: "10px", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>{input}</p>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ fontSize: "12px", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "5px", textTransform: "uppercase" }}>{t.extractedEntities || 'Extracted Entities'}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "10px" }}>
              <thead>
                <tr style={{ background: "#f1f1f1" }}>
                  <th style={{ padding: "4px", border: "1px solid #ddd", textAlign: "left" }}>Role</th>
                  <th style={{ padding: "4px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "4px", border: "1px solid #ddd", textAlign: "left" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {resultData?.analysis?.extracted_entities?.map((e: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: "4px", border: "1px solid #ddd" }}>{e.role}</td>
                    <td style={{ padding: "4px", border: "1px solid #ddd", fontWeight: "bold" }}>{e.name}</td>
                    <td style={{ padding: "4px", border: "1px solid #ddd" }}>{e.entity_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: "15px", pageBreakInside: "avoid" }}>
            <h3 style={{ fontSize: "12px", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "5px", textTransform: "uppercase" }}>{t.legalMapping || 'Recommended Legal Provisions'}</h3>
            {resultData?.legal_intelligence?.recommended_provisions?.map((prov: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: "bold", margin: "0 0 3px 0", lineHeight: "1.3" }}>[{prov.act}] Section {prov.section_number}: {prov.offence_title}</p>
                <p style={{ fontSize: "10px", margin: "0", lineHeight: "1.3" }}><em>Context: {prov.why_it_applies}</em></p>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: "10px", pageBreakInside: "avoid" }}>
            <div style={{ borderTop: "2px solid #000", borderBottom: "1px solid #000", padding: "5px 0", marginBottom: "15px", background: "#f8f9fa", textAlign: "center" }}>
              <h3 style={{ fontSize: "14px", margin: "0", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>Standard Operating Procedure: Investigation Checklist</h3>
            </div>
            
            {resultData?.legal_intelligence?.recommended_provisions?.map((prov: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "15px", pageBreakInside: "avoid" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0", color: "#333", borderBottom: "1px dashed #ccc", paddingBottom: "3px" }}>
                  Tasks for Section {prov.section_number} ({prov.act})
                </h4>
                <div style={{ paddingLeft: "10px" }}>
                  {prov.investigation_checklist?.map((check: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ width: "12px", height: "12px", border: "1.5px solid #000", marginRight: "10px", flexShrink: 0, marginTop: "1px", background: "#fff", borderRadius: "1px" }}></div>
                      <span style={{ fontSize: "11px", lineHeight: "1.3" }}>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between", pageBreakInside: "avoid" }}>
            <div style={{ width: "40%", textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000", height: "40px", marginBottom: "5px" }}></div>
              <p style={{ fontSize: "11px", margin: "0" }}>Investigating Officer Signature</p>
              <p style={{ fontSize: "9px", color: "#555", margin: "2px 0 0 0" }}>{user?.name} (Badge: {user?.badgeId})</p>
            </div>
            <div style={{ width: "40%", textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000", height: "40px", marginBottom: "5px" }}></div>
              <p style={{ fontSize: "11px", margin: "0" }}>Supervising Magistrate Approval</p>
              <p style={{ fontSize: "9px", color: "#555", margin: "2px 0 0 0" }}>Official Seal & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cases View ───────────────────────────────────────────────────────────────

function CasesView({ cases = [], onCaseCreated, onCaseUpdated, onCaseDeleted }: { cases?: CaseData[], onCaseCreated?: (c: CaseData) => void, onCaseUpdated?: (c: CaseData) => void, onCaseDeleted?: (id: string) => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | CaseStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfCaseId, setPdfCaseId] = useState<string | null>(null);
  const [pdfEvidence, setPdfEvidence] = useState<any[]>([]);
  
  // Modal Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cyber Fraud");
  const [assignee, setAssignee] = useState("IO Rahul Sharma");
  const [status, setStatus] = useState<CaseStatus>("active");
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);

  const activePdfCase = cases.find(c => c.id === pdfCaseId);

  async function exportCaseSummary(caseData: CaseData) {
    setPdfCaseId(caseData.id);
    try {
      const { data } = await supabase.from('evidence_metadata').select('*').order('upload_date', { ascending: false });
      setPdfEvidence(data || []);
      
      // Wait for React to render the hidden template with state
      setTimeout(async () => {
        const element = document.getElementById(`case-summary-pdf`);
        if (!element) return;
        const opt = {
          margin: 15,
          filename: `Case_Summary_${caseData.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
        setPdfCaseId(null);
      }, 800);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfCaseId(null);
    }
  }

  // Local fetch logic removed - now using global state.

  const filtered = filter === "all" ? cases : cases.filter(c => c.status === filter);

  const handleUpdateStatus = async (e: React.ChangeEvent<HTMLSelectElement>, caseId: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as CaseStatus;
    const { error } = await supabase.from('cases').update({ status: newStatus }).eq('id', caseId);
    if (!error && onCaseUpdated) {
      const updatedCase = cases.find(c => c.id === caseId);
      if (updatedCase) onCaseUpdated({ ...updatedCase, status: newStatus });
    }
  };

  const handleUpdateAssignee = async (e: React.FocusEvent<HTMLInputElement>, caseId: string, oldAssignee: string) => {
    e.stopPropagation();
    const newAssignee = e.target.value;
    if (newAssignee === oldAssignee) return;
    const { error } = await supabase.from('cases').update({ assignee: newAssignee }).eq('id', caseId);
    if (!error && onCaseUpdated) {
      const updatedCase = cases.find(c => c.id === caseId);
      if (updatedCase) onCaseUpdated({ ...updatedCase, assignee: newAssignee });
    }
  };

  const handleDeleteCase = async (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    const { error } = await supabase.from('cases').delete().eq('id', caseId);
    if (!error && onCaseDeleted) {
      onCaseDeleted(caseId);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const safeCasePayload = {
      id: crypto.randomUUID(),
      title,
      status: status?.toLowerCase() || 'active',
      priority: "high", 
      assignee,
      progress: 0,
      date: new Date().toISOString(),
      location: "Unassigned",
      case_number: `ACCB-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user?.id || null
    };
    
    try {
      const { data: createdCase, error } = await supabase.from('cases').insert([safeCasePayload]).select().single();
      if (error) {
        toast.error(`Database Error: ${error.message}`);
        return;
      }
      
      toast.success("Case successfully initialized in Registry.");
      setIsModalOpen(false);
      
      // Reset form
      setTitle("");
      setCategory("Cyber Fraud");
      setAssignee("IO Rahul Sharma");
      setStatus("active");
      
      if (onCaseCreated) onCaseCreated((createdCase || safeCasePayload) as CaseData);
    } catch (err: any) {
      toast.error(`Network Error: ${err.message || 'Failed to connect to database'}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Outfit']">{t.case_registry || 'Case Registry'}</h2>
          <p className="text-sm font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>{cases.length} cases · {cases.filter(c => c.status === "active").length} active</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg p-1 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{border: "1px solid rgba(212,160,23,0.12)"}}>
            {(["all", "active", "critical", "pending", "closed"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1 rounded-md text-xs font-mono transition-all"
                style={{
                  background: filter === s ? "var(--secondary)" : "transparent",
                  color: filter === s ? "#D4A017" : "var(--muted-foreground)",
                  border: filter === s ? "1px solid rgba(212,160,23,0.25)" : "1px solid transparent",
                  textTransform: "capitalize"
                }}>{t[`filter_${s}`] || s}</button>
            ))}
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all font-['Outfit']"
            style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white", border: "1px solid rgba(29,78,216,0.4)" }}>
            <Plus size={13} />{t.new_case_btn || 'New Case'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{borderColor: "var(--sidebar-border)"}}>
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b text-xs font-mono uppercase tracking-wider"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          <span>{t.col_case || 'Case'}</span><span>{t.col_status || 'Status'}</span><span>{t.col_assignee || 'Assignee'}</span><span>{t.col_date || 'Date'}</span><span>{t.col_progress || 'Progress'}</span>
        </div>
        {cases.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>No cases found. Create a new case to get started.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>No {filter} cases found.</div>
        ) : filtered.map(c => (
          <div key={c.id} className="grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b items-center cursor-pointer transition-all"
            style={{ borderColor: "var(--border)" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(212,160,23,0.04)")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: { critical:"#dc2626", active:"#1D4ED8", pending:"#D4A017", closed:"var(--muted-foreground)" }[c.status] }} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate font-['DM_Sans']">{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{c.id}</span>
                  <span className="text-xs flex items-center gap-1 font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>
                    <MapPin size={10} />{c.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <select 
                value={c.status} 
                onChange={(e) => handleUpdateStatus(e, c.id)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent text-xs font-mono font-bold focus:outline-none cursor-pointer"
                style={{ color: { critical:"#dc2626", active:"#3b82f6", pending:"#D4A017", closed:"var(--muted-foreground)" }[c.status] }}
              >
                <option value="active" className="text-slate-900">ACTIVE</option>
                <option value="pending" className="text-slate-900">PENDING</option>
                <option value="critical" className="text-slate-900">CRITICAL</option>
                <option value="closed" className="text-slate-900">CLOSED</option>
              </select>
            </div>
            <div className="hidden md:block text-xs font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>
              <input 
                type="text" 
                defaultValue={c.assignee === 'Unassigned' ? (t.unassigned || 'Unassigned') : c.assignee}
                onBlur={(e) => handleUpdateAssignee(e, c.id, c.assignee)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent w-full focus:outline-none border-b border-transparent focus:border-indigo-500 pb-0.5 transition-colors" 
              />
            </div>
            <span className="hidden md:block text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{c.date ? new Date(c.date).toLocaleDateString('en-GB') : ''}</span>
            <div className="hidden md:flex items-center justify-end w-auto gap-3">
              <button onClick={(e) => handleDeleteCase(e, c.id)} className="p-1.5 rounded text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete Case">
                <Trash size={14} />
              </button>
              {c.status === "closed" && (
                <button 
                  onClick={(e) => { e.stopPropagation(); exportCaseSummary(c); }} 
                  disabled={pdfCaseId === c.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Outfit'] transition-all hover:bg-slate-700/50"
                  style={{ border: "1px solid rgba(212,160,23,0.3)", color: "#D4A017" }}>
                  {pdfCaseId === c.id ? <Loader2 size={13} className="animate-spin" /> : <DownloadCloud size={13} />}
                  {pdfCaseId === c.id ? "Generating..." : "PDF"}
                </button>
              )}
              <span className="text-xs font-mono font-bold" style={{ color: "#D4A017" }}>{c.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,21,48,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 anim-fadeup bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{boxShadow: "0 10px 40px rgba(0,0,0,0.5)"}}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-['Outfit']">Create New Case</h3>
            <p className="text-sm mb-6" style={{ color: "var(--secondary-foreground)" }}>Initialize a new investigation record.</p>
            
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--secondary-foreground)" }}>Operation Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  style={{ borderColor: "rgba(94,115,153,0.3)" }} placeholder="e.g. Operation Nightfall" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--secondary-foreground)" }}>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  style={{ borderColor: "rgba(94,115,153,0.3)" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--secondary-foreground)" }}>Assignee</label>
                  <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    style={{ borderColor: "rgba(94,115,153,0.3)" }} />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: "var(--secondary-foreground)" }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as CaseStatus)}
                    className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none" 
                    style={{ borderColor: "rgba(94,115,153,0.3)" }}>
                    <option value="active">Active</option>
                    <option value="critical">Critical</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono mb-1" style={{ color: "var(--secondary-foreground)" }}>Assigned Date</label>
                <input type="date" value={assignedDate} onChange={e => setAssignedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B132B] border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]" 
                  style={{ borderColor: "rgba(94,115,153,0.3)" }} />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6" style={{ borderColor: "var(--border)", paddingTop: "1rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-['Outfit'] rounded-lg transition-colors hover:bg-slate-800" style={{ color: "var(--secondary-foreground)" }}>
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-sm font-['Outfit'] font-bold rounded-lg transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white", boxShadow: "0 4px 15px rgba(29,78,216,0.3)" }}>
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePdfCase && (
        <div className="hidden">
          <div id="case-summary-pdf" style={{ padding: "40px", fontFamily: "Arial, sans-serif", color: "#000", background: "#fff", width: "100%", maxWidth: "800px" }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                <Shield size={48} style={{ color: "#000" }} />
              </div>
              <h1 style={{ fontSize: "22px", margin: "0 0 5px 0", fontWeight: "bold" }}>AHMEDABAD CYBER CRIME BRANCH</h1>
              <h2 style={{ fontSize: "16px", margin: "0", fontWeight: "normal", letterSpacing: "1px" }}>OFFICIAL CASE SUMMARY REPORT</h2>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", fontSize: "12px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <div>
                <p style={{ margin: "2px 0" }}><strong>Investigating Officer:</strong> {activePdfCase.assignee}</p>
                <p style={{ margin: "2px 0" }}><strong>Badge ID:</strong> {user?.badgeId || 'N/A'}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "2px 0" }}><strong>Case ID:</strong> {activePdfCase.id}</p>
                <p style={{ margin: "2px 0" }}><strong>Date Opened:</strong> {activePdfCase.date}</p>
                <p style={{ margin: "2px 0" }}><strong>Date Closed:</strong> {new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>

            <div style={{ marginBottom: "20px", padding: "10px", background: "#f8f9fa", border: "1px solid #e9ecef" }}>
              <h3 style={{ fontSize: "14px", margin: "0 0 10px 0", textTransform: "uppercase" }}>Operation Details</h3>
              <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 5px 0" }}>{activePdfCase.title}</p>
              <p style={{ fontSize: "12px", margin: "0" }}><strong>Location:</strong> {activePdfCase.location} | <strong>Priority:</strong> {activePdfCase.priority.toUpperCase()}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "10px", textTransform: "uppercase" }}>Chain of Custody - Digital Evidence</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: "#f1f1f1" }}>
                    <th style={{ padding: "6px", border: "1px solid #ddd", textAlign: "left" }}>File Name</th>
                    <th style={{ padding: "6px", border: "1px solid #ddd", textAlign: "left" }}>Upload Date</th>
                    <th style={{ padding: "6px", border: "1px solid #ddd", textAlign: "left" }}>Size</th>
                    <th style={{ padding: "6px", border: "1px solid #ddd", textAlign: "left" }}>SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfEvidence.map((ev: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ padding: "6px", border: "1px solid #ddd", fontWeight: "bold" }}>{ev.filename}</td>
                      <td style={{ padding: "6px", border: "1px solid #ddd" }}>{new Date(ev.upload_date).toLocaleString()}</td>
                      <td style={{ padding: "6px", border: "1px solid #ddd" }}>{ev.file_size}</td>
                      <td style={{ padding: "6px", border: "1px solid #ddd", fontFamily: "monospace", wordBreak: "break-all" }}>{ev.sha256_hash}</td>
                    </tr>
                  ))}
                  {pdfEvidence.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center", fontStyle: "italic" }}>No digital evidence files linked to this case.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between", pageBreakInside: "avoid" }}>
              <div style={{ width: "40%", textAlign: "center" }}>
                <div style={{ borderBottom: "1px solid #000", height: "40px", marginBottom: "5px" }}></div>
                <p style={{ fontSize: "12px", margin: "0" }}>Investigating Officer Signature</p>
                <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0 0" }}>{activePdfCase.assignee}</p>
              </div>
              <div style={{ width: "40%", textAlign: "center" }}>
                <div style={{ borderBottom: "1px solid #000", height: "40px", marginBottom: "5px" }}></div>
                <p style={{ fontSize: "12px", margin: "0" }}>Supervising Magistrate Approval</p>
                <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0 0" }}>Official Seal & Date</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports View ─────────────────────────────────────────────────────────────

function ReportsView() {
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-['Outfit']">Intelligence Reports</h2>
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>AI-generated case summaries and analytical briefs</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Q4 2024 — Cyber Crime Overview", type: "Quarterly Report", date: "Nov 14, 2024", pages: 24, status: "ready", color: "#1D4ED8" },
          { title: "Operation Nightfall — Case Summary", type: "Case Report", date: "Nov 13, 2024", pages: 18, status: "ready", color: "#D4A017" },
          { title: "Financial Network Analysis — Gujarat", type: "Analytical Report", date: "Nov 12, 2024", pages: 31, status: "ready", color: "#7c3aed" },
          { title: "Phishing Campaigns — Banking Sector", type: "Threat Assessment", date: "Nov 10, 2024", pages: 15, status: "draft", color: "#F4C430" },
          { title: "Dark Web Activity — November 2024", type: "Intelligence Brief", date: "Nov 8, 2024", pages: 9, status: "ready", color: "#10b981" },
          { title: "Monthly Activity Digest", type: "Digest", date: "Nov 7, 2024", pages: 6, status: "processing", color: "var(--muted-foreground)" },
        ].map(r => (
          <div key={r.title} className="rounded-xl border p-5 cursor-pointer transition-all group bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{borderColor: "var(--sidebar-border)"}}
            onMouseOver={e => { e.currentTarget.style.borderColor = `${r.color}40`; e.currentTarget.style.boxShadow = `0 0 20px ${r.color}10`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--sidebar-border)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${r.color}18`, border: `1px solid ${r.color}28` }}>
                <BookOpen size={14} style={{ color: r.color }} />
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md border"
                style={{
                  background: r.status === "ready" ? "rgba(16,185,129,0.1)" : r.status === "draft" ? "var(--border)" : "var(--secondary)",
                  color: r.status === "ready" ? "#10b981" : r.status === "draft" ? "#D4A017" : "var(--muted-foreground)",
                  borderColor: r.status === "ready" ? "rgba(16,185,129,0.2)" : r.status === "draft" ? "var(--border)" : "rgba(94,115,153,0.2)",
                }}>{r.status}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-snug mb-1 font-['Outfit']">{r.title}</h3>
            <p className="text-xs mb-3 font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>{r.type}</p>
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(212,160,23,0.08)" }}>
              <div className="flex items-center gap-3 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1"><Calendar size={10} />{r.date}</span>
                <span>{r.pages}p</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#D4A017" }}><Download size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({ user, cases = [], evidence = [], isLoadingData = false }: { user: AuthUser, cases?: CaseData[], evidence?: any[], isLoadingData?: boolean }) {
  const { t } = useTranslation();
  
  const activeCasesCount = cases.filter(c => c.status?.toLowerCase() === 'active').length;
  const criticalCasesCount = cases.filter(c => c.priority?.toLowerCase() === 'critical' || c.status?.toLowerCase() === 'critical').length;
  const pendingCasesCount = cases.filter(c => c.status?.toLowerCase() === 'pending').length;
  const evidenceCount = evidence.length;
  const closedCasesCount = cases.filter(c => c.status === 'closed').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 anim-fadeup" style={{ scrollbarWidth: "none" }}>
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">{t.dashboard_overview || 'Dashboard Overview'}</h2>
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>
          {t.welcome_back ? t.welcome_back.replace('Mitesh Singhvi', user.name).replace('मितेश सिंघવી', user.name).replace('મિતેશ સિંઘવી', user.name) : `Welcome back, ${user.name}. Here is the current precinct status.`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t.active_cases || "Active Cases", value: isLoadingData ? "..." : activeCasesCount.toString(), icon: Briefcase, color: "#1D4ED8", change: "-" },
          { label: t.critical_priority || "Critical Priority", value: isLoadingData ? "..." : criticalCasesCount.toString(), icon: AlertTriangle, color: "#dc2626", change: "-" },
          { label: t.pending_cases || "Pending Cases", value: isLoadingData ? "..." : pendingCasesCount.toString(), icon: Clock, color: "#f59e0b", change: "-" },
          { label: t.evidence_logged || "Evidence Logged", value: isLoadingData ? "..." : evidenceCount.toString(), icon: ScanLine, color: "#D4A017", change: "-" },
          { label: t.resolutions || "Resolutions", value: isLoadingData ? "..." : closedCasesCount.toString(), icon: CheckCircle2, color: "#10b981", change: "-" }
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-5 transition-all hover:-translate-y-1 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <span className="text-xs font-mono font-semibold" style={{ color: s.color }}>{s.change}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-4">{s.value}</h3>
            <p className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Outfit'] mb-4 flex items-center gap-2"><TrendingUp size={16} style={{ color: "#D4A017" }}/> {t.crime_trend || 'Crime Trend Distribution'}</h3>
          <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="w-full rounded-t-sm relative group transition-all" style={{ height: `${h}%`, background: "rgba(29,78,216,0.3)" }}>
                <div className="absolute top-0 left-0 w-full rounded-t-sm" style={{ height: '4px', background: "#D4A017" }} />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-slate-900 dark:text-white text-xs px-2 py-1 rounded transition-opacity">{h}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        
        <div className="rounded-2xl border p-6 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
           <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-['Outfit'] mb-4 flex items-center gap-2"><ShieldAlert size={16} style={{ color: "#D4A017" }}/> {t.recent_alerts || 'Recent Network Alerts'}</h3>
           <div className="space-y-4">
             {/* Dynamic alerts will populate here */}
             <div className="text-center py-4 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{t.no_alerts || 'No active network alerts'}</div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Documents View ───────────────────────────────────────────────────────────

function DocumentsView({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [isFIRModalOpen, setIsFIRModalOpen] = useState(false);
  const [isSec94ModalOpen, setIsSec94ModalOpen] = useState(false);
  const [isSec106ModalOpen, setIsSec106ModalOpen] = useState(false);
  const [isSeizureModalOpen, setIsSeizureModalOpen] = useState(false);
  const [isArrestModalOpen, setIsArrestModalOpen] = useState(false);
  const [isRemandModalOpen, setIsRemandModalOpen] = useState(false);
  const [isChargesheetModalOpen, setIsChargesheetModalOpen] = useState(false);
  const [isBailModalOpen, setIsBailModalOpen] = useState(false);
  const [isWarrantModalOpen, setIsWarrantModalOpen] = useState(false);

  const handleGenerate = async (docId: string, type: string) => {
    if (docId === 'fir') {
      setIsFIRModalOpen(true);
      return;
    }
    if (docId === 'sec94') {
      setIsSec94ModalOpen(true);
      return;
    }
    if (docId === 'freeze') {
      setIsSec106ModalOpen(true);
      return;
    }
    if (docId === 'seizure') {
      setIsSeizureModalOpen(true);
      return;
    }
    if (docId === 'arrest') {
      setIsArrestModalOpen(true);
      return;
    }
    if (docId === 'remand') {
      setIsRemandModalOpen(true);
      return;
    }
    if (docId === 'chargesheet') {
      setIsChargesheetModalOpen(true);
      return;
    }
    if (docId === 'bail_opp') {
      setIsBailModalOpen(true);
      return;
    }
    if (docId === 'search_warrant') {
      setIsWarrantModalOpen(true);
      return;
    }
    setGenerating(type);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success(`${type} generation initiated. Validating data integrity...`);
    } finally {
      setGenerating(null);
    }
  };

  const categories = ["All Documents", "Case Initiation", "Investigation", "Cyber / Financial", "Court Filings"];

  const documents = [
    { id: "fir", title: t.doc_fir_title || "First Information Report (FIR)", category: "Case Initiation", desc: "Formulates the initial formal complaint citing specific BNS and IT Act penal sections (e.g. Sec 318 BNS).", icon: ClipboardList, color: "#1D4ED8", badgeColor: "bg-blue-600" },
    { id: "sec94", title: t.doc_sec94_title || "Section 94 BNSS Notice", category: "Investigation", desc: "Drafts official data preservation and log production notices for ISPs, Telecoms, Banks, and Meta.", icon: FileSearch, color: "#10b981", badgeColor: "bg-emerald-600" },
    { id: "freeze", title: t.doc_freeze_title || "Bank Account Freeze Order (Sec 106)", category: "Cyber / Financial", desc: "Generates urgent freeze requests for nodal bank officers to block fraudulent UPI wallets and mule accounts.", icon: ShieldAlert, color: "#ef4444", badgeColor: "bg-red-600" },
    { id: "seizure", title: t.doc_seizure_title || "Seizure Memo / Panchnama", category: "Investigation", desc: "Formally logs digital evidence, hard drives, and mobile phones seized at the crime scene with SHA-256 hashes.", icon: Database, color: "#10b981", badgeColor: "bg-emerald-600" },
    { id: "arrest", title: t.doc_arrest_title || "Arrest Memo & Sec 35 BNSS Notice", category: "Investigation", desc: "Formats official arrest memos or mandatory appearance notices (formerly Sec 41A) for suspects.", icon: UserCog, color: "#10b981", badgeColor: "bg-emerald-600" },
    { id: "remand", title: t.doc_remand_title || "Remand Application", category: "Court Filings", desc: "Drafts a request for police custody articulating compelling investigative grounds and pending evidence recovery.", icon: Scale, color: "#D4A017", badgeColor: "bg-amber-600" },
    { id: "chargesheet", title: t.doc_chargesheet_title || "Official Chargesheet (Sec 193 BNSS)", category: "Court Filings", desc: "Compiles a comprehensive final report detailing witnesses, forensic reports, and penal charges for trial.", icon: ScrollText, color: "#D4A017", badgeColor: "bg-amber-600" },
    { id: "bail_opp", title: t.doc_bail_opp_title || "Bail Opposition / Reply", category: "Court Filings", desc: "Formulates strong legal arguments and criminal precedent citations to contest suspect bail applications in court.", icon: ShieldCheck, color: "#D4A017", badgeColor: "bg-amber-600" },
    { id: "search_warrant", title: t.doc_search_warrant_title || "Search Warrant Application", category: "Court Filings", desc: "Drafts a judicial request to authorize the search of physical premises or encrypted digital cloud storage.", icon: Search, color: "#D4A017", badgeColor: "bg-amber-600" }
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Documents" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6 anim-fadeup" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Document Generation Suite</h2>
          <p className="text-sm font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>AI-automated legal document drafting compliant with BNS, BNSS, and IT Act.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B132B]/50 border rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-['DM_Sans']"
            style={{ borderColor: "rgba(94,115,153,0.3)" }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all font-['DM_Sans'] ${
              activeCategory === cat 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="rounded-xl border p-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden group transition-all hover:-translate-y-1 bg-[#1C2541]/80 dark:bg-[#0B132B] border-slate-200 dark:border-slate-800 hover:border-slate-600" style={{ backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 translate-x-1/3 -translate-y-1/3 rounded-full blur-xl transition-all group-hover:opacity-20" style={{ background: doc.color }} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10" style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}30`, color: doc.color }}>
                <doc.icon size={24} />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-white uppercase relative z-10 ${doc.badgeColor} bg-opacity-90 shadow-sm`}>
                {doc.category}
              </span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2 relative z-10">{doc.title}</h3>
            <p className="text-xs leading-relaxed mb-6 flex-1 font-['DM_Sans'] opacity-80" style={{ color: "var(--secondary-foreground)" }}>{doc.desc}</p>
            
            <button 
              onClick={() => handleGenerate(doc.id, doc.title)} 
              disabled={generating !== null} 
              className="mt-auto relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500 group-hover:bg-blue-600/10 group-hover:text-blue-400 group-hover:border-blue-500/30" 
              style={{ background: "rgba(15,30,61,0.5)", border: "1px solid rgba(212,160,23,0.2)", color: "var(--foreground)" }}
            >
              {generating === doc.title ? <Loader2 size={15} className="animate-spin text-blue-400" /> : <FileText size={15} className="group-hover:text-blue-400 transition-colors" />}
              {generating === doc.title ? "Generating AI Draft..." : (t.generate_download || "Generate & Download")}
            </button>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center">
            <FileSearch size={48} className="text-slate-600 mb-4 opacity-50" />
            <p className="text-slate-400 font-mono">No documents found matching your search.</p>
          </div>
        )}
      </div>

      <FIRModal isOpen={isFIRModalOpen} onClose={() => setIsFIRModalOpen(false)} />
      <Sec94Modal isOpen={isSec94ModalOpen} onClose={() => setIsSec94ModalOpen(false)} user={user} />
      <Sec106Modal isOpen={isSec106ModalOpen} onClose={() => setIsSec106ModalOpen(false)} user={user} />
      <SeizureMemoModal isOpen={isSeizureModalOpen} onClose={() => setIsSeizureModalOpen(false)} user={user} />
      <ArrestMemoModal isOpen={isArrestModalOpen} onClose={() => setIsArrestModalOpen(false)} user={user} />
      <RemandApplicationModal isOpen={isRemandModalOpen} onClose={() => setIsRemandModalOpen(false)} user={user} />
      <ChargesheetModal isOpen={isChargesheetModalOpen} onClose={() => setIsChargesheetModalOpen(false)} user={user} />
      <BailOppositionModal isOpen={isBailModalOpen} onClose={() => setIsBailModalOpen(false)} user={user} />
      <SearchWarrantModal isOpen={isWarrantModalOpen} onClose={() => setIsWarrantModalOpen(false)} user={user} />
    </div>
  );
}

// ─── Evidence Locker View ─────────────────────────────────────────────────────

function EvidenceView({ evidence = [], cases = [], user, onEvidenceUploaded, onEvidenceDeleted }: { evidence?: any[], cases?: CaseData[], user: AuthUser, onEvidenceUploaded: (ev: any) => void, onEvidenceDeleted?: (id: string) => void }) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const [isTaggingModalOpen, setIsTaggingModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleDownloadEvidence = (url: string, fileName: string) => {
    window.open(url, '_blank');
  };

  const handleDeleteEvidence = async (evidenceId: string, fileUrl: string) => {
    const confirmed = window.confirm("WARNING: Are you sure you want to delete this evidence? This action removes the file from the secure vault and breaks the chain of custody. This cannot be undone.");
    if (!confirmed) return;

    try {
      const urlParts = fileUrl.split('/evidence-vault/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { error: storageError } = await supabase.storage
          .from('evidence-vault')
          .remove([filePath]);
        if (storageError) console.error("Storage deletion error:", storageError);
      }

      const { error: dbError } = await supabase
        .from('evidence_metadata')
        .delete()
        .eq('id', evidenceId);

      if (dbError) throw dbError;

      if (onEvidenceDeleted) {
        onEvidenceDeleted(evidenceId);
      }
      toast.success("Evidence permanently deleted from the vault.");
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete evidence.");
    }
  };

  const handleFileProcess = async (file: File) => {
    setUploading(true);
    try {
      const sha256_hash = await calculateSHA256(file);
      setDroppedFile(file);
      setFileHash(sha256_hash);
      setIsTaggingModalOpen(true);
    } catch (err: any) {
      toast.error("Hashing failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    await handleFileProcess(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await handleFileProcess(file);
  };

  const getCaseLabel = (caseId: string) => {
    if (!caseId) return "Unlinked Evidence";
    const linkedCase = cases.find(c => c.id === caseId);
    if (!linkedCase) return "Unlinked Evidence";
    
    const isUUID = (str: string) => str?.length === 36 && str?.includes('-');
    // In our schema, id serves as fir_number. Use it if it's not a UUID.
    if (linkedCase.id && !isUUID(linkedCase.id)) {
      return `FIR #${linkedCase.id} — ${linkedCase.title}`;
    }
    return linkedCase.title || "Untitled Case";
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 pb-24 space-y-6 anim-fadeup" style={{ scrollbarWidth: "none" }}>
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Evidence Vault Command Center</h2>
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>Sec 63 BSA Digital Integrity Lock - Real-time cryptographic hashing and chain of custody tracking.</p>
      </div>

      <div className={`relative rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center transition-all ${dragging ? "scale-[1.02] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "border-slate-600 hover:border-blue-500"}`}
        style={{ background: dragging ? "rgba(29,78,216,0.1)" : "rgba(28, 37, 65, 0.5)" }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}>
        
        {uploading && (
           <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
              <span className="flex items-center justify-center gap-3 text-emerald-400 font-bold font-mono">
                 <Loader2 size={18} className="animate-spin" />
                 Calculating SHA-256 forensic hash...
              </span>
           </div>
        )}

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
          <UploadCloud size={28} className={dragging ? "animate-bounce" : ""} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1 font-['Outfit']">Drag & Drop cyber forensic files here</h3>
        <p className="text-sm mb-5 font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>Disk Images, PCAPs, Bank Statements, Screenshots, or Memory Dumps</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2.5 rounded-xl transition-all text-sm font-bold font-['Outfit'] hover:scale-105" 
          style={{ background: "linear-gradient(135deg,#1D4ED8,#1e40af)", color: "white", boxShadow: "0 4px 15px rgba(29,78,216,0.3)" }}
        >
          Browse Files
        </button>
      </div>

      <div className="w-full h-auto min-h-[600px] flex flex-col bg-[#1C2541]/30 border border-slate-800 rounded-2xl p-6 space-y-6 overflow-visible backdrop-blur-xl">
        <div className="border-b border-slate-700/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">Secured Chain of Custody Repository</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-48 hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search hash or file..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}><List size={14} /></button>
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}><LayoutGrid size={14} /></button>
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="w-full overflow-x-auto overflow-y-auto border border-slate-800 rounded-xl bg-[#1C2541]/40 custom-scrollbar p-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700 text-xs font-mono text-slate-400">
                  <th className="px-5 py-3 font-medium">Case ID</th>
                  <th className="px-5 py-3 font-medium">File Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Brief Description</th>
                  <th className="px-5 py-3 font-medium">SHA-256 Hash</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {evidence.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-mono text-sm">No evidence secured yet.</td>
                  </tr>
                ) : evidence.map((file, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-blue-400">
                      <p className="text-xs font-medium text-blue-400">
                        📁 {getCaseLabel(file.case_id)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-white max-w-[200px] truncate">{file.filename}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-600 bg-slate-800 text-slate-300 truncate max-w-[150px] inline-block">{file.category || 'Untagged'}</span>
                    </td>
                    <td className="px-5 py-3 max-w-[250px]">
                      {file.notes && (
                        <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                          📝 {file.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1.5 bg-emerald-900/20 text-emerald-400 border border-emerald-900/50">
                        <Lock size={10} /> {file.sha256_hash?.substring(0, 24)}...
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => handleDownloadEvidence(file.file_url, file.filename)}
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors group relative"
                          title="Download Evidence"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvidence(file.id, file.file_url)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors group relative"
                          title="Delete Evidence"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-900/50">
            {evidence.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 font-mono text-sm">No evidence secured yet.</div>
            ) : evidence.map((file, i) => (
              <div key={i} className="bg-[#1C2541] border border-slate-700 rounded-xl p-4 flex flex-col hover:border-slate-500 transition-colors shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center border border-blue-800/50">
                    <FileText size={18} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{file.category || 'Evidence'}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 truncate" title={file.filename}>{file.filename}</h4>
                <p className="text-xs font-medium text-blue-400 mt-1 mb-2">
                  📁 {getCaseLabel(file.case_id)}
                </p>
                {file.notes && (
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                    📝 {file.notes}
                  </p>
                )}
                <div className="mt-auto bg-slate-900 rounded p-2 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 mb-1">
                    <ShieldCheck size={10} /> INTEGRITY VERIFIED
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{file.sha256_hash}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50 text-[10px] font-mono text-slate-500">
                  <div className="flex flex-col">
                    <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                    <span>{file.file_size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDownloadEvidence(file.file_url, file.filename)}
                      className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors"
                      title="Download Evidence"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEvidence(file.id, file.file_url)}
                      className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
                      title="Delete Evidence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EvidenceTaggingModal 
        isOpen={isTaggingModalOpen}
        onClose={() => setIsTaggingModalOpen(false)}
        file={droppedFile}
        fileHash={fileHash}
        cases={cases}
        user={user}
        onSuccess={(newEv) => {
           if (newEv) {
             onEvidenceUploaded(newEv);
           }
           setDroppedFile(null);
           setFileHash("");
           setIsTaggingModalOpen(false);
        }}
      />
    </div>
  );
}

// ─── Digital Case Diary (Audit Timeline) ──────────────────────────────────────

function AuditView() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 anim-fadeup" style={{ scrollbarWidth: "none" }}>
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Digital Case Diary</h2>
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>Chronological system audit and case progression timeline.</p>
      </div>

      <div className="rounded-2xl border p-8 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{backdropFilter: "blur(12px)"}}>
        <div className="relative border-l-2 ml-4 md:ml-6 space-y-8" style={{ borderColor: "var(--border)" }}>
          {[
            { title: "Chargesheet Drafted", desc: "Automated chargesheet generated for Case ACCB-2024-0847 citing BNS Sec 318, 319.", time: "Today, 14:28", icon: FileText, color: "#1D4ED8" },
            { title: "AI Legal Analysis Completed", desc: "Narrative parsed. Severity assessed as HIGH. 3 Entities extracted.", time: "Today, 14:22", icon: Cpu, color: "#D4A017" },
            { title: "Evidence Hashed", desc: "Suspect_Mobile_Extraction.zip secured with SHA-256 integrity lock.", time: "Yesterday, 18:45", icon: ShieldCheck, color: "#10b981" },
            { title: "FIR Submitted", desc: "Initial complaint logged into the precinct registry by IO Rahul Sharma.", time: "Oct 24, 09:15", icon: ClipboardList, color: "var(--muted-foreground)" }
          ].map((ev, i) => (
            <div key={i} className="relative pl-8 md:pl-10 group">
              <div className="absolute -left-[17px] md:-left-[17px] top-1 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all group-hover:scale-110 bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-200 dark:border-slate-800" style={{borderColor: ev.color, color: ev.color}}>
                <ev.icon size={12} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">{ev.title}</h3>
                <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{ev.time}</span>
              </div>
              <p className="text-sm leading-relaxed font-['DM_Sans']" style={{ color: "var(--secondary-foreground)" }}>{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder View ─────────────────────────────────────────────────────────

function PlaceholderView({ id }: { id: NavId }) {
  const { t } = useTranslation();
  const cfg: Record<string, { icon: React.ElementType; title: string; desc: string }> = {
    evidence:      { icon: ScanLine,     title: "Evidence Vault",       desc: "Manage digital evidence with SHA-256 chain of custody verification" },
    legal:         { icon: Scale,        title: "Legal Intelligence",   desc: "IPC, IT Act, and PMLA reference with AI-powered legal analysis" },
    documents:     { icon: ScrollText,   title: "Documents",            desc: "Auto-generated FIRs, chargesheets, and remand applications" },
    analytics:     { icon: TrendingUp,   title: "Analytics",            desc: "Case trends, resolution rates, and departmental statistics" },
    audit:         { icon: FileSearch,   title: "Audit Logs",           desc: "Complete audit trail of all system access and modifications" },
    settings:      { icon: Settings,     title: "System Settings",      desc: "Configure CrimeGPT platform settings and integrations" },
  };
  const c = cfg[id] ?? { icon: Layers, title: "Section", desc: "Coming soon" };
  const Icon = c.icon;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "var(--border)", border: "1px solid rgba(212,160,23,0.2)" }}>
          <Icon size={28} style={{ color: "#D4A017", opacity: 0.7 }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-['Outfit']">{c.title}</h3>
          <p className="text-sm mt-1 font-['DM_Sans']" style={{ color: "var(--muted-foreground)" }}>{c.desc}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <SecBadge icon={Lock} label={t("Access Controlled") || "Access Controlled"} />
          <SecBadge icon={ShieldCheck} label={t("Audit Logged") || "Audit Logged"} />
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ user, active, onNav, open, onClose, isAnalyzing = false }: {
  user: AuthUser; active: NavId; onNav: (v: NavId) => void; open: boolean; onClose: () => void; isAnalyzing?: boolean;
}) {
  if (!open) return null;
  const allowedTabIds = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Investigating Officer'];
  const navItems = ALL_NAV.filter(n => allowedTabIds.includes(n.id));
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r"
        style={{ background: "var(--sidebar)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">Crime<span style={{ color: "#D4A017" }}>GPT</span></span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} type="button" onClick={(e) => { e.preventDefault(); onNav(id); onClose(); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all"
              style={{
                background: active === id ? "var(--sidebar-border)" : "transparent",
                color: active === id ? "#D4A017" : "var(--secondary-foreground)",
                border: `1px solid ${active === id ? "rgba(212,160,23,0.3)" : "transparent"}`,
              }}>
              <Icon size={15} />
              <span className="font-['DM_Sans'] flex-1 text-left">{label}</span>
              {badge && <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>{badge}</span>}
              {id === "investigation" && isAnalyzing && (
                <span title="AI Copilot Active: Running Background Forensic Analysis..." className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border flex items-center justify-center animate-pulse"
                  style={{ background: "rgba(212,160,23,0.1)", color: "#D4A017", borderColor: "rgba(212,160,23,0.3)" }}>
                  <Loader2 size={12} className="animate-spin" />
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const defaultNav = (ROLE_PERMISSIONS[user.role]?.[0] ?? "dashboard") as NavId;
  const [active, setActive] = useState<NavId>(() => {
    return (sessionStorage.getItem('crimegpt_active_tab') as NavId) || defaultNav;
  });
  
  const handleNavChange = (tab: NavId) => {
    setActive(tab);
    sessionStorage.setItem('crimegpt_active_tab', tab);
  };
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchGlobalLanguage = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('default_language')
        .eq('id', 1)
        .single();
  
      if (data && data.default_language) {
        i18n.changeLanguage(data.default_language);
      }
    };
    fetchGlobalLanguage();
  }, []);

  // Global AI Investigation State
  const [investigationInput, setInvestigationInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Global Data State
  const [cases, setCases] = useState<CaseData[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoadingData(true);
      const [casesRes, evidenceRes] = await Promise.all([
        supabase.from('cases').select('*').order('date', { ascending: false }),
        supabase.from('evidence_metadata').select('*').order('upload_date', { ascending: false })
      ]);
      if (casesRes.data) setCases(casesRes.data as CaseData[]);
      if (evidenceRes.data) setEvidence(evidenceRes.data);
      setIsLoadingData(false);
    }
    fetchInitialData();

    // Supabase Realtime Subscriptions
    const casesSub = supabase.channel('public:cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCases(prev => {
            if (prev.some(c => c.id === payload.new.id)) return prev;
            return [payload.new as CaseData, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setCases(prev => prev.map(c => c.id === payload.new.id ? (payload.new as CaseData) : c));
        } else if (payload.eventType === 'DELETE') {
          setCases(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    const evidenceSub = supabase.channel('public:evidence_metadata')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evidence_metadata' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvidence(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setEvidence(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
        } else if (payload.eventType === 'DELETE') {
          setEvidence(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(casesSub);
      supabase.removeChannel(evidenceSub);
    };
  }, []);

  async function analyzeCase() {
    if (!investigationInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null); // Clear previous results for fresh streaming
    try {
      const response = await fetch("http://localhost:8000/api/v1/analyze-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ complaint_text: investigationInput, language: i18n.language })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let rawJsonString = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse SSE lines
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  setAnalysisError(data.error);
                  break;
                }
                if (data.text) {
                  rawJsonString += data.text;
                  try {
                    // Progressively parse partial JSON
                    const repairedJson = jsonrepair(rawJsonString);
                    const parsedData = JSON.parse(repairedJson);
                    setAnalysisResult(parsedData);
                  } catch (e) {
                    // Ignore jsonrepair parse errors on heavily incomplete chunks
                  }
                }
              } catch (e) {
                console.error("Error parsing SSE data line", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError("Failed to analyze the case narrative. Ensure backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const views: Partial<Record<NavId, React.ReactNode>> = {
    dashboard:     <DashboardView user={user} cases={cases} evidence={evidence} isLoadingData={isLoadingData} />,
    investigation: <AIInvestigation />,
    cases:         <CasesView 
                     cases={cases} 
                     onCaseCreated={c => setCases(prev => [c, ...prev])} 
                     onCaseUpdated={c => setCases(prev => prev.map(old => old.id === c.id ? c : old))}
                     onCaseDeleted={id => setCases(prev => prev.filter(c => c.id !== id))}
                   />,
    reports:       <ReportsView />,
    documents:     <DocumentsView user={user} />,
    evidence:      <EvidenceView evidence={evidence} cases={cases} user={user} onEvidenceUploaded={(ev) => setEvidence(prev => [ev, ...prev])} onEvidenceDeleted={(id) => setEvidence(prev => prev.filter(e => e.id !== id))} />,
    users:         <UserManagement user={user} />,
    settings:      <SystemSettings user={user} />,
    logbook:       <Logbook user={user} />,
    audit:         <AuditView />,
    analytics:     <DashboardView user={user} cases={cases} evidence={evidence} isLoadingData={isLoadingData} />,
  };

  return (
    <div className="size-full flex overflow-hidden"
      style={{
        background: "var(--background)",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(29,78,216,0.08) 0%, transparent 70%)",
      }}>
      <style>{STYLES}</style>
      <div className="hidden md:flex">
        <Sidebar user={user} active={active} onNav={handleNavChange} collapsed={collapsed} onCollapse={() => setCollapsed(v => !v)} isAnalyzing={isAnalyzing} />
      </div>
      <MobileDrawer user={user} active={active} onNav={handleNavChange} open={mobileOpen} onClose={() => setMobileOpen(false)} isAnalyzing={isAnalyzing} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar user={user} active={active} onMenuToggle={() => setMobileOpen(true)} onLogout={onLogout} onNav={handleNavChange} />
        <main className="flex-1 w-full min-h-screen h-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
          {(() => {
            const allowedTabIds = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Investigating Officer'];
            if (!allowedTabIds.includes(active)) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-400">
                    <ShieldAlert className="w-12 h-12" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
                  <p className="text-slate-400 max-w-md">
                    Your current role (<span className="text-amber-400 font-semibold">{user.role}</span>) does not have authorization to access the {active} module.
                  </p>
                  <button 
                    onClick={() => handleNavChange('dashboard')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
                  >
                    Return to Dashboard
                  </button>
                </div>
              );
            }
            return views[active] ?? <PlaceholderView id={active} />;
          })()}
        </main>
      </div>
      <FloatingChatbot />
    </div>
  );
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Dashboard Render Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white" style={{ background: "var(--background)" }}>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">System Error Encountered</h2>
            <p className="text-sm font-mono opacity-80 mb-4">{this.state.error?.message || "Unknown rendering error"}</p>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm transition-colors hover:bg-blue-700">
                Reload Session
              </button>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm transition-colors hover:bg-red-700">
                Sign Out & Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState(localStorage.getItem('crimegpt_language') || 'en');

  useEffect(() => {
    localStorage.setItem('crimegpt_language', language);
  }, [language]);

  useEffect(() => {
    const saved = localStorage.getItem('crimegpt_theme') as 'light' | 'dark';
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('crimegpt_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchProfile = async (session: any) => {
    try {
      console.log("Auth successful, fetching profile for:", session.user.id);
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();

      const fetchedName = profile?.full_name || baseMetadata.full_name || baseMetadata.name || session.user.email?.split('@')[0] || 'Investigating Officer';
      let dbRole = profile?.rank || baseMetadata.role || 'Investigating Officer';
      if (dbRole === 'investigating_officer') dbRole = 'Investigating Officer';
      if (dbRole === 'senior_officer') dbRole = 'Senior Officer / Supervisor';
      if (dbRole === 'legal_officer') dbRole = 'Legal Officer';
      if (dbRole === 'forensic_expert') dbRole = 'Forensic Expert';
      if (dbRole === 'administrator') dbRole = 'Administrator';
      
      const fullUser = {
        ...baseMetadata,
        id: session.user.id,
        email: session.user.email,
        name: fetchedName,
        badgeId: profile?.badge_number || baseMetadata.badge_number || baseMetadata.badgeId || 'GUJ-CYB-000',
        role: dbRole as UserRole,
        department: profile?.department || baseMetadata.department || 'Cyber Crime Division',
        initials: getInitials(fetchedName, session.user.email)
      };
      setUser(fullUser as AuthUser);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      const fallbackName = session.user.email?.split('@')[0] || 'Officer';
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: fallbackName,
        badgeId: 'GUJ-CYB-000',
        role: 'Investigating Officer' as UserRole,
        department: 'Cyber Crime Division',
        initials: getInitials(fallbackName, session.user.email)
      } as AuthUser);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!mounted) return;
      if (session) {
        fetchProfile(session);
      } else {
        setSessionLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSessionLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        // CRITICAL GUARD: If we already have an active session for this exact user ID,
        // update the token silently in the background WITHOUT triggering loading spinners or route resets!
        if (userRef.current?.id && session?.user?.id === userRef.current.id) {
          return; 
        }

        if (session) {
          setSessionLoading(true);
          fetchProfile(session);
        }
      }
      // Explicitly IGNORE 'TOKEN_REFRESHED' to prevent UI reload on tab focus
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (sessionLoading) return (
    <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center text-slate-900 dark:text-white font-['Outfit']" style={{ background: "var(--background)" }}>
      <Loader2 size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
      <span className="text-lg">Loading Precinct Command Center...</span>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] || translations.en }}>
      <ThemeCtx.Provider value={{ theme, toggleTheme }}>
        <AuthCtx.Provider value={{ user, login: setUser, logout: () => supabase.auth.signOut() }}>
          <style>{STYLES}</style>
          <Toaster position="top-right" richColors />
          {user ? (
            <ErrorBoundary>
              <MainApp user={user} onLogout={() => supabase.auth.signOut()} />
            </ErrorBoundary>
          ) : authPage === "login" ? (
            <LoginPage onSwitch={() => setAuthPage("register")} onLogin={setUser} />
          ) : (
            <RegisterPage onSwitch={() => setAuthPage("login")} onLogin={setUser} />
          )}
        </AuthCtx.Provider>
      </ThemeCtx.Provider>
    </LanguageContext.Provider>
  );
}
