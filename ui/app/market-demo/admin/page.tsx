'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { plugins, permissionRequests as initialRequests, orgConfigs as initialOrgConfigs } from '../data/mock-data';
import type { Plugin, PermissionRequest, OrgPluginConfig, ConfigSchema } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ReviewDialog, ConfirmDialog } from '../components/dialogs';
import {
  Search,
  Shield,
  Building2,
  Settings,
  Package,
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Save,
  UserPlus,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

// 分配权限对话框
function AssignPermissionDialog({
  open,
  onOpenChange,
  plugin,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  onSubmit: (users: string[]) => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  if (!plugin) return null;

  // 模拟用户列表
  const availableUsers = [
    { id: 'user-1', name: '张三', department: '技术部' },
    { id: 'user-2', name: '李四', department: '产品部' },
    { id: 'user-3', name: '王五', department: '设计部' },
    { id: 'user-4', name: '赵六', department: '运营部' },
    { id: 'user-5', name: '孙七', department: '市场部' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            分配权限
          </DialogTitle>
          <DialogDescription>
            为「{plugin.name}」分配用户使用权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-3xl">{plugin.icon}</div>
            <div>
              <p className="font-medium">{plugin.name}</p>
              <p className="text-sm text-muted-foreground">{plugin.author.name}</p>
            </div>
          </div>

          <div>
            <Label>选择用户</Label>
            <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
              {availableUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                        }
                      }}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSubmit(selectedUsers);
              setSelectedUsers([]);
            }}
            disabled={selectedUsers.length === 0}
          >
            确认分配 ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 企业配置对话框
function OrgConfigDialog({
  open,
  onOpenChange,
  plugin,
  configs,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  configs: OrgPluginConfig[];
  onSave: (configs: Record<string, string>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (!plugin) return null;

  const enterpriseSchemas = plugin.configSchemas.filter((s) => s.configType === 'enterprise');

  const getValue = (key: string) => {
    if (formData[key] !== undefined) return formData[key];
    const config = configs.find((c) => c.pluginId === plugin.id && c.configKey === key);
    return config?.configValue || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            企业配置
          </DialogTitle>
          <DialogDescription>
            配置「{plugin.name}」的企业级参数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {enterpriseSchemas.map((schema) => (
            <div key={schema.id} className="space-y-2">
              <Label className="flex items-center gap-2">
                {schema.name}
                {schema.required && <span className="text-destructive">*</span>}
              </Label>
              {schema.type === 'boolean' ? (
                <Switch
                  checked={getValue(schema.key) === 'true'}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, [schema.key]: checked ? 'true' : 'false' })
                  }
                />
              ) : schema.type === 'password' ? (
                <Input
                  type="password"
                  value={getValue(schema.key)}
                  onChange={(e) => setFormData({ ...formData, [schema.key]: e.target.value })}
                  placeholder={schema.example || `请输入${schema.name}`}
                />
              ) : (
                <Input
                  value={getValue(schema.key)}
                  onChange={(e) => setFormData({ ...formData, [schema.key]: e.target.value })}
                  placeholder={schema.example || `请输入${schema.name}`}
                />
              )}
              {schema.description && (
                <p className="text-xs text-muted-foreground">{schema.description}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<PermissionRequest[]>(initialRequests);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // 对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<PermissionRequest | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignPlugin, setAssignPlugin] = useState<Plugin | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configPlugin, setConfigPlugin] = useState<Plugin | null>(null);
  const [orgConfigs, setOrgConfigs] = useState<OrgPluginConfig[]>(initialOrgConfigs);

  // 筛选后的申请
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          request.userName.toLowerCase().includes(keyword) ||
          request.pluginName.toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  }, [requests, statusFilter, searchKeyword]);

  // 局域插件（企业内部插件）
  const enterprisePlugins = useMemo(() => {
    return plugins.filter((p) => p.sourceType === 'enterprise');
  }, []);

  // 统计数据
  const stats = useMemo(() => ({
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    plugins: enterprisePlugins.length,
  }), [requests, enterprisePlugins]);

  // 审核通过
  const handleApprove = useCallback((request: PermissionRequest) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() }
          : r
      )
    );
    toast.success(`已通过「${request.userName}」的申请`);
    setReviewDialogOpen(false);
    setReviewingRequest(null);
  }, []);

  // 审核拒绝
  const handleReject = useCallback((request: PermissionRequest, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? { ...r, status: 'rejected', rejectReason: reason, reviewedAt: new Date().toISOString() }
          : r
      )
    );
    toast.info(`已拒绝「${request.userName}」的申请`);
    setReviewDialogOpen(false);
    setReviewingRequest(null);
  }, []);

  // 分配权限
  const handleAssignPermission = useCallback((users: string[]) => {
    toast.success(`已为 ${users.length} 名用户分配权限`);
    setAssignDialogOpen(false);
    setAssignPlugin(null);
  }, []);

  // 保存企业配置
  const handleSaveConfig = useCallback((configs: Record<string, string>) => {
    toast.success('企业配置保存成功');
    setConfigDialogOpen(false);
    setConfigPlugin(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-center" richColors />

      {/* 页面头部 */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">企业管理</h1>
          </div>
          <p className="text-muted-foreground">管理局域插件、审批权限申请、配置企业参数</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">待审核</p>
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
                  <p className="text-xs text-muted-foreground">已通过</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">已拒绝</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.plugins}</p>
                  <p className="text-xs text-muted-foreground">局域插件</p>
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
            <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-background">
              <FileCheck className="w-4 h-4" />
              权限审批 ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="plugins" className="gap-2 data-[state=active]:bg-background">
              <Package className="w-4 h-4" />
              局域插件
            </TabsTrigger>
          </TabsList>

          {/* 权限审批 */}
          <TabsContent value="requests">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>权限申请审批</CardTitle>
                    <CardDescription>审核用户提交的插件使用权限申请</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as any)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待审核</SelectItem>
                        <SelectItem value="approved">已通过</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索用户或插件..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无权限申请</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>申请人</TableHead>
                        <TableHead>申请插件</TableHead>
                        <TableHead>申请理由</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>申请时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const StatusIcon = statusIcons[request.status];
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={request.userAvatar}
                                  alt={request.userName}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-medium">{request.userName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{request.pluginIcon}</span>
                                <span>{request.pluginName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]">
                                {request.reason}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[request.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusLabels[request.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              {request.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                    onClick={() => handleApprove(request)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    通过
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      setReviewingRequest(request);
                                      setReviewDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    拒绝
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/market-demo/plugin/${request.pluginId}`}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    查看
                                  </Link>
                                </Button>
                              )}
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

          {/* 局域插件 */}
          <TabsContent value="plugins">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>局域插件管理</CardTitle>
                <CardDescription>管理企业内部插件的权限分配和配置</CardDescription>
              </CardHeader>
              <CardContent>
                {enterprisePlugins.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无局域插件</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>插件</TableHead>
                        <TableHead>版本</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>下载量</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enterprisePlugins.map((plugin) => (
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
                            {plugin.priceType === 'free' ? (
                              <span className="text-emerald-500">免费</span>
                            ) : (
                              <span>¥{plugin.price}</span>
                            )}
                          </TableCell>
                          <TableCell>{plugin.downloadCount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              已上架
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignPlugin(plugin);
                                    setAssignDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  分配权限
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setConfigPlugin(plugin);
                                    setConfigDialogOpen(true);
                                  }}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  企业配置
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* 拒绝对话框 */}
      {reviewingRequest && (
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>拒绝申请</DialogTitle>
              <DialogDescription>
                请填写拒绝「{reviewingRequest.userName}」申请的原因
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reject-reason">拒绝原因</Label>
              <Textarea
                id="reject-reason"
                placeholder="请输入拒绝原因..."
                className="mt-2"
                onChange={(e) => {
                  const reason = e.target.value;
                  // Store in local state if needed
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = (document.getElementById('reject-reason') as HTMLTextAreaElement)?.value || '未填写原因';
                  handleReject(reviewingRequest, reason);
                }}
              >
                确认拒绝
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 分配权限对话框 */}
      <AssignPermissionDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        plugin={assignPlugin}
        onSubmit={handleAssignPermission}
      />

      {/* 企业配置对话框 */}
      <OrgConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        plugin={configPlugin}
        configs={orgConfigs}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
