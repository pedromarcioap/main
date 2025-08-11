'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { analyzePlantImage } from '@/ai/flows/analyze-plant-image';
import type { Plant } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UploadCloud, Leaf } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  nickname: z.string().min(2, { message: 'O apelido deve ter pelo menos 2 caracteres.' }),
  photo: z.any().refine(files => files?.length === 1, 'A foto da planta é obrigatória.'),
});

type FormValues = z.infer<typeof formSchema>;

function AddPlantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nickname: '' },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({ variant: 'destructive', title: 'Imagem muito grande', description: 'Por favor, envie uma imagem menor que 4MB.' });
        form.resetField('photo');
        setPhotoPreview(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target?.result as string);
      reader.readAsDataURL(file);
      form.setValue('photo', e.target.files);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const file = data.photo[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const photoDataUri = reader.result as string;
        const analysisResult = await analyzePlantImage({ photoDataUri });
        
        const newPlant: Plant = {
          id: crypto.randomUUID(),
          nickname: data.nickname,
          photoDataUri,
          addedDate: new Date().toISOString(),
          ...analysisResult,
        };

        if (user) {
          const updatedUser = { ...user, plants: [...user.plants, newPlant] };
          if (!user.achievements.includes('first-sprout')) {
            updatedUser.achievements.push('first-sprout');
            toast({ title: 'Conquista Desbloqueada!', description: 'Você ganhou "Primeiro Broto"!' });
          }
          if (updatedUser.plants.length >= 5 && !user.achievements.includes('green-thumb')) {
            updatedUser.achievements.push('green-thumb');
            toast({ title: 'Conquista Desbloqueada!', description: 'Você ganhou "Dedo Verde"!' });
          }
          updateUser(updatedUser);
        }

        toast({ title: 'Planta Adicionada!', description: `${data.nickname} juntou-se ao seu jardim.` });
        router.push(`/my-plants/${newPlant.id}`);

      } catch (error) {
        console.error('Erro ao analisar a imagem da planta:', error);
        toast({
          variant: 'destructive',
          title: 'Análise Falhou',
          description: 'Não foi possível analisar a imagem da planta. Por favor, tente novamente.',
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
       toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao ler o arquivo.'});
       setIsLoading(false);
    }
  };

  return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar uma Nova Planta</CardTitle>
          <CardDescription>Envie uma foto e deixe nossa IA fazer o resto!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto da Planta</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {photoPreview ? (
                                <Image src={photoPreview} alt="Pré-visualização da planta" width={150} height={150} className="object-contain max-h-48 rounded-md" />
                              ) : (
                                <>
                                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, ou WEBP (MÁX. 4MB)</p>
                                </>
                              )}
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handlePhotoChange} />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Fred, a Figueira" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando sua planta...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-4 w-4" />
                    Adicionar ao Jardim
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}

export default AddPlantPage;
