'use client';

import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Leaf } from 'lucide-react';

export default function MyPlantsPage() {
  const { user } = useAuth();
  
  return (
    <AuthenticatedLayout>
      {user && user.plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {user.plants.map((plant) => (
            <Link href={`/my-plants/${plant.id}`} key={plant.id} className="group">
              <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative w-full aspect-square">
                    <Image
                    src={plant.photoDataUri}
                    alt={plant.nickname}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-xl text-foreground">{plant.nickname}</h3>
                    <p className="text-sm text-muted-foreground">{plant.species}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Leaf className="w-16 h-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold">Your garden is empty</h2>
            <p className="mt-2 text-muted-foreground">Add your first plant to get started with IzyBotanic.</p>
            <Button asChild className="mt-6">
                <Link href="/add-plant"><Plus className="mr-2 h-4 w-4" /> Add New Plant</Link>
            </Button>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
