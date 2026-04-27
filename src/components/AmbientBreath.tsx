import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";

/**
 * ChatAmbient — 实时聊天节奏呼吸灯
 * 
 * 动态响应因子：
 * - 聊天频率（消息间隔越短，呼吸越快）
 * - 情绪强度（intensity 越高，光晕越亮）
 * - 情绪类型（不同 mood 映射不同颜色）
 * - 是否正在输入（typing 时呼吸加速）
 */

const MOOD_COLORS: Record<string, string> = {
  calm: "#FFB6C1",
  focused: "#FF69B4",
  joyful: "#FF1493",
  excited: "#FF1493",
  longing: "#C71585",
  desire: "#FF0000",
  melancholy: "#8B008B",
  protective: "#FF6B9D",
  possessive: "#DC143C",
  shy: "#FF69B4",
  playful_angry: "#FF4500",
};

export default function ChatAmbient() {
  const { companion, messages } = useStore();
  const [chatRhythm, setChatRhythm] = useState({
    breatheSpeed: 4,      // 秒
    glowIntensity: 0.06,  // 基础透明度
    chaos: 0,             // 活跃因子 0-1
  });

  const lastMsgTimeRef = useRef(Date.now());
  const msgCountRef = useRef(0);

  // 计算聊天节奏
  useEffect(() => {
    if (messages.length < 2) return;

    const recent = messages.slice(-6);
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      const t1 = new Date(recent[i - 1].created_at).getTime();
      const t2 = new Date(recent[i].created_at).getTime();
      intervals.push(t2 - t1);
    }
    const avgInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 30000;

    // 聊天越频繁，呼吸越快
    let speed = 4;
    if (avgInterval < 5000) speed = 1.5;      // 极速聊天
    else if (avgInterval < 15000) speed = 2.5; // 正常聊天
    else if (avgInterval < 30000) speed = 3.5;  // 慢聊

    // 情绪影响亮度和速度
    const mood = companion?.current_emotion?.mood || "calm";
    const intensity = companion?.current_emotion?.intensity || 0.4;

    let glow = 0.06 + intensity * 0.12;
    if (mood === "desire" || mood === "joyful") glow += 0.04;
    if (mood === "melancholy") glow -= 0.02;

    // 活跃因子（消息越多越活跃）
    const chaos = Math.min(1, messages.length / 50);

    setChatRhythm({ breatheSpeed: speed, glowIntensity: Math.max(0.03, Math.min(0.25, glow)), chaos });
    lastMsgTimeRef.current = Date.now();
    msgCountRef.current = messages.length;
  }, [messages, companion?.current_emotion]);

  const mood = companion?.current_emotion?.mood || "calm";
  const color = MOOD_COLORS[mood] || "#FFB6C1";
  const dur = chatRhythm.breatheSpeed;
  const glow = chatRhythm.glowIntensity;
  const hexOp = (o: number) => Math.round(o * 255).toString(16).padStart(2, "0");

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* 底部光池 — 主呼吸区 */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[55%] rounded-[100%]"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${color}${hexOp(glow)} 0%, transparent 70%)`,
          animation: `ambientBreathe ${dur}s ease-in-out infinite`,
          filter: "blur(60px)",
        }}
      />
      {/* 中央光晕 — 情绪核心 */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}${hexOp(glow * 0.4)} 0%, transparent 60%)`,
          animation: `ambientBreathe ${dur * 1.3}s ease-in-out infinite reverse`,
          filter: "blur(40px)",
        }}
      />
      {/* 顶部微光 — 深夜时更明显 */}
      {mood === "longing" || mood === "desire" || mood === "melancholy" ? (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] rounded-full"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${color}${hexOp(glow * 0.3)} 0%, transparent 70%)`,
            animation: `ambientBreathe ${dur * 1.5}s ease-in-out infinite`,
            filter: "blur(50px)",
          }}
        />
      ) : null}
      {/* 活跃粒子效果（聊天频繁时） */}
      {chatRhythm.chaos > 0.3 && (
        <div className="absolute inset-0" style={{ opacity: chatRhythm.chaos * 0.5 }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: color,
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
                animation: `floatParticle ${2 + i}s ease-in-out infinite`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
