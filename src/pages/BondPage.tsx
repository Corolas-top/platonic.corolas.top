import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { useLang } from "../context/LangContext";
import BottomNav from "../components/BottomNav";
import type { RelationshipStats, RelationshipEvent } from "../types";
import BigFiveRadar from "../components/BigFiveRadar";
import { Sparkles, TrendingUp, MessageCircle, Zap, ChevronLeft, Brain } from "lucide-react";

export default function BondPage() {
  const navigate = useNavigate();
  const { companion, user, messages } = useStore();
  const { lang, setLang, t } = useLang();
  const [stats, setStats] = useState<RelationshipStats | null>(null);
  const [events, setEvents] = useState<RelationshipEvent[]>([]);

  useEffect(() => { load(); }, [companion, user]);

  async function load() {
    if (!companion || !user) return;
    try {
      const [statsRes, eventsRes] = await Promise.all([
        supabase.from("relationship_stats").select("*").eq("companion_id", companion.id).eq("user_id", user.id).maybeSingle(),
        supabase.from("relationship_events").select("*").eq("companion_id", companion.id).eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (err) { console.error(err); }
  }

  const eventIcons: Record<string, any> = {
    first_meet: Sparkles,
    adoption: Sparkles,
    deep_conversation: MessageCircle,
    milestone: TrendingUp,
    companion_initiated: MessageCircle,
    shared_memory: TrendingUp,
  };

  const days = stats?.days_together || 1;
  const totalMsgs = stats?.total_messages || messages.length || 0;
  const bond = Math.min(100, stats?.bond_level || 0);
  const intimacy = Math.min(100, stats?.intimacy_score || 0);
  const trust = Math.min(100, stats?.trust_score || 0);

  const bondLevel = bond >= 80 ? (lang === "zh" ? "灵魂共鸣" : "Soul Resonance") :
    bond >= 60 ? (lang === "zh" ? "深度依恋" : "Deep Attachment") :
    bond >= 40 ? (lang === "zh" ? "甜蜜热恋" : "Sweet Romance") :
    bond >= 20 ? (lang === "zh" ? "暧昧升温" : "Warming Up") : (lang === "zh" ? "初见心动" : "First Spark");

  const bondColor = bond >= 80 ? "#FF1493" : bond >= 60 ? "#FF69B4" : bond >= 40 ? "#FFB6C1" : "#FFC0CB";

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
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#FF1493]" />
          <h2 className="text-lg font-light tracking-wider">{t("bondTitle")}</h2>
        </div>
        <p className="text-white/30 text-[10px]">{t("bondSubtitle")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div className="glass-dark rounded-xl p-4 border border-white/5 text-center">
          <div className="flex justify-center items-baseline gap-1 mb-1">
            <motion.span className="text-3xl font-extralight tracking-wider" style={{ color: bondColor }}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              {days}
            </motion.span>
            <span className="text-white/30 text-sm">{t("days")}</span>
          </div>
          <p className="text-[10px] text-white/20">{totalMsgs} {t("messages")}</p>
        </div>

        {companion?.big_five && (
          <div className="glass-dark rounded-xl p-3 border border-white/5">
            <h4 className="text-white/50 text-xs mb-2 flex items-center gap-1"><Brain className="w-3.5 h-3.5 text-[#FF69B4]" />{lang === "zh" ? "人格画像" : "Personality"}</h4>
            <BigFiveRadar values={companion.big_five} size={200} />
          </div>
        )}

        <div className="glass-dark rounded-xl p-4 border border-white/5">
          <h4 className="text-white/50 text-xs mb-3 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{t("bondLevel")}: <span style={{ color: bondColor }}>{bondLevel}</span></h4>
          {[
            { label: t("intimacy"), value: intimacy, color: "#FF1493" },
            { label: t("trust"), value: trust, color: "#FF69B4" },
            { label: t("bondLevel"), value: bond, color: bondColor },
          ].map((s) => (
            <div key={s.label} className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/30">{s.label}</span>
                <span className="text-[10px] text-white/20">{Math.round(s.value)}%</span>
              </div>
              <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full" style={{ background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-white/40 text-xs mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />{t("events")}</h4>
          <div className="space-y-2">
            {events.length === 0 && (
              <p className="text-white/15 text-[10px] text-center py-4">{lang === "zh" ? "恋爱大事记还在书写中..." : "Relationship timeline is being written..."}</p>
            )}
            {events.map((event, i) => {
              const Icon = eventIcons[event.event_type] || Sparkles;
              return (
                <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-dark rounded-xl p-3 border border-white/4 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#FF1493]/10 border border-[#FF1493]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-[#FF1493]/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-[11px]">{event.description}</p>
                    <p className="text-[8px] text-white/15 mt-0.5">{new Date(event.created_at).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}</p>
                  </div>
                  <span className="text-[10px] text-[#FF1493]/40">+{event.bond_delta}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
