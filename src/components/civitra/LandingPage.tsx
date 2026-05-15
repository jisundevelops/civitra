'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, TrafficCone, Car, Users, ChevronRight, Zap,
  Eye, Lock, BarChart3, ArrowRight, Github, Mail, Globe,
  Menu, X, Star, Sparkles
} from 'lucide-react';

/* ───────────── Animated Background Grid ───────────── */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0f_70%)]" />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Floating orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '-10%', right: '-10%' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]"
        animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '-10%', left: '-5%' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '40%', left: '30%' }}
      />
    </div>
  );
}

/* ───────────── Floating Particles ───────────── */
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-400/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ───────────── Glow Card ───────────── */
function GlowCard({
  children,
  className = '',
  glowColor = 'indigo',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'indigo' | 'cyan' | 'violet' | 'emerald';
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const glowColors = {
    indigo: 'rgba(99,102,241,0.15)',
    cyan: 'rgba(34,211,238,0.15)',
    violet: 'rgba(139,92,246,0.15)',
    emerald: 'rgba(52,211,153,0.15)',
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.2)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect following cursor */}
      <motion.div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColors[glowColor]}, transparent 70%)`,
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {/* Animated border gradient */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `linear-gradient(var(--mouse-angle, 0deg), transparent 40%, ${glowColors[glowColor]} 50%, transparent 60%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 1,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ───────────── Section Wrapper with Scroll Animation ───────────── */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.section>
  );
}

/* ───────────── Typing Animation ───────────── */
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayed}
      <motion.span
        className="inline-block w-[3px] h-[1em] bg-indigo-400 ml-1 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      />
    </span>
  );
}

/* ───────────── Feature Card Data ───────────── */
const features = [
  {
    icon: TrafficCone,
    title: 'Digital Violation Tickets',
    description: 'Issue and manage traffic violation tickets digitally — no paper, no delays.',
    color: 'indigo' as const,
  },
  {
    icon: Car,
    title: 'Online Fine Payment',
    description: 'Citizens can view and pay fines instantly with simulated online payment.',
    color: 'cyan' as const,
  },
  {
    icon: BarChart3,
    title: 'Real-time Dashboard',
    description: 'Live statistics, charts, and reports for admins and officers.',
    color: 'violet' as const,
  },
  {
    icon: Eye,
    title: 'Violation Tracking',
    description: 'Track every violation from issuance to payment with full audit trail.',
    color: 'emerald' as const,
  },
  {
    icon: Lock,
    title: 'Secure & Role-based',
    description: 'JWT authentication with role-based access for citizens, police, and admins.',
    color: 'indigo' as const,
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Get notified when a new violation is issued against your vehicle.',
    color: 'cyan' as const,
  },
];

const developerRoles = [
  { name: 'Jisun', role: 'Full Stack Developer', icon: '🧑‍💻' },
];

/* ═══════════════ MAIN LANDING PAGE ═══════════════ */
export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden relative">
      <GridBackground />
      <Particles />

      {/* ─── Navbar ─── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-white/[0.04]"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Civitra
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#developers" className="text-sm text-zinc-400 hover:text-white transition-colors">Developers</a>
            <motion.button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-zinc-400" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 py-4 space-y-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <a href="#about" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-400 hover:text-white py-2">About</a>
              <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-400 hover:text-white py-2">Features</a>
              <a href="#developers" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-400 hover:text-white py-2">Developers</a>
              <button
                onClick={() => { setMobileMenu(false); onGetStarted(); }}
                className="w-full px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-semibold text-white"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Animated badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300 tracking-wide uppercase">
              Citizen-Police Integrated System
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div
            className="mx-auto mb-10 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="relative w-32 h-32 mx-auto">
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 blur-xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 border border-white/10">
                <Shield className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              {/* Orbiting dot */}
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ top: -6, left: '50%', originX: '0%', originY: '400%' }}
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              CIVI
            </span>
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              TRA
            </span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.div
            className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-10 h-8 sm:h-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <TypingText text="The Future of Traffic Management" delay={1200} />
          </motion.div>

          {/* Description */}
          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-500 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            A next-generation digital platform bridging citizens and traffic police.
            Issue tickets, pay fines, generate reports — all in one seamless system.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 font-semibold text-white shadow-2xl shadow-indigo-500/25 overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>

            <motion.a
              href="#about"
              className="px-8 py-3.5 rounded-xl border border-white/10 text-zinc-300 font-semibold hover:bg-white/5 hover:border-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Learn More
            </motion.a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* ─── About Section ─── */}
      <AnimatedSection id="about" className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
              About the Software
            </motion.span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Smart Traffic Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                for a Smarter City
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-zinc-500 text-base sm:text-lg leading-relaxed">
              Civitra is a comprehensive web-based traffic violation management system
              designed to digitize and streamline the process of issuing, tracking, and
              resolving traffic violations in Bangladesh.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[
              { label: 'User Roles', value: '3', desc: 'Citizen, Police, Admin' },
              { label: 'Features', value: '25+', desc: 'Functional Requirements' },
              { label: 'Violation Types', value: '8+', desc: 'Configurable Types' },
              { label: 'Real-time', value: '100%', desc: 'Digital Processing' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <GlowCard className="p-5 sm:p-6 text-center" glowColor="indigo">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-white mb-0.5">{stat.label}</div>
                  <div className="text-xs text-zinc-500">{stat.desc}</div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '👤',
                title: 'Citizen',
                desc: 'View personal violations, pay fines online, update profile, track payment history, and receive notifications.',
                gradient: 'from-cyan-500/10 to-cyan-400/5',
                border: 'hover:border-cyan-500/30',
              },
              {
                emoji: '🚔',
                title: 'Traffic Police',
                desc: 'Issue digital tickets, view and search all violations, update/cancel tickets, and manage traffic records.',
                gradient: 'from-indigo-500/10 to-indigo-400/5',
                border: 'hover:border-indigo-500/30',
              },
              {
                emoji: '👮',
                title: 'Admin',
                desc: 'Manage users, configure violation types, generate reports, view system statistics, and oversee operations.',
                gradient: 'from-violet-500/10 to-violet-400/5',
                border: 'hover:border-violet-500/30',
              },
            ].map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
              >
                <GlowCard
                  className={`p-6 sm:p-8 bg-gradient-to-br ${role.gradient} ${role.border} transition-colors h-full`}
                  glowColor={i === 0 ? 'cyan' : i === 1 ? 'indigo' : 'violet'}
                >
                  <div className="text-4xl mb-4">{role.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{role.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Features Section ─── */}
      <AnimatedSection id="features" className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Powerful Features,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Built for Impact
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.1 }}
              >
                <GlowCard className="p-6 h-full group" glowColor={feature.color}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                    feature.color === 'indigo' ? 'from-indigo-500/20 to-indigo-400/10' :
                    feature.color === 'cyan' ? 'from-cyan-500/20 to-cyan-400/10' :
                    feature.color === 'violet' ? 'from-violet-500/20 to-violet-400/10' :
                    'from-emerald-500/20 to-emerald-400/10'
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-5 h-5 ${
                      feature.color === 'indigo' ? 'text-indigo-400' :
                      feature.color === 'cyan' ? 'text-cyan-400' :
                      feature.color === 'violet' ? 'text-violet-400' :
                      'text-emerald-400'
                    }`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Tech Stack Section ─── */}
      <AnimatedSection className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">
              Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Built with Modern Tech
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { name: 'Next.js 16', icon: '▲' },
              { name: 'TypeScript', icon: 'TS' },
              { name: 'Prisma', icon: '◆' },
              { name: 'PostgreSQL', icon: '🐘' },
              { name: 'Tailwind CSS', icon: '🎨' },
              { name: 'shadcn/ui', icon: '◆' },
              { name: 'Vercel', icon: '▲' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors cursor-default"
              >
                <span className="text-indigo-400 text-sm font-mono">{tech.icon}</span>
                <span className="text-sm text-zinc-300 font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Developers Section ─── */}
      <AnimatedSection id="developers" className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">
              The Team
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Meet the
              </span>{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Developer
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-zinc-500 text-base">
              Built with passion as part of the UITS Software Engineering Lab project.
            </p>
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <GlowCard className="p-8 sm:p-10 max-w-md w-full text-center" glowColor="emerald">
                {/* Avatar */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 border border-emerald-500/20 flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-4xl">🧑‍💻</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-1">Jisun</h3>
                <p className="text-emerald-400 text-sm font-semibold mb-4">Full Stack Developer</p>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                  Designed and developed the entire Civitra system — from database architecture
                  to the user interface, building a complete citizen-police traffic management platform.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <motion.a
                    href="https://github.com/jisundevelops"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-sm hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </motion.a>
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Globe className="w-4 h-4" />
                    Developer
                  </motion.div>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA Section ─── */}
      <AnimatedSection className="relative py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlowCard className="p-10 sm:p-16" glowColor="indigo">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/30"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Join Civitra and be part of the digital transformation in traffic management.
            </p>
            <motion.button
              onClick={onGetStarted}
              className="group px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 font-semibold text-white text-lg shadow-2xl shadow-indigo-500/25"
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center gap-2">
                Launch Civitra
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </GlowCard>
        </div>
      </AnimatedSection>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-zinc-500">
              Civitra © {new Date().getFullYear()} — UITS Software Engineering Lab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/jisundevelops/civitra" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <span className="text-xs text-zinc-600">Built with Next.js + Prisma + Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
