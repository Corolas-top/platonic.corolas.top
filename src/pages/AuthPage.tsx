import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useStore } from "../store";
import { Mail, Phone, ArrowLeft, Heart, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, setSession } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSession(data.session);
        setUser(data.user as any);
        navigate("/onboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSession(data.session);
        setUser(data.user as any);
        navigate("/onboard");
      }
    } catch (err: any) {
      setError(err.message || "认证失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "发送验证码失败");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user as any);
      navigate("/onboard");
    } catch (err: any) {
      setError(err.message || "验证失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-white/40 hover:text-white/80 transition-colors flex items-center gap-2 text-sm"
        whileHover={{ x: -3 }}
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#FF1493]/30 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart className="w-7 h-7 text-[#FF1493]" strokeWidth={1.5} />
          </motion.div>
          <h2 className="text-2xl font-light tracking-wider mb-2">
            {mode === "login" ? "欢迎回来" : "初次见面"}
          </h2>
          <p className="text-white/40 text-sm">
            {mode === "login" ? "你的伴侣在等你" : "开启一段数字羁绊"}
          </p>
        </div>

        {/* Method toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-full">
          <button
            onClick={() => { setMethod("email"); setOtpSent(false); setError(""); }}
            className={`flex-1 py-2 rounded-full text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              method === "email"
                ? "bg-[#FF1493]/20 text-[#FF1493]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Mail className="w-4 h-4" />
            邮箱
          </button>
          <button
            onClick={() => { setMethod("phone"); setOtpSent(false); setError(""); }}
            className={`flex-1 py-2 rounded-full text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              method === "phone"
                ? "bg-[#FF1493]/20 text-[#FF1493]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Phone className="w-4 h-4" />
            手机
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Email form */}
        {method === "email" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleEmailAuth}
            className="space-y-4"
          >
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱地址"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-xl text-[#FF1493] text-sm tracking-wider hover:bg-[#FF1493]/30 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </motion.button>
          </motion.form>
        )}

        {/* Phone form */}
        {method === "phone" && !otpSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="手机号 (+86)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all"
            />
            <motion.button
              onClick={handleSendOTP}
              disabled={loading || !phone}
              className="w-full py-3 bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-xl text-[#FF1493] text-sm tracking-wider hover:bg-[#FF1493]/30 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "发送中..." : "发送验证码"}
            </motion.button>
          </motion.div>
        )}

        {method === "phone" && otpSent && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleVerifyOTP}
            className="space-y-4"
          >
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="验证码"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1493]/50 focus:ring-1 focus:ring-[#FF1493]/30 transition-all text-center tracking-[0.5em]"
            />
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF1493]/20 border border-[#FF1493]/40 rounded-xl text-[#FF1493] text-sm tracking-wider hover:bg-[#FF1493]/30 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "验证中..." : "验证并登录"}
            </motion.button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              重新发送
            </button>
          </motion.form>
        )}

        {/* Toggle mode */}
        <p className="text-center mt-6 text-white/30 text-sm">
          {mode === "login" ? "还没有账号？" : "已有账号？"}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-[#FF1493]/70 hover:text-[#FF1493] ml-1 transition-colors"
          >
            {mode === "login" ? "注册" : "登录"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
