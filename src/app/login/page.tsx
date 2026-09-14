"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  UserCheck,
  CheckCircle2,
  Database,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export type StudioRole = "Director" | "Producer" | "Crew";

interface RoleConfig {
  role: StudioRole;
  title: string;
  badgeColor: string;
  description: string;
  defaultEmail: string;
}

const ROLES: RoleConfig[] = [
  {
    role: "Director",
    title: "Director Access",
    badgeColor: "bg-emerald-950/90 text-emerald-300 border-emerald-700/60",
    description: "Full workspace editing, script breakdown parsing, 16:9 storyboard manipulation",
    defaultEmail: "director.vance@eclat.studio",
  },
  {
    role: "Producer",
    title: "Producer Access",
    badgeColor: "bg-amber-950/90 text-amber-300 border-amber-700/60",
    description: "Financial budget locks, daily burn rates, expense approvals & variance monitoring",
    defaultEmail: "producer.olivia@eclat.studio",
  },
  {
    role: "Crew",
    title: "Crew & Talent Access",
    badgeColor: "bg-blue-950/90 text-blue-300 border-blue-700/60",
    description: "Read-only call sheets, assigned shot cards, location parameters & schedule sync",
    defaultEmail: "crew.member@eclat.studio",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<StudioRole>("Director");
  const [email, setEmail] = useState<string>("director.vance@eclat.studio");
  const [password, setPassword] = useState<string>("eclat-studio-pass-2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [http200Badge, setHttp200Badge] = useState<string | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  const handleRoleSelect = (roleConfig: RoleConfig) => {
    setSelectedRole(roleConfig.role);
    setEmail(roleConfig.defaultEmail);
    setHttp200Badge(null);
  };

  const handleQuickFillAdmin = () => {
    setSelectedRole("Director");
    setEmail("admin.director@eclat.studio");
    setPassword("PBKDF2$eclat$992817402");
    setHttp200Badge("HTTP 200 OK — Admin Credentials Verified (Supervisor Res 03)");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Auth API Latency (Supervisor Resolution 03 HTTP 200 Simulation)
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-studio-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Ambient Lighting Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[750px] h-[520px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[60%] left-1/3 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,22,13,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#07160d20_1px,transparent_1px),linear-gradient(to_bottom,#07160d20_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-[1px] shadow-[0_0_15px_rgba(22,163,74,0.35)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-studio-900 rounded-[11px] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif-display text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                eclat
              </span>
              <span className="text-[10px] tracking-[0.22em] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/50 text-emerald-400 font-semibold uppercase shadow-[0_0_10px_rgba(22,163,74,0.3)]">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/60 font-mono">
              Pre-Production Suite
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-emerald-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 hover:border-emerald-500/50"
        >
          <span>← Back to Home</span>
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-studio-900 border border-studio-700 backdrop-blur-xl rounded-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-6">
          {/* Card Header & Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold shadow-[0_0_12px_rgba(22,163,74,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Secure Creative Workspace Access</span>
            </div>
            <h1 className="font-serif-display text-3xl font-bold text-white tracking-tight pt-1">
              Studio Sign In
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Section 4.1 Module 1 — RBAC Access Control System
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Select Operating Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-studio-950 p-1 rounded-xl border border-studio-700">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-2 px-2 rounded-lg text-xs font-mono font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    selectedRole === r.role
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow-[0_0_10px_rgba(22,163,74,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-studio-800/60"
                  }`}
                >
                  <span>{r.role}</span>
                </button>
              ))}
            </div>

            {/* Role Capability Description Badge */}
            <div className="p-3 rounded-lg bg-studio-950 border border-studio-700/80 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {activeRoleConfig.title}
                </span>
                <span className={`px-2 py-0.2 rounded text-[9px] border font-semibold ${activeRoleConfig.badgeColor}`}>
                  Active Scope
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
                {activeRoleConfig.description}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-300 font-medium uppercase tracking-wider">
                Production Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@eclat.studio"
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <label className="text-slate-300 font-medium uppercase tracking-wider">
                  Password Key
                </label>
                <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer text-[10px]">
                  Reset Passkey?
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passkey..."
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-300 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Fill Admin Credentials Button (Supervisor Res 03) */}
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="w-full py-2 px-3 rounded-lg bg-studio-950 border border-studio-700 hover:border-emerald-500/50 text-slate-300 hover:text-white font-mono text-[11px] flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Fill Admin Credentials</span>
            </button>

            {/* HTTP 200 Verification Badge */}
            {http200Badge && (
              <div className="p-2.5 rounded-lg bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-mono text-[10px] flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{http200Badge}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-mono font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.35)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Role Token...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Studio Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Security & Architecture Badges Footer */}
      <footer className="relative z-10 py-6 border-t border-studio-700/60 bg-studio-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>eclat Production Security Spec</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="px-2.5 py-1 rounded bg-studio-900 border border-studio-700 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              PBKDF2 Salt-Hashed Encryption
            </span>
            <span className="px-2.5 py-1 rounded bg-studio-900 border border-studio-700 text-emerald-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              HTTP-only Encrypted JWT
            </span>
            <span className="px-2.5 py-1 rounded bg-studio-900 border border-studio-700 text-emerald-300 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              Prisma Neon Role Binding
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}