/**
 * Navbar.tsx - Sidebar Navigation Component
 *
 * Provides dynamic navigation based on authentication state and companion status.
 * Includes brand header, nav items, dark mode (3-state), language selector, and auth section.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Calendar,
  BookOpen,
  Zap,
  Settings,
  Heart,
  LogOut,
  LogIn,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Globe,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { applyTheme, loadSavedTheme } from '@/lib/theme';
import type { Theme } from '@/lib/theme';

/** Navigation item definition */
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

/** Props for the Navbar component */
interface NavbarProps {
  isAuthenticated: boolean;
  user: User | null;
  hasCompanion: boolean;
  onLogout: () => Promise<void>;
}

/** Get navigation items for authenticated users */
function getAuthenticatedNavItems(hasCompanion: boolean): NavItem[] {
  const items: NavItem[] = [];

  // Dashboard / Plaza are mutually exclusive based on companion status
  if (hasCompanion) {
    items.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
  } else {
    items.push({ label: 'Plaza', path: '/plaza', icon: <Users size={20} /> });
  }

  items.push(
    { label: 'Chat', path: '/chat', icon: <MessageCircle size={20} /> },
    { label: 'Memory', path: '/memory', icon: <Calendar size={20} /> },
    { label: 'Drama', path: '/drama', icon: <BookOpen size={20} /> },
    { label: 'Payment', path: '/payment', icon: <Zap size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { label: 'Crowdfunding', path: '/crowdfunding', icon: <Heart size={20} /> },
  );

  return items;
}

/** Navigation items shown when user is NOT authenticated */
const publicNavItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <Sparkles size={20} /> },
  { label: 'Login', path: '/auth', icon: <LogIn size={20} /> },
];

/** Theme cycle order: light -> dark -> auto -> light */
const themeCycle: Theme[] = ['light', 'dark', 'auto'];

/** Theme icon map */
function ThemeIcon({ theme, size = 18, className }: { theme: Theme; size?: number; className?: string }) {
  if (theme === 'light') return <Sun size={size} className={className} />;
  if (theme === 'dark') return <Moon size={size} className={className} />;
  return <Monitor size={size} className={className} />;
}

/** Theme label map */
function themeLabel(theme: Theme): string {
  if (theme === 'light') return 'Light';
  if (theme === 'dark') return 'Dark';
  return 'Auto';
}

export default function Navbar({
  isAuthenticated,
  user,
  hasCompanion,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 3-state theme: light / dark / auto
  const [theme, setTheme] = useState<Theme>(() => loadSavedTheme());

  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    const stored = localStorage.getItem('language');
    return stored === 'zh' ? 'zh' : 'en';
  });

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Determine which nav items to show
  const navItems = isAuthenticated
    ? getAuthenticatedNavItems(hasCompanion)
    : publicNavItems;

  /** Cycle theme: light -> dark -> auto -> light */
  const cycleTheme = () => {
    const currentIndex = themeCycle.indexOf(theme);
    const next = themeCycle[(currentIndex + 1) % themeCycle.length];
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  /** Toggle language and persist preference */
  const toggleLanguage = () => {
    const next = language === 'en' ? 'zh' : 'en';
    setLanguage(next);
    localStorage.setItem('language', next);
  };

  /** Handle logout with error handling */
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch {
      // Error is already handled in AuthContext
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-[220px] sidebar-gradient shadow-sidebar z-50 flex flex-col">
      {/* ========== Brand Logo ========== */}
      <div
        className="flex items-center gap-2 px-5 py-6 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src="/platonic.png"
          alt="Logo"
          className="w-8 h-8 rounded-lg object-cover ring-1 ring-pink-400/40"
        />
        <span className="text-pink-200 text-lg font-bold tracking-tight">
          Corolas | Platonic
        </span>
      </div>

      {/* ========== Navigation Items ========== */}
      <div className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-150 ease-out
                ${
                  isActive
                    ? 'bg-sidebar-active text-white border-l-[3px] border-pink-400'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200 border-l-[3px] border-transparent'
                }
              `}
            >
              <span
                className={`
                  transition-transform duration-150
                  ${isActive ? 'text-pink-200' : 'text-sidebar-icon'}
                `}
              >
                {item.icon}
              </span>
              <span className="font-body">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========== Bottom Section ========== */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        {/* Separator */}
        <div className="border-t border-sidebar-hover my-1" />

        {/* Dark Mode Toggle - 3-state */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
            text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200
            transition-all duration-150 w-full"
        >
          <ThemeIcon theme={theme} size={18} className="text-sidebar-icon" />
          <span className="font-body">{themeLabel(theme)}</span>
        </button>

        {/* Language Selector */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
            text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200
            transition-all duration-150 w-full"
        >
          <Globe size={18} className="text-sidebar-icon" />
          <span className="font-body">{language === 'en' ? 'English' : '中文'}</span>
        </button>

        {/* ========== Auth Section ========== */}
        <div className="border-t border-sidebar-hover pt-3 mt-1">
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-2">
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="relative">
                  <img
                    src={user.user_metadata?.avatar || '/default-avatar.jpg'}
                    alt={user.user_metadata?.username || user.email || 'User'}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-400/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-400 rounded-full ring-2 ring-sidebar-bg" />
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-white text-[13px] font-medium leading-tight truncate max-w-[120px]">
                    {user.user_metadata?.username || user.email || 'User'}
                  </span>
                  <span className="text-sidebar-text text-[11px]">Online</span>
                </div>
              </div>
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm
                  text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200
                  transition-all duration-150 w-full"
              >
                <LogOut size={18} className="text-sidebar-icon" />
                <span className="font-body text-xs">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200
                transition-all duration-150 w-full"
            >
              <LogIn size={20} className="text-sidebar-icon" />
              <span className="font-body">Login</span>
            </button>
          )}
        </div>

        {/* ========== Copyright ========== */}
        <div className="px-4 pt-2 pb-1">
          <p className="text-sidebar-text text-[10px] opacity-60">
            &copy; 2026 Corolas | Platonic
          </p>
          <a
            href="mailto:corolar@corolas.top"
            className="text-sidebar-text text-[10px] opacity-60 hover:opacity-100 hover:text-pink-200 transition-opacity"
          >
            corolar@corolas.top
          </a>
        </div>
      </div>
    </nav>
  );
}
