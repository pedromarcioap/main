import type { Achievement } from '@/types';
import { Sprout, Users, Bot, BookOpenCheck } from 'lucide-react';

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
    id: 'chatty-gardener',
    title: 'Jardineiro Tagarela',
    description: 'Tenha sua primeira conversa com Izy, a especialista em plantas.',
    icon: Bot,
  },
  {
    id: 'diligent-student',
    title: 'Estudante Diligente',
    description: 'Veja o plano de cuidados completo de uma de suas plantas.',
    icon: BookOpenCheck,
  },
];
