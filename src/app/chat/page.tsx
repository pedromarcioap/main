'use client';

import React, { useState, useRef, useEffect } from 'react';
import withAuth from '@/components/auth/with-auth';
import { useAuth } from '@/hooks/use-auth';
import { plantCareExpertChat } from '@/ai/flows/plant-care-expert-chat';
import type { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [messages, setMessages] = useState<ChatMessage[]>(user?.chatHistory || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.chatHistory) {
      setMessages(user.chatHistory);
    }
  }, [user?.chatHistory]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = { user: input, bot: '' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        const plantAnalysis = user.plants.map(p => `Planta: ${p.nickname} (${p.species})\nAnálise:\n${p.fullCarePlan}`).join('\n\n');
        
        const response = await plantCareExpertChat({
            userMessage: input,
            chatHistory: messages,
            plantAnalysis: plantAnalysis,
        });

        const newBotMessage = response.botMessage;
        const updatedMessages = [...newMessages.slice(0, -1), { user: input, bot: newBotMessage }];
        setMessages(updatedMessages);

        const updatedUser = { ...user, chatHistory: updatedMessages };
        if (!user.achievements.includes('chatty-gardener')) {
          updatedUser.achievements.push('chatty-gardener');
          toast({ title: 'Conquista Desbloqueada!', description: 'Você ganhou "Jardineiro Tagarela"!' });
        }
        updateUser(updatedUser);

    } catch (error) {
        console.error('Erro no chat:', error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível obter uma resposta da Izy. Por favor, tente novamente.' });
        setMessages(messages); // Revert to previous messages on error
    } finally {
        setIsLoading(false);
    }
  };

  return (
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader>
            <CardTitle>Converse com a Izy</CardTitle>
            <CardDescription>Sua especialista pessoal em cuidados com plantas com IA.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <p className="text-sm text-foreground">{msg.user}</p>
                    </div>
                  </div>
                  {msg.bot && (
                    <div className="flex items-start gap-3 mt-4 justify-start">
                        <div className="h-9 w-9 border rounded-full p-1 bg-primary/20">
                            <IzyBotanicLogo />
                        </div>
                      <div className="bg-primary/80 text-primary-foreground p-3 rounded-lg rounded-bl-none max-w-[80%]">
                        <p className="text-sm">{msg.bot}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && !messages[messages.length-1]?.bot && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="h-9 w-9 border rounded-full p-1 bg-primary/20">
                        <IzyBotanicLogo className="animate-pulse" />
                    </div>
                    <div className="bg-primary/80 text-primary-foreground p-3 rounded-lg rounded-bl-none">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre cuidados com plantas, pragas ou qualquer outra coisa..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
  );
}

export default withAuth(ChatPage);
