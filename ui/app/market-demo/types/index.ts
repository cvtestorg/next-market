// 插件来源类型
export type SourceType = 'official' | 'enterprise' | 'personal';

// 付费类型
export type PriceType = 'free' | 'paid';

// 收费模式
export type PriceMode = 'one-time' | 'subscription';

// 审核状态
export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'removed';

// 插件运行状态
export type PluginRunStatus = 'running' | 'stopped';

// 安装状态
export type InstallStatus = 'not-installed' | 'installed' | 'update-available';

// 权限申请状态
export type PermissionStatus = 'pending' | 'approved' | 'rejected';

// 配置项类型
export type ConfigItemType = 
  | 'text' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'time' 
  | 'number' 
  | 'boolean' 
  | 'password';

// 配置类型
export type ConfigType = 'enterprise' | 'personal';

// 授权方式
export type GrantType = 'purchase' | 'assign' | 'approved';

// 作者信息
export interface Author {
  id: string;
  name: string;
  avatar: string;
  certification: 'official' | 'enterprise' | 'personal';
  pluginCount: number;
}

// 插件版本
export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string;
  changelog: string;
  packageUrl: string;
  createdAt: string;
}

// 配置项定义
export interface ConfigSchema {
  id: string;
  pluginId: string;
  configType: ConfigType;
  name: string;
  key: string;
  type: ConfigItemType;
  options?: { label: string; value: string }[];
  description?: string;
  defaultValue?: string;
  validation?: string;
  example?: string;
  required: boolean;
  sortOrder: number;
}

// 插件
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string[];
  sourceType: SourceType;
  priceType: PriceType;
  price?: number;
  priceMode?: PriceMode;
  author: Author;
  status: AuditStatus;
  currentVersion: string;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  versions: PluginVersion[];
  configSchemas: ConfigSchema[];
}

// 用户插件安装
export interface UserPluginInstall {
  id: string;
  userId: string;
  pluginId: string;
  versionId: string;
  runStatus: PluginRunStatus;
  installedAt: string;
}

// 用户插件配置
export interface UserPluginConfig {
  id: string;
  userId: string;
  pluginId: string;
  configKey: string;
  configValue: string;
}

// 企业插件配置
export interface OrgPluginConfig {
  id: string;
  orgId: string;
  pluginId: string;
  configKey: string;
  configValue: string;
}

// 权限申请
export interface PermissionRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  pluginId: string;
  pluginName: string;
  pluginIcon: string;
  reason: string;
  status: PermissionStatus;
  rejectReason?: string;
  reviewerId?: string;
  createdAt: string;
  reviewedAt?: string;
}

// 用户插件权限
export interface UserPluginPermission {
  id: string;
  userId: string;
  pluginId: string;
  grantType: GrantType;
  expireAt?: string;
  createdAt: string;
}

// 购买记录
export interface PurchaseRecord {
  id: string;
  userId: string;
  pluginId: string;
  pluginName: string;
  pluginIcon: string;
  amount: number;
  priceMode: PriceMode;
  purchasedAt: string;
  expireAt?: string;
}

// 筛选参数
export interface FilterParams {
  keyword?: string;
  sourceType?: SourceType | 'all';
  priceType?: PriceType | 'all';
  category?: string;
  author?: string;
}

// 插件统计
export interface PluginStats {
  totalDownloads: number;
  activeUsers: number;
  revenue: number;
  avgRating: number;
}
