'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get('email')),
      password: String(form.get('password')),
    };

    setLoading(true);
    try {
      // TODO: backend connect korun, jemon:
      // await api.post('/auth/login', payload);
      void payload;
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        labelAside={
          <Link
            href="#"
            className="hover:text-primary text-sm text-white/60 transition-colors"
          >
            Forgot password?
          </Link>
        }
      />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Please wait...' : 'Continue'}
      </Button>
    </form>
  );
}
