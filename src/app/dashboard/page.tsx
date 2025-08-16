'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flower2, Bot, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user.name ? user.name.split(' ')[0] : 'Jardineiro(a)';

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta ao seu oásis digital.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-primary" />
              <span>Meu Jardim</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-muted-foreground">
              Você tem {user.plants.length} planta(s) em sua coleção.
            </p>
            <Link href="/dashboard/my-garden" passHref>
              <Button variant="outline">Ver coleção</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              <span>Conquistas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-muted-foreground">
              Você desbloqueou {user.achievements.length} conquista(s).
            </p>
            <Link href="/dashboard/achievements" passHref>
              <Button variant="outline">Ver conquistas</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-secondary-foreground" />
              <span>Assistente Izy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <p className="text-muted-foreground">
              Converse com sua especialista em plantas para tirar dúvidas.
            </p>
            <Link href="/dashboard/chat" passHref>
              <Button>Conversar agora</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
