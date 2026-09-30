import Link from "next/link";
import {
  Clapperboard,
  Film,
  Sparkles,
  Layers,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle2,
  PlayCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060b08] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Navigation Bar */}
      <header className="border-b border-emerald-950/50 bg-[#060b08]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              eclat <span className="text-emerald-400 font-medium text-sm px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-1">STUDIO</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Workspace</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Visible Cinematic Camera Background */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-40 px-6 overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2000&q=80"
            alt="Film Production Camera Set"
            className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-75"
          />
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[140px] pointer-events-none rounded-full" />
          {/* Smooth Vignette and Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b08] via-[#060b08]/60 to-[#060b08]/85" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> All-in-One Film Pre-Production Platform
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-lg">
            From Screenplay to Set, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-300">
              Simplified in One Place.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-normal drop-shadow">
            Eliminate days of tedious manual script breakdowns. Upload your screenplay to instantly extract scenes, characters, 16:9 storyboards, and production budgets in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Production
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/breakdown"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0a1610]/80 hover:bg-[#0f241a] border border-emerald-500/40 text-white font-medium text-base transition-all flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
            >
              <PlayCircle className="w-5 h-5 text-emerald-400" />
              Explore Script Breakdown
            </Link>
          </div>

          {/* Key Value Points */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-200">
            <div className="flex items-center gap-1.5 bg-[#060b08]/80 px-3.5 py-1.5 rounded-full border border-emerald-950/80 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Entity Extraction
            </div>
            <div className="flex items-center gap-1.5 bg-[#060b08]/80 px-3.5 py-1.5 rounded-full border border-emerald-950/80 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 16:9 Storyboard Visuals
            </div>
            <div className="flex items-center gap-1.5 bg-[#060b08]/80 px-3.5 py-1.5 rounded-full border border-emerald-950/80 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dynamic Department Budgets
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 border-t border-emerald-950/40 bg-[#08120c] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">How It Works in 3 Simple Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-[#0b1811] border border-emerald-950/70 hover:border-emerald-500/40 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-3">1. Upload Screenplay</h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Import your script text directly into the studio. Industry-standard sluglines and dialogue formatting are parsed automatically.
              </p>
              <div className="mt-auto pt-4 border-t border-emerald-950/40 text-xs font-semibold text-emerald-400">
                Automated Formatting & Ingestion
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-[#0b1811] border border-emerald-950/70 hover:border-emerald-500/40 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-3">2. Automatic Breakdown</h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Instantly categorize scenes, identify characters, tag props, and structure your shots into 16:9 cinematic storyboard cards.
              </p>
              <div className="mt-auto pt-4 border-t border-emerald-950/40 text-xs font-semibold text-emerald-400">
                Entity Tagging & Visual Cards
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-[#0b1811] border border-emerald-950/70 hover:border-emerald-500/40 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-3">3. Track & Shoot</h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Control department expenses in real time, coordinate cast and crew call sheets, and prepare seamlessly for production day.
              </p>
              <div className="mt-auto pt-4 border-t border-emerald-950/40 text-xs font-semibold text-emerald-400">
                Live Budget Ledger & Call Sheets
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Built for Independent Filmmakers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-[#0a1610] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Smart Script Breakdown</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Breakdown characters, locations, and props scene-by-scene automatically without hours of manual highlighting.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0a1610] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">16:9 Spatial Storyboarding</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Plan camera angles, framing, and visual prompts for every sequence to align your cinematographer and crew.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0a1610] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Department Budgeting</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Real-time tracking of allocations vs. actual expenditures across Camera, Sound, Art, and Post-Production.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0a1610] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Cast & Crew Management</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Manage contact rosters, daily day rates, and call sheet readiness directly from your project hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-emerald-950/20 border-t border-emerald-950/40 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Plan Your Next Production?
          </h3>
          <p className="text-slate-300 text-sm mb-8 max-w-xl mx-auto">
            Take your screenplay straight into production with intelligent breakdown tools and automated workflows.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all"
          >
            Launch Production Studio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-emerald-950/40 text-center text-xs text-slate-400 relative z-10">
        <p>© 2026 eclat Studio. All rights reserved. Built for modern filmmakers.</p>
      </footer>
    </div>
  );
}