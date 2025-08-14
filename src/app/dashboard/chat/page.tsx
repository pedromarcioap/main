'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { ChatMessage, Plant } from '@/types';
import { plantCareExpertChat } from '@/ai/flows/plant-care-expert-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.chatHistory) {
      setMessages(user.chatHistory);
    }
  }, [user]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const plantAnalysis = user.plants.map(p => 
        `Apelido: ${p.nickname}, Espécie: ${p.species}, Saúde: ${p.health}, Diagnóstico: ${p.detailedDiagnosis}`
      ).join('\n');

      const chatResponse = await plantCareExpertChat({
        plantAnalysis: plantAnalysis,
        chatHistory: newMessages,
        userMessage: input,
      });

      const botMessage: ChatMessage = {
        role: 'bot',
        content: chatResponse.botMessage,
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      
      const updatedUser = {
        ...user,
        chatHistory: updatedMessages,
      };
      
      const newAchievements: string[] = [];

      // Check for 'chatty-gardener' achievement
      if (!user.achievements.includes('chatty-gardener')) {
        newAchievements.push('chatty-gardener');
      }

      // Check for 'botanical-sage' achievement
      const userMessagesCount = updatedMessages.filter(m => m.role === 'user').length;
      if (userMessagesCount >= 5 && !user.achievements.includes('botanical-sage')) {
          newAchievements.push('botanical-sage');
      }

      if (newAchievements.length > 0) {
        updatedUser.achievements.push(...newAchievements);
        const achievementMessages: {[key: string]: string} = {
            'chatty-gardener': 'Jardineiro Tagarela: Você teve sua primeira conversa com Izy!',
            'botanical-sage': 'Sábio Botânico: Você fez 5 perguntas para Izy!'
        }
        
        newAchievements.forEach(id => {
            toast({
              title: 'Nova Conquista!',
              description: achievementMessages[id],
            });
        })
      }

      await updateUser(updatedUser);

    } catch (error) {
      console.error('Erro ao conversar com o especialista:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Conversa',
        description: 'Não foi possível obter uma resposta. Tente novamente.',
      });
      setMessages(newMessages); // Revert to messages before bot response
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Fale com a Izy</h1>
        <p className="text-muted-foreground">Sua especialista em botânica com IA.</p>
      </header>
      <div className="flex-grow overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'bot' && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <footer className="mt-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
