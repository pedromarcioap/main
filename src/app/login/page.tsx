import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <LoginForm />
    </main>
  );
}
