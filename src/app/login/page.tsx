'use client';

import { LoginForm } from '@/components/auth/login-form';
import withAuth from '@/components/auth/with-auth';

function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <LoginForm />
    </main>
  );
}

export default withAuth(LoginPage, { protected: false });
