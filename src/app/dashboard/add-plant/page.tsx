'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzePlantImage } from '@/ai/flows/analyze-plant-image';
import { useAuth } from '@/hooks/use-auth';
import type { Plant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: 'O apelido deve ter pelo menos 2 caracteres.' }),
  photo: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPlantPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nickname: '' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user || !photoFile) {
      toast({
        variant: 'destructive',
        title: 'Foto Obrigatória',
        description: 'Por favor, envie uma foto da sua planta.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        
        const analysisResult = await analyzePlantImage({ photoDataUri: base64Photo });

        const newPlant: Plant = {
          id: crypto.randomUUID(),
          nickname: data.nickname,
          photoDataUri: base64Photo,
          addedDate: new Date().toISOString(),
          ...analysisResult
        };

        const updatedUser = {
          ...user,
          plants: [...user.plants, newPlant],
        };

        // Check for 'first-sprout' achievement
        if (!user.achievements.includes('first-sprout')) {
          updatedUser.achievements.push('first-sprout');
          toast({
            title: 'Nova Conquista!',
            description: 'Primeiro Broto: Você adicionou sua primeira planta!',
          });
        }

        // Check for 'green-thumb' achievement
        if (updatedUser.plants.length >= 5 && !user.achievements.includes('green-thumb')) {
          updatedUser.achievements.push('green-thumb');
          toast({
            title: 'Nova Conquista!',
            description: 'Dedo Verde: Você aumentou sua coleção para 5 plantas!',
          });
        }

        await updateUser(updatedUser);

        toast({
          title: 'Planta Adicionada!',
          description: `${data.nickname} agora faz parte do seu jardim.`,
        });

        router.push(`/dashboard/my-garden/${newPlant.id}`);
      };
    } catch (error) {
      console.error('Erro ao adicionar planta:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Análise',
        description:
          'Não foi possível analisar a imagem da sua planta. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Adicionar Nova Planta</CardTitle>
          <CardDescription>
            Tire uma foto e dê um apelido para sua nova amiga verde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido da Planta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Zami, a Zamioculca"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={() => (
                  <FormItem>
                    <FormLabel>Foto da Planta</FormLabel>
                    <FormControl>
                      <div
                        className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                        {photoPreview ? (
                          <Image
                            src={photoPreview}
                            alt="Prévia da planta"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Camera className="mx-auto h-12 w-12 mb-2" />
                            <p>Clique para enviar ou tirar uma foto</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !photoPreview}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando e salvando...
                  </>
                ) : (
                  'Adicionar ao Jardim'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
