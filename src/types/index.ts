import type { AnalyzePlantImageOutput } from "@/ai/flows/analyze-plant-image";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plants: Plant[];
  journal: JournalEntry[];
  achievements: string[];
  chatHistory: ChatMessage[];
}

export interface Plant extends AnalyzePlantImageOutput {
  id: string;
  photoDataUri: string;
  nickname: string;
  addedDate: string;
}

export interface JournalEntry {
  id: string;
  plantId: string;
  date: string;
  notes: string;
  photo?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ChatMessage {
  user: string;
  bot: string;
}
