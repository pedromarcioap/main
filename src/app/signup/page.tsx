import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <SignupForm />
    </main>
  );
}
