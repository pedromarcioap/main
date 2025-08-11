import type { Achievement } from '@/types';
import { Sprout, Users, Bot, BookOpenCheck } from 'lucide-react';

export const achievements: Achievement[] = [
  {
    id: 'first-sprout',
    title: 'First Sprout',
    description: 'Add your very first plant to your collection.',
    icon: Sprout,
  },
  {
    id: 'green-thumb',
    title: 'Green Thumb',
    description: 'Grow your collection to 5 plants.',
    icon: Users,
  },
  {
    id: 'chatty-gardener',
    title: 'Chatty Gardener',
    description: 'Have your first chat with Izy, the plant expert.',
    icon: Bot,
  },
  {
    id: 'diligent-student',
    title: 'Diligent Student',
    description: 'View the full care plan for one of your plants.',
    icon: BookOpenCheck,
  },
];
