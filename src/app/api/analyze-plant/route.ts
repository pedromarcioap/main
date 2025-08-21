import { NextRequest, NextResponse } from 'next/server';
import { analyzePlantImage } from '@/ai/flows/analyze-plant-image';
import { ai } from '@/ai/genkit';

// Helper function to convert a file stream to a data URI
async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  console.log('API /api/analyze-plant: Recebida requisição POST.');

  try {
    const formData = await req.formData();
    const photo = formData.get('photo') as File | null;

    if (!photo) {
      console.log('API Error: Nenhuma foto encontrada no formulário.');
      return NextResponse.json({ error: 'Nenhuma foto enviada.' }, { status: 400 });
    }

    console.log(`API: Foto recebida: ${photo.name}, Tamanho: ${photo.size} bytes, Tipo: ${photo.type}`);

    console.log('API: Convertendo foto para Data URI...');
    const photoDataUri = await fileToDataUri(photo);
    console.log('API: Conversão para Data URI concluída.');

    console.log('API: Executando o flow de análise do Genkit...');
    const analysisResult = await analyzePlantImage({ photoDataUri });
    console.log('API: Análise do Genkit concluída:', analysisResult);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('API /api/analyze-plant: Erro inesperado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: 'Falha ao analisar a imagem da planta.', details: errorMessage }, { status: 500 });
  }
}