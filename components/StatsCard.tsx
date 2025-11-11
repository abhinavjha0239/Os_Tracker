import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export default function StatsCard({
  label,
  value,
  caption,
  icon,
  trend,
  loading = false,
  className = '',
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={`glass-card rounded-2xl p-6 ${className}`}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-24 rounded bg-pastel-lavender/20" />
          <div className="h-8 w-32 rounded bg-pastel-lavender/20" />
          <div className="h-4 w-40 rounded bg-pastel-lavender/20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-card glass-card-hover rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {value}
          </p>
          {caption && (
            <p className="mt-1 text-sm text-gray-500">
              {caption}
            </p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  trend.isPositive
                    ? 'badge-pastel-mint'
                    : 'badge-pastel-peach'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-xs text-gray-500">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pastel-lavender/30 to-pastel-sky/30 text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}