'use client';

import { useState, useMemo, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { plugins, userInstalls as initialInstalls, userConfigs as initialUserConfigs, orgConfigs as initialOrgConfigs, userPluginPermissions as initialPermissions, currentUserPermissionRequests as initialMyRequests } from '../../data/mock-data';
import type { Plugin, UserPluginInstall, ConfigSchema, UserPluginConfig, OrgPluginConfig, UserPluginPermission, PermissionRequest } from '../../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PurchaseDialog, ConfirmDialog, PermissionRequestDialog } from '../../components/dialogs';
import {
  ArrowLeft,
  Download,
  Star,
  Play,
  Square,
  Trash2,
  RefreshCw,
  ShoppingCart,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Settings,
  FileText,
  History,
  ExternalLink,
  Copy,
  Save,
  Shield,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

const sourceTypeLabels = {
  official: { label: '官方', color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0' },
  enterprise: { label: '企业', color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0' },
  personal: { label: '个人', color: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0' },
};

const certificationLabels = {
  official: '官方认证',
  enterprise: '企业认证',
  personal: '个人开发者',
};

// 配置项渲染组件
function ConfigField({
  schema,
  value,
  onChange,
}: {
  schema: ConfigSchema;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (schema.type) {
    case 'text':
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.example || `请输入${schema.name}`}
        />
      );
    case 'password':
      return (
        <Input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.example || `请输入${schema.name}`}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.example || `请输入${schema.name}`}
        />
      );
    case 'boolean':
      return (
        <Switch
          checked={value === 'true'}
          onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
        />
      );
    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`请选择${schema.name}`} />
          </SelectTrigger>
          <SelectContent>
            {schema.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'multiselect':
      const selectedValues = value ? JSON.parse(value) : [];
      return (
        <div className="space-y-2">
          {schema.options?.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${schema.key}-${opt.value}`}
                checked={selectedValues.includes(opt.value)}
                onCheckedChange={(checked) => {
                  const newValues = checked
                    ? [...selectedValues, opt.value]
                    : selectedValues.filter((v: string) => v !== opt.value);
                  onChange(JSON.stringify(newValues));
                }}
              />
              <label
                htmlFor={`${schema.key}-${opt.value}`}
                className="text-sm cursor-pointer"
              >
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`请输入${schema.name}`}
        />
      );
  }
}

export default function PluginDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const plugin = useMemo(() => plugins.find((p) => p.id === id), [id]);
  
  const [installs, setInstalls] = useState<UserPluginInstall[]>(initialInstalls);
  const [userConfigs, setUserConfigs] = useState<UserPluginConfig[]>(initialUserConfigs);
  const [orgConfigs, setOrgConfigs] = useState<OrgPluginConfig[]>(initialOrgConfigs);
  const [permissions, setPermissions] = useState<UserPluginPermission[]>(initialPermissions);
  const [myRequests, setMyRequests] = useState<PermissionRequest[]>(initialMyRequests);
  
  const install = useMemo(
    () => installs.find((i) => i.pluginId === id),
    [installs, id]
  );
  
  const isInstalled = !!install;
  const isRunning = install?.runStatus === 'running';
  
  // 企业插件权限检查
  const isEnterprisePlugin = plugin?.sourceType === 'enterprise';
  const userPermission = useMemo(
    () => permissions.find((p) => p.pluginId === id),
    [permissions, id]
  );
  const pendingRequest = useMemo(
    () => myRequests.find((r) => r.pluginId === id && r.status === 'pending'),
    [myRequests, id]
  );
  const rejectedRequest = useMemo(
    () => myRequests.find((r) => r.pluginId === id && r.status === 'rejected'),
    [myRequests, id]
  );
  
  // 判断用户是否有权限使用企业插件
  const hasEnterprisePermission = !isEnterprisePlugin || !!userPermission;
  // 是否正在等待审批
  const isWaitingApproval = isEnterprisePlugin && !userPermission && !!pendingRequest;
  // 是否被拒绝（没有待审批请求，但有被拒绝的请求）
  const wasRejected = isEnterprisePlugin && !userPermission && !pendingRequest && !!rejectedRequest;
  // 是否需要申请权限（首次申请，没有任何请求记录）
  const needsPermissionRequest = isEnterprisePlugin && !userPermission && !pendingRequest && !rejectedRequest;
  
  // 对话框状态
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [permissionRequestOpen, setPermissionRequestOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  // 获取配置值
  const getConfigValue = useCallback(
    (schema: ConfigSchema) => {
      if (schema.configType === 'enterprise') {
        const config = orgConfigs.find(
          (c) => c.pluginId === id && c.configKey === schema.key
        );
        return config?.configValue || schema.defaultValue || '';
      } else {
        const config = userConfigs.find(
          (c) => c.pluginId === id && c.configKey === schema.key
        );
        return config?.configValue || schema.defaultValue || '';
      }
    },
    [id, orgConfigs, userConfigs]
  );

  // 更新配置值
  const updateConfigValue = useCallback(
    (schema: ConfigSchema, value: string) => {
      if (schema.configType === 'enterprise') {
        setOrgConfigs((prev) => {
          const existingIndex = prev.findIndex(
            (c) => c.pluginId === id && c.configKey === schema.key
          );
          if (existingIndex >= 0) {
            const newConfigs = [...prev];
            newConfigs[existingIndex] = { ...newConfigs[existingIndex], configValue: value };
            return newConfigs;
          } else {
            return [
              ...prev,
              {
                id: `org-config-${Date.now()}`,
                orgId: 'org-1',
                pluginId: id,
                configKey: schema.key,
                configValue: value,
              },
            ];
          }
        });
      } else {
        setUserConfigs((prev) => {
          const existingIndex = prev.findIndex(
            (c) => c.pluginId === id && c.configKey === schema.key
          );
          if (existingIndex >= 0) {
            const newConfigs = [...prev];
            newConfigs[existingIndex] = { ...newConfigs[existingIndex], configValue: value };
            return newConfigs;
          } else {
            return [
              ...prev,
              {
                id: `user-config-${Date.now()}`,
                userId: 'user-1',
                pluginId: id,
                configKey: schema.key,
                configValue: value,
              },
            ];
          }
        });
      }
    },
    [id]
  );

  // 保存配置
  const handleSaveConfig = useCallback((configType: 'enterprise' | 'personal') => {
    toast.success(`${configType === 'enterprise' ? '企业' : '个人'}配置保存成功`);
  }, []);

  // 安装插件
  const handleInstall = useCallback(() => {
    if (!plugin) return;
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
  }, [plugin]);

  // 卸载插件
  const handleUninstall = useCallback(() => {
    if (!plugin) return;
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
  }, [plugin]);

  // 启动/停止插件
  const handleToggleStatus = useCallback(() => {
    if (!plugin) return;
    setInstalls((prev) =>
      prev.map((i) =>
        i.pluginId === plugin.id
          ? { ...i, runStatus: i.runStatus === 'running' ? 'stopped' : 'running' }
          : i
      )
    );
    toast.success(isRunning ? `「${plugin.name}」已停止` : `「${plugin.name}」已启动`);
  }, [plugin, isRunning]);

  // 更新插件
  const handleUpdate = useCallback(() => {
    if (!plugin) return;
    toast.success(`「${plugin.name}」更新成功`, {
      description: `已更新至 v${plugin.currentVersion}`,
    });
  }, [plugin]);

  // 购买成功
  const handlePurchaseConfirm = useCallback(() => {
    if (!plugin) return;
    toast.success(`「${plugin.name}」购买成功`, {
      description: '您现在可以安装使用此插件',
    });
    setPurchaseOpen(false);
  }, [plugin]);

  // 提交权限申请
  const handlePermissionRequest = useCallback((reason: string) => {
    if (!plugin) return;
    const newRequest: PermissionRequest = {
      id: `request-${Date.now()}`,
      userId: 'user-1',
      userName: '当前用户',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      pluginId: plugin.id,
      pluginName: plugin.name,
      pluginIcon: plugin.icon,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setMyRequests((prev) => [...prev, newRequest]);
    setPermissionRequestOpen(false);
    toast.success('权限申请已提交', {
      description: '请等待企业管理员审批',
    });
  }, [plugin]);

  // 重新申请权限（被拒绝后）
  const handleReapply = useCallback(() => {
    if (!plugin) return;
    // 移除之前被拒绝的申请
    setMyRequests((prev) => prev.filter((r) => r.pluginId !== plugin.id || r.status !== 'rejected'));
    // 打开新的申请对话框
    setPermissionRequestOpen(true);
  }, [plugin]);

  if (!plugin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">插件不存在</h1>
          <p className="text-muted-foreground mb-4">请返回市场查找其他插件</p>
          <Button onClick={() => router.push('/market-demo')}>返回市场</Button>
        </div>
      </div>
    );
  }

  const enterpriseConfigs = plugin.configSchemas.filter((c) => c.configType === 'enterprise');
  const personalConfigs = plugin.configSchemas.filter((c) => c.configType === 'personal');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-center" richColors />
      
      {/* 头部导航 */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => router.push('/market-demo')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回市场
          </Button>
        </div>
      </div>
      
      {/* 插件基本信息 */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧：插件信息 */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-5xl shadow-lg">
                  {plugin.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{plugin.name}</h1>
                    <Badge className={sourceTypeLabels[plugin.sourceType].color}>
                      {sourceTypeLabels[plugin.sourceType].label}
                    </Badge>
                    {plugin.priceType === 'paid' && (
                      <Badge variant="secondary">付费</Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {plugin.description.split('\n')[0]}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plugin.category.map((cat) => (
                      <Badge key={cat} variant="outline" className="font-normal">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Download className="w-4 h-4" />
                      {plugin.downloadCount.toLocaleString()} 次下载
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      {plugin.rating.toFixed(1)} ({plugin.ratingCount} 评价)
                    </span>
                    <span className="flex items-center gap-1.5" suppressHydrationWarning>
                      <Clock className="w-4 h-4" />
                      更新于 {new Date(plugin.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 右侧：操作区域 */}
            <div className="lg:w-80">
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  {/* 价格 */}
                  <div className="text-center pb-4 border-b border-border/50">
                    {plugin.priceType === 'free' ? (
                      <p className="text-3xl font-bold text-emerald-500">免费</p>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold">¥{plugin.price}</p>
                        <p className="text-sm text-muted-foreground">
                          {plugin.priceMode === 'subscription' ? '每月订阅' : '一次性购买'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="space-y-3">
                    {/* 企业插件权限状态提示 */}
                    {isEnterprisePlugin && !isInstalled && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                        hasEnterprisePermission 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : isWaitingApproval
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : wasRejected
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {hasEnterprisePermission ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>已获得使用权限</span>
                          </>
                        ) : isWaitingApproval ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>权限申请审核中</span>
                          </>
                        ) : wasRejected ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>权限申请被拒绝</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>企业插件需申请权限</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* 被拒绝的原因 */}
                    {wasRejected && rejectedRequest && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <p className="font-medium text-muted-foreground mb-1">拒绝原因：</p>
                        <p className="text-foreground">{rejectedRequest.rejectReason}</p>
                      </div>
                    )}
                    
                    {isInstalled ? (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm">运行状态</span>
                          <Badge className={isRunning ? 'bg-emerald-500' : 'bg-muted'}>
                            {isRunning ? '运行中' : '已停止'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={isRunning ? 'secondary' : 'default'}
                            onClick={handleToggleStatus}
                            className="gap-2"
                          >
                            {isRunning ? (
                              <>
                                <Square className="w-4 h-4" />
                                停止
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                启动
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={handleUpdate} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            更新
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleUninstall}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          卸载插件
                        </Button>
                      </>
                    ) : needsPermissionRequest ? (
                      // 企业插件：需要申请权限
                      <>
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-blue-500 to-cyan-500"
                          onClick={() => setPermissionRequestOpen(true)}
                        >
                          <Shield className="w-4 h-4" />
                          申请使用权限
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          提交申请后需等待管理员审批
                        </p>
                      </>
                    ) : isWaitingApproval ? (
                      // 企业插件：等待审批中
                      <>
                        <Button className="w-full gap-2" disabled>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          等待审批中
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          申请已提交，请耐心等待管理员审批
                        </p>
                      </>
                    ) : wasRejected ? (
                      // 企业插件：申请被拒绝，可重新申请
                      <>
                        <Button
                          className="w-full gap-2"
                          variant="outline"
                          onClick={handleReapply}
                        >
                          <RefreshCw className="w-4 h-4" />
                          重新申请
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          您可以补充说明后重新提交申请
                        </p>
                      </>
                    ) : plugin.priceType === 'paid' ? (
                      <>
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                          onClick={() => setPurchaseOpen(true)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          立即购买
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          购买后即可安装使用
                        </p>
                      </>
                    ) : (
                      <Button className="w-full gap-2" onClick={handleInstall}>
                        <Download className="w-4 h-4" />
                        安装插件
                      </Button>
                    )}
                  </div>
                  
                  {/* 版本信息 */}
                  <div className="pt-4 border-t border-border/50 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">当前版本</span>
                      <span className="font-medium">v{plugin.currentVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">发布日期</span>
                      <span>{new Date(plugin.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* 详情内容 */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：主要内容 */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start h-12 bg-muted/50 p-1">
                <TabsTrigger value="description" className="gap-2 data-[state=active]:bg-background">
                  <FileText className="w-4 h-4" />
                  介绍
                </TabsTrigger>
                <TabsTrigger value="changelog" className="gap-2 data-[state=active]:bg-background">
                  <History className="w-4 h-4" />
                  更新日志
                </TabsTrigger>
                <TabsTrigger value="config" className="gap-2 data-[state=active]:bg-background">
                  <Settings className="w-4 h-4" />
                  配置管理
                </TabsTrigger>
              </TabsList>
              
              {/* 介绍 Tab */}
              <TabsContent value="description" className="mt-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>插件介绍</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {plugin.description.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* 更新日志 Tab */}
              <TabsContent value="changelog" className="mt-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>版本历史</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {plugin.versions
                        .slice()
                        .reverse()
                        .map((version, idx) => (
                          <div key={version.id} className="relative pl-6">
                            {idx < plugin.versions.length - 1 && (
                              <div className="absolute left-2 top-8 bottom-0 w-px bg-border" />
                            )}
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary" />
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">v{version.version}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(version.createdAt).toLocaleDateString('zh-CN')}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground whitespace-pre-line">
                                {version.changelog}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* 配置管理 Tab */}
              <TabsContent value="config" className="mt-6 space-y-6">
                {/* 企业配置 */}
                {enterpriseConfigs.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            企业配置
                          </CardTitle>
                          <CardDescription>由企业管理员统一配置</CardDescription>
                        </div>
                        <Button onClick={() => handleSaveConfig('enterprise')} className="gap-2">
                          <Save className="w-4 h-4" />
                          保存
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {enterpriseConfigs.map((schema) => (
                        <div key={schema.id} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            {schema.name}
                            {schema.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </Label>
                          <ConfigField
                            schema={schema}
                            value={getConfigValue(schema)}
                            onChange={(value) => updateConfigValue(schema, value)}
                          />
                          {schema.description && (
                            <p className="text-xs text-muted-foreground">
                              {schema.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                {/* 个人配置 */}
                {personalConfigs.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-500" />
                            个人配置
                          </CardTitle>
                          <CardDescription>用户个人的私有配置</CardDescription>
                        </div>
                        <Button onClick={() => handleSaveConfig('personal')} className="gap-2">
                          <Save className="w-4 h-4" />
                          保存
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {personalConfigs.map((schema) => (
                        <div key={schema.id} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            {schema.name}
                            {schema.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </Label>
                          <ConfigField
                            schema={schema}
                            value={getConfigValue(schema)}
                            onChange={(value) => updateConfigValue(schema, value)}
                          />
                          {schema.description && (
                            <p className="text-xs text-muted-foreground">
                              {schema.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* 右侧：作者信息 */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">作者信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={plugin.author.avatar}
                    alt={plugin.author.name}
                    className="w-12 h-12 rounded-full ring-2 ring-border"
                  />
                  <div>
                    <p className="font-medium">{plugin.author.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {certificationLabels[plugin.author.certification]}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">发布插件数</span>
                    <span className="font-medium">{plugin.author.pluginCount}</span>
                  </div>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href={`/market-demo?author=${plugin.author.id}`}>
                      <ExternalLink className="w-4 h-4" />
                      查看更多作品
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* 相关插件 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">相关插件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plugins
                  .filter(
                    (p) =>
                      p.id !== plugin.id &&
                      p.category.some((c) => plugin.category.includes(c))
                  )
                  .slice(0, 3)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/market-demo/plugin/${p.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.priceType === 'free' ? '免费' : `¥${p.price}`}
                        </p>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* 对话框 */}
      <PurchaseDialog
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        plugin={plugin}
        onConfirm={handlePurchaseConfirm}
      />
      
      <PermissionRequestDialog
        open={permissionRequestOpen}
        onOpenChange={setPermissionRequestOpen}
        plugin={plugin}
        onSubmit={handlePermissionRequest}
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
