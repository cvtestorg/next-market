'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Plugin } from '../types';
import { CreditCard, Shield, FileText } from 'lucide-react';

// 购买对话框
interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  onConfirm: () => void;
}

export function PurchaseDialog({ open, onOpenChange, plugin, onConfirm }: PurchaseDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  
  if (!plugin) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            购买插件
          </DialogTitle>
          <DialogDescription>
            您正在购买「{plugin.name}」
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-4xl">{plugin.icon}</div>
            <div>
              <h4 className="font-semibold">{plugin.name}</h4>
              <p className="text-sm text-muted-foreground">
                {plugin.priceMode === 'subscription' ? '订阅制' : '一次性购买'}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-primary">¥{plugin.price}</p>
              <p className="text-xs text-muted-foreground">
                {plugin.priceMode === 'subscription' ? '/月' : '永久'}
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">选择支付方式</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setPaymentMethod('alipay')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'alipay'
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="text-blue-500 font-medium">支付宝</div>
              </button>
              <button
                onClick={() => setPaymentMethod('wechat')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'wechat'
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="text-green-500 font-medium">微信支付</div>
              </button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm} className="bg-gradient-to-r from-primary to-primary/80">
            确认支付 ¥{plugin.price}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 权限申请对话框
interface PermissionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: Plugin | null;
  onSubmit: (reason: string) => void;
}

export function PermissionRequestDialog({
  open,
  onOpenChange,
  plugin,
  onSubmit,
}: PermissionRequestDialogProps) {
  const [reason, setReason] = useState('');
  
  if (!plugin) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            申请使用权限
          </DialogTitle>
          <DialogDescription>
            申请使用「{plugin.name}」的权限
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-3xl">{plugin.icon}</div>
            <div>
              <h4 className="font-semibold">{plugin.name}</h4>
              <p className="text-sm text-muted-foreground">{plugin.author.name}</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">申请理由 *</Label>
            <Textarea
              id="reason"
              placeholder="请详细说明您申请使用该插件的原因..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              申请提交后将由企业管理员进行审核
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSubmit(reason);
              setReason('');
            }}
            disabled={!reason.trim()}
          >
            提交申请
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 确认对话框
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 审核对话框
interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  title,
  onApprove,
  onReject,
}: ReviewDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const handleConfirm = () => {
    if (action === 'approve') {
      onApprove();
    } else if (action === 'reject' && rejectReason.trim()) {
      onReject(rejectReason);
    }
    setAction(null);
    setRejectReason('');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            审核
          </DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction('approve')}
              className={`p-4 rounded-lg border-2 transition-all ${
                action === 'approve'
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-border hover:border-emerald-500/30'
              }`}
            >
              <div className="text-emerald-500 font-medium">✓ 通过</div>
            </button>
            <button
              onClick={() => setAction('reject')}
              className={`p-4 rounded-lg border-2 transition-all ${
                action === 'reject'
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border hover:border-destructive/30'
              }`}
            >
              <div className="text-destructive font-medium">✗ 拒绝</div>
            </button>
          </div>
          
          {action === 'reject' && (
            <div>
              <Label htmlFor="reject-reason">拒绝原因 *</Label>
              <Textarea
                id="reject-reason"
                placeholder="请输入拒绝原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!action || (action === 'reject' && !rejectReason.trim())}
            className={action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
