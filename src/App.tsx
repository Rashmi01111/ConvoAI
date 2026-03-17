/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  User, 
  Bot, 
  Search, 
  Bell, 
  MoreVertical, 
  Plus, 
  MessageSquare, 
  Sparkles,
  Loader2,
  LogOut,
  Video,
  Image as ImageIcon,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  X,
  ArrowRight,
  Shield,
  Zap,
  Archive,
  Settings,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Camera,
  Info,
  ChevronLeft,
  Globe,
  Volume2,
  PhoneIncoming,
  PhoneOff,
  Maximize2,
  Minimize2,
  Trash2,
  Menu,
  Ghost,
  Activity,
  Command,
  Moon,
  Sun,
  Play,
  Pause,
  Heart,
  ThumbsUp,
  Laugh,
  Languages,
  Quote,
  Star,
  Cpu,
  Network,
  Layers,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token?: string;
}

interface Message {
  id: string;
  user: string;
  text: string;
  image?: string;
  timestamp: string;
  isSystem?: boolean;
  isAI?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  profilePic?: string;
  sentiment?: string;
  isGhost?: boolean;
  audio?: string;
  reactions?: { [emoji: string]: string[] };
}

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const messageVariants = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { type: 'spring', damping: 20, stiffness: 300 }
};

const sidebarItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

// --- Components ---

const TEAM_MEMBERS = [
  { name: "Rashmi", role: "Project Lead & Frontend Architect", image: "https://picsum.photos/seed/rashmi/200/200" },
  { name: "Shreya", role: "Backend Engineer & Motion Specialist", image: "https://picsum.photos/seed/shreya/200/200" },
  { name: "Nitin", role: "UI/UX Designer & Database Admin", image: "https://picsum.photos/seed/nitin/200/200" },
  { name: "Sneha", role: "AI Integration & Security Specialist", image: "https://picsum.photos/seed/sneha/200/200" },
];

const Navbar = ({ user, onOpenProfile, onToggleSidebar, isDarkMode, toggleDarkMode }: { 
  user?: User | null, 
  onOpenProfile?: () => void,
  onToggleSidebar?: () => void,
  isDarkMode?: boolean,
  toggleDarkMode?: () => void
}) => {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      navigate('/chat');
    }
  };

  return (
    <nav className={cn(
      "backdrop-blur-xl border-b sticky top-0 z-50 transition-colors duration-300",
      isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-100"
    )}>
      {/* Quantum Status Bar */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-1.5 px-4 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-10">
          {user && (
            <button onClick={onToggleSidebar} className={cn(
              "md:hidden p-2 rounded-xl transition-colors",
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            )}>
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <MessageSquare className="text-white w-5 h-5" />
            </motion.div>
            <span className={cn(
              "text-xl font-black tracking-tighter transition-colors",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>IntelliCall</span>
          </Link>
<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 md:gap-8 px-4 md:px-0 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
  <Link to="/" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
    Home
  </Link>

  <Link to="/about" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
    About
  </Link>

  {user && (
    <Link 
      to="/chat" 
      className="text-emerald-600 flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
    >
      <Activity className="w-3 h-3" />
      <span>Network</span>
    </Link>
  )}
</div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className={cn(
              "p-2.5 rounded-xl transition-all border",
              isDarkMode ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-slate-50 border-slate-100 text-slate-500"
            )}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileClick}
              className={cn(
                "flex items-center gap-3 p-1.5 rounded-2xl transition-all border shadow-sm",
                isDarkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-md bg-emerald-50 flex items-center justify-center">
                {user.pic ? (
                  <img src={user.pic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-emerald-600 font-black text-sm">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-left hidden sm:block pr-2">
                <p className={cn("text-xs font-black leading-none", isDarkMode ? "text-white" : "text-slate-900")}>{user.name}</p>
                <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">Online</p>
              </div>
            </motion.button>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-3 text-xs font-black text-slate-600 hover:text-emerald-600 transition-all uppercase tracking-widest">Login</Link>
              <Link to="/login" className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const HomePage = ({ isDarkMode, toggleDarkMode, user }: { isDarkMode?: boolean, toggleDarkMode?: () => void, user?: User | null }) => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  return (
    <div className={cn("min-h-screen selection:bg-emerald-100 overflow-x-hidden", isDarkMode ? "bg-slate-950" : "bg-white")}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />
      
      <main>
        {/* Hero Section: The "Glass" Experience */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ opacity, scale }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 backdrop-blur-md"
                >
                  <Sparkles className="w-4 h-4" /> v2.5 Quantum Update Live
                </motion.div>
                
                <h1 className={cn(
                  "text-3xl md:text-5xl lg:text-6xl font-black leading-[1] tracking-tighter mb-8",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  QUANTUM <br />
                  <span className="text-emerald-500 italic">INTELLIGENCE.</span>
                </h1>
                
                <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto leading-relaxed font-bold mb-10 px-4">
                  Experience the next evolution of human connection. Secure, intelligent, and boundary-less communication for the modern era.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <Link to="/login" className="px-12 py-6 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-4 group">
                    Start Transmitting <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link to="/about" className={cn(
                    "px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border transition-all backdrop-blur-md",
                    isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100"
                  )}>
                    Explore Protocol
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Floating Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className={cn(
                "p-4 rounded-[3rem] border shadow-2xl relative z-10 overflow-hidden group",
                isDarkMode ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200"
              )}>
                <div className="aspect-video rounded-[2rem] overflow-hidden relative">
                  <img 
                    src="https://picsum.photos/seed/dashboard/1600/900" 
                    alt="IntelliCall Interface" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  {/* Overlay UI Elements */}
                  <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Activity className="w-8 h-8 text-white animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-xl tracking-tight">Active Stream</h4>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</p>
                      </div>
                    </div>
                    <div className="hidden md:flex gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-emerald-500/10 rounded-full -z-10 animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-teal-500/5 rounded-full -z-10 animate-[spin_30s_linear_infinite_reverse]"></div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className={cn("py-40 px-6", isDarkMode ? "bg-slate-950" : "bg-slate-50")}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className={cn("text-3xl md:text-5xl font-black tracking-tighter mb-6", isDarkMode ? "text-white" : "text-slate-900")}>
                  ENGINEERED FOR <br />
                  <span className="text-emerald-500">EXCELLENCE.</span>
                </h2>
                <p className="text-slate-400 font-bold text-sm md:text-base">Every feature is built from the ground up to redefine how you communicate.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[800px]">
              {/* Large Feature */}
              <motion.div 
                whileHover={{ y: -10 }}
                className={cn(
                  "md:col-span-2 md:row-span-2 p-12 rounded-[3.5rem] border relative overflow-hidden group",
                  isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"
                )}
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                      <Bot className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className={cn("text-4xl font-black mb-6 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>AI Sentiment Engine</h3>
                    <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-sm">
                      Our neural network analyzes tone, emotion, and context in real-time, helping you navigate complex conversations with ease.
                    </p>
                  </div>
                  <div className="mt-12 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Mood Analysis</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">98% Accuracy</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "98%" }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors"></div>
              </motion.div>

              {/* Medium Feature */}
              <motion.div 
                whileHover={{ y: -10 }}
                className={cn(
                  "md:col-span-2 p-12 rounded-[3.5rem] border relative overflow-hidden group",
                  isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"
                )}
              >
                <div className="flex flex-col md:flex-row gap-10 items-center h-full">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-8">
                      <Shield className="w-7 h-7 text-teal-500" />
                    </div>
                    <h3 className={cn("text-3xl font-black mb-4 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Ghost Protocol</h3>
                    <p className="text-slate-400 font-bold leading-relaxed">Self-destructing messages and ephemeral threads for ultimate privacy.</p>
                  </div>
                  <div className="w-full md:w-48 aspect-square bg-slate-800/50 rounded-[2rem] border border-white/5 flex items-center justify-center">
                    <Ghost className="w-20 h-20 text-slate-700 animate-bounce" />
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 1 */}
              <motion.div 
                whileHover={{ y: -10 }}
                className={cn(
                  "p-10 rounded-[3.5rem] border flex flex-col justify-between group",
                  isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"
                )}
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Command className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className={cn("text-xl font-black mb-2 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Smart Recap</h3>
                  <p className="text-slate-400 font-bold text-xs">Summarize 100+ messages in seconds.</p>
                </div>
              </motion.div>

              {/* Small Feature 2 */}
              <motion.div 
                whileHover={{ y: -10 }}
                className={cn(
                  "p-10 rounded-[3.5rem] border flex flex-col justify-between group",
                  isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"
                )}
              >
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Zap className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h3 className={cn("text-xl font-black mb-2 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Instant Sync</h3>
                  <p className="text-slate-400 font-bold text-xs">Real-time updates across all nodes.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Unique Feature: Quantum Network Visualization */}
        <section className={cn("py-32 relative", isDarkMode ? "bg-slate-950" : "bg-slate-50")}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className={cn("text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-none", isDarkMode ? "text-white" : "text-slate-900")}>
                    QUANTUM <br />
                    <span className="text-emerald-500">NETWORK.</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-sm md:text-base mb-10 leading-relaxed">
                    Our proprietary quantum-mesh network ensures that your data is not just encrypted, but physically impossible to intercept. Real-time node optimization keeps your latency below 5ms globally.
                  </p>
                  
                  <div className="space-y-6">
                    {[
                      { label: "Network Stability", value: "99.999%", color: "bg-emerald-500" },
                      { label: "Quantum Entanglement", value: "Active", color: "bg-teal-500" },
                      { label: "Global Nodes", value: "14,204", color: "bg-emerald-400" }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                        <div className="flex items-center gap-4">
                          <span className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{stat.value}</span>
                          <div className={cn("w-2 h-2 rounded-full animate-ping", stat.color)}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-[4rem] bg-slate-900 overflow-hidden relative border-8 border-white dark:border-slate-800 shadow-2xl">
                  {/* Simulated Quantum Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            opacity: [0.1, 0.5, 0.1],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                          className="border-[0.5px] border-emerald-500/30"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Central Pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-64 h-64 bg-emerald-500 rounded-full blur-[80px]"
                    />
                    <div className="relative z-10 text-center">
                      <Zap className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
                      <div className="text-4xl font-black text-white tracking-tighter">CORE ACTIVE</div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mt-2">Syncing Nodes...</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Data Tags */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Traffic: 1.2 PB/s</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={cn("py-40 relative overflow-hidden", isDarkMode ? "bg-slate-950" : "bg-white")}>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className={cn("text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-none", isDarkMode ? "text-white" : "text-slate-900")}>
                  EARLY <span className="text-emerald-500 italic">BIRDS.</span>
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] w-12 bg-emerald-500/30"></div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">The architects of intelli-call</p>
                  <div className="h-[1px] w-12 bg-emerald-500/30"></div>
                </div>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TEAM_MEMBERS.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: i * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  whileHover={{ y: -15 }}
                  className={cn(
                    "p-10 rounded-[3.5rem] border transition-all duration-500 group relative",
                    isDarkMode 
                      ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 shadow-2xl hover:shadow-emerald-500/10" 
                      : "bg-slate-50 border-slate-100 hover:border-emerald-500/20 hover:bg-white shadow-xl hover:shadow-slate-200"
                  )}
                >
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 ring-4 ring-transparent group-hover:ring-emerald-500/20">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" referrerPolicy="no-referrer" />
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>
                  
                  <h3 className={cn("text-2xl font-black tracking-tight mb-2 group-hover:text-emerald-500 transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>
                    {member.name}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs leading-relaxed mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    {member.role}
                  </p>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={cn("py-40 px-6", isDarkMode ? "bg-slate-900/30" : "bg-slate-50")}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className={cn("text-3xl md:text-5xl font-black tracking-tighter mb-6", isDarkMode ? "text-white" : "text-slate-900")}>
                TRUSTED BY <br />
                <span className="text-emerald-500 italic">THE BEST.</span>
              </h2>
              <p className="text-slate-400 font-bold text-lg">Don't just take our word for it. Hear from our early adopters.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Alex Rivera", role: "CTO @ TechFlow", content: "The AI Sentiment Engine is a game-changer. It's like having a professional mediator in every chat.", image: "https://picsum.photos/seed/alex/100/100" },
                { name: "Sarah Chen", role: "Lead Designer @ CreativeMesh", content: "IntelliCall's UI is the most impressive I've seen in years. It's fast, beautiful, and incredibly intuitive.", image: "https://picsum.photos/seed/sarah/100/100" },
                { name: "Marcus Thorne", role: "Security Architect", content: "Ghost Protocol gives me peace of mind. True privacy in a world that's constantly watching.", image: "https://picsum.photos/seed/marcus/100/100" }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-12 rounded-[3.5rem] border relative",
                    isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"
                  )}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-2xl object-cover grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className={cn("font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{t.name}</h4>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold leading-relaxed italic">"{t.content}"</p>
                  <div className="absolute top-10 right-12 opacity-10">
                    <Quote className="w-12 h-12 text-emerald-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className={cn(
            "max-w-7xl mx-auto p-20 rounded-[4rem] relative overflow-hidden text-center",
            isDarkMode ? "bg-emerald-500" : "bg-slate-900"
          )}>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-10 leading-none">
                READY TO <br />
                <span className="opacity-50">EVOLVE?</span>
              </h2>
              <p className="text-white/70 font-bold text-base mb-16 max-w-xl mx-auto">
                Join the 10,000+ users already experiencing the future of communication. 
                No credit card required. No strings attached.
              </p>
              <Link to="/login" className={cn(
                "px-16 py-8 rounded-2xl font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl inline-flex items-center gap-4 group",
                isDarkMode ? "bg-white text-emerald-600 hover:bg-slate-100" : "bg-emerald-500 text-white hover:bg-emerald-400"
              )}>
                Initialize Now <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
              </Link>
            </div>
            
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </section>

        {/* Footer */}
        <footer className={cn("py-20 px-6 border-t", isDarkMode ? "bg-slate-950 border-white/5" : "bg-white border-slate-100")}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className={cn("text-2xl font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>INTELLI-CALL</span>
                </div>
                <p className="text-slate-400 font-bold text-lg max-w-sm leading-relaxed">
                  Redefining human connection through artificial intelligence and quantum-mesh networking.
                </p>
              </div>
              <div>
                <h4 className={cn("text-xs font-black uppercase tracking-[0.3em] mb-8", isDarkMode ? "text-white" : "text-slate-900")}>Protocol</h4>
                <ul className="space-y-4">
                  {['Network', 'Security', 'AI Engine', 'Ghost Mode'].map(item => (
                    <li key={item}><a href="#" className="text-slate-400 font-bold hover:text-emerald-500 transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={cn("text-xs font-black uppercase tracking-[0.3em] mb-8", isDarkMode ? "text-white" : "text-slate-900")}>Company</h4>
                <ul className="space-y-4">
                  {['About', 'Team', 'Careers', 'Contact'].map(item => (
                    <li key={item}><a href="#" className="text-slate-400 font-bold hover:text-emerald-500 transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 dark:border-white/5 gap-8">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">© 2026 INTELLI-CALL PROTOCOL. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-8">
                {['Privacy', 'Terms', 'Security'].map(item => (
                  <a key={item} href="#" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-500 transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const LoginPage = ({ setUser, isDarkMode, toggleDarkMode }: { setUser: (u: User | null) => void, isDarkMode?: boolean, toggleDarkMode?: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/user/login' : '/api/user/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        navigate('/chat');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col selection:bg-emerald-100", isDarkMode ? "bg-slate-950" : "bg-slate-50")}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-12 rounded-[3rem] shadow-2xl max-w-md w-full border relative overflow-hidden",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="text-center mb-8">
            <h2 className={cn("text-4xl font-black mb-2 tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>
              {isLogin ? "INITIALIZE." : "REGISTER."}
            </h2>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">
              {isLogin ? "Connect to the Intelli-Call Grid" : "Join the Intelligence Network"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={cn(
                    "w-full px-8 py-5 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-black text-lg shadow-inner",
                    isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                  )}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={cn(
                  "w-full px-8 py-5 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-black text-lg shadow-inner",
                  isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                )}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full px-8 py-5 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-black text-lg shadow-inner",
                  isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                )}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? "Authenticate" : "Create Account")}
            </motion.button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
            >
              {isLogin ? "New here? Create an identity" : "Already have an identity? Login"}
            </button>
            
            {isLogin && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Demo Credentials</p>
                <div className="text-[10px] font-bold text-slate-500 space-y-1">
                  <p>Email: <span className="text-emerald-500">guest@example.com</span></p>
                  <p>Password: <span className="text-emerald-500">password123</span></p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FloatingParticles = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: Math.random() * 0.5, 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%" 
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50 + "%"],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className={cn(
            "absolute w-1 h-1 rounded-full",
            isDarkMode ? "bg-emerald-500/30" : "bg-emerald-200"
          )}
        />
      ))}
    </div>
  );
};

const ChatPage = ({ user, setUser, isDarkMode, toggleDarkMode }: { user: User, setUser: (u: User | null) => void, isDarkMode?: boolean, toggleDarkMode?: () => void }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [usersList, setUsersList] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string, type: 'video' | 'audio', offer: any } | null>(null);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(user.pic);

  useEffect(() => {
    setProfilePic(user.pic);
  }, [user.pic]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | 'ai'>('all');
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const STICKERS = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGpxS7S0T0V0s/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l41lTfuxV5F6v6z6w/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6ZzZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l0HlHFRbmaZtBRhXG/giphy.gif"
  ];
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Merged logic: Use 'setup' event from user's backend
    newSocket.emit('setup', { _id: user._id, name: user.name });

    newSocket.on('connected', () => {
      console.log("Socket connected to grid");
    });

    newSocket.on('message received', (newMessage: any) => {
      // Convert user's message format to our Message interface
      const message: Message = {
        id: newMessage._id || Math.random().toString(36).substr(2, 9),
        user: newMessage.sender.name,
        text: newMessage.content || newMessage.text,
        timestamp: new Date().toLocaleTimeString(),
        profilePic: newMessage.sender.pic,
        sentiment: analyzeSentiment(newMessage.content || newMessage.text)
      };
      setMessages((prev) => [...prev, message]);
      
      if (message.user !== user.name) {
        generateSmartReplies(message.text);
      }
    });

    // Support for our existing events
    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => {
        // Prevent double messages by checking ID
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      if (message.user !== user.name && !message.isAI) {
        generateSmartReplies(message.text);
        
        // Auto-reply logic for AI if mentioned or if it's a greeting
        const lowerText = message.text.toLowerCase();
        if (lowerText.includes('ai') || lowerText.includes('help') || lowerText.includes('hello intelli')) {
          handleAiResponse(message.text);
        }
      }
    });

    newSocket.on('typing', () => setTypingUsers(prev => new Set(prev).add('Someone')));
    newSocket.on('stop typing', () => setTypingUsers(new Set()));

    newSocket.on('offer', async (data) => {
      if (data.from !== user.name) {
        setIncomingCall(data);
      }
    });

    newSocket.on('answer', async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on('ice-candidate', async (data) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    });

    newSocket.on('call_ended', () => {
      endCall();
    });

    newSocket.on('reaction_updated', ({ messageId, reactions }: { messageId: string, reactions: any }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });

    newSocket.on('call_ended', () => {
      endCall();
    });

    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(true);
      else setShowSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      newSocket.close();
      window.removeEventListener('resize', handleResize);
    };
  }, [user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupPeerConnection = (remoteUser: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: remoteUser, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  // Unique Feature: Sentiment Analysis (Simple implementation)
  const analyzeSentiment = (text: string) => {
    const positive = ['happy', 'good', 'great', 'awesome', 'love', 'yes', 'cool', 'nice'];
    const negative = ['sad', 'bad', 'angry', 'hate', 'no', 'urgent', 'help', 'wrong'];
    const lower = text.toLowerCase();
    if (positive.some(word => lower.includes(word))) return '😊';
    if (negative.some(word => lower.includes(word))) return '😟';
    return '😐';
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() && socket) {
      const messageData = {
        user: user.name,
        text: inputMessage,
        profilePic: profilePic || undefined,
        sentiment: analyzeSentiment(inputMessage),
        isGhost: isGhostMode
      };
      // Merged logic: Emit 'new message' for backend compatibility
      socket.emit('new message', {
        sender: { _id: user._id, name: user.name, pic: profilePic },
        content: inputMessage,
        chat: { users: [{ _id: 'all' }] } // Global chat simulation
      });

      socket.emit('send_message', messageData);
      
      // AI Trigger logic
      const lowerInput = inputMessage.toLowerCase();
      if (activeTab === 'ai') {
        // If we are in the AI tab, all messages go to the AI bot automatically
        // We use a small timeout to let the user's message appear first
        setTimeout(() => handleAiResponse(inputMessage), 500);
      } else if (lowerInput.startsWith('/ai ')) {
        handleAiResponse(inputMessage.slice(4));
      } else if (lowerInput.startsWith('/draw ')) {
        handleDrawImage(inputMessage.slice(6));
      } else if (lowerInput.includes('ai') || lowerInput.includes('bot') || lowerInput.includes('help')) {
        // Proactive AI response if user mentions AI/Bot/Help
        setTimeout(() => handleAiResponse(inputMessage), 1000);
      }
      
      setInputMessage('');
      socket.emit('stop_typing', user.name);
    }
  };

  const generateSmartReplies = async (lastMessage: string) => {
    setIsGeneratingReplies(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this message: "${lastMessage}", suggest 3 very short (1-3 words) quick replies. Return ONLY a JSON array of strings. Example: ["Cool!", "Got it", "Nice"]`,
        config: { responseMimeType: "application/json" }
      });
      
      const replies = JSON.parse(response.text || "[]");
      setSmartReplies(replies.slice(0, 3));
    } catch (error) {
      console.error("Smart Reply Error:", error);
      setSmartReplies([]);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const translateMessage = async (messageId: string, text: string) => {
    setTranslatingId(messageId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate this message to Hindi (in Hinglish if possible, or simple Hindi): "${text}". Return ONLY the translated text.`,
      });
      
      const translatedText = response.text || "Translation failed.";
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: `${m.text}\n\n🌐 Translation: ${translatedText}` } : m));
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleDrawImage = async (prompt: string) => {
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });
      
      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        socket?.emit('send_message', { 
          user: "Intelli-Bot", 
          text: `Generated image for: ${prompt}`, 
          image: imageUrl,
          isAI: true,
          sentiment: '🎨'
        });
      }
    } catch (error) {
      console.error("Image Gen Error:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAiResponse = async (prompt: string) => {
    if (isAiThinking) return;
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the IntelliCall AI, a highly advanced, empathetic, and conversational chatbot. 
        A user is talking to you: "${prompt}". 
        
        Your Personality:
        - You are NOT a simple FAQ bot. You are a real AI assistant like ChatGPT or Gemini.
        - IMPORTANT: Respond in the SAME LANGUAGE as the user's message. If they speak Hindi, reply in Hindi. If they speak English, reply in English. If they use Hinglish, use Hinglish.
        - Be friendly, witty, and engaging.
        - You can talk about anything: life, technology, jokes, or even just casual "chai-pe-charcha".
        - If the user asks about the app, explain Ghost Mode (private) or AI Recaps.
        - Keep responses concise but meaningful.
        
        Respond now as a real friend.`,
      });
      
      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: "Intelli-Bot",
        text: response.text || "I'm sorry, I couldn't process that.",
        timestamp: new Date().toLocaleTimeString(),
        isAI: true,
        sentiment: '🤖'
      };
      
      // Add locally immediately for better UX
      setMessages(prev => [...prev, aiMessage]);
      // Also emit so others (if any) see it
      socket?.emit('send_message', aiMessage);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: "Intelli-Bot",
        text: "System: AI Node is currently offline. Please check your API key.",
        timestamp: new Date().toISOString(),
        isAI: true,
        sentiment: '⚠️'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (socket) {
      socket.emit('typing', 'global');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop typing', 'global');
      }, 2000);
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        setUser({ ...user, pic: base64 });
        localStorage.setItem(`profilePic_${user.name}`, base64);
        // Also update the main user object in localStorage if it exists
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...parsed, pic: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setUser({ ...user, pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" });
    localStorage.removeItem(`profilePic_${user.name}`);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      localStorage.setItem('user', JSON.stringify({ ...parsed, pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" }));
    }
  };

  const startCall = async (type: 'video' | 'audio') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      setLocalStream(stream);
      setCallType(type);
      setIsCalling(true);

      const pc = setupPeerConnection('all');
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit('offer', { from: user.name, offer, type });

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      // Removed alert as per iframe best practices
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: incomingCall.type === 'video', 
        audio: true 
      });
      setLocalStream(stream);
      setCallType(incomingCall.type);
      setIsCalling(true);

      const pc = setupPeerConnection(incomingCall.from);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit('answer', { to: incomingCall.from, answer });
      setIncomingCall(null);

      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    socket?.emit('end_call');
  };

  const summarizeChat = async () => {
    if (messages.length < 2) return;
    setIsSummarizing(true);
    try {
      const chatHistory = messages
        .filter(m => !m.isSystem)
        .map(m => `${m.user}: ${m.text}`)
        .join('\n');

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this chat concisely:\n\n${chatHistory}`,
      });
      
      setSummary(response.text || "Could not generate summary.");
    } catch (error) {
      console.error("Summarization Error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleArchive = (id: string) => {
    setArchivedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          socket?.emit('send_message', { 
            user: user.name, 
            text: "🎤 Voice Message", 
            audio: base64Audio,
            profilePic: profilePic || undefined 
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    socket?.emit('add_reaction', { messageId, emoji, username: user.name });
  };

  return (
    <div className={cn(
      "h-screen flex flex-col font-sans overflow-hidden selection:bg-emerald-100 transition-colors duration-500 relative",
      isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Ambient Glows & Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20",
            isDarkMode ? "bg-emerald-500" : "bg-emerald-200"
          )}
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20",
            isDarkMode ? "bg-blue-500" : "bg-blue-200"
          )}
        />
        <FloatingParticles isDarkMode={!!isDarkMode} />
      </div>

      <Navbar 
        user={user} 
        onOpenProfile={() => setShowProfile(true)}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar - Responsive with Staggered Entrance */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 left-0 z-40 w-[85vw] md:w-80 lg:w-[380px] border-r flex flex-col md:relative md:translate-x-0 md:opacity-100 shadow-2xl md:shadow-none transition-all duration-500 backdrop-blur-xl",
                isDarkMode ? "bg-slate-900/40 border-slate-800/50" : "bg-white/40 border-slate-200/50"
              )}
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h2 className={cn("text-2xl font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>CORE.</h2>
                  </div>
                  <button className="md:hidden p-3 text-slate-400 hover:bg-slate-50 rounded-2xl" onClick={() => setShowSidebar(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search Nodes..." 
                    className={cn(
                      "w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-black transition-all",
                      isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-600" : "bg-slate-100/50 border-slate-200 text-slate-400"
                    )}
                  />
                </div>

                <div className="flex p-1 bg-slate-500/5 rounded-2xl gap-1">
                  {[
                    { id: 'all', label: 'Nodes', icon: Network },
                    { id: 'ai', label: 'AI', icon: Bot },
                    { id: 'archived', label: 'History', icon: Archive }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab.id 
                          ? "bg-white text-emerald-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <tab.icon className="w-3 h-3" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 custom-scrollbar">
                {/* Permanent AI Agent Node */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    setActiveTab('ai');
                  }}
                  className={cn(
                    "p-4 rounded-3xl border mb-6 cursor-pointer group transition-all hover:scale-[1.02] active:scale-95",
                    isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={cn("text-sm font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>INTELLI-BOT</h4>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Always Online</p>
                    </div>
                  </div>
                </motion.div>

                {activeTab === 'ai' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-6 rounded-[2.5rem] border cursor-pointer group mx-2 transition-all hover:shadow-xl",
                      isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <Zap className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-black text-sm tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>INTELLI-BOT</span>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-200/50 px-2 py-0.5 rounded">Active</span>
                        </div>
                        <p className="text-xs text-emerald-600/70 truncate font-bold">Quantum Assistant Ready</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 px-4">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 px-2">Active Channels</h3>
                  <div className="space-y-3">
                    {usersList.map((u, idx) => {
                      const isArchived = archivedIds.has(u);
                      if (activeTab === 'all' && isArchived) return null;
                      if (activeTab === 'archived' && !isArchived) return null;
                      if (activeTab === 'ai') return null;

                      return (
                        <motion.div 
                          key={idx} 
                          variants={sidebarItemVariants}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => { if (window.innerWidth < 768) setShowSidebar(false); }}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                            isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
                          )}
                        >
                          <div className="relative">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-sm transition-all group-hover:scale-110",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-white text-slate-400"
                            )}>
                              {u.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className={cn("text-sm font-black truncate tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{u === user.name ? `Me` : u}</p>
                              <span className="text-[9px] font-bold text-slate-300 uppercase">12:45</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-400 truncate font-bold">
                                {typingUsers.has(u) ? <span className="text-emerald-500 italic">Typing...</span> : "Active now"}
                              </p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleArchive(u); }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-emerald-500 transition-all"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Main Area */}
        <section className={cn(
          "flex-1 flex flex-col relative min-w-0 transition-all duration-500",
          isDarkMode ? "bg-slate-950/20" : "bg-transparent"
        )}>
          {/* Chat Header */}
          <div className={cn(
            "backdrop-blur-2xl px-4 md:px-10 py-4 md:py-6 border-b flex items-center justify-between sticky top-0 z-10 transition-all duration-500",
            isDarkMode ? "bg-slate-950/60 border-slate-800/50" : "bg-white/60 border-slate-100"
          )}>
            <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-2xl transition-all",
                isDarkMode ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-900 shadow-slate-200"
              )}>
                <Globe className="w-6 h-6 md:w-7 md:h-7 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className={cn("font-black text-lg md:text-2xl tracking-tighter truncate", isDarkMode ? "text-white" : "text-slate-900")}>GLOBAL NETWORK</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] md:text-[11px] text-emerald-500 font-black uppercase tracking-[0.2em]">{usersList.length} Nodes Synchronized</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startCall('video')} 
                  className={cn(
                    "p-4 rounded-2xl transition-all",
                    isDarkMode ? "bg-slate-900 text-slate-400 hover:text-emerald-400" : "bg-slate-100 text-slate-500 hover:text-emerald-600"
                  )}
                >
                  <Video className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startCall('audio')} 
                  className={cn(
                    "p-4 rounded-2xl transition-all",
                    isDarkMode ? "bg-slate-900 text-slate-400 hover:text-emerald-400" : "bg-slate-100 text-slate-500 hover:text-emerald-600"
                  )}
                >
                  <Phone className="w-5 h-5" />
                </motion.button>
              </div>
              <div className={cn("w-px h-10 mx-2", isDarkMode ? "bg-slate-800" : "bg-slate-200")}></div>
              <button 
                onClick={summarizeChat}
                disabled={isSummarizing || messages.length < 2}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-2xl group",
                  isDarkMode 
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/40" 
                    : "bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/20"
                )}
              >
                {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                <span className="hidden md:inline">Quantum Recap</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={cn(
            "flex-1 overflow-y-auto p-6 md:p-16 space-y-10 md:space-y-16 transition-all duration-500 custom-scrollbar",
            isDarkMode ? "bg-slate-950/40" : "bg-slate-50/30"
          )}>
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                if (msg.isSystem) {
                  return (
                    <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                      <span className={cn(
                        "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-sm border transition-colors",
                        isDarkMode ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-white text-slate-300 border-slate-100"
                      )}>
                        {msg.text}
                      </span>
                    </motion.div>
                  );
                }

                const isMe = msg.user === user.name;
                return (
                  <motion.div
                    key={msg.id || idx}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    className={cn(
                      "flex gap-4 max-w-[95%] md:max-w-[85%]",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 shadow-md overflow-hidden flex items-center justify-center transition-colors",
                        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-white"
                      )}>
                        {msg.profilePic ? (
                          <img src={msg.profilePic} alt={msg.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-slate-400 font-black text-sm">{msg.user.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}>
                      <div className="flex items-center gap-3 mb-2 px-2">
                        {!isMe && <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>{msg.user}</span>}
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sentiment && <span className="text-xs" title="AI Sentiment">{msg.sentiment}</span>}
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "relative px-6 py-5 md:px-12 md:py-10 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl group transition-all backdrop-blur-xl border",
                          isMe 
                            ? "bg-emerald-500/90 text-white rounded-tr-none border-emerald-400/30 shadow-emerald-500/20" 
                            : msg.isAI 
                              ? "bg-slate-900/80 text-white rounded-tl-none shadow-slate-900/40 border-slate-700/50"
                              : isDarkMode
                                ? "bg-slate-800/40 text-slate-200 rounded-tl-none border-slate-700/30"
                                : "bg-white/60 text-slate-800 rounded-tl-none border-white/50 shadow-slate-200/30"
                        )}
                      >
                        {msg.isGhost && (
                          <div className="absolute -top-4 -right-4 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white shadow-2xl z-20">
                            <Ghost className="w-5 h-5 text-emerald-400 animate-pulse" />
                          </div>
                        )}
                        
                        {msg.isAI && (
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <Bot className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Quantum Intelligence</span>
                          </div>
                        )}
                        
                        {msg.image && (
                          <div className={cn(
                            "mb-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 transition-all hover:scale-[1.02]",
                            isDarkMode ? "border-slate-700" : "border-white"
                          )}>
                            <img 
                              src={msg.image} 
                              alt="Shared" 
                              className="w-full h-auto max-h-[500px] object-cover cursor-pointer"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {msg.audio && (
                          <div className="mb-6 flex items-center gap-5 bg-black/30 p-5 rounded-3xl border border-white/10 backdrop-blur-xl">
                            <button 
                              onClick={() => {
                                const audio = new Audio(msg.audio);
                                audio.play();
                              }}
                              className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              <Play className="w-6 h-6 ml-1" />
                            </button>
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-emerald-400/60">
                                <span>Voice Node</span>
                                <span>0:04</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 2 }}
                                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                              </div>
                            </div>
                            <Mic className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        
                        <p className="text-base md:text-lg leading-relaxed font-bold tracking-tight whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* AI Translation Button */}
                        {!msg.isAI && !msg.isSystem && msg.text && (
                          <button 
                            onClick={() => translateMessage(msg.id!, msg.text)}
                            disabled={translatingId === msg.id}
                            className={cn(
                              "mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                              isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                            )}
                          >
                            {translatingId === msg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                            Translate Node
                          </button>
                        )}
                        
                        {/* Reactions Display */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                              <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleReaction(msg.id!, emoji)}
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs flex items-center gap-1 border transition-colors",
                                  (users as string[]).includes(user.name) 
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" 
                                    : isDarkMode ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                                )}
                              >
                                <span>{emoji}</span>
                                <span className="font-black">{(users as string[]).length}</span>
                              </motion.button>
                            ))}
                          </div>
                        )}

                        {/* Reaction Picker Trigger */}
                        <div className={cn(
                          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 rounded-full shadow-xl z-20",
                          isMe ? "right-full mr-2" : "left-full ml-2",
                          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
                        )}>
                          {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id!, emoji)}
                              className="p-1.5 hover:bg-emerald-500/10 rounded-full transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {isMe && (
                          <div className="absolute -bottom-1 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
              
              {isAiThinking && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] rounded-tl-none flex items-center gap-4 shadow-2xl">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-500">Processing</span>
                  </div>
                </motion.div>
              )}

              {Array.from(typingUsers).filter(u => u !== user.name).map(u => (
                <motion.div key={u} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-6">
                  {u} is typing...
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Summary Overlay */}
          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className={cn(
                  "absolute bottom-32 left-6 right-6 md:left-12 md:right-12 p-8 rounded-[3rem] shadow-2xl border z-30 transition-colors duration-300",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-6 h-6 text-emerald-500" />
                    <h3 className={cn("text-xl font-black tracking-tighter uppercase", isDarkMode ? "text-white" : "text-slate-900")}>Recap.</h3>
                  </div>
                  <button onClick={() => setSummary(null)} className={cn("p-2 rounded-xl transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
                    <X className="w-6 h-6 text-slate-300" />
                  </button>
                </div>
                <div className={cn("p-6 rounded-[2rem] border transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                  <p className={cn("text-sm leading-relaxed font-bold italic", isDarkMode ? "text-slate-300" : "text-slate-700")}>"{summary}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Replies */}
          <AnimatePresence>
            {smartReplies.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar"
              >
                {smartReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputMessage(reply);
                      setSmartReplies([]);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                      isDarkMode ? "bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800" : "bg-white border-slate-100 text-emerald-600 hover:bg-slate-50"
                    )}
                  >
                    {reply}
                  </button>
                ))}
                <button onClick={() => setSmartReplies([])} className="p-2 text-slate-300 hover:text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className={cn(
            "p-5 md:p-12 border-t relative transition-all duration-500 backdrop-blur-3xl",
            isDarkMode ? "bg-slate-950/80 border-slate-800/50" : "bg-white/80 border-slate-100"
          )}>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 right-0 md:left-10 md:right-auto z-50 mb-6 shadow-2xl rounded-3xl overflow-hidden border border-slate-200/50 animate-in slide-in-from-bottom-4">
                <EmojiPicker 
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    setInputMessage(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                  width={350}
                  height={400}
                />
              </div>
            )}

            {showStickers && (
              <div className={cn(
                "absolute bottom-full left-10 z-50 mb-6 p-8 rounded-[3rem] shadow-2xl border grid grid-cols-2 gap-6 w-[350px] transition-all backdrop-blur-2xl animate-in slide-in-from-bottom-4",
                isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-100"
              )}>
                <div className="col-span-2 flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Quantum Stickers</span>
                  </div>
                  <button onClick={() => setShowStickers(false)} className="p-2 hover:bg-slate-500/10 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-300" /></button>
                </div>
                {STICKERS.map((sticker, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      socket?.emit('send_message', { user: user.name, text: "Sticker", image: sticker, profilePic: profilePic || undefined, isGhost: isGhostMode });
                      setShowStickers(false);
                    }}
                    className={cn(
                      "rounded-2xl overflow-hidden border-2 hover:border-emerald-500 transition-all shadow-lg",
                      isDarkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"
                    )}
                  >
                    <img src={sticker} alt="Sticker" className="w-full h-auto p-2" referrerPolicy="no-referrer" />
                  </motion.button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between md:justify-start gap-2 order-2 md:order-1">
                <div className="flex gap-2 bg-slate-500/5 p-1.5 rounded-[2rem]">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all",
                      isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all",
                      showEmojiPicker ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : (isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm")
                    )}
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => setShowStickers(!showStickers)}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all",
                      showStickers ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : (isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm")
                    )}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="flex gap-2 bg-slate-500/5 p-1.5 rounded-[2rem]">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => isRecording ? stopRecording() : startRecording()}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all",
                      isRecording ? "bg-red-500 text-white animate-pulse shadow-xl shadow-red-500/20" : (isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm")
                    )}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => setIsGhostMode(!isGhostMode)}
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all",
                      isGhostMode ? "bg-slate-900 text-emerald-400 shadow-2xl border border-emerald-500/20" : (isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm")
                    )}
                  >
                    <Ghost className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-3 order-1 md:order-2">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder={isGhostMode ? "Ghost message..." : "Message Node..."}
                    className={cn(
                      "w-full px-8 md:px-10 py-5 md:py-6 border rounded-[2rem] md:rounded-[3rem] focus:ring-4 focus:ring-emerald-500/20 outline-none text-sm md:text-lg font-bold transition-all shadow-2xl",
                      isDarkMode 
                        ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-emerald-500/50 focus:shadow-emerald-500/10" 
                        : "bg-white border-slate-100 text-slate-900 placeholder-slate-300 focus:border-emerald-500/50 focus:shadow-emerald-500/5"
                    )}
                  />
                  {isGhostMode && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Encrypted</span>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className={cn(
                    "w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-[2rem] transition-all shadow-2xl disabled:opacity-50 group relative overflow-hidden",
                    isDarkMode ? "bg-emerald-500 text-white shadow-emerald-500/40" : "bg-slate-900 text-white shadow-slate-900/20"
                  )}
                >
                  <AnimatePresence>
                    {inputMessage.trim() && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-white/20 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                  <Send className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                </motion.button>
              </div>
            </form>
          </div>
        </section>

        {/* Profile Sidebar */}
        <AnimatePresence>
          {showProfile && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]" />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 35, stiffness: 350 }}
                className={cn(
                  "fixed right-0 top-0 bottom-0 w-full sm:w-[450px] shadow-2xl z-[70] flex flex-col transition-colors duration-300",
                  isDarkMode ? "bg-slate-900" : "bg-white"
                )}
              >
                <div className={cn("p-10 border-b flex items-center justify-between", isDarkMode ? "border-slate-800" : "border-slate-100")}>
                  <h2 className={cn("text-3xl font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>PROFILE.</h2>
                  <button onClick={() => setShowProfile(false)} className={cn("p-3 rounded-2xl transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
                    <X className="w-7 h-7 text-slate-300" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10">
                  <div className="flex flex-col items-center mb-12">
                    <div className="relative group">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "w-40 h-40 rounded-[3rem] flex items-center justify-center text-5xl font-black border-4 shadow-2xl overflow-hidden transition-colors",
                          isDarkMode ? "bg-slate-800 border-slate-700 text-slate-600" : "bg-slate-50 border-white text-slate-300"
                        )}
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </motion.div>
                      <div className="absolute -bottom-2 -right-2 flex gap-2">
                        <button 
                          onClick={() => profileInputRef.current?.click()}
                          className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-2xl hover:bg-emerald-600 transition-all"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                        {profilePic && (
                          <button 
                            onClick={removeProfilePic}
                            className="p-4 bg-red-500 text-white rounded-[1.5rem] shadow-2xl hover:bg-red-600 transition-all"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                    </div>
                    <h3 className={cn("mt-8 text-3xl font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>{user.name}</h3>
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Verified Node</p>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</label>
                      <div className={cn("p-6 rounded-[2rem] border transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                        <p className={cn("text-sm font-bold leading-relaxed italic", isDarkMode ? "text-slate-300" : "text-slate-700")}>"Connected to IntelliCall Network."</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System Settings</label>
                      <div className="space-y-2">
                        {[
                          { icon: Bell, label: "Alerts", value: "Active" },
                          { icon: Shield, label: "Security", value: "E2E" },
                          { icon: Globe, label: "Region", value: "Global" }
                        ].map((item, i) => (
                          <button key={i} className={cn("w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
                            <div className="flex items-center gap-5">
                              <item.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                              <span className={cn("text-sm font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.label}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{item.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={cn("p-10 border-t", isDarkMode ? "border-slate-800" : "border-slate-100")}>
                  <button 
                    onClick={() => {
                      setUser(null);
                      navigate('/');
                    }}
                    className={cn(
                      "w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                      isDarkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                    )}
                  >
                    <LogOut className="w-5 h-5" /> Terminate Session
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Incoming Call Overlay */}
        <AnimatePresence>
          {incomingCall && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed bottom-10 right-6 left-6 md:left-auto md:right-10 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl z-[110] border border-white/10 w-full max-w-[350px]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl animate-pulse">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-1 tracking-tighter">{incomingCall.from}</h3>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Incoming {incomingCall.type} Call</p>
                
                <div className="flex gap-4 w-full">
                  <button onClick={endCall} className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Decline</button>
                  <button onClick={acceptCall} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"><PhoneIncoming className="w-4 h-4" /> Accept</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Call Overlay */}
        <AnimatePresence>
          {isCalling && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900 z-[120] flex flex-col items-center justify-center p-6 md:p-12"
            >
              <div className="relative w-full max-w-6xl aspect-video bg-black rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl border border-white/5">
                {callType === 'video' ? (
                  <div className="w-full h-full relative">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                    <div className="absolute top-6 right-6 md:top-12 md:right-12 w-32 h-48 md:w-48 md:h-72 bg-slate-800 rounded-[2rem] border-4 border-white/20 overflow-hidden shadow-2xl">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-black">
                    <div className="w-40 h-40 bg-emerald-500/10 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
                        <User className="w-16 h-16" />
                      </div>
                    </div>
                    <h3 className="mt-10 text-white font-black text-4xl tracking-tighter">Secure Session</h3>
                    <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.5em] mt-4">Audio Link Active</p>
                  </div>
                )}
                
                <div className="absolute top-8 left-8 flex items-center gap-4 bg-black/40 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-black tracking-[0.2em] uppercase">Live</span>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 md:gap-10">
                  <button className="w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"><Mic className="w-6 h-6" /></button>
                  <button onClick={endCall} className="w-20 h-20 md:w-24 md:h-24 bg-red-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-all active:scale-90"><PhoneOff className="w-10 h-10" /></button>
                  <button className="w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"><VideoOff className="w-6 h-6" /></button>
                </div>
              </div>
              
              <div className="mt-12 flex flex-col items-center">
                <div className="flex items-center gap-3 text-white/20 mb-3">
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Quantum Encrypted</span>
                </div>
                <h4 className="text-white/40 font-bold text-sm">INTELLICALL SECURE GATEWAY</h4>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const AboutPage = ({ isDarkMode, toggleDarkMode, user }: { isDarkMode?: boolean, toggleDarkMode?: () => void, user?: User | null }) => {
  return (
    <div className={cn("min-h-screen selection:bg-emerald-100 overflow-x-hidden", isDarkMode ? "bg-slate-950" : "bg-white")}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-32 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <h1 className={cn("text-5xl md:text-8xl font-black tracking-tighter mb-12 leading-none", isDarkMode ? "text-white" : "text-slate-900")}>
                OUR <br />
                <span className="text-emerald-500 italic">MISSION.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-bold">
                We are building the infrastructure for the next century of human communication. 
                Privacy isn't a feature—it's the foundation.
              </p>
            </motion.div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-[120px] -z-10"></div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-12 mb-40">
            {[
              { title: "Privacy First", desc: "Every byte of data is encrypted using quantum-resistant algorithms.", icon: Shield },
              { title: "AI Native", desc: "Intelligence is baked into the core protocol, not added as an afterthought.", icon: Bot },
              { title: "Global Mesh", desc: "A decentralized network of nodes ensures 100% uptime and zero latency.", icon: Globe }
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={cn(
                  "p-12 rounded-[3.5rem] border",
                  isDarkMode ? "bg-slate-900 border-white/5" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-emerald-500/20">
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={cn("text-3xl font-black mb-6 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{v.title}</h3>
                <p className="text-slate-400 font-bold leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Team Section (Reused and Enhanced) */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={cn("text-3xl md:text-5xl font-black tracking-tighter mb-6", isDarkMode ? "text-white" : "text-slate-900")}>
                THE <span className="text-emerald-500 italic">ARCHITECTS.</span>
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-emerald-500/30"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Early Birds Team</p>
                <div className="h-[1px] w-12 bg-emerald-500/30"></div>
              </div>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-10 rounded-[3.5rem] border transition-all duration-500 group",
                  isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/30" : "bg-slate-50 border-slate-100 hover:border-emerald-500/20"
                )}
              >
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden mb-10 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-2xl">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className={cn("text-2xl font-black tracking-tight mb-2", isDarkMode ? "text-white" : "text-slate-900")}>{member.name}</h3>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] mb-6">{member.role}</p>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Globe className="w-4 h-4 text-slate-500 hover:text-emerald-500 cursor-pointer" />
                  <Activity className="w-4 h-4 text-slate-500 hover:text-emerald-500 cursor-pointer" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <div className={cn(
            "p-20 rounded-[4rem] text-center relative overflow-hidden",
            isDarkMode ? "bg-emerald-500" : "bg-slate-900"
          )}>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-10">JOIN THE REVOLUTION.</h2>
            <Link to="/login" className={cn(
              "px-16 py-8 rounded-2xl font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl inline-flex items-center gap-4 group",
              isDarkMode ? "bg-white text-emerald-600 hover:bg-slate-100" : "bg-emerald-500 text-white hover:bg-emerald-400"
            )}>
              Get Started <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      
      {/* Reusing Footer */}
      <footer className={cn("py-20 px-6 border-t", isDarkMode ? "bg-slate-950 border-white/5" : "bg-white border-slate-100")}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">© 2026 INTELLI-CALL PROTOCOL. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Security'].map(item => (
                <a key={item} href="#" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-500 transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-slate-950" : "bg-white")}>
        <Routes>
          <Route path="/" element={<HomePage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/chat" element={user ? <ChatPage user={user} setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> : <LoginPage setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/about" element={<AboutPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}
