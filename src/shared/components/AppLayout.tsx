import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  WifiOff,
  HelpCircle,
} from 'lucide-react'
import { useNetwork } from '../hooks'
import { cn } from '.'

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({
  to,
  icon,
  label,
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-4 py-3 rounded-xl transition-all',
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'text-gray-500 hover:bg-gray-100',
      )
    }
  >
    {icon}
    <span className="text-[10px] md:text-sm font-semibold">{label}</span>
  </NavLink>
)

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline } = useNetwork()

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 space-y-8">
        <div className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Guardião Fiscal</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/documentos" icon={<FileText size={20} />} label="Documentos" />
          <NavItem to="/checklist" icon={<CheckSquare size={20} />} label="Checklist" />
          <NavItem to="/configuracoes" icon={<Settings size={20} />} label="Configurações" />
          <NavItem to="/ajuda" icon={<HelpCircle size={20} />} label="Ajuda" />
        </nav>

        {!isOnline && (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <WifiOff size={18} />
            <span className="text-sm font-medium">Modo Offline</span>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-40">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Início" />
        <NavItem to="/documentos" icon={<FileText size={20} />} label="Docs" />
        <NavItem to="/checklist" icon={<CheckSquare size={20} />} label="Check" />
        <NavItem to="/configuracoes" icon={<Settings size={20} />} label="Ajustes" />
        <NavItem to="/ajuda" icon={<HelpCircle size={20} />} label="Ajuda" />
      </nav>

      {!isOnline && (
        <div className="md:hidden fixed top-4 right-4 z-50 bg-amber-500 text-white p-2 rounded-full shadow-lg">
          <WifiOff size={20} />
        </div>
      )}
    </div>
  )
}
