'use client';
import { useAuth } from '@/hooks/use-auth';
import { achievements } from '@/lib/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { user } = useAuth();
  const userAchievements = user?.achievements || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Minhas Conquistas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const isUnlocked = userAchievements.includes(achievement.id);
          return (
            <Card key={achievement.id} className={cn(!isUnlocked && "bg-muted/50")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{achievement.title}</CardTitle>
                {isUnlocked ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
