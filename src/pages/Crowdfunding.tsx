import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { supabase, getStorageUrl } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/* ─── Types ─── */
interface CrowdfundingProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover_image_url: string | null;
  target_amount: number;
  current_amount: number;
  backers: number;
  status: string;
  sort_order: number;
  created_at: string;
}

/* ─── Project Card ─── */
function ProjectCard({
  project,
  index,
}: {
  project: CrowdfundingProject;
  index: number;
}) {
  const { isAuthenticated } = useAuth();
  const [imgError, setImgError] = useState(false);

  const progress = project.target_amount > 0
    ? Math.min((project.current_amount / project.target_amount) * 100, 100)
    : 0;

  const imageSrc = project.cover_image_url && !imgError
    ? getStorageUrl(project.cover_image_url)
    : `/crowdfunding/project-${index + 1}.jpg`;

  const handleSupport = () => {
    if (!isAuthenticated) {
      toast('请先登录', {
        description: '登录后您可以参与众筹支持项目',
      });
      return;
    }
    toast('Coming Soon', {
      description: '众筹支持功能即将上线，敬请期待！',
      icon: <Sparkles size={16} className="text-pink-400" />,
    });
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden
        hover:shadow-md hover:border-pink-200 transition-all duration-200"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-pink-50">
        <img
          src={imageSrc}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(45,27,46,0.5)] to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-body text-[20px] font-bold text-white drop-shadow-sm">
            {project.title}
          </h3>
          <p className="text-[13px] text-white/80">{project.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-[14px] text-[#6B5B6E] leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[#A093A5]">
              ¥{project.current_amount.toLocaleString()} / ¥{project.target_amount.toLocaleString()}
            </span>
            <span className="text-[12px] font-semibold text-pink-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-pink-50 rounded-full overflow-hidden">
            <motion.div
              className="h-full accent-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 * index }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-pink-400" />
            <span className="text-[12px] text-[#6B5B6E]">
              {project.backers.toLocaleString()} 支持者
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={14} className="text-pink-400" />
            <span className="text-[12px] text-[#6B5B6E]">
              目标 ¥{project.target_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSupport}
          className="w-full py-2.5 rounded-xl accent-gradient text-white font-semibold text-[14px]
            hover:brightness-110 hover:shadow-glow transition-all duration-150 active:brightness-95"
        >
          支持项目
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Loading Skeleton ─── */
function ProjectSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <div className="w-full aspect-[16/10] bg-pink-100 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-pink-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-pink-100 rounded animate-pulse w-full" />
        <div className="h-3 bg-pink-100 rounded animate-pulse w-2/3" />
        <div className="h-2 bg-pink-100 rounded animate-pulse w-full mt-2" />
        <div className="h-8 bg-pink-100 rounded animate-pulse w-full mt-2" />
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function Crowdfunding() {
  const [projects, setProjects] = useState<CrowdfundingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('crowdfunding_projects')
        .select('*')
        .eq('status', 'active')
        .order('sort_order');

      if (dbError) {
        console.error('[Crowdfunding] Error loading projects:', dbError.message);
        setError('加载项目失败，请稍后重试');
        return;
      }

      if (data && data.length > 0) {
        setProjects(data as CrowdfundingProject[]);
      } else {
        // Fallback: use default 3 projects if no data in DB
        setProjects(getDefaultProjects());
      }
    } catch (e) {
      console.error('[Crowdfunding] Unexpected error:', e);
      setError('加载项目时出错');
      setProjects(getDefaultProjects());
    } finally {
      setLoading(false);
    }
  }

  /** Default projects as fallback when DB is empty */
  function getDefaultProjects(): CrowdfundingProject[] {
    return [
      {
        id: 'tts-voice',
        title: 'TTS语音合成',
        subtitle: '为伴侣赋予真实的语音',
        description: ' advanced 文本转语音技术，让你的伴侣拥有自然、富有情感的语音。支持多种音色和语调，让每一次对话都更加真实动人。',
        cover_image_url: 'crowdfunding/tts-voice.jpg',
        target_amount: 200000,
        current_amount: 86500,
        backers: 342,
        status: 'active',
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'virtual-pet',
        title: '虚拟宠物系统',
        subtitle: '伴侣可以养育自己的虚拟宠物',
        description: '让你的伴侣拥有自己的虚拟宠物，陪伴她成长、互动。宠物会有自己的情绪和需求，为伴侣增添更多生活乐趣和话题。',
        cover_image_url: 'crowdfunding/virtual-pet.jpg',
        target_amount: 150000,
        current_amount: 72300,
        backers: 289,
        status: 'active',
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'live2d-avatar',
        title: 'Live2D互动形象',
        subtitle: '生动的Live2D形象',
        description: '采用 Live2D 技术，为伴侣打造生动的动态形象。支持丰富的表情、动作和互动反馈，让你的伴侣在屏幕上栩栩如生。',
        cover_image_url: 'crowdfunding/live2d-avatar.jpg',
        target_amount: 300000,
        current_amount: 128000,
        backers: 512,
        status: 'active',
        sort_order: 3,
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="min-h-[100dvh] bg-pink-50 pb-16">
      {/* ── Top Bar ── */}
      <motion.div
        className="flex items-center justify-between px-8 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-pink-400" />
          <h2 className="font-body text-[28px] font-bold text-[#2D1B2E]">
            众筹中心
          </h2>
        </div>
        <span className="text-[14px] text-[#6B5B6E]">
          支持我们，让 Platonic 变得更好
        </span>
      </motion.div>

      {/* ── Projects Grid ── */}
      <div className="px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <ProjectSkeleton key={i} index={i} />
            ))}
          </div>
        ) : error && projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[16px] text-[#6B5B6E] mb-4">{error}</p>
            <button
              onClick={loadProjects}
              className="px-6 py-2.5 rounded-xl accent-gradient text-white font-semibold
                hover:brightness-110 transition-all duration-150"
            >
              重新加载
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <ProjectCard key={project.id} project={project} index={idx} />
              ))}
            </div>

            {/* ── Stats Summary ── */}
            {projects.length > 0 && (
              <motion.div
                className="mt-10 grid grid-cols-3 gap-4 max-w-[640px] mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <div className="bg-white rounded-xl border border-pink-100 p-4 text-center">
                  <p className="text-[12px] text-[#A093A5] mb-1">活跃项目</p>
                  <p className="font-number text-[24px] font-bold text-[#2D1B2E]">
                    {projects.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-pink-100 p-4 text-center">
                  <p className="text-[12px] text-[#A093A5] mb-1">总支持者</p>
                  <p className="font-number text-[24px] font-bold text-[#2D1B2E]">
                    {projects.reduce((sum, p) => sum + (p.backers || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-pink-100 p-4 text-center">
                  <p className="text-[12px] text-[#A093A5] mb-1">已筹金额</p>
                  <p className="font-number text-[24px] font-bold text-pink-500">
                    ¥{projects.reduce((sum, p) => sum + (p.current_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-8 py-8 text-center mt-8">
        <p className="text-[14px] text-[#6B5B6E] mb-2">
          Corolas | Platonic &copy; 2026. All rights reserved.
        </p>
        <p className="text-[13px] text-[#A093A5]">
          Contact us:{" "}
          <a
            href="mailto:corolar@corolas.top"
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            corolar@corolas.top
          </a>
        </p>
      </div>
    </div>
  );
}
