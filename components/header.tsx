
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, HelpCircle, Menu, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { dataSyncManager } from '@/lib/data-sync';
import { SyncStatus } from '@/lib/types';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'informe', label: 'Informe', icon: '📋' },
  { id: 'analytics', label: 'Análisis', icon: '📈' },
  { id: 'tools', label: 'Herramientas', icon: '🛠️' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' }
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: null,
    hasPendingChanges: false,
    conflictResolution: 'server-wins'
  });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Subscribe to sync status changes
    const unsubscribe = dataSyncManager.onSyncStatusChange(setSyncStatus);
    
    return unsubscribe;
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSync = async () => {
    try {
      await dataSyncManager.syncToCloud();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'Sin conexión';
    if (syncStatus.hasPendingChanges) return 'Sincronizando...';
    if (syncStatus.lastSync) {
      const timeDiff = Date.now() - syncStatus.lastSync.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      if (minutes < 1) return 'Sincronizado';
      if (minutes < 60) return `Sincronizado hace ${minutes}m`;
      const hours = Math.floor(minutes / 60);
      return `Sincronizado hace ${hours}h`;
    }
    return 'Sin sincronizar';
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-opacity-20">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">🩰</div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text">
                Panel Elite - Celeste
              </h1>
              <div className="text-xs text-amber-600 font-medium">
                Ballet Folklórico Argentino
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-48 pl-10 py-2 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Sync Status */}
            <div 
              className={`sync-indicator ${syncStatus.isOnline ? (syncStatus.hasPendingChanges ? 'syncing' : 'online') : 'offline'}`}
              title={getSyncStatusText()}
            >
              {syncStatus.isOnline ? (
                syncStatus.hasPendingChanges ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{getSyncStatusText()}</span>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={handleSync}
              className="btn btn-ghost p-2"
              title="Sincronizar manualmente"
              disabled={!syncStatus.isOnline || syncStatus.hasPendingChanges}
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.hasPendingChanges ? 'animate-spin' : ''}`} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="theme-toggle"
              title="Cambiar tema"
              aria-label="Toggle theme"
            />

            {/* PWA Install Button */}
            <button
              id="pwa-install"
              className="btn btn-secondary p-2 hidden"
              title="Instalar aplicación"
            >
              📱
            </button>

            {/* Help Button */}
            <button className="btn btn-secondary p-2" title="Ayuda">
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden btn btn-ghost p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-opacity-20">
            <div className="flex flex-col gap-2 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-tab text-left ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile Search */}
            <div className="relative mt-4 sm:hidden">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-10 py-2 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
