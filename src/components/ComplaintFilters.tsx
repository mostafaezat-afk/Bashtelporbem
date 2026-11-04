import React from 'react';
import { Search, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ComplaintCategory } from '../types';

interface ComplaintFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  stats,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Search Input matching Screenshot 2 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث..."
          className="w-full bg-[#161c24] border border-[#252d3d] rounded-xl py-2.5 pr-10 pl-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-right"
          dir="rtl"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Two Dropdown selectors matching Screenshot 2 */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Category selector */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none bg-[#161c24] border border-[#252d3d] rounded-xl py-2.5 pr-3.5 pl-8 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-right"
          >
            <option value="all">كل المشاكل</option>
            <option value="garbage">تراكم قمامة ونظافة</option>
            <option value="roads">طرق ورصف وحفر</option>
            <option value="water">مياه وصرف صحي</option>
            <option value="electricity">أعمدة إنارة وكهرباء</option>
            <option value="encroachments">إشغالات ومحليات</option>
            <option value="other">شكاوى أخرى</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort / Status selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none bg-[#161c24] border border-[#252d3d] rounded-xl py-2.5 pr-3.5 pl-8 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-right"
          >
            <option value="newest">الأحدث</option>
            <option value="most_voted">الأكثر تفاعلاً وتأييداً</option>
            <option value="open">المشاكل المفتوحة فقط</option>
            <option value="in_progress">قيد المعالجة فقط</option>
            <option value="resolved">تم حلها</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer shrink-0 ${
            statusFilter === 'all'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#161c24] border-[#252d3d] text-gray-400 hover:text-gray-200'
          }`}
        >
          الكل ({stats.total})
        </button>
        <button
          onClick={() => onStatusFilterChange('open')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer shrink-0 ${
            statusFilter === 'open'
              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
              : 'bg-[#161c24] border-[#252d3d] text-gray-400 hover:text-gray-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>مفتوحة ({stats.open})</span>
        </button>
        <button
          onClick={() => onStatusFilterChange('in_progress')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer shrink-0 ${
            statusFilter === 'in_progress'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-[#161c24] border-[#252d3d] text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>قيد المعالجة ({stats.inProgress})</span>
        </button>
        <button
          onClick={() => onStatusFilterChange('resolved')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer shrink-0 ${
            statusFilter === 'resolved'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-[#161c24] border-[#252d3d] text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>تم الحل ({stats.resolved})</span>
        </button>
      </div>
    </div>
  );
};
