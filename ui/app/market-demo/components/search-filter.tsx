'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { FilterParams, SourceType, PriceType } from '../types';
import { allCategories } from '../data/mock-data';
import { useState } from 'react';

interface SearchFilterProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export function SearchFilter({ filters, onFilterChange }: SearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ ...filters, keyword });
  };
  
  const handleSourceTypeChange = (sourceType: string) => {
    onFilterChange({ ...filters, sourceType: sourceType as SourceType | 'all' });
  };
  
  const handlePriceTypeChange = (priceType: string) => {
    onFilterChange({ ...filters, priceType: priceType as PriceType | 'all' });
  };
  
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category: category === '全部' ? undefined : category });
  };
  
  const clearFilters = () => {
    onFilterChange({
      keyword: '',
      sourceType: 'all',
      priceType: 'all',
      category: undefined,
    });
  };
  
  const hasActiveFilters =
    filters.keyword ||
    (filters.sourceType && filters.sourceType !== 'all') ||
    (filters.priceType && filters.priceType !== 'all') ||
    filters.category;

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索插件名称、描述或作者..."
            value={filters.keyword || ''}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
          />
          {filters.keyword && (
            <button
              onClick={() => handleKeywordChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showAdvanced ? 'secondary' : 'outline'}
          size="icon"
          className="h-11 w-11"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      {/* 高级筛选 */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <Select
            value={filters.sourceType || 'all'}
            onValueChange={handleSourceTypeChange}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="来源分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="official">官方插件</SelectItem>
              <SelectItem value="enterprise">企业插件</SelectItem>
              <SelectItem value="personal">个人插件</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.priceType || 'all'}
            onValueChange={handlePriceTypeChange}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="付费类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="free">免费</SelectItem>
              <SelectItem value="paid">付费</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.category || '全部'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
              <X className="w-3.5 h-3.5 mr-1" />
              清除筛选
            </Button>
          )}
        </div>
      )}
      
      {/* 快捷分类标签 */}
      <div className="flex flex-wrap gap-2">
        {['全部', '官方插件', '免费', 'AI 工具', '效率工具', '开发工具'].map((tag) => {
          let isActive = false;
          if (tag === '全部') {
            isActive = !hasActiveFilters;
          } else if (tag === '官方插件') {
            isActive = filters.sourceType === 'official';
          } else if (tag === '免费') {
            isActive = filters.priceType === 'free';
          } else {
            isActive = filters.category === tag;
          }
          
          return (
            <Badge
              key={tag}
              variant={isActive ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 text-sm font-normal transition-all hover:scale-105 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => {
                if (tag === '全部') {
                  clearFilters();
                } else if (tag === '官方插件') {
                  handleSourceTypeChange(isActive ? 'all' : 'official');
                } else if (tag === '免费') {
                  handlePriceTypeChange(isActive ? 'all' : 'free');
                } else {
                  handleCategoryChange(isActive ? '全部' : tag);
                }
              }}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
