import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

/**
 * Consistent page header + layout wrapper for all dashboard inner pages.
 * Keeps title, description, and optional action-button in one line.
 */
export function PageShell({
  title,
  description,
  action,
  children,
  maxWidth = 'xl',
  className,
}: PageShellProps) {
  const maxW = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className={cn('space-y-5 animate-fade-in', maxW, className)}>
      {/* Page header — matches DashboardHome section header style */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

/** Section card within a PageShell — replaces shadcn Card for inner dashboard content */
interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPad?: boolean;
}

export function Section({ title, description, children, className, action, noPad }: SectionProps) {
  return (
    <div className={cn('bento-card', className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

/** Inline field row — label above, input below, consistent spacing */
export function FieldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}

/** Grid of 2 columns for form fields */
export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={cn('grid gap-4', cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
      {children}
    </div>
  );
}

/** Empty state placeholder */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-violet-500" />
      </div>
      <h3 className="font-display font-semibold text-[15px] mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Chip/badge for tags */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-muted text-muted-foreground', className)}>
      {children}
    </span>
  );
}

/** Full-page spinner — matches DashboardHome loading style */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="h-4 w-4 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        Loading...
      </div>
    </div>
  );
}
