import { useState } from 'react';
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
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Plaza', path: '/plaza', icon: <Users size={20} /> },
  { label: 'Chat', path: '/chat', icon: <MessageCircle size={20} /> },
  { label: 'Memory', path: '/memory', icon: <Calendar size={20} /> },
  { label: 'Drama', path: '/drama', icon: <BookOpen size={20} /> },
  { label: 'Payment', path: '/payment', icon: <Zap size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: { username: string; avatar: string } | null;
  onLogout?: () => void;
}

export default function Navbar({ isAuthenticated = false, user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className="fixed left-0 top-0 h-screen w-[220px] sidebar-gradient shadow-sidebar z-50 flex flex-col">
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-6 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Sparkles size={24} className="text-pink-200" />
        <span className="text-pink-200 text-xl font-bold tracking-tight">Platonic</span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-150 ease-out
                ${
                  isActive
                    ? 'bg-sidebar-active text-white border-l-[3px] border-pink-400'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200 border-l-[3px] border-transparent'
                }
              `}
              style={{
                animationDelay: `${index * 60}ms`,
              }}
            >
              <span
                className={`
                  transition-transform duration-150
                  ${hoveredItem === item.path && !isActive ? 'scale-110' : ''}
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

      {/* Bottom Section */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        {/* Crowdfunding link */}
        <button
          onClick={() => navigate('/crowdfunding')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
            text-sidebar-text hover:bg-sidebar-hover hover:text-rose-gold
            transition-all duration-150 border-l-[3px] border-transparent"
        >
          <Heart size={20} className="text-rose-gold" />
          <span className="font-body">Crowdfunding</span>
        </button>

        {/* Auth section */}
        <div className="border-t border-sidebar-hover pt-3 mt-1">
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="relative">
                  <img
                    src={user.avatar || '/default-avatar.jpg'}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-400/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-400 rounded-full ring-2 ring-sidebar-bg" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white text-[13px] font-medium leading-tight">
                    {user.username}
                  </span>
                  <span className="text-sidebar-text text-[11px]">Online</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm
                  text-sidebar-text hover:bg-sidebar-hover hover:text-pink-200
                  transition-all duration-150"
              >
                <LogOut size={18} />
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
              <LogIn size={20} />
              <span className="font-body">Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
