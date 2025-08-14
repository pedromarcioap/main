'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { JournalEntry } from '@/types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, NotebookPen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  notes: z
    .string()
    .min(5, { message: 'Sua nota precisa ter pelo menos 5 caracteres.' })
    .max(500, { message: 'Sua nota não pode ter mais de 500 caracteres.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface PlantJournalProps {
  plantId: string;
}

export function PlantJournal({ plantId }: PlantJournalProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: '' },
  });

  const journalEntries =
    user?.journal
      .filter((entry) => entry.plantId === plantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) ||
    [];

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) return;
    setIsSubmitting(true);

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      plantId: plantId,
      date: new Date().toISOString(),
      notes: data.notes,
    };

    try {
      const updatedUser = { ...user, journal: [...user.journal, newEntry] };
      await updateUser(updatedUser);
      toast({
        title: 'Entrada Adicionada!',
        description: 'Suas anotações foram salvas no diário.',
      });
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar a entrada do diário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar sua anotação. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;

    const updatedJournal = user.journal.filter((entry) => entry.id !== entryId);

    try {
      await updateUser({ ...user, journal: updatedJournal });
      toast({
        title: 'Anotação Excluída!',
        description: 'Sua anotação foi removida do diário.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a anotação. Tente novamente.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <NotebookPen className="h-5 w-5" /> Nova Anotação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suas anotações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Novos brotos apareceram hoje!"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Salvando...' : 'Salvar Anotação'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico do Diário</h3>
        {journalEntries.length > 0 ? (
          <ScrollArea className="h-72 pr-4">
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="group relative rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(
                        new Date(entry.date),
                        "dd 'de' MMMM, yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                  <p className="text-foreground">{entry.notes}</p>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente esta anotação.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className="bg-destructive hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="py-4 text-center text-muted-foreground">
            Nenhuma anotação ainda. Adicione uma para começar!
          </p>
        )}
      </div>
    </div>
  );
}
