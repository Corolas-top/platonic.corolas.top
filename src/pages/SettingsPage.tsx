import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import {
  ArrowLeft,
  LogOut,
  User,
  Heart,
  Trash2,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Brain,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, companion, setUser, setSession, setCompanion, setMessages } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCompanion(null);
    setMessages([]);
    navigate("/");
  };

  const handleDeleteCompanion = async () => {
    if (!companion) return;
    await supabase.from("companions").update({ is_active: false }).eq("id", companion.id);
    setCompanion(null);
    setMessages([]);
    setShowDeleteConfirm(false);
    navigate("/onboard");
  };

  const menuItems = [
    {
      icon: MessageSquare,
      label: "返回对话",
      action: () => navigate("/chat"),
      color: "#FF1493",
    },
    {
      icon: Brain,
      label: "记忆殿堂",
      action: () => navigate("/memory"),
      color: "#FF69B4",
    },
    {
      icon: Sparkles,
      label: "关系图谱",
      action: () => navigate("/bond"),
      color: "#FFB6C1",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button
            onClick={() => navigate("/chat")}
            className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-2 text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h2 className="text-3xl font-light tracking-wider mb-2">设置</h2>
          <p className="text-white/40 text-sm">管理你的账号和伴侣</p>
        </motion.div>

        {/* User profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <User className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.email || user?.phone || "用户"}</p>
              <p className="text-xs text-white/30">{user?.id?.slice(0, 8)}...</p>
            </div>
          </div>
        </motion.div>

        {/* Companion info */}
        {companion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-[#FF1493]" />
              <h3 className="text-sm font-medium">我的伴侣</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#FF1493]/10 border border-[#FF1493]/30 flex items-center justify-center overflow-hidden">
                {companion.avatar_url ? (
                  <img src={companion.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#FF1493] text-xs">{companion.name[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{companion.name}</p>
                <p className="text-xs text-white/30">
                  理性{companion.rationality_level}% · 情绪{companion.emotion_level}%
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-red-400/60 text-xs hover:text-red-400 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              解除关系
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-8"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full glass-dark rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
                <span className="text-sm text-white/70 flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </button>
            );
          })}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full py-3 glass-dark rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </motion.button>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-dark rounded-2xl p-6 max-w-sm w-full border border-red-500/20"
            >
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-center text-lg mb-2">确认解除关系？</h3>
              <p className="text-center text-white/40 text-sm mb-6">
                所有对话记录、记忆和关系数据将被清除。此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCompanion}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                >
                  确认解除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
