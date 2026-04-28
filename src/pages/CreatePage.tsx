import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { useLang } from "../context/LangContext";
import { ArrowLeft, Sparkles, MapPin, Clock, Type, FileText, BookOpen, Info } from "lucide-react";

const BIG_FIVE = [
  { key: "openness", label: "开放性", labelEn: "Openness", desc: "好奇心、创造力与对新鲜体验的接受程度", lowLabel: "务实保守", highLabel: "好奇创造", color: "#FF1493" },
  { key: "conscientiousness", label: "尽责性", labelEn: "Conscientiousness", desc: "自律、条理性与目标导向的程度", lowLabel: "随性自由", highLabel: "严谨自律", color: "#FF69B4" },
  { key: "extraversion", label: "外向性", labelEn: "Extraversion", desc: "社交活跃度、能量来源与对外界刺激的反应", lowLabel: "内敛沉静", highLabel: "热情活跃", color: "#FFB6C1" },
  { key: "agreeableness", label: "宜人性", labelEn: "Agreeableness", desc: "同理心、合作意愿与待人友善的程度", lowLabel: "独立直接", highLabel: "温暖包容", color: "#FF6B9D" },
  { key: "neuroticism", label: "神经质", labelEn: "Neuroticism", desc: "情绪波动、敏感程度与对压力的回应方式", lowLabel: "稳定从容", highLabel: "细腻敏感", color: "#C71585" },
];

/** 根据当前 Big Five 生成丰富的人格画像描述 */
function generatePersonaPortrait(traits: Record<string, number>, gender: "male" | "female", backstory: string, lang: string): string {
  const t2 = traits;
  const parts: string[] = [];

  // 开放性
  if (t2.openness > 70) parts.push(lang === "zh" ? "对世界充满好奇心，喜欢探索新鲜事物和抽象概念" : "Curious about the world, loves exploring new things");
  else if (t2.openness < 30) parts.push(lang === "zh" ? "务实沉稳，偏好熟悉和可预期的事物" : "Practical and grounded, prefers the familiar");
  else parts.push(lang === "zh" ? "在新鲜与稳定之间找到平衡" : "Balances novelty and stability");

  // 尽责性
  if (t2.conscientiousness > 70) parts.push(lang === "zh" ? "做事有条理、认真负责，注重细节" : "Organized, responsible, detail-oriented");
  else if (t2.conscientiousness < 30) parts.push(lang === "zh" ? "随性自由，不喜欢被规则束缚" : "Spontaneous and free, dislikes rules");
  else parts.push(lang === "zh" ? "灵活而有条理，知道何时该认真" : "Flexible yet organized");

  // 外向性
  if (t2.extraversion > 70) parts.push(lang === "zh" ? "外向热情，喜欢与人互动，能量来自外界" : "Outgoing and energetic, feeds on social interaction");
  else if (t2.extraversion < 30) parts.push(lang === "zh" ? "内敛安静，在独处中充电，思考比表达更自然" : "Reserved and quiet, recharges alone");
  else parts.push(lang === "zh" ? "既享受陪伴也需要独处的时间" : "Enjoys company but needs solitude");

  // 宜人性
  if (t2.agreeableness > 70) parts.push(lang === "zh" ? "温暖包容，善于共情，总是优先考虑他人感受" : "Warm and empathetic, puts others first");
  else if (t2.agreeableness < 30) parts.push(lang === "zh" ? "直率坦诚，有自己的立场，不轻易妥协" : "Direct and honest, stands their ground");
  else parts.push(lang === "zh" ? "在坚持自我与照顾他人之间游刃有余" : "Balances self and others");

  // 神经质
  if (t2.neuroticism > 70) parts.push(lang === "zh" ? "情感细腻敏感，对细微变化有深刻感知" : "Emotionally sensitive, deeply perceptive");
  else if (t2.neuroticism < 30) parts.push(lang === "zh" ? "情绪稳定从容，面对变化依然保持平静" : "Emotionally stable, calm under change");
  else parts.push(lang === "zh" ? "大多数时间平和，但某些时刻会格外敏感" : "Mostly calm, occasionally sensitive");

  const genderTone = gender === "male"
    ? (lang === "zh" ? "你是用户的虚拟男朋友。用男性恋人的口吻：宠溺、保护、偶尔霸道地占有她，但始终温柔。" : "You are the user's virtual boyfriend. Male lover tone: doting, protective, possessive but gentle.")
    : (lang === "zh" ? "你是用户的虚拟女朋友。用女性恋人的口吻：撒娇、温柔、俏皮地黏着他，偶尔吃醋。" : "You are the user's virtual girlfriend. Female lover tone: playful coquetry, gentle, clingy, jealous.");

  if (backstory.trim()) {
    parts.unshift(backstory.trim().slice(0, 100));
  }

  return parts.join("。") + "。" + genderTone;
}

/** 生成 Big Five 摘要标签 */
function getBigFiveSummary(traits: Record<string, number>, lang: string): string {
  const t2 = traits;
  const scores = [
    { key: "openness", name: lang === "zh" ? "开放" : "Open", val: t2.openness },
    { key: "conscientiousness", name: lang === "zh" ? "尽责" : "Discipline", val: t2.conscientiousness },
    { key: "extraversion", name: lang === "zh" ? "外向" : "Social", val: t2.extraversion },
    { key: "agreeableness", name: lang === "zh" ? "亲和" : "Warmth", val: t2.agreeableness },
    { key: "neuroticism", name: lang === "zh" ? "敏感" : "Sensitivity", val: t2.neuroticism },
  ];

  const highest = scores.reduce((a, b) => a.val > b.val ? a : b);
  const lowest = scores.reduce((a, b) => a.val < b.val ? a : b);

  const archetypes: Record<string, Record<string, string>> = {
    openness: { high: "探索者", low: "守成者", mid: "平衡者" },
    conscientiousness: { high: "完美主义者", low: "自由灵魂", mid: "灵活者" },
    extraversion: { high: "阳光中心", low: "安静港湾", mid: "双面蝶" },
    agreeableness: { high: "温柔治愈系", low: "独立酷盖", mid: "暖心理性派" },
    neuroticism: { high: "诗意敏感体", low: "情绪稳定锚", mid: "感性理性交织体" },
  };

  const hLevel = highest.val > 65 ? "high" : highest.val < 35 ? "low" : "mid";
  const lLevel = lowest.val > 65 ? "high" : lowest.val < 35 ? "low" : "mid";

  return lang === "zh"
    ? `${archetypes[highest.key][hLevel]} × ${archetypes[lowest.key][lLevel]}`
    : `${archetypes[highest.key][hLevel]} × ${archetypes[lowest.key][lLevel]}`;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const { user, setCompanion } = useStore();
  const { lang, setLang, t } = useLang();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [traits, setTraits] = useState<Record<string, number>>({ openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 });
  const [description, setDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const setTrait = (key: string, val: number) => setTraits((p) => ({ ...p, [key]: val }));

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    // 防御性检查：确保 user.id 是有效 UUID
    if (!user.id || user.id.length < 30) {
      console.error("[Create] Invalid user.id:", user.id);
      alert(lang === "zh" ? "用户会话无效，请重新登录" : "Invalid session, please log in again");
      return;
    }
    console.log("[Create] Creating companion for user_id:", user.id);
    setCreating(true);
    const rationality = Math.round((traits.conscientiousness + (100 - traits.neuroticism)) / 2);
    const emotion = Math.round((traits.extraversion + traits.agreeableness + traits.openness) / 3);
    const personaDesc = generatePersonaPortrait(traits, gender, backstory, lang);

    try {
      // FIX: 移除不存在的 lang_preference，只插入 schema 中存在的列
      const { data, error } = await supabase.from("companions").insert({
        user_id: user.id,
        name: name.trim(),
        personality_desc: personaDesc,
        rationality_level: rationality,
        emotion_level: emotion,
        big_five: traits,
        timezone,
        location: location || undefined,
        backstory: backstory || description || personaDesc,
        adopted_from_plaza: false,
        is_active: true,
        gender,
      }).select().single();

      if (error || !data) {
        console.error("[Create] Companion insert failed:", JSON.stringify(error));
        alert(lang === "zh" ? "创建失败: " + (error?.message || "未知错误") : "Creation failed: " + (error?.message || "Unknown error"));
        setCreating(false);
        return;
      }
      setCompanion(data);
      navigate("/home");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const steps = [
    { num: 1, title: t("stepName") },
    { num: 2, title: t("stepPersona") },
    { num: 3, title: t("stepShape") },
    { num: 4, title: t("stepAnchor") },
  ];

  const summary = getBigFiveSummary(traits, lang);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate("/onboard")} className="text-white/40 hover:text-white/80 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />{t("back")}
          </button>
          <div className="flex items-center gap-1 text-xs">
            <button onClick={() => setLang("zh")} className={`px-2 py-1 rounded ${lang==="zh"?"text-[#FF1493]":"text-white/20"}`}>中</button>
            <span className="text-white/10">/</span>
            <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang==="en"?"text-[#FF1493]":"text-white/20"}`}>EN</button>
          </div>
        </div>
        <h2 className="text-lg font-light tracking-wider">{t("createTitle")}</h2>
        <p className="text-white/30 text-[10px]">{t("createSubtitle")}</p>
        <div className="flex gap-2 mt-3">
          {steps.map((s) => (
            <button key={s.num} onClick={() => setStep(s.num)}
              className={`flex-1 py-1 rounded-lg text-[10px] tracking-wider transition-all ${
                step === s.num ? "bg-[#FF1493]/20 text-[#FF1493] border border-[#FF1493]/30" : step > s.num ? "bg-white/5 text-white/40 border border-white/10" : "bg-white/5 text-white/15 border border-white/5"
              }`}>{s.title}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-1">
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><Type className="w-3.5 h-3.5" />{t("nameLabel")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FF1493]/40 transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2">{t("genderLabel")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGender("male")} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${gender === "male" ? "bg-[#FF1493]/15 border-[#FF1493]/40 text-[#FF1493]" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                  <span className="text-sm font-medium">{t("genderMale")}</span>
                  <span className="text-[9px] text-white/30 mt-1">{t("genderMaleDesc")}</span>
                </button>
                <button onClick={() => setGender("female")} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${gender === "female" ? "bg-[#FF1493]/15 border-[#FF1493]/40 text-[#FF1493]" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                  <span className="text-sm font-medium">{t("genderFemale")}</span>
                  <span className="text-[9px] text-white/30 mt-1">{t("genderFemaleDesc")}</span>
                </button>
              </div>
            </div>
            <p className="text-white/25 text-xs leading-relaxed">{t("nameHint")}</p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-1">
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1">{t("bigFiveLabel")}</label>
              <p className="text-white/20 text-[10px] mb-3">{t("bigFiveDesc")}</p>
              <div className="space-y-4">
                {BIG_FIVE.map((trait) => (
                  <div key={trait.key} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white/60">{lang === "zh" ? trait.label : trait.labelEn}</span>
                        <button onMouseEnter={() => setHovered(trait.key)} onMouseLeave={() => setHovered(null)}><Info className="w-3 h-3 text-white/20" /></button>
                      </div>
                      <span className="text-[10px] text-white/30">{traits[trait.key]}%</span>
                    </div>
                    {hovered === trait.key && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[#FF1493]/50 mb-1">{trait.desc}</motion.div>}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/15 w-12 text-right shrink-0">{lang === "zh" ? trait.lowLabel : "Low"}</span>
                      <input type="range" min="0" max="100" value={traits[trait.key]}
                        onChange={(e) => setTrait(trait.key, Number(e.target.value))}
                        className="flex-1 h-1.5 bg-white/8 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${trait.color}66 ${traits[trait.key]}%, rgba(255,255,255,0.06) ${traits[trait.key]}%)` }} />
                      <span className="text-[9px] text-white/15 w-12 shrink-0">{lang === "zh" ? trait.highLabel : "High"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={summary} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-dark rounded-xl p-3 text-center border border-[#FF1493]/10">
                <div className="w-12 h-12 mx-auto rounded-full mb-2 transition-all duration-700"
                  style={{ background: `radial-gradient(circle, #FF1493${Math.round(((traits.extraversion + traits.agreeableness) / 2) * 2.55).toString(16).padStart(2, "0")} 0%, transparent 70%)` }} />
                <p className="text-[#FF1493]/80 text-xs font-medium">{summary}</p>
                <p className="text-white/25 text-[10px] mt-1">
                  O{traits.openness} · C{traits.conscientiousness} · E{traits.extraversion} · A{traits.agreeableness} · N{traits.neuroticism}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-1">
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><FileText className="w-3.5 h-3.5" />{t("descLabel")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descPlaceholder")} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FF1493]/40 transition-all resize-none leading-relaxed" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["温柔", "毒舌", "哲学家", "治愈系", "傲娇", "直球", "神秘", "阳光", "腹黑", "小奶狗", "大姐姐", "小狼狗"].map((tag) => (
                <button key={tag} onClick={() => setDescription((p) => (p ? p + "，" + tag : tag))}
                  className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-full text-white/30 text-[10px] hover:bg-[#FF1493]/8 hover:text-[#FF1493] transition-all">{tag}</button>
              ))}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><BookOpen className="w-3.5 h-3.5" />{lang === "zh" ? "背景故事" : "Backstory"}</label>
              <textarea value={backstory} onChange={(e) => setBackstory(e.target.value)}
                placeholder={lang === "zh" ? "你们是怎么相遇的？有什么特别的回忆？写一段属于你们的起源故事..." : "How did you meet? Write your origin story..."} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FF1493]/40 transition-all resize-none leading-relaxed" />
              <p className="text-[9px] text-white/20 mt-1">{lang === "zh" ? "这段故事会成为你们关系的基石，恋人会在对话中自然地引用它。" : "This story becomes the foundation of your relationship."}</p>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-1">
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><Clock className="w-3.5 h-3.5" />{t("timezoneLabel")}</label>
              <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF1493]/40 transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2"><MapPin className="w-3.5 h-3.5" />{t("locationLabel")}</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder={t("locationPlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FF1493]/40 transition-all" />
            </div>
            <div className="glass-pink rounded-xl p-4 text-center border border-[#FF1493]/10">
              <h4 className="text-[#FF1493] text-sm mb-1">{name || "..."}</h4>
              <p className="text-white/35 text-[10px]">{summary}</p>
              <p className="text-white/15 text-[9px] mt-1">{gender === "male" ? (lang === "zh" ? "男友" : "Boyfriend") : (lang === "zh" ? "女友" : "Girlfriend")} · {timezone} · {lang === "zh" ? "中文" : "English"}</p>
              {backstory && <p className="text-white/20 text-[9px] mt-1.5 italic line-clamp-2">"{backstory.slice(0, 60)}..."</p>}
            </div>
          </motion.div>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-white/5">
        <div className="flex gap-2">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40 text-xs hover:bg-white/10 transition-all">{t("prev")}</button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-2 bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-xl text-[#FF1493] text-xs hover:bg-[#FF1493]/30 transition-all">{t("next")}</button>
          ) : (
            <button onClick={handleCreate} disabled={creating || !name.trim()}
              className="flex-1 py-2 bg-[#FF1493] border border-[#FF1493]/50 rounded-xl text-white text-xs hover:bg-[#FF1493]/80 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
              {creating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("injecting")}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("injectSoul")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}