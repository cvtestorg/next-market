'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { plugins, userInstalls as initialInstalls, permissionRequests, purchaseRecords } from '../data/mock-data';
import type { Plugin, UserPluginInstall, PermissionRequest, PurchaseRecord } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ConfirmDialog, PermissionRequestDialog } from '../components/dialogs';
import {
  Search,
  Play,
  Square,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Package,
  FileCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Settings,
} from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const statusLabels = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
};

export default function MyPluginsPage() {
  const [installs, setInstalls] = useState<UserPluginInstall[]>(initialInstalls);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('installed');
  
  // 对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestPlugin, setRequestPlugin] = useState<Plugin | null>(null);

  // 已安装的插件列表
  const installedPlugins = useMemo(() => {
    return installs
      .map((install) => {
        const plugin = plugins.find((p) => p.id === install.pluginId);
        if (!plugin) return null;
        return { ...plugin, install };
      })
      .filter(Boolean)
      .filter((p) => {
        if (!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase();
        return (
          p!.name.toLowerCase().includes(keyword) ||
          p!.description.toLowerCase().includes(keyword)
        );
      });
  }, [installs, searchKeyword]);

  // 我的权限申请
  const myRequests = useMemo(() => {
    return permissionRequests.filter((r) => r.userId === 'user-1' || true); // 显示所有演示数据
  }, []);

  // 我的购买记录
  const myPurchases = useMemo(() => purchaseRecords, []);

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

  // 启动/停止插件
  const handleToggleStatus = useCallback((plugin: Plugin, currentStatus: 'running' | 'stopped') => {
    setInstalls((prev) =>
      prev.map((i) =>
        i.pluginId === plugin.id
          ? { ...i, runStatus: currentStatus === 'running' ? 'stopped' : 'running' }
          : i
      )
    );
    toast.success(
      currentStatus === 'running' ? `「${plugin.name}」已停止` : `「${plugin.name}」已启动`
    );
  }, []);

  // 更新插件
  const handleUpdate = useCallback((plugin: Plugin) => {
    toast.success(`「${plugin.name}」更新成功`, {
      description: `已更新至 v${plugin.currentVersion}`,
    });
  }, []);

  // 提交权限申请
  const handleSubmitRequest = useCallback((reason: string) => {
    if (requestPlugin) {
      toast.success('申请已提交', {
        description: '请等待管理员审核',
      });
      setRequestDialogOpen(false);
      setRequestPlugin(null);
    }
  }, [requestPlugin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-center" richColors />
      
      {/* 页面头部 */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-2">我的插件</h1>
          <p className="text-muted-foreground">管理已安装的插件、查看权限申请和购买记录</p>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-12 bg-muted/50 p-1 mb-6">
            <TabsTrigger value="installed" className="gap-2 data-[state=active]:bg-background">
              <Package className="w-4 h-4" />
              已安装 ({installedPlugins.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-background">
              <FileCheck className="w-4 h-4" />
              权限申请 ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2 data-[state=active]:bg-background">
              <CreditCard className="w-4 h-4" />
              购买记录 ({myPurchases.length})
            </TabsTrigger>
          </TabsList>
          
          {/* 已安装插件 */}
          <TabsContent value="installed">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>已安装插件</CardTitle>
                    <CardDescription>管理您当前已安装的插件</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索已安装插件..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {installedPlugins.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无已安装的插件</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/market-demo">去市场安装</Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件</TableHead>
                        <TableHead>版本</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>安装时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installedPlugins.map((item) => {
                        if (!item) return null;
                        const plugin = item as Plugin & { install: UserPluginInstall };
                        const isRunning = plugin.install.runStatus === 'running';
                        
                        return (
                          <TableRow key={plugin.id}>
                            <TableCell>
                              <Link
                                href={`/market-demo/plugin/${plugin.id}`}
                                className="flex items-center gap-3 hover:opacity-80"
                              >
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                  {plugin.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{plugin.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {plugin.author.name}
                                  </p>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">v{plugin.currentVersion}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  isRunning
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-muted text-muted-foreground'
                                }
                              >
                                {isRunning ? '运行中' : '已停止'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(plugin.install.installedAt).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleStatus(plugin, plugin.install.runStatus)
                                    }
                                  >
                                    {isRunning ? (
                                      <>
                                        <Square className="w-4 h-4 mr-2" />
                                        停止
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        启动
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdate(plugin)}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    更新
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/market-demo/plugin/${plugin.id}`}>
                                      <Settings className="w-4 h-4 mr-2" />
                                      配置
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUninstall(plugin)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    卸载
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 权限申请 */}
          <TabsContent value="requests">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>权限申请记录</CardTitle>
                <CardDescription>查看您提交的插件使用权限申请</CardDescription>
              </CardHeader>
              <CardContent>
                {myRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无权限申请记录</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件</TableHead>
                        <TableHead>申请理由</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>申请时间</TableHead>
                        <TableHead>审核时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.map((request) => {
                        const StatusIcon = statusIcons[request.status];
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                  {request.pluginIcon}
                                </div>
                                <span className="font-medium">{request.pluginName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                                {request.reason}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[request.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusLabels[request.status]}
                              </Badge>
                              {request.status === 'rejected' && request.rejectReason && (
                                <p className="text-xs text-destructive mt-1">
                                  原因: {request.rejectReason}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {request.reviewedAt
                                ? new Date(request.reviewedAt).toLocaleDateString('zh-CN')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 购买记录 */}
          <TabsContent value="purchases">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>购买记录</CardTitle>
                <CardDescription>查看您的插件购买历史</CardDescription>
              </CardHeader>
              <CardContent>
                {myPurchases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无购买记录</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/market-demo">去市场看看</Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>购买时间</TableHead>
                        <TableHead>到期时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                {purchase.pluginIcon}
                              </div>
                              <span className="font-medium">{purchase.pluginName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">¥{purchase.amount}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {purchase.priceMode === 'subscription' ? '订阅' : '永久'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(purchase.purchasedAt).toLocaleDateString('zh-CN')}
                          </TableCell>
                          <TableCell>
                            {purchase.expireAt ? (
                              <span
                                className={
                                  new Date(purchase.expireAt) < new Date()
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }
                              >
                                {new Date(purchase.expireAt).toLocaleDateString('zh-CN')}
                              </span>
                            ) : (
                              <span className="text-emerald-500">永久有效</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {purchase.priceMode === 'subscription' &&
                              purchase.expireAt &&
                              new Date(purchase.expireAt) > new Date() && (
                                <Button variant="outline" size="sm">
                                  续费
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 对话框 */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
      
      <PermissionRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        plugin={requestPlugin}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}
