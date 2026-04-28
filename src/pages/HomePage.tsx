import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { useLang } from "../context/LangContext";
import BottomNav from "../components/BottomNav";
import type { RelationshipStats, RelationshipEvent } from "../types";
import {
  Heart, MessageCircle, Sparkles, Calendar, TrendingUp, Zap, MapPin,
  ChevronLeft,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { companion, user } = useStore();
  const { lang, setLang, t } = useLang();
  const [stats, setStats] = useState<RelationshipStats | null>(null);
  const [events, setEvents] = useState<RelationshipEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [companion, user]);

  async function load() {
    if (!companion || !user) { setLoading(false); return; }
    try {
      const [statsRes, eventsRes] = await Promise.all([
        supabase.from("relationship_stats").select("*").eq("companion_id", companion.id).eq("user_id", user.id).maybeSingle(),
        supabase.from("relationship_events").select("*").eq("companion_id", companion.id).eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  const now = new Date();
  const createdAt = companion ? new Date(companion.created_at) : now;
  const days = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / 86400000));

  const stage = days < 1 ? "初见心动" : days < 7 ? "暧昧升温" : days < 30 ? "甜蜜热恋" : days < 90 ? "深度依恋" : days < 365 ? "灵魂伴侣" : "永恒恋人";
  const stageColor = days < 7 ? "#FFC0CB" : days < 30 ? "#FFB6C1" : days < 90 ? "#FF69B4" : "#FF1493";

  const totalMsgs = stats?.total_messages || 0;
  const bondLevel = Math.min(100, stats?.bond_level || 0);

  const latestEvent = events[0];
  const recentEvents = events.slice(0, 5);

  const mood = companion?.current_emotion?.mood || "calm";
  const intensity = companion?.current_emotion?.intensity || 0.4;

  const bf = companion?.big_five || { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#FF1493]/30 border-t-[#FF1493] rounded-full animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate("/chat")} className="text-white/40 hover:text-white/80 flex items-center gap-1 text-sm"><ChevronLeft className="w-4 h-4" />{t("back")}</button>
          <div className="flex items-center gap-1 text-xs">
            <button onClick={() => setLang("zh")} className={`px-2 py-1 rounded ${lang==="zh"?"text-[#FF1493]":"text-white/20"}`}>中</button>
            <span className="text-white/10">/</span>
            <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang==="en"?"text-[#FF1493]":"text-white/20"}`}>EN</button>
          </div>
        </div>
        <h2 className="text-lg font-light tracking-wider">{lang === "zh" ? "次主页" : "Home"}</h2>
        <p className="text-white/30 text-[10px]">{t("subtitle2")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* 伴侣信息 */}
        <div className="glass-dark rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#FF1493]/10 border-2 border-[#FF1493]/20 flex items-center justify-center overflow-hidden">
                {companion?.avatar_url ? (
                  <img src={companion.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src="/platonic-logo.png" alt="" className="w-14 h-14 object-contain" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ background: companion?.gender === "male" ? "#6366f1" : "#FF1493", color: "#fff" }}>
                {companion?.gender === "male" ? "♂" : "♀"}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-light">{companion?.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />{mood}</span>
                <span className="text-[10px] text-white/30">{companion?.timezone}</span>
              </div>
              {companion?.location && (
                <span className="text-[9px] text-white/20 flex items-center gap-0.5 mt-0.5"><MapPin className="w-2 h-2" />{companion.location}</span>
              )}
            </div>
          </div>

          {/* 大五人格 */}
          <div className="flex gap-1.5 mb-3">
            {[
              { label: "O", val: bf.openness, color: "#FF1493" },
              { label: "C", val: bf.conscientiousness, color: "#FF69B4" },
              { label: "E", val: bf.extraversion, color: "#FFB6C1" },
              { label: "A", val: bf.agreeableness, color: "#FF6B9D" },
              { label: "N", val: bf.neuroticism, color: "#C71585" },
            ].map((t2) => (
              <div key={t2.label} className="flex-1 text-center">
                <div className="text-[8px] text-white/20 mb-0.5">{t2.label}</div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t2.val}%`, background: t2.color, opacity: 0.6 }} />
                </div>
                <div className="text-[8px] text-white/15 mt-0.5">{t2.val}%</div>
              </div>
            ))}
          </div>

          {/* 相处阶段 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">{lang === "zh" ? "相处" : "Stage"}</span>
              <span className="text-[10px] font-medium" style={{ color: stageColor }}>{stage}</span>
              <span className="text-[10px] text-white/20">· {days}{lang === "zh" ? "天" : " days"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#FF1493]" style={{ opacity: 0.3 + intensity * 0.5, animation: "pulse 1.5s infinite" }} />
              <span className="text-[10px] text-white/25">{Math.round(intensity * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 关系统计 */}
        <div className="glass-dark rounded-xl p-4 border border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xl font-extralight text-[#FF1493]">{totalMsgs}</p>
              <p className="text-[10px] text-white/25">{t("messages")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-extralight" style={{ color: stageColor }}>{days}</p>
              <p className="text-[10px] text-white/25">{t("days")}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/30">{t("bondLevel")}</span>
              <span className="text-[10px] text-white/25">{Math.round(bondLevel)}%</span>
            </div>
            <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${bondLevel}%` }} transition={{ duration: 1 }}
                className="h-full rounded-full" style={{ background: stageColor }} />
            </div>
          </div>
        </div>

        {/* 最近事件 */}
        <div>
          <h4 className="text-white/40 text-xs mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />{t("events")}</h4>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-white/15 text-[10px] text-center py-4">{lang === "zh" ? "恋爱大事记还在书写中..." : "Relationship timeline is being written..."}</p>
            ) : recentEvents.map((event) => {
              const Icon = event.event_type === "milestone" ? Calendar : event.event_type === "companion_initiated" ? MessageCircle : TrendingUp;
              return (
                <div key={event.id} className="glass-dark rounded-xl p-2.5 border border-white/4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FF1493]/10 border border-[#FF1493]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-[#FF1493]/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/50 text-[10px]">{event.description}</p>
                  </div>
                  <span className="text-[9px] text-white/15">{new Date(event.created_at).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-pink rounded-xl p-3 border border-[#FF1493]/10 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#FF1493] shrink-0" />
          <div>
            <p className="text-[#FF1493]/60 text-[10px]">{latestEvent ? `${lang === "zh" ? "最新" : "Latest"}: ${latestEvent.description}` : `${lang === "zh" ? "开始你们的恋爱故事" : "Start your love story"}`}</p>
            <p className="text-white/15 text-[9px] mt-0.5">{companion?.backstory ? companion.backstory.slice(0, 60) + "..." : ""}</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
