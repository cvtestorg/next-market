'use client';

import { useState, useCallback } from 'react';
import { SearchFilter } from './components/search-filter';
import { PluginGrid } from './components/plugin-grid';
import { PurchaseDialog, ConfirmDialog } from './components/dialogs';
import { plugins, userInstalls as initialInstalls } from './data/mock-data';
import type { FilterParams, Plugin, UserPluginInstall } from './types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function MarketPage() {
  const [filters, setFilters] = useState<FilterParams>({
    keyword: '',
    sourceType: 'all',
    priceType: 'all',
  });
  
  const [installs, setInstalls] = useState<UserPluginInstall[]>(initialInstalls);
  
  // 对话框状态
  const [purchasePlugin, setPurchasePlugin] = useState<Plugin | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  // 安装插件
  const handleInstall = useCallback((plugin: Plugin) => {
    const newInstall: UserPluginInstall = {
      id: `install-${Date.now()}`,
      userId: 'user-1',
      pluginId: plugin.id,
      versionId: plugin.versions[plugin.versions.length - 1]?.id || '',
      runStatus: 'running',
      installedAt: new Date().toISOString(),
    };
    setInstalls((prev) => [...prev, newInstall]);
    toast.success(`「${plugin.name}」安装成功`, {
      description: '插件已启动运行',
    });
  }, []);

  // 卸载插件
  const handleUninstall = useCallback((plugin: Plugin) => {
    setConfirmDialog({
      open: true,
      title: '确认卸载',
      description: `确定要卸载「${plugin.name}」吗？卸载后需要重新安装才能使用。`,
      variant: 'destructive',
      onConfirm: () => {
        setInstalls((prev) => prev.filter((i) => i.pluginId !== plugin.id));
        toast.success(`「${plugin.name}」已卸载`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

  // 启动插件
  const handleStart = useCallback((plugin: Plugin) => {
    setInstalls((prev) =>
      prev.map((i) =>
        i.pluginId === plugin.id ? { ...i, runStatus: 'running' } : i
      )
    );
    toast.success(`「${plugin.name}」已启动`);
  }, []);

  // 停止插件
  const handleStop = useCallback((plugin: Plugin) => {
    setInstalls((prev) =>
      prev.map((i) =>
        i.pluginId === plugin.id ? { ...i, runStatus: 'stopped' } : i
      )
    );
    toast.info(`「${plugin.name}」已停止`);
  }, []);

  // 购买插件
  const handlePurchase = useCallback((plugin: Plugin) => {
    setPurchasePlugin(plugin);
  }, []);

  const handlePurchaseConfirm = useCallback(() => {
    if (purchasePlugin) {
      toast.success(`「${purchasePlugin.name}」购买成功`, {
        description: '您现在可以安装使用此插件',
      });
      setPurchasePlugin(null);
    }
  }, [purchasePlugin]);

  // 统计数据
  const stats = {
    total: plugins.length,
    free: plugins.filter((p) => p.priceType === 'free').length,
    installed: installs.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-center" richColors />
      
      {/* Hero 区域 */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-6 py-12 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                插件市场
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              发现优质插件，提升工作效率。支持官方、企业、个人开发者发布的各类插件。
            </p>
            
            {/* 统计卡片 */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">全部插件</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.free}</p>
                  <p className="text-xs text-muted-foreground">免费插件</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.installed}</p>
                  <p className="text-xs text-muted-foreground">已安装</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="container mx-auto px-6 py-8">
        {/* 搜索筛选 */}
        <div className="mb-8">
          <SearchFilter filters={filters} onFilterChange={setFilters} />
        </div>
        
        {/* 插件网格 */}
        <PluginGrid
          plugins={plugins}
          installs={installs}
          filters={filters}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
          onStart={handleStart}
          onStop={handleStop}
          onPurchase={handlePurchase}
        />
      </div>
      
      {/* 对话框 */}
      <PurchaseDialog
        open={!!purchasePlugin}
        onOpenChange={(open) => !open && setPurchasePlugin(null)}
        plugin={purchasePlugin}
        onConfirm={handlePurchaseConfirm}
      />
      
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
