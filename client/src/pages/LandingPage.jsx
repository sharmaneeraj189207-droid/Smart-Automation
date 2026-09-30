import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck,
  Zap,
  BarChart2,
  Users2
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30">
              FP
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              FlowPilot <span className="text-indigo-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-sm shadow-indigo-500/20 transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6 ai-pulse-border">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Smart Workflow & Approval Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Automate Work. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300">
              Accelerate Decisions.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FlowPilot AI transforms repetitive operational workflows into intelligent, measurable automation with AI classification, structured extraction, smart rule routing, and human-in-the-loop governance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Start Automating</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Launch Demo Mode</span>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Mongoose ODM
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gemini AI Engine
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strict Zod Validation
            </span>
          </div>
        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section className="py-20 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Operational Bottleneck vs. The FlowPilot Solution
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Traditional enterprise administrative processes bleed time, accuracy, and operational agility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Manual Nightmare */}
            <div className="glass-card rounded-2xl p-8 border border-rose-500/20 bg-rose-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-300">The Manual Bottleneck</h3>
                  <p className="text-xs text-slate-400">Traditional operational friction</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>Slow Approvals:</strong> Requests sit in email inboxes for days with no SLA visibility.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>Data Entry Errors:</strong> Manual transcription of amounts, dates, and vendor details.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>Duplicate Spend:</strong> Zero automated duplicate fraud detection across departments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span><strong>No Audit Trail:</strong> Disconnected approvals across Slack, email, and paper sheets.</span>
                </li>
              </ul>
            </div>

            {/* The FlowPilot Automated Platform */}
            <div className="glass-card rounded-2xl p-8 border border-indigo-500/30 bg-indigo-950/10 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-300">The FlowPilot Automation Platform</h3>
                  <p className="text-xs text-slate-400">Autonomous intelligence + Human governance</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span><strong>Autonomous Classification:</strong> AI classifies requests into leave, expense, purchase, or IT in under 1 second.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span><strong>Structured Extraction:</strong> Extracts currency, amount, and purpose without manual data entry.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span><strong>Smart Rule Routing:</strong> Auto-approves under ₹5,000; routes higher tiers with SLA enforcement.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span><strong>Full Compliance:</strong> Immutable audit logs, auto-generated completion summaries, and ROI analytics.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core AI Capabilities */}
      <section className="py-20 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              Advanced Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Genuine Operational AI, Not a Simple Chatbot
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              FlowPilot executes multi-stage workflow actions embedded directly into operational pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <Cpu className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-base font-bold text-white">1. Intelligent Classification</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Categorizes unstructured requests with confidence scores and reasoning into leave, expense, procurement, or IT support.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <FileCheck className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-base font-bold text-white">2. Structured Extraction</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Regex and LLM token extraction captures financial amounts (₹, $, €), dates, vendors, and flags missing mandatory inputs.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-base font-bold text-white">3. Duplicate Fraud Detection</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Flags potential duplicate claims against recent submissions to protect company budgets from double reimbursement.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <Layers className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-base font-bold text-white">4. Rule & Policy Engine</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Configurable threshold policies enforce micro-expense auto-approvals, manager review, and multi-tier executive authorization.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <Clock className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-base font-bold text-white">5. SLA & Escalation Engine</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Continuous background watcher tracks priority deadlines (2h, 4h, 24h) and automatically escalates breached workflows.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition">
              <BarChart2 className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-base font-bold text-white">6. Formula-Backed ROI Analytics</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Calculates hours saved, automation percentages, and processing speed using transparent, audit-ready operational formulas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ready to experience FlowPilot AI?
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Sign in with demo credentials or create your enterprise workspace now.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition"
            >
              Launch Demo Workspace
            </Link>
          </div>

          <p className="mt-12 text-xs text-slate-600">
            © 2026 FlowPilot AI Platform. Built for the Smart Automation Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
};
