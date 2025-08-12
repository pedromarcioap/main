'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Leaf } from 'lucide-react';

function MyPlantsPage() {
  const { user } = useAuth();

  return (
    <>
      {user && user.plants.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {user.plants.map((plant) => (
            <Link
              href={`/my-plants/${plant.id}`}
              key={plant.id}
              className="group"
            >
              <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-square w-full">
                  <Image
                    src={plant.photoDataUri}
                    alt={plant.nickname}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="flex flex-grow flex-col justify-between p-4">
                  <div>
                    <h3 className="font-headline text-xl text-foreground">
                      {plant.nickname}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plant.species}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
          <Leaf className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">Seu jardim está vazio</h2>
          <p className="mt-2 text-muted-foreground">
            Adicione sua primeira planta para começar com o IzyBotanic.
          </p>
          <Button asChild className="mt-6">
            <Link href="/add-plant">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Planta
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default MyPlantsPage;
