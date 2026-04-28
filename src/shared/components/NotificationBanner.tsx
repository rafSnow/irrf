import React from 'react'
import { Info, AlertTriangle, XCircle, CheckCircle2, X } from 'lucide-react'
import type { AppNotification } from '../hooks/useNotifications'
import { cn } from '.'

interface NotificationBannerProps {
  notification: AppNotification
  onClose?: () => void
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onClose,
}) => {
  const icons = {
    info: <Info size={20} className="text-blue-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    success: <CheckCircle2 size={20} className="text-green-500" />,
  }

  const bgColors = {
    info: 'bg-blue-50 border-blue-100',
    warning: 'bg-amber-50 border-amber-100',
    error: 'bg-red-50 border-red-100',
    success: 'bg-green-50 border-green-100',
  }

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 rounded-2xl border animate-in slide-in-from-top-4 duration-300',
        bgColors[notification.type],
      )}
    >
      <div className="mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{notification.message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  )
}
