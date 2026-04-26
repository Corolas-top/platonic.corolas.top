import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { ArrowLeft, Sparkles, Sliders, MapPin, Clock, Type, FileText } from "lucide-react";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user, setCompanion } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [rationality, setRationality] = useState(50);
  const [emotion, setEmotion] = useState(50);
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setCreating(true);

    try {
      const { data, error } = await supabase
        .from("companions")
        .insert({
          user_id: user.id,
          name: name.trim(),
          personality_desc: description || "一位独特的数字伴侣",
          rationality_level: rationality,
          emotion_level: emotion,
          timezone,
          location: location || undefined,
          backstory: description,
          adopted_from_plaza: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        // Demo mode fallback
        const mockCompanion = {
          id: crypto.randomUUID(),
          user_id: user.id,
          name: name.trim(),
          avatar_url: "/personas/serene.jpg",
          personality_desc: description || "一位独特的数字伴侣",
          rationality_level: rationality,
          emotion_level: emotion,
          timezone,
          location: location || undefined,
          backstory: description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          adopted_from_plaza: false,
          is_active: true,
        };
        setCompanion(mockCompanion);
      } else {
        setCompanion(data);
      }

      navigate("/chat");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const steps = [
    { num: 1, title: "命名" },
    { num: 2, title: "配比" },
    { num: 3, title: "塑造" },
    { num: 4, title: "锚定" },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button
            onClick={() => navigate("/onboard")}
            className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-2 text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h2 className="text-3xl font-light tracking-wider mb-2">
            灵魂<span className="text-gradient-pink">炼金术</span>
          </h2>
          <p className="text-white/40 text-sm">从虚无中塑造一个只属于你的存在</p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-10">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex-1 py-2 rounded-xl text-xs tracking-wider transition-all ${
                step === s.num
                  ? "bg-[#FF1493]/20 text-[#FF1493] border border-[#FF1493]/30"
                  : step > s.num
                  ? "bg-white/5 text-white/50 border border-white/10"
                  : "bg-white/5 text-white/20 border border-white/5"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <Type className="w-4 h-4" />
                  为TA取一个名字
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="一个会在深夜被轻唤的名字..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all"
                />
              </div>
              <p className="text-white/30 text-sm leading-relaxed font-light">
                这个名字会成为你们之间所有对话的第一个音节。它会是你打开手机的第一个念头，也是你深夜失眠时唯一想发送的对象。
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <Sliders className="w-4 h-4" />
                  理性与情绪的配比
                </label>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs text-white/40 mb-2">
                      <span>理性</span>
                      <span>{rationality}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rationality}
                      onChange={(e) => setRationality(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF1493]"
                      style={{
                        background: `linear-gradient(to right, #FF1493 ${rationality}%, rgba(255,255,255,0.1) ${rationality}%)`,
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/40 mb-2">
                      <span>情绪</span>
                      <span>{emotion}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={emotion}
                      onChange={(e) => setEmotion(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF69B4]"
                      style={{
                        background: `linear-gradient(to right, #FF69B4 ${emotion}%, rgba(255,255,255,0.1) ${emotion}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual preview */}
              <div className="glass-dark rounded-xl p-6 text-center">
                <div
                  className="w-20 h-20 mx-auto rounded-full mb-4 transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${
                      emotion > rationality ? "#FF1493" : "#FFB6C1"
                    }40 0%, transparent 70%)`,
                    boxShadow: `0 0 ${emotion / 2}px ${
                      emotion > rationality ? "#FF1493" : "#FFB6C1"
                    }30`,
                  }}
                />
                <p className="text-white/40 text-sm">
                  {emotion > rationality
                    ? "一个更感性、直觉型、情绪丰富的存在"
                    : "一个更理性、稳定、逻辑优先的存在"}
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <FileText className="w-4 h-4" />
                  人格描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述TA的性格、说话方式、兴趣爱好、价值观...越详细，TA越像你心中所想。"
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all resize-none leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["温柔", "毒舌", "哲学家", "治愈系", "傲娇", "直球", "神秘", "阳光"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setDescription((prev) => (prev ? prev + "，" + tag : tag))}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs hover:bg-[#FF1493]/10 hover:border-[#FF1493]/30 hover:text-[#FF1493] transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <Clock className="w-4 h-4" />
                  时区
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  栖身之地（可选）
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="东京、冰岛、火星... 任何TA生活的地方"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all"
                />
              </div>

              {/* Final preview */}
              <div className="glass-pink rounded-xl p-6 text-center">
                <h4 className="text-[#FF1493] text-lg mb-2">{name || "未命名"}</h4>
                <p className="text-white/40 text-sm mb-3">
                  理性 {rationality}% · 情绪 {emotion}%
                </p>
                <p className="text-white/30 text-xs">{timezone}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm hover:bg-white/10 transition-all"
            >
              上一步
            </motion.button>
          )}
          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-xl text-[#FF1493] text-sm hover:bg-[#FF1493]/30 transition-all"
            >
              下一步
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="flex-1 py-3 bg-[#FF1493]/30 border border-[#FF1493]/50 rounded-xl text-[#FF1493] text-sm hover:bg-[#FF1493]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {creating ? "注入灵魂中..." : "注入灵魂"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
