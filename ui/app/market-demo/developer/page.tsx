'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { myUploadedPlugins, pendingPlugins, plugins } from '../data/mock-data';
import type { Plugin, AuditStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/dialogs';
import {
  Plus,
  Upload,
  Package,
  BarChart3,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Download,
  Star,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileUp,
} from 'lucide-react';

const auditStatusConfig: Record<AuditStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: '审核中', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  approved: { label: '已上架', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: '被拒绝', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  removed: { label: '已下架', color: 'bg-muted text-muted-foreground', icon: AlertCircle },
};

// 上传新插件对话框
function UploadPluginDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    priceType: 'free',
    price: '',
    priceMode: 'one-time',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('请填写必填项');
      return;
    }
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      category: '',
      priceType: 'free',
      price: '',
      priceMode: 'one-time',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            上传新插件
          </DialogTitle>
          <DialogDescription>
            填写插件信息并上传插件包，提交后将进入审核流程
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="name">插件名称 *</Label>
            <Input
              id="name"
              placeholder="输入插件名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">插件描述 *</Label>
            <Textarea
              id="description"
              placeholder="详细描述插件的功能和特点..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">插件分类 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="效率工具">效率工具</SelectItem>
                <SelectItem value="开发工具">开发工具</SelectItem>
                <SelectItem value="AI 工具">AI 工具</SelectItem>
                <SelectItem value="数据分析">数据分析</SelectItem>
                <SelectItem value="团队协作">团队协作</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>付费类型</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceType"
                  value="free"
                  checked={formData.priceType === 'free'}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  className="accent-primary"
                />
                <span>免费</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceType"
                  value="paid"
                  checked={formData.priceType === 'paid'}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  className="accent-primary"
                />
                <span>付费</span>
              </label>
            </div>
          </div>

          {formData.priceType === 'paid' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">价格 (¥)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceMode">收费模式</Label>
                <Select
                  value={formData.priceMode}
                  onValueChange={(value) => setFormData({ ...formData, priceMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">一次性购买</SelectItem>
                    <SelectItem value="subscription">按月订阅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>插件包</Label>
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                拖放插件包到此处，或点击选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持 .zip 格式，最大 50MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>提交审核</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 发布新版本对话框
function PublishVersionDialog({
  open,
  onOpenChange,
  plugin,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  onSubmit: (version: string, changelog: string) => void;
}) {
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');

  if (!plugin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>发布新版本</DialogTitle>
          <DialogDescription>
            为「{plugin.name}」发布新版本
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-3xl">{plugin.icon}</div>
            <div>
              <p className="font-medium">{plugin.name}</p>
              <p className="text-sm text-muted-foreground">
                当前版本: v{plugin.currentVersion}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">新版本号 *</Label>
            <Input
              id="version"
              placeholder="例如: 1.3.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="changelog">更新日志 *</Label>
            <Textarea
              id="changelog"
              placeholder="描述本次更新的内容..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>新版本包</Label>
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                点击上传新版本包
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSubmit(version, changelog);
              setVersion('');
              setChangelog('');
            }}
            disabled={!version || !changelog}
          >
            发布版本
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 价格设置对话框
function PriceSettingDialog({
  open,
  onOpenChange,
  plugin,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  onSubmit: (price: number, mode: 'one-time' | 'subscription') => void;
}) {
  const [price, setPrice] = useState(plugin?.price?.toString() || '');
  const [mode, setMode] = useState<'one-time' | 'subscription'>(plugin?.priceMode || 'one-time');

  if (!plugin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            价格设置
          </DialogTitle>
          <DialogDescription>
            设置「{plugin.name}」的价格
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">价格 (¥)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>收费模式</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'one-time' | 'subscription')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">一次性购买</SelectItem>
                <SelectItem value="subscription">按月订阅</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onSubmit(Number(price), mode)}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('plugins');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  // 合并已上架和待审核的插件
  const allMyPlugins = useMemo(() => {
    return [...myUploadedPlugins, ...pendingPlugins];
  }, []);

  // 统计数据
  const stats = useMemo(() => {
    const approvedPlugins = allMyPlugins.filter((p) => p.status === 'approved');
    return {
      total: allMyPlugins.length,
      approved: approvedPlugins.length,
      pending: allMyPlugins.filter((p) => p.status === 'pending').length,
      downloads: approvedPlugins.reduce((sum, p) => sum + p.downloadCount, 0),
      revenue: approvedPlugins
        .filter((p) => p.priceType === 'paid')
        .reduce((sum, p) => sum + (p.price || 0) * Math.floor(p.downloadCount * 0.3), 0),
    };
  }, [allMyPlugins]);

  // 上传新插件
  const handleUploadPlugin = useCallback((data: any) => {
    toast.success('插件提交成功', {
      description: '请等待平台审核',
    });
    setUploadDialogOpen(false);
  }, []);

  // 发布新版本
  const handlePublishVersion = useCallback((version: string, changelog: string) => {
    toast.success(`版本 v${version} 发布成功`);
    setPublishDialogOpen(false);
    setSelectedPlugin(null);
  }, []);

  // 设置价格
  const handleSetPrice = useCallback((price: number, mode: 'one-time' | 'subscription') => {
    toast.success('价格设置成功');
    setPriceDialogOpen(false);
    setSelectedPlugin(null);
  }, []);

  // 删除插件
  const handleDeletePlugin = useCallback((plugin: Plugin) => {
    setConfirmDialog({
      open: true,
      title: '确认删除',
      description: `确定要删除「${plugin.name}」吗？此操作不可恢复。`,
      variant: 'destructive',
      onConfirm: () => {
        toast.success(`「${plugin.name}」已删除`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

  // 下架插件
  const handleRemovePlugin = useCallback((plugin: Plugin) => {
    setConfirmDialog({
      open: true,
      title: '确认下架',
      description: `确定要下架「${plugin.name}」吗？下架后用户将无法安装此插件。`,
      onConfirm: () => {
        toast.success(`「${plugin.name}」已下架`);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-center" richColors />

      {/* 页面头部 */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">开发者中心</h1>
              <p className="text-muted-foreground">管理您上传的插件和版本</p>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              上传新插件
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">全部插件</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">已上架</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.downloads.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">总下载</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">¥{stats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">预估收入</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-12 bg-muted/50 p-1 mb-6">
            <TabsTrigger value="plugins" className="gap-2 data-[state=active]:bg-background">
              <Package className="w-4 h-4" />
              我的插件
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-background">
              <BarChart3 className="w-4 h-4" />
              数据统计
            </TabsTrigger>
          </TabsList>

          {/* 我的插件 */}
          <TabsContent value="plugins">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>我的插件</CardTitle>
                <CardDescription>管理您上传的所有插件</CardDescription>
              </CardHeader>
              <CardContent>
                {allMyPlugins.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>您还没有上传过插件</p>
                    <Button
                      variant="link"
                      onClick={() => setUploadDialogOpen(true)}
                      className="mt-2"
                    >
                      上传第一个插件
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件</TableHead>
                        <TableHead>版本</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>下载</TableHead>
                        <TableHead>评分</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allMyPlugins.map((plugin) => {
                        const statusConfig = auditStatusConfig[plugin.status];
                        const StatusIcon = statusConfig.icon;
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
                                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                    {plugin.description.split('\n')[0]}
                                  </p>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">v{plugin.currentVersion}</Badge>
                            </TableCell>
                            <TableCell>
                              {plugin.priceType === 'free' ? (
                                <span className="text-emerald-500">免费</span>
                              ) : (
                                <span>¥{plugin.price}</span>
                              )}
                            </TableCell>
                            <TableCell>{plugin.downloadCount.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {plugin.rating.toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/market-demo/plugin/${plugin.id}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      查看详情
                                    </Link>
                                  </DropdownMenuItem>
                                  {plugin.status === 'approved' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPlugin(plugin);
                                          setPublishDialogOpen(true);
                                        }}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        发布新版本
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPlugin(plugin);
                                          setPriceDialogOpen(true);
                                        }}
                                      >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        价格设置
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleRemovePlugin(plugin)}
                                        className="text-amber-500 focus:text-amber-500"
                                      >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        下架插件
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePlugin(plugin)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除插件
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

          {/* 数据统计 */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    下载趋势
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">图表数据加载中...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    用户分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">图表数据加载中...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    收入统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-emerald-500">
                        ¥{stats.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">总收入</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-blue-500">
                        ¥{Math.floor(stats.revenue * 0.3).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">本月收入</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-purple-500">
                        {allMyPlugins.filter((p) => p.priceType === 'paid').length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">付费插件</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 对话框 */}
      <UploadPluginDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUploadPlugin}
      />

      <PublishVersionDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        plugin={selectedPlugin}
        onSubmit={handlePublishVersion}
      />

      <PriceSettingDialog
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        plugin={selectedPlugin}
        onSubmit={handleSetPrice}
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
