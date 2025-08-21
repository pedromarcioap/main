'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';

export default function MyGardenPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meu Jardim</h1>
        <Link href="/dashboard/add-plant" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Planta
          </Button>
        </Link>
      </div>
      
      {user?.plants && user.plants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.plants.map((plant) => (
            <Link key={plant.id} href={`/dashboard/my-garden/${plant.id}`} passHref>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Image 
                    src={plant.photoURL || 'https://placehold.co/600x400.png'}
                    alt={plant.nickname}
                    width={600}
                    height={400}
                    className="rounded-t-lg object-cover aspect-[3/2]"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl">{plant.nickname}</CardTitle>
                  <p className="text-muted-foreground">{plant.species}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Seu jardim está vazio!</h2>
          <p className="text-muted-foreground mt-2 mb-4">Que tal adicionar sua primeira planta?</p>
          <Link href="/dashboard/add-plant" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Planta
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
