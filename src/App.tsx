/**
 * App.tsx - Root Application Component
 *
 * Wraps the entire application with AuthProvider and defines all routes.
 * Includes route guards for authenticated pages and companion-required pages.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Plaza from './pages/Plaza'
import Customize from './pages/Customize'
import Chat from './pages/Chat'
import Memory from './pages/Memory'
import Drama from './pages/Drama'
import Payment from './pages/Payment'
import Settings from './pages/Settings'
import Crowdfunding from './pages/Crowdfunding'
import { Spinner } from './components/ui/spinner'

/**
 * ProtectedRoute - Redirects unauthenticated users to /auth.
 * Shows a loading spinner while auth state is being determined.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900">
        <Spinner className="w-12 h-12 text-pink-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

/**
 * CompanionRoute - Redirects authenticated users without a companion to /plaza.
 * Also acts as a protected route (redirects unauthenticated users to /auth).
 */
function CompanionRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasCompanion, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900">
        <Spinner className="w-12 h-12 text-pink-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (!hasCompanion) {
    return <Navigate to="/plaza" replace />
  }

  return <>{children}</>
}

/** AuthRoute - Redirects already authenticated users to dashboard. */
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900">
        <Spinner className="w-12 h-12 text-pink-400" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />

          {/* Protected routes - require authentication */}
          <Route path="/plaza" element={<ProtectedRoute><Plaza /></ProtectedRoute>} />
          <Route path="/customize" element={<ProtectedRoute><Customize /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/crowdfunding" element={<ProtectedRoute><Crowdfunding /></ProtectedRoute>} />

          {/* Companion routes - require both authentication AND a companion */}
          <Route path="/dashboard" element={<CompanionRoute><Dashboard /></CompanionRoute>} />
          <Route path="/chat" element={<CompanionRoute><Chat /></CompanionRoute>} />
          <Route path="/memory" element={<CompanionRoute><Memory /></CompanionRoute>} />
          <Route path="/drama" element={<CompanionRoute><Drama /></CompanionRoute>} />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

/** Simple Privacy Policy placeholder page */
function PrivacyPage() {
  return (
    <div className="ml-[220px] p-8 max-w-[800px]">
      <h1 className="font-body text-[28px] font-bold text-[#2D1B2E] mb-4">隐私政策</h1>
      <div className="space-y-4 text-[14px] text-[#6B5B6E] font-body leading-relaxed">
        <p>最后更新日期：2026年1月1日</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">1. 数据收集</h2>
        <p>我们仅收集为您提供服务所必需的最少信息，包括：账号信息（邮箱、用户名）、伴侣配置和对话记录、使用统计数据（用于改善服务）。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">2. 数据存储</h2>
        <p>您的对话数据存储在安全的云端服务器上。敏感信息采用加密存储。您随时可以导出或删除自己的数据。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">3. 数据使用</h2>
        <p>我们不会将您的个人数据出售给第三方。不会使用您的对话内容训练AI模型（除非您明确同意）。仅用于提供服务和技术支持。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">4. 您的权利</h2>
        <p>您拥有访问权、更正权、删除权和导出权。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">5. 联系方式</h2>
        <p>如有隐私相关问题，请联系：corolar@corolas.top</p>
      </div>
    </div>
  )
}

/** Simple Terms of Service placeholder page */
function TermsPage() {
  return (
    <div className="ml-[220px] p-8 max-w-[800px]">
      <h1 className="font-body text-[28px] font-bold text-[#2D1B2E] mb-4">服务条款</h1>
      <div className="space-y-4 text-[14px] text-[#6B5B6E] font-body leading-relaxed">
        <p>最后更新日期：2026年1月1日</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">1. 服务说明</h2>
        <p>Corolas | Platonic 是一款AI虚拟伴侣应用，旨在为用户提供情感陪伴和互动体验。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">2. 使用规则</h2>
        <p>用户需年满13周岁。禁止用于违法、欺诈或骚扰目的。禁止尝试破解、逆向工程或干扰服务正常运行。用户对自己的账号行为负责。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">3. 内容政策</h2>
        <p>禁止生成或传播违法、暴力、仇恨言论。禁止上传侵犯他人知识产权的内容。我们保留删除违规内容的权利。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">4. 免责声明</h2>
        <p>AI伴侣的回复由算法生成，不构成专业建议。服务按"现状"提供，不作任何明示或暗示的担保。</p>
        <h2 className="font-semibold text-[#2D1B2E] mt-4">5. 联系我们</h2>
        <p>如有任何问题，请联系：corolar@corolas.top</p>
      </div>
    </div>
  )
}
