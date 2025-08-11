'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { useAuth } from '@/hooks/use-auth';
import type { Plant } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Droplets,
  Sun,
  HeartPulse,
  Stethoscope,
  Bug,
  FlaskConical,
  ClipboardList,
  Lightbulb,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


function InfoPill({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
      <div className="p-2 rounded-full bg-primary/20 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: string }) {
    const { icon: Icon, color, label } = useMemo(() => {
        const lowerHealth = health.toLowerCase();
        if (lowerHealth.includes('healthy')) return { icon: Smile, color: 'bg-green-500', label: 'Healthy' };
        if (lowerHealth.includes('minor issues')) return { icon: Meh, color: 'bg-yellow-500', label: 'Minor Issues' };
        if (lowerHealth.includes('unhealthy')) return { icon: Frown, color: 'bg-red-500', label: 'Unhealthy' };
        return { icon: Meh, color: 'bg-gray-500', label: 'Unknown' };
    }, [health]);
    
    return <Badge className={`${color} text-white`}><Icon className="w-4 h-4 mr-2" />{label}</Badge>;
}

export default function PlantDetailPage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const plant = useMemo(() => user?.plants.find((p: Plant) => p.id === id), [user, id]);
  
  useEffect(() => {
    if (user && plant && !user.achievements.includes('diligent-student')) {
      const updatedUser = { ...user, achievements: [...user.achievements, 'diligent-student'] };
      updateUser(updatedUser);
      toast({ title: 'Achievement Unlocked!', description: 'You earned "Diligent Student"!' });
    }
  }, [user, plant, updateUser, toast]);

  if (!user) return <AuthenticatedLayout><Skeleton className="w-full h-screen" /></AuthenticatedLayout>;
  if (!plant) {
    // This can happen briefly on load, or if the ID is invalid.
    // If it's not a brief load, we could redirect.
    return <AuthenticatedLayout><p>Plant not found.</p></AuthenticatedLayout>;
  }

  return (
    <AuthenticatedLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image src={plant.photoDataUri} alt={plant.nickname} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-3xl">{plant.nickname}</CardTitle>
                    <CardDescription>{plant.species}</CardDescription>
                  </div>
                  <HealthBadge health={plant.health} />
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Tabs defaultValue="care-plan" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
                    <TabsTrigger value="health-diagnosis">Health</TabsTrigger>
                    <TabsTrigger value="expert-tips">Expert Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="care-plan">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ClipboardList /> Full Care Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <InfoPill icon={Droplets} title="Watering" content={plant.wateringFrequency} />
                            <InfoPill icon={Sun} title="Sunlight" content={plant.sunlightNeeds} />
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold text-foreground mb-2">Detailed Instructions</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plant.fullCarePlan}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health-diagnosis">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HeartPulse /> Health Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <InfoPill icon={Stethoscope} title="Potential Problems" content={plant.potentialProblems} />
                            <InfoPill icon={FlaskConical} title="Recommended Treatments" content={plant.treatments} />
                            <InfoPill icon={Bug} title="Pests & Diseases" content={plant.potentialPestsAndDiseases} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expert-tips">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb /> Expert Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                {plant.expertTips}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
