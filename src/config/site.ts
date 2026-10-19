export const siteConfig = {
  name: 'EcomDrive',
  description: 'The Full Operating System for Your Ecommerce Business',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;
