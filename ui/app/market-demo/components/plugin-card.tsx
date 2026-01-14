'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Plugin, UserPluginInstall } from '../types';
import { Download, Star, Play, Square, Trash2, RefreshCw, ShoppingCart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PluginCardProps {
  plugin: Plugin;
  install?: UserPluginInstall;
  hasPermission?: boolean;
  onInstall?: (plugin: Plugin) => void;
  onUninstall?: (plugin: Plugin) => void;
  onStart?: (plugin: Plugin) => void;
  onStop?: (plugin: Plugin) => void;
  onPurchase?: (plugin: Plugin) => void;
}

const sourceTypeLabels = {
  official: { label: '官方', color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0' },
  enterprise: { label: '企业', color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0' },
  personal: { label: '个人', color: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0' },
};

const certificationIcons = {
  official: '✓',
  enterprise: '★',
  personal: '◆',
};

export function PluginCard({
  plugin,
  install,
  hasPermission = true,
  onInstall,
  onUninstall,
  onStart,
  onStop,
  onPurchase,
}: PluginCardProps) {
  const isInstalled = !!install;
  const isRunning = install?.runStatus === 'running';
  const needPurchase = plugin.priceType === 'paid' && !hasPermission;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 border-border/50">
      {/* 装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <Link href={`/market-demo/plugin/${plugin.id}`} className="block">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* 图标 */}
            <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
              {plugin.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                  {plugin.name}
                </h3>
                <Badge className={`${sourceTypeLabels[plugin.sourceType].color} text-[10px] px-1.5 py-0 h-4`}>
                  {sourceTypeLabels[plugin.sourceType].label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {plugin.description.split('\n')[0]}
              </p>
              
              {/* 分类标签 */}
              <div className="flex flex-wrap gap-1 mt-2">
                {plugin.category.slice(0, 2).map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* 作者和统计 */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                    <img
                      src={plugin.author.avatar}
                      alt={plugin.author.name}
                      className="w-5 h-5 rounded-full ring-1 ring-border"
                    />
                    <span className="truncate max-w-[100px]">{plugin.author.name}</span>
                    <span className="text-[10px] opacity-60">
                      {certificationIcons[plugin.author.certification]}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{plugin.author.certification === 'official' ? '官方认证' : plugin.author.certification === 'enterprise' ? '企业认证' : '个人开发者'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {plugin.downloadCount >= 1000 ? `${(plugin.downloadCount / 1000).toFixed(1)}k` : plugin.downloadCount}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                {plugin.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        {/* 价格 */}
        <div className="text-sm">
          {plugin.priceType === 'free' ? (
            <span className="text-emerald-500 font-medium">免费</span>
          ) : (
            <span className="font-semibold">
              ¥{plugin.price}
              <span className="text-xs text-muted-foreground font-normal">
                /{plugin.priceMode === 'subscription' ? '月' : '永久'}
              </span>
            </span>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isInstalled ? (
            <>
              {isRunning ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        onClick={() => onStop?.(plugin)}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>停止</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => onStart?.(plugin)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>启动</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onUninstall?.(plugin)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>卸载</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : needPurchase ? (
            <Button
              size="sm"
              className="h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={() => onPurchase?.(plugin)}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              购买
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="h-8"
              onClick={() => onInstall?.(plugin)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              安装
            </Button>
          )}
        </div>
      </CardFooter>
      
      {/* 已安装标识 */}
      {isInstalled && (
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${isRunning ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isRunning ? '运行中' : '已停止'}
          </Badge>
        </div>
      )}
    </Card>
  );
}
