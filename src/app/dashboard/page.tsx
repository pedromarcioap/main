'use client';

import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarDays, Lightbulb, Droplets, Sun } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const getCareTasks = () => {
    if (!user) return [];
    return user.plants.slice(0, 2).map((plant, index) => ({
      id: plant.id,
      plantName: plant.nickname,
      task: index % 2 === 0 ? 'Watering' : 'Sunlight Check',
      date: new Date(),
    }));
  };

  const careTasks = getCareTasks();

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-headline text-4xl text-foreground">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening in your garden today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Critical Care Alerts</CardTitle>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              {user && user.plants.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Droplets className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{user.plants[0].nickname} needs watering.</p>
                        <p className="text-sm text-muted-foreground">Soil is likely dry.</p>
                      </div>
                    </div>
                    <Button size="sm">Watered</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No alerts right now. Your plants are happy!</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/add-plant">Add a new plant</Link>
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Lightbulb className="h-6 w-6 text-accent" />
              <CardTitle>Seasonal Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                As summer approaches, be mindful of increased sun exposure. You may need to move some plants to shadier spots to avoid leaf scorch.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            <CardTitle>Upcoming Care</CardTitle>
          </CardHeader>
          <CardContent>
            {careTasks.length > 0 ? (
                <ul className="space-y-3">
                {careTasks.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {task.task === 'Watering' ? <Droplets className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                        <p><span className="font-medium">{task.plantName}</span>: {task.task}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Today</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center text-muted-foreground py-4">No upcoming tasks. Add a plant to get started!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
