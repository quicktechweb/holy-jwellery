import Link from 'next/link';
import type { ReactNode } from 'react';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { Logo } from '@/components/ui/Logo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <GlowBackground />

      <div className="animate-rise relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(236,42,139,0.12)] backdrop-blur">
          <div className="px-8 pt-8 pb-7">
            <Link
              href="/"
              aria-label="EcomDrive home"
              className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a1c8c] to-[#3d0b4d] text-white"
            >
              <Logo className="size-7" />
            </Link>
            <h1 className="text-center text-2xl font-bold">{title}</h1>
            <p className="mt-1.5 text-center text-sm text-white/50">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <div className="border-t border-white/10 px-8 py-4 text-center text-sm text-white/50">
            {footer}
          </div>
        </div>
      </div>
    </main>
  );
}
