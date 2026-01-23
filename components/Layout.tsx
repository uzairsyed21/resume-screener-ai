
import React, { useState } from 'react';
import { AppView, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onViewChange: (view: AppView) => void;
  currentView: AppView;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onViewChange, currentView, notifications, onMarkRead }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('setup')}>
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Screen<span className="text-indigo-600">AI</span>
              </span>
            </div>
            
            <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-[0.15em]">
              <button 
                onClick={() => onViewChange('setup')} 
                className={`transition-all py-5 border-b-2 ${currentView === 'setup' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Setup
              </button>
              <button 
                onClick={() => onViewChange('results')} 
                className={`transition-all py-5 border-b-2 ${currentView === 'results' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => onViewChange('analytics')} 
                className={`transition-all py-5 border-b-2 ${currentView === 'analytics' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => onViewChange('workspace')} 
                className={`transition-all py-5 border-b-2 ${currentView === 'workspace' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                Workspace
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors relative"
                >
                  <i className="fas fa-bell text-xl"></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 z-[60]">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <i className="fas fa-bell-slash text-slate-100 text-4xl mb-3"></i>
                          <p className="text-xs font-bold text-slate-400">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { onMarkRead(n.id); setShowNotifications(false); }}
                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-4 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                              n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                              <i className={`fas text-xs ${n.type === 'success' ? 'fa-check' : 'fa-info'}`}></i>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{n.title}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[9px] font-bold text-slate-300 uppercase mt-1 block">{n.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100 group cursor-pointer" onClick={() => onViewChange('workspace')}>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pro</p>
                  <p className="text-sm font-bold text-slate-800">Admin</p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center text-xs font-black text-white group-hover:bg-indigo-600 transition-colors shadow-lg">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} ScreenAI Talent Intelligence. Powered by <span className="text-indigo-600">uzair</span>.
      </footer>
    </div>
  );
};

export default Layout;
