import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to EcomDrive"
      subtitle="Welcome back! Please sign in to continue"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <GoogleButton />
      <LoginForm />
    </AuthShell>
  );
}
