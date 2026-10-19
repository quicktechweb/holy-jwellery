import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Sign up' };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join EcomDrive and start managing your store"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />
      <RegisterForm />
    </AuthShell>
  );
}
