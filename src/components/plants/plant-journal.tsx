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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, NotebookPen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  notes: z.string().min(5, { message: 'Sua nota precisa ter pelo menos 5 caracteres.' }).max(500, { message: 'Sua nota não pode ter mais de 500 caracteres.' }),
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

  const journalEntries = user?.journal.filter(entry => entry.plantId === plantId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><NotebookPen className="w-5 h-5" /> Nova Anotação</CardTitle>
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
                {isSubmitting ? 'Salvando...' : 'Salvar Anotação'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Histórico do Diário</h3>
        {journalEntries.length > 0 ? (
           <ScrollArea className="h-72 pr-4">
              <div className="space-y-4">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(entry.date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    <p className="text-foreground">{entry.notes}</p>
                  </div>
                ))}
              </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma anotação ainda. Adicione uma para começar!</p>
        )}
      </div>
    </div>
  );
}
