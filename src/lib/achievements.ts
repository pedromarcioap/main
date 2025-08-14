import type { Achievement } from '@/types';
import { Sprout, Users, Bot, BookOpenCheck, Crown, BookUser, MessageSquareQuote } from 'lucide-react';

export const achievements: Achievement[] = [
  {
    id: 'first-sprout',
    title: 'Primeiro Broto',
    description: 'Adicione sua primeira planta à sua coleção.',
    icon: Sprout,
  },
  {
    id: 'green-thumb',
    title: 'Dedo Verde',
    description: 'Aumente sua coleção para 5 plantas.',
    icon: Users,
  },
  {
    id: 'enthusiast-collector',
    title: 'Colecionador Entusiasta',
    description: 'Aumente sua coleção para 10 plantas.',
    icon: Crown,
  },
  {
    id: 'master-botanist',
    title: 'Mestre Botânico',
    description: 'Aumente sua coleção para 25 plantas.',
    icon: Crown,
  },
  {
    id: 'chatty-gardener',
    title: 'Jardineiro Tagarela',
    description: 'Tenha sua primeira conversa com Izy, a especialista em plantas.',
    icon: Bot,
  },
  {
    id: 'botanical-sage',
    title: 'Sábio Botânico',
    description: 'Faça 5 perguntas para a especialista em plantas Izy.',
    icon: MessageSquareQuote,
  },
  {
    id: 'diligent-student',
    title: 'Estudante Diligente',
    description: 'Veja o plano de cuidados completo de uma de suas plantas.',
    icon: BookOpenCheck,
  },
  {
    id: 'journal-curator',
    title: 'Curador de Diários',
    description: 'Faça 10 anotações no diário de suas plantas.',
    icon: BookUser,
  },
];
