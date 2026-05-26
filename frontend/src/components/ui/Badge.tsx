import React from 'react';
import { cn } from '@/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-emerald-900/50 text-emerald-400',
  warning: 'bg-amber-900/50 text-amber-400',
  danger:  'bg-red-900/50 text-red-400',
  info:    'bg-blue-900/50 text-blue-400',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
