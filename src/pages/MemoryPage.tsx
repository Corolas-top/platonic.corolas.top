import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { useLang } from "../context/LangContext";
import BottomNav from "../components/BottomNav";
import type { Memory } from "../types";
import { ArrowLeft, Brain, Star, Clock, Bookmark, Heart, Calendar, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface CalendarDay {
  date: number;
  fullDate: string;
  hasMemory: boolean;
  hasEvent: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function MemoryPage() {
  const navigate = useNavigate();
  const { companion, user } = useStore();
  const { lang, setLang, t } = useLang();
  const [memories, setLocalMemories] = useState<Memory[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "short_term" | "long_term" | "milestone">("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { load(); }, [companion, user]);

  async function load() {
    if (!companion || !user) return;
    setLoading(true);
    try {
      const [memRes, evtRes] = await Promise.all([
        supabase.from("memories").select("*")
          .eq("companion_id", companion.id).eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(100),
        supabase.from("relationship_events").select("*")
          .eq("companion_id", companion.id).eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(50),
      ]);
      if (memRes.data && memRes.data.length > 0) setLocalMemories(memRes.data);
      else setLocalMemories(generateDemoMemories(companion.id, user.id));
      if (evtRes.data) setEvents(evtRes.data);
    } catch {
      setLocalMemories(generateDemoMemories(companion.id, user.id));
    } finally { setLoading(false); }
  }

  function generateDemoMemories(cid: string, uid: string): Memory[] {
    return [
      { id: "1", companion_id: cid, user_id: uid, content: lang === "zh" ? "第一次见面时的对话" : "First conversation", memory_type: "milestone", importance_score: 1.0, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "2", companion_id: cid, user_id: uid, content: lang === "zh" ? "用户提到喜欢深夜听雨声" : "User mentioned liking rain at night", memory_type: "long_term", importance_score: 0.7, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "3", companion_id: cid, user_id: uid, content: lang === "zh" ? "用户今天工作很累，需要安慰" : "User was tired from work", memory_type: "short_term", importance_score: 0.4, created_at: new Date(Date.now() - 3600000).toISOString() },
    ];
  }

  // 日历数据生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    const memoryDates = new Set(memories.map((m) => m.created_at.slice(0, 10)));
    const eventDates = new Set(events.map((e) => e.created_at?.slice(0, 10)).filter(Boolean));

    const days: CalendarDay[] = [];
    // 上月填充
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = prevLastDay - i;
      days.push({ date: d, fullDate: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, hasMemory: false, hasEvent: false, isToday: false, isCurrentMonth: false });
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const fd = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: d, fullDate: fd,
        hasMemory: memoryDates.has(fd),
        hasEvent: eventDates.has(fd),
        isToday: fd === todayStr,
        isCurrentMonth: true,
      });
    }
    // 下月填充到 42 格（6行）
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, fullDate: `${year}-${String(month + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`, hasMemory: false, hasEvent: false, isToday: false, isCurrentMonth: false });
    }
    return days;
  }, [currentMonth, memories, events]);

  // 按日期筛选
  const filtered = useMemo(() => {
    let list = filter === "all" ? memories : memories.filter((m) => m.memory_type === filter);
    if (selectedDate) {
      list = list.filter((m) => m.created_at.startsWith(selectedDate));
    }
    return list;
  }, [memories, filter, selectedDate]);

  const monthLabel = currentMonth.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long" });
  const weekDays = lang === "zh" ? ["日", "一", "二", "三", "四", "五", "六"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    milestone: { icon: Star, color: "#FF1493", label: t("milestone") },
    long_term: { icon: Bookmark, color: "#FF69B4", label: t("longTerm") },
    short_term: { icon: Clock, color: "#FFB6C1", label: t("shortTerm") },
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/chat")} className="text-white/40 hover:text-white/80 p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#FF1493]" />
            <h2 className="text-lg font-light tracking-wider">{t("memoryTitle")}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => setLang("zh")} className={`px-2 py-1 rounded ${lang==="zh"?"text-[#FF1493]":"text-white/20"}`}>中</button>
          <span className="text-white/10">/</span>
          <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang==="en"?"text-[#FF1493]":"text-white/20"}`}>EN</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* 记忆日历 */}
        <div className="glass-dark rounded-xl p-3 border border-white/5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF1493]/60" />
              <span className="text-xs text-white/50">{monthLabel}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 text-white/30 hover:text-[#FF1493] transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 text-white/30 hover:text-[#FF1493] transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[9px] text-white/20 py-1">{d}</div>
            ))}
          </div>
          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <button
                key={i}
                onClick={() => day.isCurrentMonth && setSelectedDate(selectedDate === day.fullDate ? null : day.fullDate)}
                className={`relative aspect-square rounded-lg flex items-center justify-center text-[10px] transition-all ${
                  !day.isCurrentMonth ? "text-white/10" :
                  selectedDate === day.fullDate ? "bg-[#FF1493]/30 text-[#FF1493] border border-[#FF1493]/40" :
                  day.isToday ? "bg-[#FF1493]/15 text-[#FF1493] border border-[#FF1493]/20" :
                  "text-white/50 hover:bg-white/5"
                }`}
              >
                {day.date}
                {/* 记忆标记 */}
                {day.hasMemory && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF1493]" />
                )}
                {/* 事件标记 */}
                {day.hasEvent && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-[#FF69B4]" />
                )}
              </button>
            ))}
          </div>
          {/* 图例 */}
          <div className="flex items-center gap-3 mt-2 px-1">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#FF1493]" /><span className="text-[9px] text-white/25">{lang === "zh" ? "记忆" : "Memory"}</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#FF69B4]" /><span className="text-[9px] text-white/25">{lang === "zh" ? "事件" : "Event"}</span></div>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="ml-auto text-[9px] text-[#FF1493]/60 hover:text-[#FF1493]">{lang === "zh" ? "清除筛选" : "Clear filter"}</button>
            )}
          </div>
        </div>

        {/* 快速统计 */}
        <div className="flex gap-2 mb-3">
          {[
            { key: "all" as const, label: t("all"), count: memories.length },
            { key: "milestone" as const, label: t("milestone"), count: memories.filter((m) => m.memory_type === "milestone").length },
            { key: "long_term" as const, label: t("longTerm"), count: memories.filter((m) => m.memory_type === "long_term").length },
            { key: "short_term" as const, label: t("shortTerm"), count: memories.filter((m) => m.memory_type === "short_term").length },
          ].map((f) => (
            <button key={f.key} onClick={() => { setFilter(f.key); setSelectedDate(null); }}
              className={`flex-1 py-2 rounded-xl text-center border transition-all ${filter === f.key ? "bg-[#FF1493]/10 border-[#FF1493]/30" : "bg-white/3 border-white/5"}`}>
              <p className={`text-xs ${filter === f.key ? "text-[#FF1493]" : "text-white/40"}`}>{f.label}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{f.count}</p>
            </button>
          ))}
        </div>

        {/* 今日事件提示 */}
        <AnimatePresence>
          {events.filter((e) => e.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length > 0 && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-pink rounded-xl p-3 border border-[#FF1493]/15 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF1493] shrink-0" />
              <div>
                <p className="text-xs text-[#FF1493]/80">{lang === "zh" ? "今天有特别的日子" : "Today is special"}</p>
                <p className="text-[10px] text-white/30">
                  {events.filter((e) => e.created_at?.startsWith(new Date().toISOString().slice(0, 10))).map((e) => e.description).join(" · ")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 记忆列表 */}
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-5 h-5 border-2 border-[#FF1493]/30 border-t-[#FF1493] rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2 max-w-lg mx-auto">
            {filtered.map((memory, i) => {
              const config = typeConfig[memory.memory_type] || typeConfig.short_term;
              const Icon = config.icon;
              return (
                <motion.div key={memory.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-dark rounded-xl p-3.5 border border-white/4 hover:border-[#FF1493]/15 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/8" style={{ background: `${config.color}12` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-xs leading-relaxed mb-1.5">{memory.content}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/25">{config.label}</span>
                        <div className="flex-1 h-[3px] bg-white/4 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${memory.importance_score * 100}%`, background: config.color, opacity: 0.5 }} />
                        </div>
                        <span className="text-[9px] text-white/15">{new Date(memory.created_at).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16"><Heart className="w-8 h-8 text-white/8 mx-auto mb-2" /><p className="text-white/25 text-xs">{t("noMemory")}</p></div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
