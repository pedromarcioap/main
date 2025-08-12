'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { achievements } from '@/lib/achievements';
import { suggestNewPlants } from '@/ai/flows/suggest-new-plants';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Trophy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function DiscoverPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!user) return;
    setIsLoading(true);
    setSuggestions(null);

    try {
      const userCollection =
        user.plants.map((p) => `${p.nickname} (${p.species})`).join(', ') ||
        'Nenhuma planta ainda.';
      const userPreferences =
        'Gosta de plantas de interior de baixa manutenção.'; // Pode ser dinâmico no futuro

      const result = await suggestNewPlants({ userCollection, userPreferences });
      setSuggestions(result.suggestedPlants);
    } catch (error) {
      console.error('Erro ao obter sugestões:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          'Não foi possível obter sugestões de plantas. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unlockedAchievements = user?.achievements || [];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb /> Sugestões de Plantas
          </CardTitle>
          <CardDescription>
            Receba recomendações com IA para sua próxima amiga verde com base na
            sua coleção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : suggestions ? (
            <div className="space-y-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {suggestions}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">
                Clique no botão para obter novas ideias de plantas!
              </p>
            </div>
          )}
          <Button
            onClick={handleGetSuggestions}
            disabled={isLoading}
            className="mt-6 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Ideias...
              </>
            ) : (
              'Sugerir Novas Plantas'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy /> Conquistas
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso e celebre seus marcos na jardinagem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {achievements.map((ach) => {
              const isUnlocked = unlockedAchievements.includes(ach.id);
              return (
                <li
                  key={ach.id}
                  className={`flex items-start gap-4 rounded-lg p-4 transition-all ${
                    isUnlocked
                      ? 'bg-primary/20'
                      : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div
                    className={`rounded-full p-2 ${
                      isUnlocked
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    <ach.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {ach.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {ach.description}
                    </p>
                  </div>
                  {isUnlocked && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default DiscoverPage;
