import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../context/LangContext";
import { useStore } from "../store";
import { Brain, Sparkles, Settings } from "lucide-react";

const LogoNavIcon = ({ className, strokeWidth: _sw }: { className?: string; strokeWidth?: number }) => (
  <img src="/platonic-logo.png" alt="" className={className} />
);

const tabs = [
  { path: "/chat", icon: LogoNavIcon, labelKey: "chatTitle" },
  { path: "/memory", icon: Brain, labelKey: "memory" },
  { path: "/bond", icon: Sparkles, labelKey: "bond" },
  { path: "/settings", icon: Settings, labelKey: "settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const { messages } = useStore();
  const current = location.pathname;
  const unreadCount = messages.filter((m) => m.role === "companion").length % 100;

  return (
    <div className="shrink-0 glass-dark border-t border-white/5 px-2 py-1.5 z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = current === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-[#FF1493]/8 rounded-xl border border-[#FF1493]/15"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    active ? "text-[#FF1493]" : "text-white/25"
                  }`}
                  strokeWidth={active ? 2 : 1.5}
                />
                {tab.path === "/chat" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-[#FF1493] text-[8px] text-white flex items-center justify-center px-1">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </div>
              <span
                className={`text-[9px] relative z-10 transition-colors ${
                  active ? "text-[#FF1493]" : "text-white/25"
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
