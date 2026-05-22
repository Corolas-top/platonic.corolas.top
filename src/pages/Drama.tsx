import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Star,
  Lock,
  Users,
  Sparkles,
  Check,
  Play,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase, getStorageUrl } from '@/lib/supabase';

/* ─── Types ─── */
interface DramaItem {
  id: string;
  name: string;
  description: string;
  cover_image_path: string | null;
  scene_setting: string | null;
  rating: number;
  ratingCount: string;
  genre: string;
  tags: string[];
  isUnlocked: boolean;
  unlockCondition: string;
  difficulty: '简单' | '中等' | '困难';
}

interface MyStorySession {
  id: string;
  dramaId: string;
  name: string;
  coverImage: string;
  currentChapter: number;
  totalChapters: number;
  status: 'ongoing' | 'completed';
  lastPlayed: string;
  affection: number;
}

const filterTabs = ['全部', '已解锁', '热门', '浪漫', '悬疑', '日常', '奇幻'];

const difficultyColors: Record<string, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-amber-100 text-amber-700',
  '困难': 'bg-red-100 text-red-700',
};

/* ─── Drama Cover Image with fallback ─── */
function DramaCoverImage({ drama, className }: { drama: DramaItem; className?: string }) {
  const [src, setSrc] = useState(drama.cover_image_path || '/drama-cover-1.jpg');
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setSrc('/drama-cover-1.jpg');
      setFailed(true);
    }
  };

  return (
    <img
      src={src}
      alt={drama.name}
      className={className}
      onError={handleError}
    />
  );
}

/* ─── Login Banner ─── */
function AuthBanner() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="mb-6 rounded-xl bg-pink-50 border border-pink-200 p-4 flex items-center gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Sparkles size={20} className="text-pink-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] text-[#6B5B6E] font-body">
          登录后可以解锁并参与剧情互动。
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 rounded-xl text-[13px] font-body font-medium text-pink-500 border border-pink-200 hover:bg-pink-100 transition-all duration-150 flex items-center gap-1.5"
        >
          <LogIn size={14} />
          登录
        </button>
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 rounded-xl text-[13px] font-body font-medium text-white accent-gradient hover:brightness-110 transition-all duration-150 flex items-center gap-1.5"
        >
          <UserPlus size={14} />
          创建账户
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Component ─── */
export default function Drama() {
  const [activeView, setActiveView] = useState<'plaza' | 'my'>('plaza');
  const [activeFilter, setActiveFilter] = useState('全部');
  const [dramas, setDramas] = useState<DramaItem[]>([]);
  const [sessions, setSessions] = useState<MyStorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Load dramas from Supabase
  useEffect(() => {
    async function loadDramas() {
      try {
        setLoading(true);
        const { data: rows, error } = await supabase
          .from('drama_definitions')
          .select('*')
          .order('id');

        if (error || !rows) {
          setDramas([]);
          return;
        }

        const mapped: DramaItem[] = rows.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name || ''),
          description: String(row.description || ''),
          cover_image_path: row.cover_image_path ? getStorageUrl(String(row.cover_image_path)) : null,
          scene_setting: String(row.scene_setting || ''),
          rating: Number(row.rating) || 4.5,
          ratingCount: String(row.rating_count || '0'),
          genre: String(row.genre || '浪漫'),
          tags: Array.isArray(row.tags) ? row.tags : ['剧情'],
          isUnlocked: Boolean(row.is_unlocked) || false,
          unlockCondition: String(row.unlock_condition || ''),
          difficulty: (String(row.difficulty) as '简单' | '中等' | '困难') || '简单',
        }));

        setDramas(mapped);
      } catch (e) {
        console.error('Drama load error:', e);
        setDramas([]);
      } finally {
        setLoading(false);
      }
    }

    loadDramas();
  }, []);

  // Load my story sessions (from localStorage for now, can be extended to Supabase)
  useEffect(() => {
    const stored = localStorage.getItem('drama_sessions');
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  }, []);

  /* Filtered dramas */
  const filteredDramas = useMemo(() => {
    if (activeFilter === '全部') return dramas;
    if (activeFilter === '已解锁') return dramas.filter((d) => d.isUnlocked);
    if (activeFilter === '热门') return [...dramas].sort((a, b) => b.ratingCount.localeCompare(a.ratingCount));
    return dramas.filter((d) => d.genre === activeFilter);
  }, [activeFilter, dramas]);

  /* Unlocked count */
  const unlockedCount = dramas.filter((d) => d.isUnlocked).length;

  /* Handle enter drama */
  const handleEnterDrama = (name: string) => {
    if (!isAuthenticated) {
      toast('请先登录以参与剧情', {
        description: '登录后可以解锁并体验剧情',
        icon: <Sparkles size={16} className="text-pink-400" />,
      });
      return;
    }
    toast('剧情空间即将开启...', {
      description: `正在进入「${name}」的剧情世界`,
      icon: <Sparkles size={16} className="text-pink-400" />,
    });
  };

  /* Handle locked click */
  const handleLockedClick = (condition: string) => {
    toast('剧情尚未解锁', {
      description: `解锁条件：${condition}`,
    });
  };

  /* Animation variants */
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-[100dvh] bg-pink-50">
      {/* ── Top Bar ── */}
      <div className="px-8 pt-6 pb-4">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-pink-400" />
            <h2 className="font-body text-[28px] font-bold text-[#2D1B2E]">
              剧情空间
            </h2>
          </div>

          {/* Right: Unlocked badge */}
          <motion.span
            className="px-3 py-1 rounded-full text-[12px] font-semibold tracking-wider text-pink-500 bg-pink-50 border border-pink-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            已解锁 {unlockedCount}/{dramas.length}
          </motion.span>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          className="flex items-center gap-2 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setActiveView('plaza')}
            className={cn(
              'px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200',
              activeView === 'plaza'
                ? 'accent-gradient text-white shadow-md'
                : 'bg-white text-[#6B5B6E] border border-pink-100 hover:bg-pink-50'
            )}
          >
            剧情广场
          </button>
          <button
            onClick={() => setActiveView('my')}
            className={cn(
              'px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200',
              activeView === 'my'
                ? 'accent-gradient text-white shadow-md'
                : 'bg-white text-[#6B5B6E] border border-pink-100 hover:bg-pink-50'
            )}
          >
            我的剧情
          </button>
        </motion.div>
      </div>

      {/* ── Auth Banner ── */}
      {!isAuthenticated && (
        <div className="px-8">
          <AuthBanner />
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-8 pb-8">
        <AnimatePresence mode="wait">
          {/* ═══ Story Plaza ═══ */}
          {activeView === 'plaza' && (
            <motion.div
              key="plaza"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Featured Banner */}
              {dramas.length > 0 && (
              <motion.div
                className="relative w-full h-[240px] rounded-3xl overflow-hidden mb-6 group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onClick={() => handleEnterDrama(dramas[0].name)}
              >
                <DramaCoverImage
                  drama={dramas[0]}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 30%, rgba(26,16,37,0.85) 100%)',
                  }}
                />
                <div className="absolute right-0 top-0 h-full w-[60%] flex flex-col justify-center px-8">
                  <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold text-white accent-gradient w-fit mb-3">
                    推荐剧情
                  </span>
                  <h1 className="font-display text-[36px] text-white mb-2 leading-tight">
                    {dramas[0].name}
                  </h1>
                  <p className="text-[15px] text-white/80 leading-relaxed mb-4 line-clamp-2">
                    {dramas[0].description}
                  </p>
                  <div className="flex items-center gap-4 text-[13px] text-white/70 mb-4">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                      {dramas[0].rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {dramas[0].ratingCount} 体验
                    </span>
                    <span className="flex items-center gap-1">
                      <Lock size={14} />
                      {dramas[0].isUnlocked ? '免费解锁' : dramas[0].unlockCondition}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterDrama(dramas[0].name);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white text-pink-500 font-semibold text-[14px]
                      hover:bg-pink-50 transition-all duration-150 w-fit shadow-md active:scale-95"
                  >
                    开始体验
                  </button>
                </div>
              </motion.div>
              )}

              {/* Filter Tabs */}
              <motion.div
                className="flex items-center gap-2 mb-6 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200',
                      activeFilter === tab
                        ? 'accent-gradient text-white shadow-sm'
                        : 'bg-white text-[#6B5B6E] border border-pink-100 hover:bg-pink-50'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </motion.div>

              {/* Drama Card Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  className="grid grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {filteredDramas.map((drama, idx) => (
                    <motion.div
                      key={drama.id}
                      custom={idx}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      className={cn(
                        'group rounded-2xl overflow-hidden bg-white border border-pink-100 transition-all duration-200',
                        'hover:shadow-lg hover:-translate-y-1.5',
                        !drama.isUnlocked && 'grayscale'
                      )}
                    >
                      {/* Cover Image */}
                      <div
                        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                        onClick={() =>
                          drama.isUnlocked
                            ? handleEnterDrama(drama.name)
                            : handleLockedClick(drama.unlockCondition)
                        }
                      >
                        <DramaCoverImage
                          drama={drama}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                        />
                        {/* Bottom gradient */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(transparent 50%, rgba(26,16,37,0.8) 100%)',
                          }}
                        />

                        {/* Difficulty badge */}
                        <span
                          className={cn(
                            'absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                            difficultyColors[drama.difficulty]
                          )}
                        >
                          {drama.difficulty}
                        </span>

                        {/* Genre tag */}
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-[#2D1B2E]">
                          {drama.genre}
                        </span>

                        {/* Lock overlay */}
                        {!drama.isUnlocked && (
                          <div className="absolute inset-0 bg-[rgba(26,16,37,0.55)] flex flex-col items-center justify-center transition-all duration-200 group-hover:bg-[rgba(26,16,37,0.45)]">
                            <Lock size={32} className="text-white mb-2" />
                            <span className="text-[12px] text-white/80">{drama.unlockCondition}</span>
                            <span className="text-[11px] text-white/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              点击解锁
                            </span>
                          </div>
                        )}

                        {/* Info overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-body text-[16px] font-semibold text-white leading-snug mb-1 line-clamp-2">
                            {drama.name}
                          </h4>
                          <div className="flex items-center gap-2 text-white/70">
                            <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                            <span className="text-[12px]">{drama.rating}</span>
                            <span className="text-[11px] text-white/50">{drama.ratingCount}人</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-4">
                        <p className="text-[12px] text-[#A093A5] line-clamp-2 mb-3 leading-relaxed">
                          {drama.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            {drama.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full text-[11px] bg-pink-50 text-pink-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {drama.isUnlocked ? (
                            <button
                              onClick={() => handleEnterDrama(drama.name)}
                              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white
                                accent-gradient hover:brightness-110 transition-all duration-150
                                shadow-sm active:scale-95"
                            >
                              进入剧情
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#A093A5]">{drama.unlockCondition}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══ My Stories ═══ */}
          {activeView === 'my' && (
            <motion.div
              key="my"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-pink-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={18} className="text-pink-400" />
                    <span className="text-[13px] text-[#6B5B6E]">总体验剧情</span>
                  </div>
                  <span className="font-number text-[32px] font-bold text-[#2D1B2E]">
                    {sessions.length}
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-pink-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={18} className="text-green-500" />
                    <span className="text-[13px] text-[#6B5B6E]">已完成</span>
                  </div>
                  <span className="font-number text-[32px] font-bold text-[#2D1B2E]">
                    {sessions.filter((s) => s.status === 'completed').length}
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-pink-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={18} className="text-amber-500" />
                    <span className="text-[13px] text-[#6B5B6E]">进行中</span>
                  </div>
                  <span className="font-number text-[32px] font-bold text-[#2D1B2E]">
                    {sessions.filter((s) => s.status === 'ongoing').length}
                  </span>
                </div>
              </div>

              {/* Session list */}
              <div className="space-y-4">
                {sessions.map((session, idx) => {
                  const progress = (session.currentChapter / session.totalChapters) * 100;
                  return (
                    <motion.div
                      key={session.id}
                      className="bg-white rounded-2xl border border-pink-100 p-5 flex gap-5
                        hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                    >
                      {/* Cover thumbnail */}
                      <div className="w-[100px] h-[130px] rounded-xl overflow-hidden shrink-0">
                        <img
                          src={session.coverImage}
                          alt={session.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-body text-[18px] font-semibold text-[#2D1B2E]">
                              {session.name}
                            </h3>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                                session.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              )}
                            >
                              {session.status === 'completed' ? '已完成' : '进行中'}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#A093A5]">
                            上次游玩：{session.lastPlayed} · 好感度：{session.affection}
                          </p>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] text-[#6B5B6E]">
                              进度 {session.currentChapter}/{session.totalChapters} 章
                            </span>
                            <span className="text-[12px] text-[#A093A5]">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full accent-gradient"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEnterDrama(session.name)}
                            className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                              accent-gradient hover:brightness-110 transition-all duration-150
                              shadow-sm active:scale-95 flex items-center gap-1.5"
                          >
                            {session.status === 'completed' ? (
                              <>
                                <Sparkles size={14} />
                                重新体验
                              </>
                            ) : (
                              <>
                                <Play size={14} />
                                继续剧情
                              </>
                            )}
                          </button>
                          {session.status === 'completed' && (
                            <span className="flex items-center gap-1 text-[12px] text-green-600">
                              <Check size={14} />
                              已获得 +50 好感度
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
