import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-plant-image.ts';
import '@/ai/flows/plant-care-expert-chat.ts';
import '@/ai/flows/suggest-new-plants.ts';