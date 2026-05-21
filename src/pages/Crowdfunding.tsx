import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  TrendingUp,
  Gift,
  Check,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FundingPlan {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  supporters: number;
  previewImage: string;
  features: string[];
  accentColor: string;
  progressGradient: string;
}

interface Supporter {
  id: string;
  name: string;
  amount: number;
  timeAgo: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FUNDING_PLANS: FundingPlan[] = [
  {
    id: 'live2d',
    title: 'Live2D 形象系统',
    description: '让你的AI伴侣拥有生动的2D动画形象。她会眨眼、微笑、害羞，每一个表情都栩栩如生。支持自定义外观和多种服装。',
    targetAmount: 35000,
    currentAmount: 18500,
    supporters: 120,
    previewImage: '/live2d-preview.jpg',
    features: ['生动的表情动画', '自定义外观', '多种情绪状态', '服装系统'],
    accentColor: 'text-pink-400',
    progressGradient: 'from-pink-400 to-pink-300',
  },
  {
    id: 'pet',
    title: '虚拟宠物系统',
    description: '一只可爱的虚拟宠物将陪伴在你们身边。它会成长、互动、表达情绪，成为你们共同的家人。',
    targetAmount: 25000,
    currentAmount: 15200,
    supporters: 85,
    previewImage: '/pet-preview.jpg',
    features: ['宠物成长系统', '互动玩法', '情绪表达', '个性化外观'],
    accentColor: 'text-rose-gold',
    progressGradient: 'from-rose-gold to-pink-200',
  },
  {
    id: 'tts',
    title: 'TTS 语音合成',
    description: '先进的语音合成技术，让你的伴侣拥有独特而自然的声线。甜美、成熟、清亮——选择你喜欢的声音。',
    targetAmount: 40000,
    currentAmount: 13580,
    supporters: 72,
    previewImage: '/tts-preview.jpg',
    features: ['自然语音合成', '多声线选择', '情感语调', '低延迟响应'],
    accentColor: 'text-purple-memory',
    progressGradient: 'from-purple-memory to-pink-200',
  },
];

const TOTAL_RAISED = 47280;
const TOTAL_GOAL = 100000;
const TOTAL_SUPPORTERS = 187;

const SUPPORTERS: Supporter[] = [
  { id: 's1', name: '张**', amount: 50, timeAgo: '2小时前' },
  { id: 's2', name: 'Li***', amount: 100, timeAgo: '3小时前' },
  { id: 's3', name: '王**', amount: 10, timeAgo: '5小时前' },
  { id: 's4', name: 'Chen**', amount: 200, timeAgo: '6小时前' },
  { id: 's5', name: '刘**', amount: 50, timeAgo: '8小时前' },
  { id: 's6', name: '赵**', amount: 500, timeAgo: '12小时前' },
  { id: 's7', name: 'Yang*', amount: 20, timeAgo: '1天前' },
  { id: 's8', name: '孙**', amount: 100, timeAgo: '1天前' },
  { id: 's9', name: 'Wu***', amount: 50, timeAgo: '2天前' },
  { id: 's10', name: '周**', amount: 10, timeAgo: '2天前' },
  { id: 's11', name: 'Xu**', amount: 1000, timeAgo: '3天前' },
  { id: 's12', name: '马**', amount: 100, timeAgo: '3天前' },
];

const SUPPORT_AMOUNTS = [10, 50, 100];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Animated progress bar that fills when in view */
function AnimatedProgressBar({
  targetPercent,
  gradient,
  delay = 0,
}: {
  targetPercent: number;
  gradient: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <div ref={ref} className="h-2 rounded-full bg-pink-50 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${targetPercent}%` } : { width: 0 }}
        transition={{
          duration: 1.5,
          delay,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        }}
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
      />
    </div>
  );
}

/** Animated number for total raised */
function AnimatedRaisedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView) return;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="font-number text-[52px] font-bold text-white">
      ¥{value.toLocaleString()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Crowdfunding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [supportStep, setSupportStep] = useState<'select' | 'success'>('select');

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectedPlan = FUNDING_PLANS.find((p) => p.id === selectedPlanId);

  const handleSupportClick = (planId: string) => {
    setSelectedPlanId(planId);
    setSelectedAmount(null);
    setCustomAmount('');
    setSupportStep('select');
    setSupportModalOpen(true);
  };

  const handleSupportSubmit = () => {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) return;
    setSupportStep('success');
  };

  const handleCloseModal = () => {
    setSupportModalOpen(false);
    setSelectedAmount(null);
    setCustomAmount('');
    setSupportStep('select');
  };

  const totalPercent = Math.round((TOTAL_RAISED / TOTAL_GOAL) * 100);

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* ── Section 1: Floating Navigation ── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`
          fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 transition-all duration-300
          ${scrolled ? 'bg-pink-50/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'}
        `}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-pink-200 hover:text-white transition-colors"
        >
          <Sparkles size={22} className={scrolled ? 'text-pink-400' : 'text-pink-200'} />
          <span className={`font-body text-lg font-bold tracking-tight ${scrolled ? 'text-pink-400' : 'text-pink-200'}`}>
            Platonic
          </span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className={`
              px-4 py-2 rounded-full font-body text-[13px] font-medium
              transition-all duration-200
              ${scrolled
                ? 'text-plum-800 hover:bg-pink-100 border border-pink-200'
                : 'text-white/80 hover:text-white border border-white/20 hover:bg-white/10'
              }
            `}
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeft size={14} />
              返回应用
            </span>
          </button>
        </div>
      </motion.nav>

      {/* ── Section 2: Hero ── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/crowdfunding-hero.jpg)' }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(26,16,37,0.3) 0%, rgba(26,16,37,0.7) 100%)' }}
        />
        {/* Subtle zoom animation */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          className="absolute inset-0"
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-block px-4 py-1.5 rounded-full accent-gradient mb-5"
          >
            <span className="font-body text-[13px] font-semibold text-white">
              Platonic 筹资计划
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="font-display text-[48px] text-white mb-4"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.3)', lineHeight: 1.15 }}
          >
            一起创造有温度的AI陪伴
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-body text-[16px] text-white/85 max-w-[560px] mx-auto mb-8"
          >
            你的每一分支持，都将让 Platonic 变得更加生动、温暖、真实。帮助我们实现 Live2D 形象、虚拟宠物和语音合成三大愿景。
          </motion.p>

          {/* Total Raised Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <AnimatedRaisedNumber target={TOTAL_RAISED} />
            <p className="font-body text-[15px] text-white/70 mt-1">
              已筹集 / ¥{TOTAL_GOAL.toLocaleString()} 目标
            </p>

            {/* Progress bar */}
            <div className="mt-4 max-w-[480px] mx-auto">
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPercent}%` }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                  }}
                  className="h-full rounded-full accent-gradient"
                />
              </div>
              <p className="font-body text-[13px] text-white/60 mt-2">
                {TOTAL_SUPPORTERS} 位支持者
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={24} className="text-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Section 3: Why Crowdfund ── */}
      <section className="py-16 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="font-display text-[36px] text-plum-900 mb-4"
          >
            为什么选择筹资？
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-body text-[15px] text-plum-800 max-w-[640px] mx-auto mb-10"
          >
            Platonic 相信，最好的AI陪伴需要最先进的交互技术。Live2D 让伴侣有了生动的表情，虚拟宠物增添了日常乐趣，TTS 语音让对话有了真实的温度。这些技术需要大量研发资源，而你的支持将加速这一切的到来。
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users size={36} className="text-pink-400" />,
                title: '社区驱动',
                desc: '由用户社区共同决定产品方向，确保每一个功能都是真正被需要的',
                bg: 'bg-pink-50',
              },
              {
                icon: <TrendingUp size={36} className="text-rose-gold" />,
                title: '透明进度',
                desc: '实时更新的开发进度和资金使用情况，每一笔支出都公开透明',
                bg: 'bg-rose-50',
              },
              {
                icon: <Gift size={36} className="text-gold" />,
                title: '早鸟福利',
                desc: '支持者将优先体验新功能，并获得专属标识和奖励',
                bg: 'bg-yellow-50',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="
                  rounded-2xl card-gradient border border-pink-100 shadow-md p-7
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-200
                "
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mx-auto mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-body text-[18px] font-bold text-plum-900 mb-2">
                  {card.title}
                </h3>
                <p className="font-body text-[13px] text-plum-800">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Funding Plan Cards ── */}
      <section className="py-16 px-6 bg-pink-50">
        <div className="max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="font-display text-[36px] text-plum-900 text-center mb-10"
          >
            三大筹资计划
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {FUNDING_PLANS.map((plan, i) => {
              const percent = Math.round((plan.currentAmount / plan.targetAmount) * 100);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-15%' }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                  }}
                  className="
                    bg-white rounded-3xl border border-pink-100 shadow-md overflow-hidden
                    hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200 flex flex-col
                  "
                >
                  {/* Preview Image */}
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={plan.previewImage}
                      alt={plan.title}
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(transparent 40%, white 100%)' }}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="px-6 pb-6 flex-1 flex flex-col">
                    <h3 className="font-body text-[22px] font-bold text-plum-900 mb-2">
                      {plan.title}
                    </h3>
                    <p className="font-body text-[13px] text-plum-800 mb-4 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Feature list */}
                    <div className="space-y-1.5 mb-5">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2">
                          <Check size={16} className="text-green-500 flex-shrink-0" />
                          <span className="font-body text-[13px] text-plum-800">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Funding progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-[12px] text-plum-800">
                          已筹集: ¥{plan.currentAmount.toLocaleString()} / ¥{plan.targetAmount.toLocaleString()}
                        </span>
                        <span className={`font-number text-[18px] font-semibold ${plan.accentColor}`}>
                          {percent}%
                        </span>
                      </div>
                      <AnimatedProgressBar
                        targetPercent={percent}
                        gradient={plan.progressGradient}
                        delay={i * 0.2}
                      />
                      <p className="font-body text-[12px] text-muted-plum mt-1.5">
                        {plan.supporters} 位支持者
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto space-y-2">
                      <button
                        onClick={() => handleSupportClick(plan.id)}
                        className="
                          w-full py-3 rounded-xl accent-gradient text-white font-body font-semibold
                          transition-all duration-150 hover:brightness-110 hover:shadow-glow active:brightness-95
                        "
                      >
                        支持此计划
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Overall Progress ── */}
      <section className="py-12 px-6">
        <div className="max-w-[800px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="font-display text-[36px] text-plum-900 text-center mb-8"
          >
            总体进度
          </motion.h2>

          <div className="space-y-5">
            {FUNDING_PLANS.map((plan, i) => {
              const percent = Math.round((plan.currentAmount / plan.targetAmount) * 100);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-15%' }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-4"
                >
                  <span className="font-body text-[15px] text-plum-900 w-[100px] flex-shrink-0 text-right">
                    {plan.title.split(' ')[0]}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-pink-50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percent}%` }}
                      viewport={{ once: true, margin: '-15%' }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${plan.progressGradient}`}
                    />
                  </div>
                  <span className="font-body text-[12px] text-muted-plum w-[100px] flex-shrink-0">
                    ¥{plan.currentAmount.toLocaleString()} / ¥{plan.targetAmount.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="font-body text-[15px] text-plum-800 text-center mt-8"
          >
            预计完成时间: 2025年6月
          </motion.p>
        </div>
      </section>

      {/* ── Section 6: Supporter Wall ── */}
      <section className="py-12 px-6 bg-pink-50">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-[36px] text-plum-900 mb-2">
              感谢每一位支持者
            </h2>
            <p className="font-body text-[15px] text-plum-800">
              因为有你们，Platonic 才能不断成长
            </p>
          </motion.div>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
          >
            {SUPPORTERS.map((supporter, i) => (
              <motion.div
                key={supporter.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="
                  bg-white rounded-xl px-3.5 py-2.5 border border-pink-100
                  hover:shadow-sm transition-shadow duration-150
                "
              >
                <p className="font-body text-[13px] text-plum-900 font-medium truncate">
                  {supporter.name}
                </p>
                <p className="font-body text-[12px] text-pink-500 font-semibold">
                  ¥{supporter.amount}
                </p>
                <p className="font-body text-[11px] text-muted-plum">
                  {supporter.timeAgo}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => alert(`查看全部 ${TOTAL_SUPPORTERS} 位支持者`)}
              className="font-body text-[13px] text-pink-500 hover:text-pink-600 transition-colors"
            >
              查看全部 {TOTAL_SUPPORTERS} 位支持者
            </button>
          </motion.p>
        </div>
      </section>

      {/* ── Section 7: CTA Footer ── */}
      <section className="py-16 px-6 accent-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="font-display text-[36px] text-white mb-3"
          >
            成为 Platonic 成长的一部分
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-[15px] text-white/80 mb-8"
          >
            每一份支持，都在为这个世界增添一点温暖
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onClick={() => handleSupportClick(FUNDING_PLANS[0].id)}
            className="
              px-12 py-4 rounded-full bg-white text-pink-500 font-body font-semibold
              transition-all duration-150 hover:scale-105 hover:shadow-glow
            "
          >
            立即支持
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-sidebar-bg text-sidebar-text py-12 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-pink-200" />
              <span className="text-pink-200 font-body font-bold">Platonic</span>
            </div>
            <p className="font-body text-[12px] text-sidebar-text">
              &copy; 2024 Platonic AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Support Modal ── */}
      <AnimatePresence>
        {supportModalOpen && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(26,16,37,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.68, -0.3, 0.32, 1.3] as [number, number, number, number] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-lg p-6 max-w-[420px] w-full relative"
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-pink-50 transition-colors"
              >
                <X size={20} className="text-plum-800" />
              </button>

              {supportStep === 'select' ? (
                <>
                  <h3 className="font-body text-[20px] font-semibold text-plum-900 text-center mb-1">
                    支持 {selectedPlan.title.split(' ')[0]}
                  </h3>
                  <p className="font-body text-[13px] text-muted-plum text-center mb-6">
                    选择一个金额来支持这个项目
                  </p>

                  {/* Amount options */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {SUPPORT_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`
                          py-3 rounded-xl font-body font-semibold text-[16px] transition-all duration-150
                          ${selectedAmount === amt
                            ? 'accent-gradient text-white shadow-glow scale-105'
                            : 'bg-pink-50 text-plum-900 hover:bg-pink-100 border border-pink-100'
                          }
                        `}
                      >
                        ¥{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="relative mb-6">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-muted-plum text-[15px]">
                      ¥
                    </span>
                    <input
                      type="number"
                      placeholder="自定义金额"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="
                        w-full pl-8 pr-4 py-3 rounded-xl border border-pink-100 bg-white
                        font-body text-[15px] text-plum-900 placeholder:text-muted-plum
                        focus:outline-none focus:border-pink-400 focus:shadow-glow transition-all
                      "
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSupportSubmit}
                    disabled={!selectedAmount && !customAmount}
                    className="
                      w-full py-3.5 rounded-xl accent-gradient text-white font-body font-semibold
                      transition-all duration-150 hover:brightness-110 hover:shadow-glow active:brightness-95
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
                      flex items-center justify-center gap-2
                    "
                  >
                    <Heart size={18} />
                    确认支持
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-pink-400" />
                  </div>
                  <h3 className="font-body text-[20px] font-semibold text-plum-900 mb-2">
                    感谢您的支持!
                  </h3>
                  <p className="font-body text-[13px] text-muted-plum mb-6">
                    您的每一份贡献都让 Platonic 变得更好
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="px-8 py-2.5 rounded-xl accent-gradient text-white font-body font-semibold transition-all hover:brightness-110 hover:shadow-glow"
                  >
                    完成
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
