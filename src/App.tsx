/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
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
  UserX,
  UserMinus,
  AlertTriangle,
  Layers,
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
  Fingerprint,
  Users
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8 text-center">
          <div>
            <h1 className="text-4xl font-black text-red-500 mb-4">Oops! Something went wrong.</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              The application crashed. This is likely due to a runtime error. 
              Please check the browser console for more details.
            </p>
            <pre className="bg-slate-900 p-4 rounded-xl border border-white/10 text-xs text-left overflow-auto max-w-2xl mx-auto mb-8">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token?: string;
  lastSeen?: string;
  isOnline?: boolean;
  friends?: User[];
}

interface FriendRequest {
  _id: string;
  from: User;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  admin: User | string;
  pic: string;
}

interface Reel {
  _id: string;
  createdBy: string;
  createdByName: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt?: string;
  likes?: string[];
}

interface Message {
  id: string;
  user: string;
  senderId?: string;
  to?: string; // Recipient name for private chat
  groupId?: string; // Group ID for group chat
  text: string;
  image?: string;
  video?: string;
  timestamp: string;
  isSystem?: boolean;
  isAI?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  profilePic?: string;
  sentiment?: string;
  isGhost?: boolean;
  audio?: string;
  reactions?: { [emoji: string]: string[] };
  isEdited?: boolean;
  editedAt?: string;
  readBy?: string[];
  isDeleted?: boolean;
  deletedFor?: string[]; // List of user names who deleted it for themselves
}

const SEND_SOUND = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";
const RECEIVE_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const CALL_SOUND = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3";

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const messageVariants = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  }
};

const sidebarItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

// --- Components ---

const TEAM_MEMBERS = [
  { name: "Rashmi", role: "Project Lead & Frontend Architect", image: "https://picsum.photos/seed/rashmi/200/200" },
  { name: "Shreya", role: "Backend Engineer & Database Admin", image: "https://picsum.photos/seed/shreya/200/200" },
  { name: "Nitin", role: "UI/UX Designer & Motion Specialist", image: "https://picsum.photos/seed/nitin/200/200" },
  { name: "Sneha", role: "AI Integration & Security Specialist", image: "https://picsum.photos/seed/sneha/200/200" },
];

const INTELLICALL_ABOUT = {
  headline: "Built for real-time connection",
  description:
    "IntelliCall brings live chat, AI assistance, groups, and voice or video calls into one focused experience. Messages sync instantly over WebSockets; calls use WebRTC. Use video filters on your own preview during video calls for a fun, polished look.",
};

const VIDEO_CALL_FILTERS: { id: string; label: string; css: string }[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "warm", label: "Warm", css: "sepia(0.35) contrast(1.05) saturate(1.2)" },
  { id: "cool", label: "Cool", css: "hue-rotate(200deg) saturate(1.25) brightness(1.02)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.65) contrast(1.12)" },
  { id: "soft", label: "Glow", css: "brightness(1.08) contrast(0.92) blur(0.4px)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.2)" },
];

const Navbar = ({ user, onOpenProfile, onOpenReels, onToggleSidebar, isDarkMode, toggleDarkMode, onlineCount }: { 
  user?: User | null, 
  onOpenProfile?: () => void,
  onOpenReels?: () => void,
  onToggleSidebar?: () => void,
  isDarkMode?: boolean,
  toggleDarkMode?: () => void,
  onlineCount?: number
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-100"
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={cn(
              "p-2 rounded-xl transition-colors md:hidden",
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to={user ? "/chat" : "/login"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <span className={cn(
              "text-xl font-black tracking-tight",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>IntelliCall</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 ml-10 text-xs font-bold text-slate-400">
            <Link to="/about" className="hover:text-emerald-500 transition-colors">About</Link>
            {user && <Link to="/chat" className="text-emerald-500 flex items-center gap-2 font-black">Chat</Link>}
            {user && (
              <button
                onClick={() => {
                  if (onOpenReels) onOpenReels();
                  else navigate("/chat");
                }}
                className="hover:text-emerald-500 transition-colors flex items-center gap-2"
              >
                Reels
                <span className="px-2 py-0.5 text-[9px] bg-emerald-500/15 text-emerald-600 rounded-full font-black">
                  {typeof onlineCount === "number" ? onlineCount : 0}
                </span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileClick}
              className={cn(
                "flex items-center gap-3 p-1.5 rounded-2xl transition-all border",
                isDarkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-emerald-50 flex items-center justify-center">
                {user.pic ? (
                  <img src={user.pic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-emerald-600 font-black text-xs">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-left hidden sm:block pr-2">
                <p className={cn("text-xs font-black leading-none", isDarkMode ? "text-white" : "text-slate-900")}>{user.name}</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">Online</p>
              </div>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-emerald-500 transition-all">Login</Link>
              <Link to="/login" className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">Join Now</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden border-t overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}
          >
            <div className="flex flex-col p-4 gap-4 text-sm font-bold">
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={cn("p-3 rounded-xl", isDarkMode ? "text-white hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50")}>About</Link>
              {user && <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-xl text-emerald-500 font-black">Chat</Link>}
            {user && (
              <button
                onClick={() => {
                  if (onOpenReels) onOpenReels();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl text-emerald-500 font-black text-left"
              >
                Reels
              </button>
            )}
              {!user && <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-xl text-emerald-500 font-black">Login / Join</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


const LoginPage = ({ setUser, isDarkMode, toggleDarkMode }: { setUser: (u: User | null) => void, isDarkMode?: boolean, toggleDarkMode?: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wipeBusy, setWipeBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const navigate = useNavigate();

  const clearBrowserData = () => {
    if (!window.confirm('Clear all local browser data (saved login, theme)? You will need to sign in again.')) return;
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.reload();
  };

  const wipeServerDatabase = async () => {
    const typed = window.prompt('This deletes ALL users, messages, groups on the server. Type exactly: RESET_ALL_DATA');
    if (typed !== 'RESET_ALL_DATA') return;
    setWipeBusy(true);
    try {
      const res = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET_ALL_DATA' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      alert('Server database wiped. Create a new account.');
      window.location.reload();
    } catch (e: any) {
      alert(e.message || 'Reset failed');
    } finally {
      setWipeBusy(false);
    }
  };

  const deleteMyAccount = async () => {
    if (!email.trim() || !password) {
      alert('Enter your email and password to delete your account.');
      return;
    }
    if (!window.confirm('Permanently delete your account and all your messages? This cannot be undone.')) return;
    setDeleteBusy(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      alert('Your account has been deleted.');
      window.location.reload();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    } finally {
      setDeleteBusy(false);
    }
  };

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
    <div className={cn("min-h-screen flex flex-col selection:bg-emerald-100 relative overflow-hidden", isDarkMode ? "bg-slate-950" : "bg-slate-50")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.25),transparent)]" />
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-16 p-6 lg:p-12 max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col justify-center max-w-lg mx-auto lg:mx-0"
        >
          <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.5em] mb-4">IntelliCall</p>
          <h1 className={cn("text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-6", isDarkMode ? "text-white" : "text-slate-900")}>
            Connect in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">real time</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">
            Chat, AI assistant, voice and video — one clean workspace. Sign in to continue or reset data for a fresh start.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-600")}>End-to-end feel</div>
            <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-600")}>Socket.io live</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex-1 p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full mx-auto border relative overflow-hidden backdrop-blur-xl",
            isDarkMode ? "bg-slate-900/80 border-slate-700/80" : "bg-white/90 border-slate-100"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <div className="text-center mb-8">
            <h2 className={cn("text-3xl font-black mb-2 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-500 font-bold text-xs">
              {isLogin ? "Sign in to open your chats" : "Join IntelliCall in seconds"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={cn(
                    "w-full px-5 py-4 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-bold",
                    isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                  )}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full px-5 py-4 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-bold",
                  isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                )}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full px-5 py-4 border-2 border-transparent focus:border-emerald-500 rounded-2xl transition-all outline-none font-bold",
                  isDarkMode ? "bg-slate-800 text-white placeholder-slate-600" : "bg-slate-50 text-slate-900"
                )}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? "Sign in" : "Create account")}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
            >
              {isLogin ? "New here? Create an account" : "Have an account? Sign in"}
            </button>
          </div>

          <div className={cn("mt-8 pt-8 border-t space-y-3", isDarkMode ? "border-slate-800" : "border-slate-100")}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Data &amp; privacy
            </p>
            <button
              type="button"
              onClick={clearBrowserData}
              className={cn("w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              Clear local browser data
            </button>
            <button
              type="button"
              onClick={wipeServerDatabase}
              disabled={wipeBusy}
              className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
              {wipeBusy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reset entire server database (demo)"}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={deleteMyAccount}
                disabled={deleteBusy}
                className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
              >
                {deleteBusy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete my account (uses email above)"}
              </button>
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
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [messageInfo, setMessageInfo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [searchFriendInput, setSearchFriendInput] = useState('');
  const [isSearchingFriend, setIsSearchingFriend] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string, fromUserId?: string, type: 'video' | 'audio', offer: any } | null>(null);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChat, setShowChat] = useState(false); // For mobile view
  const [profilePic, setProfilePic] = useState<string | null>(user.pic);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | 'ai'>('all');
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [activeFeed, setActiveFeed] = useState<'chat' | 'reels'>('chat');
  const [reels, setReels] = useState<Reel[]>([]);
  const [newReelCaption, setNewReelCaption] = useState('');
  const [newReelMediaUrl, setNewReelMediaUrl] = useState('');
  const [newReelMediaType, setNewReelMediaType] = useState<'image' | 'video'>('video');
  const [editReelId, setEditReelId] = useState<string | null>(null);
  const [editReelCaption, setEditReelCaption] = useState('');
  const [editReelMediaUrl, setEditReelMediaUrl] = useState('');
  const [editReelMediaType, setEditReelMediaType] = useState<'image' | 'video'>('video');
  const [isGhostMode, setIsGhostMode] = useState(() => {
    try {
      const saved = localStorage.getItem('ghostMode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('ghostMode', JSON.stringify(isGhostMode));
  }, [isGhostMode]);
  const [ghostTimer, setGhostTimer] = useState(10); // Default 10s self-destruct
  const [moodColor, setMoodColor] = useState('emerald');
  const [showAboutChat, setShowAboutChat] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [videoCallFilterId, setVideoCallFilterId] = useState('none');
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

  const SEND_SOUND = "https://raw.githubusercontent.com/sharma-rashmi/assets/main/send.mp3";
  const RECEIVE_SOUND = "https://raw.githubusercontent.com/sharma-rashmi/assets/main/receive.mp3";
  const CALL_SOUND = "https://raw.githubusercontent.com/sharma-rashmi/assets/main/call.mp3";
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const remotePeerUserIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const selectedUserRef = useRef<User | null>(null);
  const selectedGroupRef = useRef<Group | null>(null);
  const activeTabRef = useRef<'all' | 'archived' | 'ai'>('all');

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (activeFeed === 'reels') {
      setShowSidebar(false);
    }
  }, [activeFeed]);

  const playSound = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Audio play blocked or failed:", e.message);
        });
      }
    } catch (e) {
      console.error("Sound system error:", e);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: user.pic });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: user.pic });
        }
      });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setProfilePic(user.pic);
  }, [user.pic]);

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [usersRes, groupsRes, friendsRes, requestsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/groups'),
          fetch(`/api/friends/${user._id}`),
          fetch(`/api/friends/requests/${user._id}`)
        ]);
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (groupsRes.ok) setGroups(await groupsRes.json());
        if (friendsRes.ok) setFriends(await friendsRes.json());
        if (requestsRes.ok) setFriendRequests(await requestsRes.json());
      } catch (error) {
        console.error("Error fetching users/groups/friends:", error);
      }
    };
    fetchUsersAndGroups();
  }, []);

  // Fetch reels feed (Instagram-like) for Reels panel.
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch('/api/reels');
        if (res.ok) setReels(await res.json());
      } catch (e) {
        console.error('Error fetching reels:', e);
      }
    };
    fetchReels();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let url = '/api/messages?';
        if (selectedGroup) {
          url += `groupId=${selectedGroup._id}`;
        } else if (selectedUser) {
          url += `user=${user.name}&to=${selectedUser.name}`;
        } else if (activeTab === 'ai') {
          url += `user=${user.name}&to=My Assistant`;
        } else {
          url += `user=${user.name}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser, selectedGroup, activeTab, user.name]);

  useEffect(() => {
    // Self-destruct logic for ghost messages
    const timer = setInterval(() => {
      setMessages(prev => prev.filter(msg => {
        if (!msg.isGhost) return true;
        const age = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
        return age < 15; // Self-destruct after 15 seconds
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('setup', { _id: user._id, name: user.name });

    newSocket.on('connected', () => {
      console.log("Socket connected to grid");
      setSocketConnected(true);
    });

    newSocket.on('connect', () => {
      setSocketConnected(true);
    });

    newSocket.on('user_logged_in', async (newUser) => {
      console.log("Received user_logged_in:", newUser);
      const res = await fetch('/api/users');
      if (res.ok) setAllUsers(await res.json());
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    newSocket.on('user_status_change', (updatedUsers: User[]) => {
      const filtered = updatedUsers.filter(u => u.name !== user.name);
      setOnlineUsers(filtered);
    });

    const messageMatchesOpenChat = (msg: Message): boolean => {
      const selU = selectedUserRef.current;
      const selG = selectedGroupRef.current;
      const tab = activeTabRef.current;
      if (msg.isSystem) return true;
      if (selG) return String(msg.groupId) === String(selG._id);
      if (tab === 'ai') {
        return (msg.user === user.name && msg.to === 'My Assistant') ||
          (msg.user === 'My Assistant' && msg.to === user.name);
      }
      if (selU) {
        const isPrivate =
          (msg.user === user.name && msg.to === selU.name) ||
          (msg.user === selU.name && msg.to === user.name);

        // Allow AI "Explain" bubbles to appear inside the currently opened private chat.
        const isAiExplain =
          !!msg.isAI &&
          msg.user === "My Assistant" &&
          (msg.to === selU.name || msg.to === user.name);

        return isPrivate || isAiExplain;
      }
      return !msg.to && !msg.groupId;
    };

    newSocket.on('message received', (newMessage: any) => {
      const message: Message = {
        id: newMessage.id || newMessage._id || Math.random().toString(36).substr(2, 9),
        user: newMessage.sender?.name ?? newMessage.user,
        senderId: newMessage.sender?._id,
        to: newMessage.to,
        groupId: newMessage.groupId != null ? String(newMessage.groupId) : undefined,
        text: newMessage.content || newMessage.text,
        image: newMessage.image,
        video: newMessage.video,
        audio: newMessage.audio,
        timestamp: newMessage.timestamp || new Date().toISOString(),
        profilePic: newMessage.sender?.pic ?? newMessage.profilePic,
        isGhost: newMessage.isGhost,
        isAI: newMessage.isAI,
        isSystem: newMessage.isSystem,
        sentiment: analyzeSentiment(newMessage.content || newMessage.text || '')
      };

      if (messageMatchesOpenChat(message)) {
        setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      const isForMe = message.user !== user.name;
      if (isForMe) {
        playSound(RECEIVE_SOUND);
        if (!messageMatchesOpenChat(message)) {
          const label = message.groupId ? 'Group' : (message.to ? message.user : 'Global');
          showNotification(`New message (${label})`, message.text || '');
        } else {
          generateSmartReplies(message.text || '');
        }
      }
    });

    newSocket.on('receive_message', (raw: Message) => {
      const message: Message = {
        ...raw,
        groupId: raw.groupId != null ? String(raw.groupId) : undefined
      };

      if (messageMatchesOpenChat(message)) {
        setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      if (message.user !== user.name) {
        playSound(RECEIVE_SOUND);
        if (!messageMatchesOpenChat(message)) {
          showNotification(`New Message from ${message.user}`, message.text || '');
        }
      }

      if (message.sentiment === '😊' || message.sentiment === '🔥') setMoodColor('emerald');
      else if (message.sentiment === '😢' || message.sentiment === '😞') setMoodColor('blue');
      else if (message.sentiment === '😠' || message.sentiment === '😡') setMoodColor('red');
      else if (message.sentiment === '😮' || message.sentiment === '😲') setMoodColor('purple');

      if (message.user !== user.name && !message.isAI) {
        if (messageMatchesOpenChat(message)) {
          generateSmartReplies(message.text || '');
          const lowerText = (message.text || '').toLowerCase();
          if (lowerText.includes('ai') || lowerText.includes('help') || lowerText.includes('hello intelli')) {
            handleAiResponse(message.text || '');
          }
        }
      }
    });

    newSocket.on("friend_request_received", (request: FriendRequest) => {
      setFriendRequests(prev => [...prev, request]);
      showNotification('New Friend Request', `${request.from.name} sent you a friend request!`);
      playSound(RECEIVE_SOUND);
    });

    newSocket.on("friend_request_accepted", (data: { from: string }) => {
      showNotification('Friend Request Accepted', `You and ${data.from} are now friends!`);
      playSound(RECEIVE_SOUND);
      // Refresh friends list
      fetch(`/api/friends/${user._id}`).then(res => res.ok && res.json()).then(data => data && setFriends(data));
    });

    newSocket.on('message_edited', (editedMsg: Message) => {
      setMessages(prev => prev.map(m => m.id === editedMsg.id ? { ...m, text: editedMsg.text, isEdited: true, editedAt: editedMsg.editedAt } : m));
    });

    newSocket.on('message_deleted', ({ id }: { id: string }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, text: '🚫 This message was deleted' } : m));
    });

    newSocket.on('all_messages_deleted', () => {
      setMessages([]);
    });

    newSocket.on('typing', () => setTypingUsers(prev => new Set(prev).add('Someone')));
    newSocket.on('stop typing', () => setTypingUsers(new Set()));

    newSocket.on('reel_created', (reel: Reel) => {
      setReels((prev) => {
        if (prev.some((r) => r._id === reel._id)) return prev;
        return [reel, ...prev];
      });
    });

    newSocket.on('reel_updated', (reel: Reel) => {
      setReels((prev) => prev.map((r) => (r._id === reel._id ? reel : r)));
    });

    newSocket.on('reel_like_updated', ({ reelId, likes }: { reelId: string; likes: string[] }) => {
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId
            ? {
                ...r,
                likes,
              }
            : r
        )
      );
    });

    newSocket.on('reel_deleted', ({ reelId }: { reelId: string }) => {
      setReels((prev) => prev.filter((r) => r._id !== reelId));
    });

    newSocket.on('offer', async (data) => {
      if (data.from !== user.name) {
        setIncomingCall(data);
        playSound(CALL_SOUND);
      }
    });

    newSocket.on('answer', async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        // If ICE candidates arrived early, flush them now.
        if (pendingIceCandidatesRef.current.length) {
          const pc = peerConnection.current;
          const buffered = pendingIceCandidatesRef.current;
          pendingIceCandidatesRef.current = [];
          for (const cand of buffered) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.error("Error adding buffered ice candidate", e);
            }
          }
        }
      }
    });

    newSocket.on('ice-candidate', async (data) => {
      if (!peerConnection.current) return;
      const pc = peerConnection.current;
      try {
        // Buffer candidates until we have a remote description.
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingIceCandidatesRef.current.push(data.candidate as RTCIceCandidateInit);
        }
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    newSocket.on('reaction_updated', ({ messageId, reactions }: { messageId: string, reactions: any }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });

    return () => {
      newSocket.close();
    };
  }, [user?.name]);

  useEffect(() => {
    if (!socket) return;
    const onRemoteCallEnded = () => {
      setLocalStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      setRemoteStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      setIsCalling(false);
      setIncomingCall(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      pendingIceCandidatesRef.current = [];
      remotePeerUserIdRef.current = null;
      setVideoCallFilterId("none");
    };
    socket.on('call_ended', onRemoteCallEnded);
    return () => {
      socket.off('call_ended', onRemoteCallEnded);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !groups.length) return;
    groups.forEach((g) => socket.emit('join group', g._id));
  }, [socket, groups]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
        setShowChat(true);
      } else {
        if (selectedUser) {
          setShowSidebar(false);
          setShowChat(true);
        } else {
          setShowSidebar(true);
          setShowChat(false);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedUser]);

  const handleSelectUser = (u: User | null) => {
    setSelectedUser(u);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
      setShowChat(true);
    }
  };

  const handleBackToSidebar = () => {
    setSelectedUser(null);
    if (window.innerWidth < 768) {
      setShowSidebar(true);
      setShowChat(false);
    }
  };

  useEffect(() => {
    if (!messages.length) return;
    
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage.user === user.name;
    
    // Check if user is near bottom
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If we are within 150px of the bottom, we consider it "at the bottom"
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (isMyMessage || isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Fallback if container ref isn't ready
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, user.name]);

  useEffect(() => {
    if (localVideoRef.current && localStream && callType === 'video') {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callType, isCalling]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === 'video') {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, callType, isCalling]);

  const setupPeerConnection = (remoteUserId: string) => {
    // Reset buffer whenever we create a new peer connection.
    pendingIceCandidatesRef.current = [];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { toUserId: remoteUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const videoFilterCss = useMemo(
    () => VIDEO_CALL_FILTERS.find((f) => f.id === videoCallFilterId)?.css ?? "none",
    [videoCallFilterId]
  );

  // Unique Feature: Sentiment Analysis (Simple implementation)
  const analyzeSentiment = (text: string) => {
    const positive = ['happy', 'good', 'great', 'awesome', 'love', 'yes', 'cool', 'nice'];
    const negative = ['sad', 'bad', 'angry', 'hate', 'no', 'urgent', 'help', 'wrong'];
    const lower = text.toLowerCase();
    if (positive.some(word => lower.includes(word))) return '😊';
    if (negative.some(word => lower.includes(word))) return '😟';
    return '😐';
  };

  const handleDeleteMessage = (id: string) => {
    socket?.emit('delete_message', { id });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, text: '🚫 This message was deleted' } : m));
  };

  const handleDeleteAllMessages = async () => {
    if (window.confirm("Are you sure you want to delete ALL messages? This cannot be undone.")) {
      try {
        const response = await fetch('/api/messages/all', { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id })
        });
        if (response.ok) {
          socket?.emit('delete_all_messages');
          setMessages([]);
        } else {
          alert("Failed to delete messages from server.");
        }
      } catch (error) {
        console.error("Error deleting all messages:", error);
        alert("An error occurred while deleting messages.");
      }
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setInputMessage(message.text);
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          members: [...newGroupMembers, user._id],
          admin: user._id
        })
      });
      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [...prev, newGroup]);
        setShowNewGroupModal(false);
        setNewGroupName('');
        setNewGroupMembers([]);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const addMemberToGroup = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      const response = await fetch(`/api/groups/${selectedGroup._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        const updatedGroup = await response.json();
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
        setSelectedGroup(updatedGroup);
        setShowAddMemberModal(false);
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleExitGroup = async (groupId: string) => {
    if (!window.confirm("Are you sure you want to exit this group?")) return;
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${user._id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setGroups(prev => prev.filter(g => g._id !== groupId));
        setSelectedGroup(null);
        setShowGroupInfo(false);
        alert("You have left the group.");
      }
    } catch (error) {
      console.error("Error exiting group:", error);
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const handleDeleteGroup = async (groupId: string) => {
    setShowConfirmModal({
      show: true,
      title: "Delete Group",
      message: "Are you sure you want to delete this group? This will delete all messages for everyone and cannot be undone.",
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/groups/${groupId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            setGroups(prev => prev.filter(g => g._id !== groupId));
            if (selectedGroup?._id === groupId) setSelectedGroup(null);
            setShowConfirmModal(prev => ({ ...prev, show: false }));
          }
        } catch (error) {
          console.error("Error deleting group:", error);
        }
      }
    });
  };

  const handleDeletePerson = async (friendId: string) => {
    setShowConfirmModal({
      show: true,
      title: "Remove Friend",
      message: "Are you sure you want to remove this person and delete all messages? This action is permanent.",
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/friends/${user._id}/${friendId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            setFriends(prev => prev.filter(f => f._id !== friendId));
            if (selectedUser?._id === friendId) setSelectedUser(null);
            setShowConfirmModal(prev => ({ ...prev, show: false }));
          }
        } catch (error) {
          console.error("Error deleting person:", error);
        }
      }
    });
  };

  const sendFriendRequest = async (toUserId: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: user._id, to: toUserId })
      });
      if (response.ok) {
        alert("Friend request sent!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });
      if (response.ok) {
        setFriendRequests(prev => prev.filter(r => r._id !== requestId));
        if (status === 'accepted') {
          showNotification('Friend Request Accepted', `You are now friends!`);
          // Refresh friends list
          const friendsRes = await fetch(`/api/friends/${user._id}`);
          if (friendsRes.ok) setFriends(await friendsRes.json());
        }
      }
    } catch (error) {
      console.error("Error responding to friend request:", error);
    }
  };

  const sendFriendRequestBySearch = async () => {
    if (!searchFriendInput.trim()) return;
    setIsSearchingFriend(true);
    try {
      // Find user by name or email/ID
      const response = await fetch(`/api/users/search?query=${searchFriendInput}`);
      if (response.ok) {
        const foundUsers = await response.json();
        const targetUser = foundUsers.find((u: User) => u.name.toLowerCase() === searchFriendInput.toLowerCase() || u._id === searchFriendInput);
        
        if (targetUser) {
          if (targetUser._id === user._id) {
            alert("You cannot add yourself as a friend!");
            return;
          }
          await sendFriendRequest(targetUser._id);
          setSearchFriendInput('');
        } else {
          alert("User not found. Please check the name or ID.");
        }
      }
    } catch (error) {
      console.error("Error searching user:", error);
    } finally {
      setIsSearchingFriend(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    if (editingMessage) {
      const editedMsg: Message = {
        ...editingMessage,
        text: inputMessage,
        isEdited: true,
        editedAt: new Date().toISOString()
      };
      socket.emit('edit_message', editedMsg);
      setMessages(prev => prev.map(m => m.id === editedMsg.id ? editedMsg : m));
      setEditingMessage(null);
      setInputMessage('');
      playSound(SEND_SOUND);
      return;
    }

    const messageId = Math.random().toString(36).substr(2, 9);
    const messageData: Message = {
      id: messageId,
      user: user.name,
      senderId: user._id,
      to: selectedGroup ? undefined : (selectedUser?.name || (activeTab === 'ai' ? 'My Assistant' : undefined)),
      groupId: selectedGroup?._id,
      text: inputMessage,
      timestamp: new Date().toISOString(),
      profilePic: profilePic || undefined,
      sentiment: analyzeSentiment(inputMessage),
      isGhost: isGhostMode
    };

    playSound(SEND_SOUND);
    setMessages(prev => [...prev, messageData]);

    const chatUsers = selectedGroup 
      ? selectedGroup.members.map(m => ({ _id: m._id }))
      : selectedUser 
        ? [{ _id: selectedUser._id }, { _id: user._id }]
        : [{ _id: 'all' }];

    socket.emit('new message', {
      id: messageId,
      sender: { _id: user._id, name: user.name, pic: profilePic },
      to: messageData.to,
      groupId: messageData.groupId,
      content: inputMessage,
      chat: { users: chatUsers }
    });

    const lowerInput = inputMessage.toLowerCase();
    if (activeTab === 'ai') {
      setTimeout(() => handleAiResponse(inputMessage), 500);
    } else if (lowerInput.startsWith('/ai ')) {
      handleAiResponse(inputMessage.slice(4));
    } else if (lowerInput.startsWith('/draw ')) {
      handleDrawImage(inputMessage.slice(6));
    } else if (lowerInput.includes('ai') || lowerInput.includes('bot') || lowerInput.includes('help')) {
      setTimeout(() => handleAiResponse(inputMessage), 1000);
    }
    
    setInputMessage('');
    socket.emit('stop typing', 'global');
  };

  const generateSmartReplies = async (lastMessage: string) => {
    setIsGeneratingReplies(true);
    try {
      const response = await fetch("/api/ai/smart-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastMessage }),
      });
      const data = await response.json();
      const replies = Array.isArray(data.replies) ? data.replies : [];
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
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Translation failed");
      const translatedText = data.text || text;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, text: `${m.text}\n\n🌐 Translation: ${translatedText}` } : m
        )
      );
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setTranslatingId(null);
    }
  };

  const explainMessageWithAI = async (messageId: string, originalText: string) => {
    const trimmed = (originalText || "").trim();
    if (!trimmed) return;

    setExplainingId(messageId);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Explain this message in simple Hindi/Hinglish and make it easy to understand. Keep it short (max 3-5 lines). Return ONLY the explanation text (no headings/bullets).\n\nMessage: "${trimmed}"`
        })
      });

      const data = await response.json();
      const explanation = data?.text || "Sorry, I couldn't explain that right now.";

      const explainMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: "My Assistant",
        text: explanation,
        timestamp: new Date().toISOString(),
        isAI: true,
        to: selectedUser?.name,
        groupId: selectedGroup?._id,
        sentiment: "🤖"
      };

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx === -1) return [...prev, explainMsg];
        return [...prev.slice(0, idx + 1), explainMsg, ...prev.slice(idx + 1)];
      });
    } catch (e) {
      console.error("Explain AI error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          user: "My Assistant",
          text: "(failed) Please try again.",
          timestamp: new Date().toISOString(),
          isAI: true,
          to: selectedUser?.name,
          groupId: selectedGroup?._id,
          sentiment: "⚠️"
        } as Message
      ]);
    } finally {
      setExplainingId(null);
    }
  };

  const handleDrawImage = async (prompt: string) => {
    setIsAiThinking(true);
    try {
      const response = await fetch("/api/ai/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Could not generate");
        return;
      }
      if (data.imageUrl) {
        socket?.emit("send_message", {
          user: "My Assistant",
          to: selectedUser?.name,
          text: `Generated for: ${prompt}`,
          image: data.imageUrl,
          isAI: true,
          sentiment: "🎨",
        });
      } else if (data.textFallback) {
        socket?.emit("send_message", {
          user: "My Assistant",
          to: selectedUser?.name,
          text: `🎨 ${prompt}\n\n${data.textFallback}`,
          isAI: true,
          sentiment: "🎨",
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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "AI Node is currently busy.");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: "My Assistant",
        to: user.name,
        text: data.text,
        timestamp: new Date().toISOString(),
        isAI: true,
        sentiment: '🤖'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      socket?.emit('send_message', aiMessage);
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user: "My Assistant",
        text: `System: ${error.message || "AI Node is currently busy or offline. Please try again in a moment."}`,
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

  const [isGroupCalling, setIsGroupCalling] = useState(false);
  const [groupCallRoom, setGroupCallRoom] = useState('');

  const startCall = async (type: 'video' | 'audio') => {
    if (selectedGroup) {
      setGroupCallRoom(`intellicall-group-${selectedGroup._id}`);
      setIsGroupCalling(true);
      return;
    }
    if (!selectedUser) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      setLocalStream(stream);
      setCallType(type);
      setIsCalling(true);
      remotePeerUserIdRef.current = selectedUser._id;

      const pc = setupPeerConnection(selectedUser._id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit('offer', { from: user.name, fromUserId: user._id, toUserId: selectedUser._id, offer, type });

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    let callerId = incomingCall.fromUserId;
    if (!callerId && incomingCall.from) {
      const match = friends.find((f) => f.name === incomingCall.from) || allUsers.find((u) => u.name === incomingCall.from);
      callerId = match?._id;
    }
    if (!callerId) {
      alert("Could not identify the caller. Try again after they call from an updated app.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === "video",
        audio: true,
      });
      setLocalStream(stream);
      setCallType(incomingCall.type);
      setIsCalling(true);
      remotePeerUserIdRef.current = callerId;

      const pc = setupPeerConnection(callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      // Flush buffered ICE candidates now that remote description exists.
      if (pendingIceCandidatesRef.current.length) {
        const buffered = pendingIceCandidatesRef.current;
        pendingIceCandidatesRef.current = [];
        for (const cand of buffered) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error("Error adding buffered ice candidate", e);
          }
        }
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit("answer", { toUserId: callerId, answer });
      setIncomingCall(null);

      if (localVideoRef.current && incomingCall.type === "video") {
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
    pendingIceCandidatesRef.current = [];
    const peerId = remotePeerUserIdRef.current;
    remotePeerUserIdRef.current = null;
    setVideoCallFilterId("none");
    socket?.emit('end_call', peerId ? { toUserId: peerId } : undefined);
  };

  const summarizeChat = async () => {
    if (messages.length === 0) return;
    setIsSummarizing(true);
    try {
      const chatHistory = messages
        .filter(m => !m.isSystem)
        .map(m => `${m.user}: ${m.text}`)
        .join('\n');

      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Summarization failed.");
      }

      setSummary(data.text || "No summary returned.");
    } catch (error: any) {
      console.error("Summarization Error:", error);
      setSummary(error?.message || "Could not summarize. Try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleArchive = (name: string) => {
    setArchivedIds(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && socket) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64File = reader.result as string;
        const messageId = Math.random().toString(36).substr(2, 9);
        const messageData: Message = {
          id: messageId,
          user: user.name,
          to: selectedUser?.name,
          text: `📁 Sent a file: ${file.name}`,
          image: file.type.startsWith('image/') ? base64File : undefined,
          timestamp: new Date().toISOString(),
          profilePic: profilePic || undefined,
          isGhost: isGhostMode
        };
        
        // Add locally
        setMessages(prev => [...prev, messageData]);
        
        // Emit to server
        socket.emit('new message', {
          id: messageId,
          sender: { _id: user._id, name: user.name, pic: profilePic },
          to: selectedUser?.name,
          content: `📁 Sent a file: ${file.name}`,
          image: file.type.startsWith('image/') ? base64File : undefined,
          chat: { users: [{ _id: 'all' }] }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
          ? 'audio/mp4' 
          : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const messageId = Math.random().toString(36).substr(2, 9);
          
          const messageData: Message = {
            id: messageId,
            user: user.name,
            to: selectedUser?.name,
            text: "🎤 Voice Message",
            audio: base64Audio,
            timestamp: new Date().toISOString(),
            profilePic: profilePic || undefined,
            isGhost: isGhostMode
          };

          // Add locally
          setMessages(prev => [...prev, messageData]);

          socket?.emit('new message', { 
            id: messageId,
            sender: { _id: user._id, name: user.name, pic: profilePic },
            to: selectedUser?.name,
            content: "🎤 Voice Message", 
            audio: base64Audio,
            chat: { users: [{ _id: 'all' }] }
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

  const handleCreateReel = async () => {
    try {
      const caption = newReelCaption.trim();
      const mediaUrl = newReelMediaUrl.trim();
      if (!mediaUrl) return;

      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          caption,
          mediaUrl,
          mediaType: newReelMediaType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to post reel');
        return;
      }

      setNewReelCaption('');
      setNewReelMediaUrl('');
    } catch (e) {
      console.error('Create reel error:', e);
      alert('Failed to post reel');
    }
  };

  const shareReelToChat = (reel: Reel) => {
    if (!socket) return;

    const mediaKindIsImage = reel.mediaType === 'image';
    const messageId = Math.random().toString(36).substr(2, 9);
    const text = reel.caption?.trim() ? `📸 Reel: ${reel.caption.trim()}` : '📸 Reel';

    const messageData: Message = {
      id: messageId,
      user: user.name,
      senderId: user._id,
      to: selectedGroup ? undefined : (selectedUser?.name || undefined),
      groupId: selectedGroup?._id,
      text,
      timestamp: new Date().toISOString(),
      profilePic: profilePic || undefined,
      isGhost: isGhostMode,
      image: mediaKindIsImage ? reel.mediaUrl : undefined,
      video: !mediaKindIsImage ? reel.mediaUrl : undefined,
    };

    // Show instantly for the sender (server does not echo to sender room).
    setMessages((prev) => [...prev, messageData]);

    const chatUsers = selectedGroup
      ? selectedGroup.members.map((m) => ({ _id: m._id }))
      : selectedUser
        ? [{ _id: selectedUser._id }, { _id: user._id }]
        : [{ _id: 'all' }];

    socket.emit('new message', {
      id: messageId,
      sender: { _id: user._id, name: user.name, pic: profilePic },
      to: messageData.to,
      groupId: messageData.groupId,
      content: messageData.text,
      image: messageData.image,
      video: messageData.video,
      audio: messageData.audio,
      isGhost: isGhostMode,
      isAI: false,
      isSystem: false,
      chat: { users: chatUsers },
    });
  };

  const openReelsFeed = () => {
    setActiveFeed('reels');
    setActiveTab('all');
    setShowSidebar(false);
    if (window.innerWidth < 768) setShowChat(false);
  };

  const toggleReelLike = async (reel: Reel) => {
    try {
      await fetch(`/api/reels/${reel._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });
    } catch (e) {
      console.error('toggleReelLike error:', e);
    }
  };

  const startEditReel = (reel: Reel) => {
    setEditReelId(reel._id);
    setEditReelCaption(reel.caption || '');
    setEditReelMediaUrl(reel.mediaUrl || '');
    setEditReelMediaType(reel.mediaType || 'video');
  };

  const saveEditReel = async () => {
    if (!editReelId) return;
    try {
      const caption = editReelCaption.trim();
      const mediaUrl = editReelMediaUrl.trim();
      if (!mediaUrl) {
        alert('Media URL required');
        return;
      }

      const res = await fetch(`/api/reels/${editReelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          caption,
          mediaUrl,
          mediaType: editReelMediaType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Edit failed');
      }
      setEditReelId(null);
      setEditReelCaption('');
      setEditReelMediaUrl('');
    } catch (e) {
      console.error('saveEditReel error:', e);
      alert('Edit failed');
    }
  };

  const deleteReel = async (reel: Reel) => {
    if (!window.confirm('Delete this reel?')) return;
    try {
      const res = await fetch(`/api/reels/${reel._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Delete failed');
      }
    } catch (e) {
      console.error('deleteReel error:', e);
      alert('Delete failed');
    }
  };

  return (
    <div className={cn(
      "h-[100dvh] min-h-0 flex flex-col font-sans overflow-hidden selection:bg-emerald-100 transition-colors duration-500 relative",
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
            "absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
            moodColor === 'emerald' ? "bg-emerald-500" : 
            moodColor === 'blue' ? "bg-blue-500" : 
            moodColor === 'red' ? "bg-red-500" : "bg-purple-500"
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
            "absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
            moodColor === 'emerald' ? "bg-cyan-500" : 
            moodColor === 'blue' ? "bg-indigo-500" : 
            moodColor === 'red' ? "bg-orange-500" : "bg-pink-500"
          )}
        />
        <FloatingParticles isDarkMode={!!isDarkMode} />
      </div>

      <Navbar 
        user={user} 
        onOpenProfile={() => setShowProfile(true)}
        onOpenReels={openReelsFeed}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        isDarkMode={isDarkMode}
        onlineCount={onlineUsers.length + 1}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 flex overflow-hidden relative z-10 min-h-0">
        {/* Sidebar - mobile: drawer + backdrop so it does not overlap chat messily */}
        <AnimatePresence>
          {showSidebar && (
            <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close menu"
              className="fixed inset-0 z-[85] bg-black/55 backdrop-blur-[2px] md:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[90] w-full sm:w-80 lg:w-[380px] max-w-[100vw] border-r flex flex-col md:relative md:z-0 md:translate-x-0 md:opacity-100 shadow-2xl md:shadow-none transition-all duration-500 backdrop-blur-xl h-full touch-pan-y",
                isDarkMode ? "bg-slate-950/95 border-slate-800/80" : "bg-white/95 border-slate-200/80"
              )}
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h2 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>CHATS</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", socketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")}></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{socketConnected ? "Online" : "Offline"}</span>
                    </div>
                    <button className="md:hidden p-2 text-slate-400 hover:bg-slate-800/50 rounded-xl" onClick={() => setShowSidebar(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowFriendsModal(true)}
                        className={cn("p-2.5 rounded-xl transition-all relative", isDarkMode ? "bg-slate-800 text-blue-400 hover:bg-slate-700" : "bg-slate-100 text-blue-600 hover:bg-slate-200")}
                        title="Friends"
                      >
                        <User className="w-4 h-4" />
                        {friendRequests.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-bounce">
                            {friendRequests.length}
                          </span>
                        )}
                      </button>
                      <button 
                        onClick={() => setShowNewGroupModal(true)}
                        className={cn("p-2.5 rounded-xl transition-all", isDarkMode ? "bg-slate-800 text-emerald-400 hover:bg-slate-700" : "bg-slate-100 text-emerald-600 hover:bg-slate-200")}
                        title="New Group"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAboutChat(true)}
                        className={cn("p-2.5 rounded-xl transition-all", isDarkMode ? "bg-slate-800 text-amber-400 hover:bg-slate-700" : "bg-slate-100 text-amber-600 hover:bg-slate-200")}
                        title="About IntelliCall & team"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowChatSettings(true)}
                        className={cn("p-2.5 rounded-xl transition-all", isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900")}
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", isDarkMode ? "text-slate-500 group-focus-within:text-emerald-500" : "text-slate-400 group-focus-within:text-emerald-500")} />
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "w-full pl-11 pr-4 py-3 rounded-xl text-xs font-bold transition-all outline-none border",
                        isDarkMode 
                          ? "bg-slate-900/50 border-slate-800 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10" 
                          : "bg-slate-50 border-slate-100 text-slate-900 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                      )}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 bg-slate-50 dark:bg-slate-950">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* AI Assistant Tab */}
                    <div className="px-4 mb-6">
                    <motion.div 
                      variants={sidebarItemVariants}
                      initial="initial"
                      animate="animate"
                      onClick={() => {
                        setActiveTab('ai');
                        setActiveFeed('chat');
                        setSelectedUser(null);
                        setSelectedGroup(null);
                        if (window.innerWidth < 768) setShowSidebar(false);
                      }}
                      className={cn(
                        "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                        activeTab === 'ai'
                          ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                          : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                      )}
                    >
                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <Bot className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-black text-sm tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>MY ASSISTANT</span>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-200/50 px-2 py-0.5 rounded">AI</span>
                        </div>
                        <p className="text-xs text-emerald-600/70 truncate font-bold">Private AI Chat</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Groups Section */}
                  <div className="px-4 mb-6">
                    <motion.div
                      variants={sidebarItemVariants}
                      initial="initial"
                      animate="animate"
                      onClick={() => {
                        setActiveFeed('reels');
                        if (window.innerWidth < 768) setShowSidebar(false);
                      }}
                      className={cn(
                        "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                        activeFeed === 'reels'
                          ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                          : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                      )}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <Play className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-black text-sm tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>REELS</span>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-200/50 px-2 py-0.5 rounded">IG</span>
                        </div>
                        <p className="text-xs text-emerald-600/70 truncate font-bold">Post • Share • Watch</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="px-4 mb-6">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Groups</h3>
                    <div className="space-y-2">
                      {groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map((g, idx) => (
                        <motion.div 
                          key={g._id}
                          variants={sidebarItemVariants}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setSelectedGroup(g);
                            setActiveFeed('chat');
                            setSelectedUser(null);
                            setActiveTab('all');
                            socket?.emit('join group', g._id);
                            if (window.innerWidth < 768) setShowSidebar(false);
                          }}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                            selectedGroup?._id === g._id
                              ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                              : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                          )}
                        >
                          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 overflow-hidden border-2 border-white dark:border-slate-700">
                            {g.pic ? <img src={g.pic} alt={g.name} className="w-full h-full object-cover" /> : <Users className="w-7 h-7" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-black truncate tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{g.name}</p>
                            <p className="text-xs text-slate-400 truncate font-bold">{g.members.length} members</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Friends Section */}
                  <div className="px-4 mb-6">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Friends</h3>
                    <div className="space-y-2">
                      {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f, idx) => (
                        <motion.div 
                          key={f._id}
                          variants={sidebarItemVariants}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setSelectedUser(f);
                            setActiveFeed('chat');
                            setSelectedGroup(null);
                            setActiveTab('all');
                            if (window.innerWidth < 768) setShowSidebar(false);
                          }}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                            selectedUser?._id === f._id
                              ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                              : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                          )}
                        >
                          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 overflow-hidden border-2 border-white dark:border-slate-700">
                            {f.pic ? <img src={f.pic} alt={f.name} className="w-full h-full object-cover" /> : <User className="w-7 h-7" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-black truncate tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{f.name}</p>
                            <p className="text-xs text-slate-400 truncate font-bold">Friend</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Users Section */}
                  <div className="px-4">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Network</h3>
                    <div className="space-y-2">
                      {/* Global Chat Node */}
                      <motion.div 
                        variants={sidebarItemVariants}
                        initial="initial"
                        animate="animate"
                        onClick={() => {
                          setSelectedUser(null);
                          setSelectedGroup(null);
                          setActiveTab('all');
                          if (window.innerWidth < 768) setShowSidebar(false);
                        }}
                        className={cn(
                          "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                          !selectedUser && !selectedGroup && activeTab !== 'ai'
                            ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                            : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                        )}
                      >
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                          <Globe className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-black truncate tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>GLOBAL NETWORK</p>
                          <p className="text-xs text-emerald-500 font-bold">Public Node</p>
                        </div>
                      </motion.div>

                      {friends.filter(u => u._id !== user._id && u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u, idx) => (
                        <motion.div 
                          key={u._id} 
                          variants={sidebarItemVariants}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => { 
                            setSelectedUser(u);
                            setSelectedGroup(null);
                            setActiveTab('all');
                            if (window.innerWidth < 768) setShowSidebar(false); 
                          }}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer group relative border border-transparent",
                            selectedUser?._id === u._id 
                              ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
                              : (isDarkMode ? "hover:bg-slate-800/50 hover:border-slate-700" : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50")
                          )}
                        >
                          <div className="relative">
                            {u.pic ? (
                              <img src={u.pic} alt={u.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-all" />
                            ) : (
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-sm transition-all group-hover:scale-110",
                                isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-white text-slate-400"
                              )}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm",
                              u.isOnline ? "bg-emerald-500" : "bg-slate-400"
                            )}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className={cn("text-sm font-black truncate tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{u.name}</p>
                              {!friends.some(f => f._id === u._id) && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendFriendRequest(u._id);
                                  }}
                                  className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/10 px-2 py-1 rounded transition-all"
                                >
                                  Add Friend
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate font-bold">
                              {typingUsers.has(u.name) ? <span className="text-emerald-500 italic">Typing...</span> : (u.isOnline ? "Active now" : `Last seen ${u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : 'recently'}`)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Live Panel */}
                  <div className="mt-8 px-4 pb-8">
                    <div className={cn(
                      "p-4 rounded-3xl border shadow-xl relative overflow-hidden group",
                      isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Live Panel</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500">{onlineUsers.length} Online</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {onlineUsers.length > 0 ? onlineUsers.map((u, i) => (
                          <div key={i} className="relative group/user cursor-pointer" onClick={() => {
                            if (friends.some(f => f._id === u._id)) {
                              setSelectedUser(u);
                              setSelectedGroup(null);
                              setActiveTab('all');
                              if (window.innerWidth < 768) setShowSidebar(false);
                            } else {
                              alert("Add them as a friend first to chat!");
                            }
                          }}>
                            <img src={u.pic} alt={u.name} className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-500/30" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {u.name}
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-slate-500 font-bold italic">No other users online</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Chat Main Area */}
        <section className={cn(
          "flex-1 flex flex-col relative min-w-0 transition-all duration-500 overflow-hidden",
          isDarkMode ? "bg-slate-950 md:border-l border-slate-800/50" : "bg-slate-50 md:border-l border-slate-200/80"
        )}>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={cn("absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20", isDarkMode ? "bg-emerald-500" : "bg-emerald-300")}></div>
            <div className={cn("absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20", isDarkMode ? "bg-blue-500" : "bg-blue-300")}></div>
            <div className={cn(
              "absolute inset-0 opacity-[0.02]",
              isDarkMode ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
            )}></div>
          </div>
          {!selectedUser && !selectedGroup && activeTab !== 'ai' && activeFeed !== 'reels' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className={cn(
                "w-24 h-24 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl",
                isDarkMode ? "bg-slate-900 shadow-slate-900/50" : "bg-white shadow-slate-200"
              )}>
                <MessageSquare className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className={cn("text-3xl md:text-4xl font-black tracking-tight mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
                START CHATS
              </h2>
              <p className="text-slate-500 font-bold max-w-md">
                Select a person or group from the sidebar to start messaging. You can also chat with the AI Assistant.
              </p>
              <button 
                onClick={() => setShowSidebar(true)} 
                className="mt-8 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform md:hidden"
              >
                Open Sidebar
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className={cn(
                "backdrop-blur-2xl px-4 md:px-10 py-4 md:py-6 border-b flex items-center justify-between sticky top-0 z-10 transition-all duration-500",
                isDarkMode ? "bg-slate-950/60 border-slate-800/50" : "bg-white/60 border-slate-100"
              )}>
            <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
              <button 
                onClick={() => setShowSidebar(true)} 
                className={cn(
                  "p-2 rounded-xl transition-colors md:hidden",
                  isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-2xl transition-all",
                isDarkMode ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-900 shadow-slate-200"
              )}>
                <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="min-w-0">
                <motion.h2 
                  animate={{ 
                    textShadow: isGhostMode ? [
                      "0 0 4px rgba(16,185,129,0.4)",
                      "0 0 12px rgba(16,185,129,0.8)",
                      "0 0 4px rgba(16,185,129,0.4)"
                    ] : "none"
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn("font-black text-lg md:text-2xl tracking-tight truncate", isDarkMode ? "text-white" : "text-slate-900")}
                >
                  {activeFeed === 'reels'
                    ? 'REELS'
                    : selectedGroup
                      ? selectedGroup.name.toUpperCase()
                      : (selectedUser
                        ? selectedUser.name.toUpperCase()
                        : (activeTab === 'ai' ? "MY ASSISTANT" : "GLOBAL CHAT"))}
                </motion.h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]", (selectedUser ? selectedUser.isOnline : true) ? "bg-emerald-500" : "bg-slate-400")}></div>
                  <p className="text-[10px] md:text-[12px] text-emerald-500 font-black uppercase tracking-widest">
                    {activeFeed === 'reels'
                      ? `${(onlineUsers.length + 1)} Online`
                      : selectedGroup
                        ? `${selectedGroup.members.length} Members`
                        : (selectedUser
                          ? (selectedUser.isOnline ? "Online" : `Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleTimeString() : 'recently'}`)
                          : (activeTab === 'ai' ? "AI Ready" : `${onlineUsers.length} Nodes Active`))}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {selectedGroup && (
                <button 
                  onClick={() => setShowGroupInfo(true)}
                  className={cn("p-3 md:p-4 rounded-2xl transition-all", isDarkMode ? "bg-slate-900 text-slate-400 hover:text-emerald-400" : "bg-slate-100 text-slate-500 hover:text-emerald-600")}
                  title="Group Info"
                >
                  <Info className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              {selectedGroup && (selectedGroup.admin === user._id || (typeof selectedGroup.admin === 'object' && selectedGroup.admin._id === user._id)) && (
                <button 
                  onClick={() => setShowAddMemberModal(true)}
                  className={cn("p-3 md:p-4 rounded-2xl transition-all", isDarkMode ? "bg-slate-900 text-emerald-400 hover:bg-slate-800" : "bg-slate-100 text-emerald-600 hover:bg-slate-200")}
                  title="Add Member"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              {selectedGroup && (
                <button 
                  onClick={() => handleExitGroup(selectedGroup._id)}
                  className={cn("p-3 md:p-4 rounded-2xl transition-all", isDarkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")}
                  title="Exit Group"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startCall('video')} 
                  className={cn(
                    "p-3 md:p-4 rounded-2xl transition-all",
                    isDarkMode ? "bg-slate-900 text-slate-400 hover:text-emerald-400" : "bg-slate-100 text-slate-500 hover:text-emerald-600"
                  )}
                >
                  <Video className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startCall('audio')} 
                  className={cn(
                    "p-3 md:p-4 rounded-2xl transition-all",
                    isDarkMode ? "bg-slate-900 text-slate-400 hover:text-emerald-400" : "bg-slate-100 text-slate-500 hover:text-emerald-600"
                  )}
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDeleteAllMessages} 
                  className={cn(
                    "p-3 md:p-4 rounded-2xl transition-all",
                    isDarkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                  )}
                  title="Clear All Messages"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                {selectedUser && (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeletePerson(selectedUser._id)} 
                    className={cn(
                      "p-3 md:p-4 rounded-2xl transition-all",
                      isDarkMode ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-red-100 text-red-600 hover:bg-red-200"
                    )}
                    title="Delete Person & Chat"
                  >
                    <UserMinus className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                )}
                {selectedGroup && (selectedGroup.admin === user._id || (typeof selectedGroup.admin === 'object' && selectedGroup.admin._id === user._id)) && (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGroup(selectedGroup._id)} 
                    className={cn(
                      "p-3 md:p-4 rounded-2xl transition-all",
                      isDarkMode ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-red-100 text-red-600 hover:bg-red-200"
                    )}
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                )}
              </div>
              <div className={cn("w-px h-10 mx-2", isDarkMode ? "bg-slate-800" : "bg-slate-200")}></div>
              <button 
                onClick={summarizeChat}
                disabled={isSummarizing || messages.length < 1}
                className={cn(
                  "flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg group",
                  isDarkMode 
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/40" 
                    : "bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/20"
                )}
              >
                {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                <span className="hidden md:inline">Summarize</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className={cn(
            "flex-1 overflow-y-auto p-4 md:p-8 space-y-10 md:space-y-16 transition-all duration-500 custom-scrollbar overscroll-contain touch-pan-y",
            isDarkMode ? "bg-slate-950/40" : "bg-slate-50/30"
          )}>
            <AnimatePresence initial={false}>
              {messages.filter(msg => {
                if (activeFeed === 'reels') return false;
                if (msg.isSystem) return true;
                
                // Group Chat
                if (selectedGroup) {
                  return String(msg.groupId) === String(selectedGroup._id);
                }
                
                // AI Chat
                if (activeTab === 'ai') {
                  return (msg.user === user.name && msg.to === 'My Assistant') || 
                         (msg.user === 'My Assistant' && msg.to === user.name);
                }

                // Private Chat
                if (selectedUser) {
                  return (msg.user === user.name && msg.to === selectedUser.name) || 
                         (msg.user === selectedUser.name && msg.to === user.name);
                }

                // Global Chat (no 'to' and no 'groupId')
                return !msg.to && !msg.groupId;
              }).map((msg, idx) => {
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
                        {!isMe && !msg.isAI && <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>{msg.user}</span>}
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sentiment && <span className="text-xs" title="AI Sentiment">{msg.sentiment}</span>}
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "relative px-4 py-3 md:px-5 md:py-3.5 rounded-2xl md:rounded-3xl shadow-sm group transition-all border",
                          isMe 
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm border-emerald-400/30 shadow-emerald-500/20" 
                            : msg.isAI 
                              ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-tl-sm shadow-slate-900/40 border-slate-700/50"
                              : isDarkMode
                                ? "bg-slate-800 text-slate-200 rounded-tl-sm border-slate-700/50 shadow-slate-900/20"
                                : "bg-white text-slate-800 rounded-tl-sm border-slate-200 shadow-slate-200/50",
                          msg.isGhost && "ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-slate-950/50"
                        )}
                      >
                        {msg.isGhost && (
                          <div className="absolute -top-4 -right-4 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20">
                            <Ghost className="w-5 h-5 text-emerald-400 animate-pulse" />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white">
                              {Math.max(0, 15 - Math.floor((Date.now() - new Date(msg.timestamp).getTime()) / 1000))}s
                            </div>
                          </div>
                        )}
                        
                        {msg.isAI && (
                          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
                            <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center">
                              <Bot className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">AI Assistant</span>
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

                        {msg.video && (
                          <div className={cn(
                            "mb-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 transition-all hover:scale-[1.02]",
                            isDarkMode ? "border-slate-700" : "border-white"
                          )}>
                            <video
                              src={msg.video}
                              controls
                              playsInline
                              className="w-full max-h-[520px] object-contain bg-black"
                            />
                          </div>
                        )}

                        {msg.audio && (
                          <div className="mb-4 flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                            <button 
                              onClick={() => {
                                const audio = new Audio(msg.audio);
                                audio.play().catch(e => console.error("Voice message play failed", e));
                              }}
                              className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              <Play className="w-5 h-5 ml-1" />
                            </button>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-emerald-400/60">
                                <span>Voice Message</span>
                                <span>0:04</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 2 }}
                                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                              </div>
                            </div>
                            <Mic className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                        
                        {msg.isGhost && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90 mb-2">
                            Vanishing message · visible for ~15s — text is readable below
                          </p>
                        )}
                        <p className={cn(
                          "text-base md:text-lg leading-relaxed font-bold tracking-tight whitespace-pre-wrap transition-all duration-500",
                          msg.isDeleted ? "italic text-slate-400" : ""
                        )}>
                          {msg.isDeleted ? "🚫 This message was deleted" : msg.text}
                        </p>
                        {msg.isEdited && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1 block">
                            Edited {new Date(msg.editedAt!).toLocaleTimeString()}
                          </span>
                        )}
                        
                        {/* AI Translation Button */}
                        {!msg.isAI && !msg.isSystem && msg.text && (
                          <div className="mt-3 flex items-center gap-2">
                            <button 
                              onClick={() => translateMessage(msg.id!, msg.text)}
                              disabled={translatingId === msg.id}
                              className={cn(
                                "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                                isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                              )}
                            >
                              {translatingId === msg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                              Translate
                            </button>
                            <button
                              onClick={() => explainMessageWithAI(msg.id!, msg.text)}
                              disabled={explainingId === msg.id}
                              className={cn(
                                "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                                isDarkMode ? "text-slate-200/90 hover:text-emerald-300" : "text-slate-700 hover:text-emerald-600"
                              )}
                              title="AI Explain"
                            >
                              {explainingId === msg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                              Explain
                            </button>
                          </div>
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
                          "absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1.5 rounded-full shadow-2xl z-30",
                          isMe ? "right-0" : "left-0",
                          isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-100"
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

                        {/* Message Actions (Edit, Info, Delete) */}
                        <div className={cn(
                          "absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 p-1.5 rounded-2xl shadow-2xl z-30",
                          isMe ? "right-0" : "left-0",
                          isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-100"
                        )}>
                          {isMe && (
                            <>
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                                title="Edit Message"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setMessageInfo(msg)}
                                className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                                title="Message Info"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id!)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                title="Delete Message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
              
              {activeFeed === 'reels' && (
                <div className="w-full px-2 md:px-0 py-4 space-y-6">
                  {/* Online strip (top inside reels panel) */}
                  <div className="flex items-center justify-between gap-4 px-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Online Now</p>
                      <p className={cn("text-sm font-black", isDarkMode ? "text-slate-100" : "text-slate-900")}>
                        {onlineUsers.length + 1} people
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-end overflow-x-auto custom-scrollbar">
                      <div className="flex gap-3">
                        {[...onlineUsers, user].slice(0, 10).map((u, idx) => (
                          <div key={u._id} className="relative">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl overflow-hidden border shadow-lg",
                              isDarkMode ? "bg-slate-900/60 border-slate-800/60" : "bg-white/80 border-slate-100"
                            )}>
                              <img
                                src={u.pic}
                                alt={u.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className={cn(
                              "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                              isDarkMode ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white"
                            )}>
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reels Composer */}
                  <div className={cn(
                    "p-5 rounded-[2rem] border shadow-2xl backdrop-blur-xl",
                    isDarkMode ? "bg-slate-900/60 border-slate-800/60" : "bg-white/60 border-slate-100/60"
                  )}>
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Caption
                        </label>
                        <input
                          value={newReelCaption}
                          onChange={(e) => setNewReelCaption(e.target.value)}
                          placeholder="Write a caption..."
                          className={cn(
                            "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                            isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Media URL
                        </label>
                        <input
                          value={newReelMediaUrl}
                          onChange={(e) => setNewReelMediaUrl(e.target.value)}
                          placeholder="https://... (image or video url)"
                          className={cn(
                            "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                            isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                          )}
                        />
                      </div>
                      <div className="w-full md:w-40">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Type
                        </label>
                        <select
                          value={newReelMediaType}
                          onChange={(e) => setNewReelMediaType(e.target.value as 'image' | 'video')}
                          className={cn(
                            "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                            isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                          )}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <button
                        onClick={handleCreateReel}
                        className={cn(
                          "px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-[1.02]",
                          isDarkMode ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-slate-900 text-white shadow-slate-900/20"
                        )}
                        disabled={!newReelMediaUrl.trim()}
                      >
                        Post Reel
                      </button>
                    </div>
                    <p className={cn("mt-3 text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      Tip: Paste an image/video URL then Share it to your current chat.
                    </p>
                  </div>

                  {/* Reels Feed */}
                  <div className="space-y-5">
                    {reels.length === 0 ? (
                      <div className={cn(
                        "p-8 rounded-[2rem] border text-center",
                        isDarkMode ? "bg-slate-900/40 border-slate-800/50" : "bg-white/60 border-slate-100/60"
                      )}>
                        <p className="text-slate-400 font-bold">No reels yet. Post the first one.</p>
                      </div>
                    ) : (
                      reels.map((reel, idx) => (
                        <motion.div
                          key={reel._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.03 }}
                          className={cn(
                            "rounded-[2.5rem] overflow-hidden border shadow-2xl",
                            isDarkMode ? "bg-slate-900/40 border-slate-800/50" : "bg-white/70 border-slate-100/70"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4 p-5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                isDarkMode ? "bg-gradient-to-br from-emerald-500 to-cyan-400" : "bg-emerald-500"
                              )}>
                                <Camera className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-sm font-black">{reel.createdByName}</p>
                                <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                  {reel.mediaType.toUpperCase()} • {reel.createdAt ? new Date(reel.createdAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                            </div>
                          </div>

                          {reel.mediaType === 'video' ? (
                            <video
                              src={reel.mediaUrl}
                              controls
                              controlsList="nodownload"
                              preload="metadata"
                              playsInline
                              className="w-full max-h-[520px] bg-black object-contain"
                              onError={() => console.error("Reel video failed to load:", reel.mediaUrl)}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <img
                              src={reel.mediaUrl}
                              alt="Reel"
                              className="w-full max-h-[520px] object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}

                          <div className="p-5 space-y-3">
                            {reel.caption?.trim() && (
                              <p className={cn(
                                "text-sm font-bold leading-relaxed",
                                isDarkMode ? "text-slate-100" : "text-slate-900"
                              )}>
                                {reel.caption}
                              </p>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={() => toggleReelLike(reel)}
                                className={cn(
                                  "flex items-center gap-2 px-5 py-3 rounded-[2rem] font-black uppercase tracking-widest shadow-lg transition-transform hover:scale-[1.02] text-[10px]",
                                  (reel.likes || []).includes(user._id)
                                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                    : isDarkMode
                                      ? "bg-slate-900 text-white shadow-slate-900/20"
                                      : "bg-white text-slate-900 border border-slate-200"
                                )}
                                title="Like"
                              >
                                <Heart className="w-4 h-4" />
                                {(reel.likes || []).length}
                              </button>
                              <button
                                onClick={() => shareReelToChat(reel)}
                                className={cn(
                                  "flex-1 px-5 py-3 rounded-[2rem] font-black uppercase tracking-widest shadow-lg transition-transform hover:scale-[1.02]",
                                  isDarkMode ? "bg-slate-900 text-white shadow-slate-900/20" : "bg-white text-slate-900 border border-slate-200"
                                )}
                              >
                                Share to Chat
                              </button>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setActiveFeed('chat');
                                }}
                                className={cn(
                                  "w-14 flex items-center justify-center px-3 py-3 rounded-[2rem] shadow-lg transition-transform hover:scale-[1.02]",
                                  isDarkMode ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-emerald-500 text-white"
                                )}
                                title="Back to chat"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </button>

                              {(reel.createdBy as any) === user._id && (
                                <>
                                  <button
                                    onClick={() => startEditReel(reel)}
                                    className={cn(
                                      "w-14 flex items-center justify-center px-3 py-3 rounded-[2rem] shadow-lg transition-transform hover:scale-[1.02]",
                                      isDarkMode ? "bg-slate-900 text-slate-200 shadow-slate-900/20" : "bg-white text-slate-900 border border-slate-200"
                                    )}
                                    title="Edit"
                                  >
                                    <Settings className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => deleteReel(reel)}
                                    className={cn(
                                      "w-14 flex items-center justify-center px-3 py-3 rounded-[2rem] shadow-lg transition-transform hover:scale-[1.02]",
                                      "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
                                    )}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                              Shares to current {selectedGroup ? 'group' : (selectedUser ? 'friend' : 'global')} chat.
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
              <AnimatePresence>
                {editReelId && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className={cn(
                        "w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative",
                        isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                      )}
                    >
                      <button
                        onClick={() => setEditReelId(null)}
                        className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="Close"
                      >
                        <X className="w-6 h-6" />
                      </button>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">Edit Reel</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/90">
                            Update caption/media
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Caption
                          </label>
                          <input
                            value={editReelCaption}
                            onChange={(e) => setEditReelCaption(e.target.value)}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                              isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Media URL
                          </label>
                          <input
                            value={editReelMediaUrl}
                            onChange={(e) => setEditReelMediaUrl(e.target.value)}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                              isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Type
                          </label>
                          <select
                            value={editReelMediaType}
                            onChange={(e) => setEditReelMediaType(e.target.value as 'image' | 'video')}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl outline-none border text-sm font-bold transition-all",
                              isDarkMode ? "bg-slate-950/30 border-slate-800 text-white focus:border-emerald-500/50" : "bg-white border-slate-100 text-slate-900 focus:border-emerald-500/50"
                            )}
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={saveEditReel}
                            className={cn(
                              "flex-1 px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-lg transition-transform hover:scale-[1.02]",
                              isDarkMode ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-slate-900 text-white shadow-slate-900/20"
                            )}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditReelId(null)}
                            className={cn(
                              "px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-lg transition-transform hover:scale-[1.02]",
                              isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-200"
                            )}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {activeFeed === 'chat' && isAiThinking && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-xl">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-emerald-500">Thinking</span>
                  </div>
                </motion.div>
              )}

              {activeFeed === 'chat' && Array.from(typingUsers).filter(u => u !== user.name).map(u => (
                <motion.div key={u} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-6">
                  {u} is typing...
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Info Modal */}
          <AnimatePresence>
            {messageInfo && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={cn(
                    "w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative",
                    isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                  )}
                >
                  <button 
                    onClick={() => setMessageInfo(null)}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Message Info</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Quantum Node Data</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold leading-relaxed mb-4">{messageInfo.text}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Activity className="w-3 h-3" />
                        <span>Sentiment: {messageInfo.sentiment}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Sent At</p>
                        <p className="text-xs font-bold">{new Date(messageInfo.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
                        <div className="flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-emerald-500" />
                          <p className="text-xs font-bold">Delivered</p>
                        </div>
                      </div>
                    </div>
                    
                    {messageInfo.isEdited && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1">Last Edited</p>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{new Date(messageInfo.editedAt!).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
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
            {activeFeed === 'chat' && smartReplies.length > 0 && (
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
            activeFeed === 'reels' && "hidden",
            isDarkMode ? "bg-slate-950/80 border-slate-800/50" : "bg-white/80 border-slate-100"
          )}>
            {editingMessage && (
              <div className={cn(
                "absolute bottom-full left-0 right-0 p-4 flex items-center justify-between border-b animate-in slide-in-from-bottom-4 z-40",
                isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-slate-50/90 border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Editing Message</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingMessage(null);
                    setInputMessage('');
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
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

            <form onSubmit={handleSendMessage} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder={isGhostMode ? "Quantum Ghost message..." : "Message Node..."}
                    className={cn(
                      "w-full px-8 md:px-10 py-5 md:py-6 border rounded-[2rem] md:rounded-[3rem] focus:ring-4 focus:ring-emerald-500/20 outline-none text-sm md:text-lg font-bold transition-all shadow-2xl",
                      isDarkMode 
                        ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-emerald-500/50 focus:shadow-emerald-500/10" 
                        : "bg-white border-slate-100 text-slate-900 placeholder-slate-300 focus:border-emerald-500/50 focus:shadow-emerald-500/5",
                      isGhostMode && "font-mono italic text-emerald-400 border-emerald-500/30"
                    )}
                  />
                  {isGhostMode && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <motion.div
                        animate={{ 
                          opacity: [0.4, 1, 0.4],
                          scale: [0.95, 1, 0.95]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                      >
                        <Fingerprint className="w-4 h-4 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Quantum Encrypted</span>
                      </motion.div>
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
          </>
          )}
        </section>

        {/* Friends Modal */}
        <AnimatePresence>
          {showFriendsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                  "w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative",
                  isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                )}
              >
                <button 
                  onClick={() => setShowFriendsModal(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Friends & Requests</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Manage your network</p>
                  </div>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Add Friend by Search */}
                  <div className="mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Add Friend by Name/ID</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={searchFriendInput}
                        onChange={(e) => setSearchFriendInput(e.target.value)}
                        placeholder="Enter name or user ID..."
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button 
                        onClick={sendFriendRequestBySearch}
                        disabled={isSearchingFriend}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all"
                      >
                        {isSearchingFriend ? '...' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {friendRequests.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending Requests</h4>
                      <div className="space-y-2">
                        {friendRequests.map(req => (
                          <div key={req._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                              <img src={req.from.pic} alt={req.from.name} className="w-8 h-8 rounded-lg object-cover" />
                              <span className="text-sm font-bold">{req.from.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => respondToFriendRequest(req._id, 'accepted')}
                                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => respondToFriendRequest(req._id, 'rejected')}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Friends</h4>
                    {friends.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No friends yet. Add some from the network!</p>
                    ) : (
                      <div className="space-y-2">
                        {friends.map(f => (
                          <div key={f._id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <img src={f.pic} alt={f.name} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-sm font-bold">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Member Modal */}
        <AnimatePresence>
          {showAddMemberModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                  "w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative",
                  isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                )}
              >
                <button 
                  onClick={() => setShowAddMemberModal(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Add Member</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Expand your group</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {allUsers.filter(u => u._id !== user._id && !selectedGroup?.members.some(m => m._id === u._id)).map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <img src={u.pic} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-sm font-bold">{u.name}</span>
                      </div>
                      <button 
                        onClick={() => addMemberToGroup(u._id)}
                        className="px-4 py-2 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Group Info Modal */}
        <AnimatePresence>
          {showGroupInfo && selectedGroup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGroupInfo(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                  "relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border z-10",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>GROUP INFO</h3>
                  <button onClick={() => setShowGroupInfo(false)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl mb-4">
                    {selectedGroup.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className={cn("text-2xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>{selectedGroup.name}</h4>
                  <p className="text-slate-400 font-bold text-xs mt-1">{selectedGroup.members.length} Members</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Members</label>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                      {selectedGroup.members.map(m => (
                        <div key={m._id} className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                          <div className="flex items-center gap-4">
                            <img src={m.pic} alt={m.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{m.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {m._id}</p>
                              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                                {(selectedGroup.admin === m._id || (typeof selectedGroup.admin === 'object' && selectedGroup.admin._id === m._id)) ? "Admin" : "Member"}
                              </p>
                            </div>
                          </div>
                          {m._id === user._id && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleExitGroup(selectedGroup._id)}
                      className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                    >
                      Exit Group
                    </button>
                    {(selectedGroup.admin === user._id || (typeof selectedGroup.admin === 'object' && selectedGroup.admin._id === user._id)) && (
                      <button 
                        onClick={() => handleDeleteGroup(selectedGroup._id)}
                        className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                      >
                        Delete Group
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* New Group Modal */}
        <AnimatePresence>
          {showNewGroupModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNewGroupModal(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                  "relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border z-10",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>CREATE NEW GROUP</h3>
                  <button onClick={() => setShowNewGroupModal(false)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Group Name</label>
                    <input 
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name..."
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500" : "bg-slate-50 border-slate-100 text-slate-900 focus:border-emerald-500"
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Members</label>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {allUsers.filter(u => u._id !== user._id).map(u => (
                        <div 
                          key={u._id}
                          onClick={() => {
                            if (newGroupMembers.includes(u._id)) {
                              setNewGroupMembers(prev => prev.filter(id => id !== u._id));
                            } else {
                              setNewGroupMembers(prev => [...prev, u._id]);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border",
                            newGroupMembers.includes(u._id)
                              ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")
                              : (isDarkMode ? "bg-slate-800/50 border-transparent hover:border-slate-700" : "bg-slate-100/50 border-transparent hover:border-slate-200")
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
                            {u.pic ? <img src={u.pic} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
                          </div>
                          <span className={cn("text-sm font-bold", isDarkMode ? "text-slate-200" : "text-slate-700")}>{u.name}</span>
                          {newGroupMembers.includes(u._id) && <div className="ml-auto w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={createGroup}
                    disabled={!newGroupName.trim() || newGroupMembers.length === 0}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Create Group
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                  <h2 className={cn("text-3xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>PROFILE</h2>
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
                    <h3 className={cn("mt-8 text-3xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{user.name}</h3>
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mt-2">Verified User</p>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                      <div className={cn("p-6 rounded-[2rem] border transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                        <p className={cn("text-sm font-bold leading-relaxed italic", isDarkMode ? "text-slate-300" : "text-slate-700")}>"Available to chat."</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manage Chats</label>
                      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {friends.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Friends</p>
                            {friends.map(f => (
                              <div key={f._id} className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                                <div className="flex items-center gap-3">
                                  <img src={f.pic} alt={f.name} className="w-8 h-8 rounded-lg object-cover" />
                                  <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-200" : "text-slate-700")}>{f.name}</span>
                                </div>
                                <button onClick={() => handleDeletePerson(f._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {groups.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Groups</p>
                            {groups.map(g => (
                              <div key={g._id} className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">{g.name.charAt(0).toUpperCase()}</div>
                                  <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-200" : "text-slate-700")}>{g.name}</span>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleExitGroup(g._id)} className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all" title="Exit Group">
                                    <LogOut className="w-4 h-4" />
                                  </button>
                                  {(g.admin === user._id || (typeof g.admin === 'object' && g.admin._id === user._id)) && (
                                    <button onClick={() => handleDeleteGroup(g._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Group">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settings</label>
                      <div className="space-y-2">
                        {[
                          { icon: Bell, label: "Notifications", value: "On" },
                          { icon: Shield, label: "Privacy", value: "Secure" },
                          { icon: Globe, label: "Language", value: "Hinglish" }
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
                      navigate('/login');
                    }}
                    className={cn(
                      "w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                      isDarkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                    )}
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* About (in-chat) */}
        <AnimatePresence>
          {showAboutChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[125] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 12 }}
                className={cn(
                  "w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border shadow-2xl p-8 md:p-12 relative",
                  isDarkMode ? "bg-slate-900/95 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                )}
              >
                <button
                  type="button"
                  onClick={() => setShowAboutChat(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-3">IntelliCall</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{INTELLICALL_ABOUT.headline}</h2>
                <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10">{INTELLICALL_ABOUT.description}</p>
                <h3 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-6">Our team</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {TEAM_MEMBERS.map((member, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-4 p-4 rounded-2xl border",
                        isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                      )}
                    >
                      <img src={member.image} alt="" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-black">{member.name}</p>
                        <p className="text-[11px] text-emerald-500/90 font-bold mt-1">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-bold">
                  Tip: On video calls, use the filter chips on your preview — they are cosmetic and only affect how you see yourself.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Settings Modal */}
        <AnimatePresence>
          {showChatSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 12 }}
                className={cn(
                  "w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl relative",
                  isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                )}
              >
                <div className={cn("p-6 border-b flex items-center justify-between", isDarkMode ? "border-slate-800" : "border-slate-100")}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Settings</h2>
                  </div>
                  <button
                    onClick={() => setShowChatSettings(false)}
                    className="p-2 rounded-xl bg-slate-800/10 text-slate-500 hover:bg-slate-800/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Appearance</h3>
                    <div className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                        <div>
                          <p className="font-bold text-sm">Dark Mode</p>
                          <p className="text-xs text-slate-500">Toggle application theme</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          isDarkMode ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          isDarkMode ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Notifications</h3>
                    <div className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-bold text-sm">Push Notifications</p>
                          <p className="text-xs text-slate-500">Get alerts for new messages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (Notification.permission !== "granted") {
                            Notification.requestPermission();
                          } else {
                            alert("Notifications are already enabled. You can disable them in your browser settings.");
                          }
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          Notification.permission === "granted" ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          Notification.permission === "granted" ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Privacy Settings */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Privacy</h3>
                    <div className={cn("flex items-center justify-between p-4 rounded-2xl border", isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-rose-500" />
                        <div>
                          <p className="font-bold text-sm">Ghost Mode</p>
                          <p className="text-xs text-slate-500">Messages disappear after reading</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsGhostMode(!isGhostMode)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          isGhostMode ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          isGhostMode ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal.show && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                  "w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden",
                  isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2",
                  showConfirmModal.type === 'danger' ? "bg-red-500" : (showConfirmModal.type === 'warning' ? "bg-orange-500" : "bg-emerald-500")
                )} />
                
                <div className="flex flex-col items-center text-center mt-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                    showConfirmModal.type === 'danger' ? "bg-red-500/10 text-red-500" : (showConfirmModal.type === 'warning' ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500")
                  )}>
                    {showConfirmModal.type === 'danger' ? <Trash2 className="w-8 h-8" /> : (showConfirmModal.type === 'warning' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />)}
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{showConfirmModal.title}</h3>
                  <p className={cn("text-sm font-bold leading-relaxed mb-8", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {showConfirmModal.message}
                  </p>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setShowConfirmModal(prev => ({ ...prev, show: false }))}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                        isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={showConfirmModal.onConfirm}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-white shadow-lg",
                        showConfirmModal.type === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : (showConfirmModal.type === 'warning' ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20")
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
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
                  <button onClick={() => setIncomingCall(null)} className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Decline</button>
                  <button onClick={acceptCall} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"><PhoneIncoming className="w-4 h-4" /> Accept</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Call Overlay */}
        <AnimatePresence>
          {isGroupCalling && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950 z-[120] flex flex-col"
            >
              <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800">
                <h3 className="text-white font-black">{selectedGroup?.name} - Group Call</h3>
                <button 
                  onClick={() => setIsGroupCalling(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  End Group Call
                </button>
              </div>
              <iframe 
                src={`https://meet.jit.si/${groupCallRoom}`}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full flex-1 border-none"
              />
            </motion.div>
          )}
          {isCalling && !isGroupCalling && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black z-[120] flex flex-col items-center justify-center p-6 md:p-12"
            >
              <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
              <div className="relative w-full max-w-6xl aspect-video bg-black rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_80px_-12px_rgba(16,185,129,0.35)] border border-emerald-500/20">
                {callType === 'video' ? (
                  <div className="w-full h-full relative">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-6 right-6 md:top-10 md:right-10 w-28 h-40 md:w-44 md:h-64 bg-slate-900/90 rounded-2xl md:rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl ring-2 ring-emerald-500/20">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ filter: videoFilterCss }}
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 max-w-[95%] z-20">
                      {VIDEO_CALL_FILTERS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setVideoCallFilterId(f.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all",
                            videoCallFilterId === f.id
                              ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-black/50 border-white/15 text-white/90 hover:border-emerald-500/50"
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black relative">
                    <div className="w-44 h-44 rounded-full bg-emerald-500/15 flex items-center justify-center animate-pulse ring-4 ring-emerald-500/20">
                      <div className="w-36 h-36 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-2xl">
                        <Phone className="w-16 h-16" />
                      </div>
                    </div>
                    <h3 className="mt-10 text-white font-black text-3xl md:text-4xl tracking-tight">Voice call</h3>
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.35em] mt-3">Audio connected</p>
                  </div>
                )}
                
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-[10px] font-black tracking-[0.25em] uppercase">Live</span>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5 md:gap-8 z-30">
                  <span className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 opacity-60" title="Mic"><Mic className="w-6 h-6" /></span>
                  <button type="button" onClick={endCall} className="w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/50 hover:bg-red-600 transition-all active:scale-95"><PhoneOff className="w-9 h-9 md:w-10 md:h-10" /></button>
                  <span className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 opacity-60" title="Video off in audio"><VideoOff className="w-6 h-6" /></span>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-emerald-500/60 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Peer connection</span>
                </div>
                <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest">IntelliCall</p>
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
                {INTELLICALL_ABOUT.description}
              </p>
            </motion.div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-[120px] -z-10"></div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-12 mb-40">
            {[
              { title: "Privacy First", desc: "Your conversations are private and secure, always.", icon: Shield },
              { title: "Smart AI", desc: "Our intelligent assistant helps you communicate better.", icon: Bot },
              { title: "Fast & Reliable", desc: "Experience zero lag and 100% uptime on any device.", icon: Globe }
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
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">© 2026 RASHMI'S CONNECT. ALL RIGHTS RESERVED.</p>
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
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
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

  const toggleDarkMode = () => setIsDarkMode((prev: boolean) => !prev);

  return (
    <ErrorBoundary>
      <Router>
        <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-slate-950" : "bg-white")}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/chat" element={user ? <ChatPage user={user} setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /> : <LoginPage setUser={setUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/about" element={<AboutPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
