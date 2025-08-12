'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { plantCareExpertChat } from '@/ai/flows/plant-care-expert-chat';
import type { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { IzyBotanicLogo } from '@/components/icons';
import { cn } from '@/lib/utils';

function ChatPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize messages from user's chat history
    if (user?.chatHistory) {
      setMessages(user.chatHistory);
    }
  }, [user?.chatHistory]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    const viewport =
      scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const plantAnalysis =
        user.plants
          .map(
            (p) =>
              `Planta: ${p.nickname} (${p.species})\nSaúde: ${p.health}\nPlano de Cuidados: ${p.fullCarePlan}`
          )
          .join('\n\n') || 'O usuário não possui plantas ainda.';

      // Send only the last 10 messages for context
      const chatHistoryForAI = newMessages.slice(-10);

      const response = await plantCareExpertChat({
        userMessage: input,
        chatHistory: chatHistoryForAI,
        plantAnalysis: plantAnalysis,
      });

      const newBotMessage: ChatMessage = {
        role: 'bot',
        content: response.botMessage,
      };
      
      const updatedMessages = [...newMessages, newBotMessage];
      setMessages(updatedMessages);

      if (user) {
        const updatedUser = { ...user, chatHistory: updatedMessages };
        if (!user.achievements.includes('chatty-gardener')) {
          updatedUser.achievements.push('chatty-gardener');
          toast({
            title: 'Conquista Desbloqueada!',
            description: 'Você ganhou "Jardineiro Tagarela"!',
          });
        }
        // Update user data in Firestore without waiting
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
      };
      setMessages([...newMessages, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          'Não foi possível obter uma resposta da Izy. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="flex h-[calc(100vh-10rem)] flex-col">
      <CardHeader>
        <CardTitle>Converse com a Izy</CardTitle>
        <CardDescription>
          Sua especialista pessoal em cuidados com plantas com IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'bot' && (
                  <div className="h-9 w-9 rounded-full border bg-primary/20 p-1">
                    <IzyBotanicLogo />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-primary text-primary-foreground'
                      : 'rounded-bl-none bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.role === 'user' && user && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage
                      src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`}
                      alt={user.name || ''}
                    />
                    <AvatarFallback>
                      {getInitials(user.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start justify-start gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full border bg-primary/20 p-1">
                  <IzyBotanicLogo />
                </div>
                <div className="rounded-lg rounded-bl-none bg-muted p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre cuidados com plantas, pragas ou qualquer outra coisa..."
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatPage;
