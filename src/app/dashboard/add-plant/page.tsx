
'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Plant, User } from '@/types';
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
import { Camera, Loader2 } from 'lucide-react';
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
    
    let success = false;
    setIsSubmitting(true);

    try {
      console.log('Passo 1: Upload da imagem para o Firebase Storage...');
      const storageRef = ref(
        storage,
        `plants/${user.id}/${crypto.randomUUID()}-${photoFile.name}`
      );
      const uploadResult = await uploadBytes(storageRef, photoFile);
      const photoURL = await getDownloadURL(uploadResult.ref);
      console.log('Upload concluído. URL da foto:', photoURL);

      console.log('Passo 2: Chamando a API de análise...');
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        body: formData,
      });

      console.log('Resposta da API recebida. Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API de análise:', errorData);
        throw new Error(
          errorData.error || 'A análise da planta falhou.'
        );
      }

      const analysisResult = await response.json();
      console.log('Análise concluída:', analysisResult);

      console.log('Passo 3: Salvando os dados da planta no Firestore...');
      const newPlantData = {
        // Não geramos ID de planta aqui, o Firestore fará isso
        userId: user.id,
        nickname: data.nickname,
        photoURL: photoURL,
        addedDate: new Date().toISOString(),
        ...analysisResult,
      };

      // Usando addDoc para que o Firestore gere o ID do documento
      const docRef = await addDoc(collection(db, 'plants'), newPlantData);
      console.log('Planta salva no Firestore com o ID:', docRef.id);



      toast({
        title: 'Planta Adicionada!',
        description: `${data.nickname} agora faz parte do seu jardim.`,
      });
      
      success = true;

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
       if(success) {
        router.push('/dashboard/my-garden');
       }
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
                            fill={true}
                            style={{objectFit: 'cover'}}
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
