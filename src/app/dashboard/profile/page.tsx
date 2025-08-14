'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  nickname: z.string().optional(),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }).readonly(),
  phone: z.string().optional(),
  photoURL: z.string().url({ message: 'Por favor, insira uma URL válida.' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      nickname: user?.nickname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      photoURL: user?.photoURL || '',
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      await updateUser({
        ...user,
        name: data.name,
        nickname: data.nickname || '',
        phone: data.phone || '',
        photoURL: data.photoURL || '',
      });
      toast({
        title: 'Perfil Atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: 'Não foi possível salvar suas informações. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações e gerencie sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={form.watch('photoURL') || user?.photoURL} alt={user?.name} />
                    <AvatarFallback>
                        <UserIcon className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <FormField
                    control={form.control}
                    name="photoURL"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel>URL da Foto de Perfil</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/sua-foto.png"
                            {...field}
                          />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
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
                      <Input placeholder="Como você gostaria de ser chamado?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} disabled />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
