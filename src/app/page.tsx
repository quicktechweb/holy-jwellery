import Link from 'next/link';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { Logo } from '@/components/ui/Logo';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <GlowBackground />
      {/* watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 text-[28rem] leading-none font-extrabold text-white/[0.03] select-none"
      >
        V2
      </span>

      <div className="animate-rise relative z-10 flex flex-col items-center">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-2 shadow-[0_0_60px_rgba(236,42,139,0.25)]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a1c8c] to-[#3d0b4d] text-white">
            <Logo />
          </div>
        </div>

        <span className="text-primary mb-8 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em]">
          ECOMDRIVE V2
        </span>

        <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight sm:text-7xl">
          Welcome to
          <br />
          <span className="via-primary bg-gradient-to-r from-[#ff5aa8] to-[#c4107a] bg-clip-text text-transparent">
            EcomDrive
          </span>
        </h1>

        <p className="mt-6 max-w-md text-base text-white/60 sm:text-lg">
          The Full Operating System for Your Ecommerce Business
        </p>

        <Link
          href="/login"
          className="group bg-primary hover:bg-primary-hover mt-10 inline-flex items-center gap-4 rounded-full py-3 pr-3 pl-8 text-sm font-semibold text-white shadow-[0_0_40px_rgba(236,42,139,0.45)] transition-colors"
        >
          Go to Dashboard
          <span className="flex size-9 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-0.5">
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>

        <p className="mt-5 text-sm text-white/40">V2-তে নতুন কী এসেছে দেখুন</p>
      </div>
    </main>
  );
}
