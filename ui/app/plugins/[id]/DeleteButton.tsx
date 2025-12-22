'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
  pluginId: number
  pluginName: string
}

export default function DeleteButton({ pluginId, pluginName }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/v1/plugins/${pluginId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete plugin')
      }
      
      // 删除成功，重定向到插件列表
      router.push('/plugins')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to delete plugin:', error)
      alert(`删除失败: ${error.message}`)
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg">删除插件</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除插件</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除插件 <span className="font-semibold">"{pluginName}"</span> 吗？
            <br />
            <span className="text-destructive mt-2 block">
              此操作无法撤销，插件及其所有版本将被永久删除。
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

