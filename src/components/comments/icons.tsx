export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path d="M13.4 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.75.35-1.4 1.5-1.4H16V5.5s-1-.17-2-.17c-2.05 0-3.4 1.24-3.4 3.5v1.95H8.4v2.6h2.2V20z" fill="#fff" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#d6249f" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="#d6249f" />
    </svg>
  );
}
