import React from 'react';
import { AlertCircle, Inbox, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface TabLoadingSkeletonProps {
  variant?: 'cards' | 'table' | 'split' | 'stats';
  rows?: number;
  label?: string;
}

export const TabLoadingSkeleton: React.FC<TabLoadingSkeletonProps> = ({
  variant = 'cards',
  rows = 4,
  label = 'Loading section data...',
}) => {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label={label}>
      <div className="flex items-center justify-between">
        <div className="h-5 w-44 bg-gray-200 rounded-lg" />
        <div className="h-4 w-24 bg-gray-100 rounded-lg" />
      </div>

      {variant === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="h-3.5 w-24 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-orange-100 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {variant === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-11 bg-gray-50 border-b border-gray-100 px-4 flex items-center gap-4">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded ml-auto" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-7 w-20 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {variant === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-100 rounded-2xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      )}

      {variant === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-44 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-orange-100 rounded-lg" />
              </div>
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
              <div className="pt-2 flex gap-2">
                <div className="h-9 w-28 bg-gray-100 rounded-xl" />
                <div className="h-9 w-24 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ErrorStatePanelProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorStatePanel: React.FC<ErrorStatePanelProps> = ({
  title = 'Unable to load this section',
  message,
  onRetry,
  retryLabel = 'Retry',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`bg-white border border-red-200 rounded-2xl p-6 text-center space-y-3 shadow-xs ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-sans font-bold text-sm text-gray-900">{title}</h4>
        <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 min-h-[44px] rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};

interface EmptyStatePanelProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStatePanel: React.FC<EmptyStatePanelProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-gray-200/80 rounded-2xl p-8 text-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto border border-orange-100">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h4 className="font-sans font-bold text-sm text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 min-h-[44px] rounded-xl transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface PaginationBarProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  itemLabel?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'items',
}) => {
  const activePage = page ?? currentPage ?? 1;
  if (totalItems === 0 || totalPages <= 1) return null;
  const start = (activePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, activePage * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
      <span>
        Showing <strong className="text-gray-900">{start}–{end}</strong> of{' '}
        <strong className="text-gray-900">{totalItems}</strong> {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={activePage <= 1}
          onClick={() => onPageChange(Math.max(1, activePage - 1))}
          className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-45 disabled:cursor-not-allowed font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>
        <span className="px-2 font-semibold text-gray-800">
          Page {activePage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
          className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-45 disabled:cursor-not-allowed font-semibold cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
