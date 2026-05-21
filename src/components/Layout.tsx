import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarRoutes = [
  '/dashboard',
  '/plaza',
  '/chat',
  '/memory',
  '/drama',
  '/settings',
  '/payment',
  '/crowdfunding',
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const showSidebar = sidebarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-pink-50">
      {showSidebar && <Navbar />}
      <div
        className={`
          min-h-screen transition-all duration-300
          ${showSidebar ? 'ml-[220px]' : ''}
        `}
      >
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
