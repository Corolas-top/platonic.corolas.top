import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plaza" element={<Plaza />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/drama" element={<Drama />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/crowdfunding" element={<Crowdfunding />} />
      </Routes>
    </Layout>
  )
}
