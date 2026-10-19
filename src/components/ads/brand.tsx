export const ADS_ROUTES = {
  dashboard: '/dashboard/ads',
  profit: '/dashboard/ads/profit',
  meta: '/dashboard/ads/meta',
  tiktok: '/dashboard/ads/tiktok',
  google: '/dashboard/ads/google',
  spend: '/dashboard/ads/spend',
} as const;

export const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#1877f2" />
    <path d="M13.4 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.3 1.4-1.3h1.4V5.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.3V14h2.3v7h2.8z" fill="#fff" />
  </svg>
);
export const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path d="M16.5 3c.3 2.2 1.6 3.6 3.8 3.8v2.7c-1.4.1-2.7-.3-3.8-1.1v6.1c0 5.3-5.800 6.900-8.200 3.300-1.600-2.500-.6-6.500 3.400-6.900v2.800c-.3.100-.6.100-.9.300-1.200.6-1.200 2.400 0 3 1.200.6 2.600-.3 2.600-1.700V3h3.100z" fill="#111" />
  </svg>
);
export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.300-.2-1.900H12v3.700h5.400a4.600 4.600 0 0 1-2 3v2.500h3.300c1.900-1.800 2.900-4.400 2.900-7.300z" />
    <path fill="#34a853" d="M12 22c2.700 0 5-.9 6.700-2.400l-3.300-2.500c-.9.600-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3v2.600A10 10 0 0 0 12 22z" />
    <path fill="#fbbc05" d="M6.400 13.900a6 6 0 0 1 0-3.800V7.500H3a10 10 0 0 0 0 9l3.400-2.600z" />
    <path fill="#ea4335" d="M12 6c1.500 0 2.800.5 3.800 1.500l2.900-2.900A10 10 0 0 0 3 7.500l3.400 2.600C7.200 7.800 9.400 6 12 6z" />
  </svg>
);
