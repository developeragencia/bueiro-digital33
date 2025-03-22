import { useState } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  timestamp: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova integração disponível',
      message: 'A integração com a plataforma XYZ está disponível.',
      type: 'info',
      read: false,
      timestamp: '2024-03-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Campanha finalizada',
      message: 'A campanha "Black Friday 2024" foi finalizada com sucesso.',
      type: 'success',
      read: true,
      timestamp: '2024-03-19T15:30:00Z'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900">Notificações</h2>
          </div>
          <button
            onClick={() => setNotifications([])}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar todas
          </button>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma notificação disponível
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-lg border ${getTypeStyles(notification.type)} ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="mt-1 text-sm">{notification.message}</p>
                    <div className="mt-2 flex items-center text-sm opacity-75">
                      <Clock size={14} className="mr-1" />
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 hover:bg-white rounded-full transition-colors"
                        title="Marcar como lida"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                      title="Remover notificação"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}