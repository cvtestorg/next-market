'use client';

import { PluginCard } from './plugin-card';
import type { Plugin, UserPluginInstall, FilterParams } from '../types';
import { useMemo } from 'react';
import { PackageOpen } from 'lucide-react';

interface PluginGridProps {
  plugins: Plugin[];
  installs: UserPluginInstall[];
  filters: FilterParams;
  onInstall: (plugin: Plugin) => void;
  onUninstall: (plugin: Plugin) => void;
  onStart: (plugin: Plugin) => void;
  onStop: (plugin: Plugin) => void;
  onPurchase: (plugin: Plugin) => void;
}

export function PluginGrid({
  plugins,
  installs,
  filters,
  onInstall,
  onUninstall,
  onStart,
  onStop,
  onPurchase,
}: PluginGridProps) {
  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      // 关键词搜索
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchName = plugin.name.toLowerCase().includes(keyword);
        const matchDesc = plugin.description.toLowerCase().includes(keyword);
        const matchAuthor = plugin.author.name.toLowerCase().includes(keyword);
        if (!matchName && !matchDesc && !matchAuthor) {
          return false;
        }
      }
      
      // 来源筛选
      if (filters.sourceType && filters.sourceType !== 'all') {
        if (plugin.sourceType !== filters.sourceType) {
          return false;
        }
      }
      
      // 付费类型筛选
      if (filters.priceType && filters.priceType !== 'all') {
        if (plugin.priceType !== filters.priceType) {
          return false;
        }
      }
      
      // 分类筛选
      if (filters.category) {
        if (!plugin.category.includes(filters.category)) {
          return false;
        }
      }
      
      return true;
    });
  }, [plugins, filters]);

  if (filteredPlugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <PackageOpen className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">没有找到符合条件的插件</p>
        <p className="text-sm mt-1">尝试调整筛选条件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredPlugins.map((plugin) => {
        const install = installs.find((i) => i.pluginId === plugin.id);
        return (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            install={install}
            onInstall={onInstall}
            onUninstall={onUninstall}
            onStart={onStart}
            onStop={onStop}
            onPurchase={onPurchase}
          />
        );
      })}
    </div>
  );
}
