# Documentação Técnica - IzyBotanic

## 1. Visão Geral da Arquitetura

O IzyBotanic é um aplicativo web full-stack construído com **Next.js** (React) no frontend e **Firebase** como backend (BaaS - Backend as a Service). A inteligência artificial é impulsionada pelo **Google Gemini** através do framework **Genkit**.

-   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI.
-   **Backend & Banco de Dados:** Firebase (Firestore para banco de dados NoSQL, Firebase Authentication para gerenciamento de usuários).
-   **Inteligência Artificial:** Google Gemini, orquestrado via Genkit para fluxos de IA.
-   **Hospedagem:** Firebase App Hosting.

### Fluxo de Dados Principal

1.  **Autenticação:** O usuário se cadastra ou faz login via Firebase Authentication (email/senha ou Google).
2.  **Criação do Documento do Usuário:** Após o primeiro login, um documento de usuário é criado na coleção `users` do Firestore, usando o UID do Firebase Auth como ID do documento.
3.  **Gerenciamento de Estado:** O `AuthContext` (localizado em `src/context/auth-context.tsx`) mantém o estado do usuário logado (incluindo todas as suas plantas, diários, etc.) em todo o frontend.
4.  **Interação com IA:** Quando uma função de IA é necessária (ex: análise de imagem), o frontend envia os dados para um "Server Action" do Next.js, que por sua vez invoca o fluxo Genkit correspondente.
5.  **Persistência de Dados:** Todas as alterações nos dados do usuário (adicionar uma planta, escrever no diário, etc.) são salvas no documento do usuário no Firestore através da função `updateUser` do `AuthContext`.

---

## 2. Estrutura de Dados (Firestore)

Temos uma coleção principal no Firestore:

-   **Coleção:** `users`
    -   **Documento:** `{userId}` (UID do Firebase Authentication)
    -   **Estrutura do Documento (Schema):** Consulte a interface `User` em `src/types/index.ts`.

```typescript
// src/types/index.ts
export interface User {
  id: string; // UID do Firebase Auth
  name: string;
  email: string;
  nickname: string;
  phone: string;
  photoURL: string;
  plants: Plant[]; // Array de objetos Plant
  journal: JournalEntry[]; // Array de objetos JournalEntry
  achievements: string[]; // Array de IDs de conquistas
  chatHistory: ChatMessage[]; // Array de objetos ChatMessage
}

export interface Plant extends AnalyzePlantImageOutput {
  id: string; // UUID gerado no frontend
  photoDataUri: string; // Imagem da planta em base64
  nickname: string;
  addedDate: string; // Data em formato ISO
}

export interface JournalEntry {
  id: string; // UUID gerado no frontend
  plantId: string; // ID da planta associada
  date: string; // Data em formato ISO
  notes: string;
}
```

**Importante para o Backend:** O backend, neste caso, é primariamente o Firestore e os fluxos de IA do Genkit. Não há um servidor Node.js customizado. A lógica "server-side" é manipulada por:
1.  **Firebase Security Rules:** (Não implementado, mas necessário para produção) Para proteger o acesso aos dados do Firestore.
2.  **Genkit Flows:** Funções de IA que rodam no ambiente do servidor do Next.js.

---

## 3. Funcionalidades Detalhadas

### 3.1. Autenticação e Perfil do Usuário

-   **Telas:** `/login`, `/signup`, `/dashboard/profile`
-   **Componentes Chave:** `login-form.tsx`, `signup-form.tsx`, `auth-context.tsx`
-   **Fluxo:**
    1.  O usuário se cadastra ou faz login usando email/senha ou Google.
    2.  O `AuthContext` manipula a comunicação com o Firebase Auth.
    3.  A função `getOrCreateUser` no `AuthContext` busca o documento do usuário no Firestore ou cria um novo se for o primeiro login.
    4.  O estado do usuário é mantido globalmente.
    5.  Na página de perfil, o usuário pode atualizar suas informações (nome, apelido, foto), que são salvas no Firestore através de `updateUser`.
    6.  **Modo Desenvolvedor:** Para contornar problemas de conexão local com o Firebase, um botão "Entrar como Desenvolvedor" está disponível em `localhost`. Ele cria um usuário fictício e simula a persistência de dados localmente, sem tocar no Firebase.

### 3.2. Análise e Gerenciamento de Plantas

-   **Telas:** `/dashboard/add-plant`, `/dashboard/my-garden`, `/dashboard/my-garden/[plantId]`
-   **Fluxo de IA:** `analyzePlantImage` (`src/ai/flows/analyze-plant-image.ts`)
-   **Fluxo Frontend:**
    1.  O usuário vai para "Adicionar Planta", digita um apelido e envia uma foto.
    2.  A imagem é convertida para um Data URI (base64).
    3.  A função `analyzePlantImage` é chamada, enviando o Data URI para o fluxo Genkit.
    4.  **Backend (Genkit):** O fluxo `analyzePlantImageFlow` usa o Gemini para analisar a imagem e o prompt, retornando um objeto JSON estruturado com a identificação, diagnóstico, plano de cuidados, etc. (conforme o `AnalyzePlantImageOutputSchema`).
    5.  **Frontend:** O resultado da IA é combinado com os dados do formulário para criar um novo objeto `Plant`.
    6.  Este novo objeto é adicionado ao array `plants` no objeto `User` e persistido no Firestore.
    7.  "Meu Jardim" exibe todas as plantas do usuário. Clicar em uma planta leva à página de detalhes.
    8.  Na página de detalhes, o usuário pode ver todas as informações da análise da IA e excluir a planta.

### 3.3. Diário da Planta

-   **Componente Chave:** `plant-journal.tsx` (usado na página de detalhes da planta)
-   **Fluxo:**
    1.  Na página de detalhes de uma planta, o usuário pode escrever uma anotação em um `textarea`.
    2.  Ao salvar, um objeto `JournalEntry` é criado com um ID único, o ID da planta associada, a data e a anotação.
    3.  Este objeto é adicionado ao array `journal` no objeto `User` e persistido no Firestore.
    4.  O histórico de anotações para aquela planta é exibido na mesma página, ordenado por data.

### 3.4. Chat com a Especialista Izy

-   **Tela:** `/dashboard/chat`
-   **Fluxo de IA:** `plantCareExpertChat` (`src/ai/flows/plant-care-expert-chat.ts`)
-   **Fluxo Frontend:**
    1.  O usuário digita uma pergunta.
    2.  Ao enviar, a função `plantCareExpertChat` é chamada.
    3.  O frontend envia a mensagem atual do usuário, o histórico de chat anterior e um resumo das plantas do usuário (para dar contexto à IA).
    4.  **Backend (Genkit):** O fluxo `plantCareExpertChatFlow` recebe todo o contexto, o injeta em um prompt para o Gemini e gera uma resposta no papel da especialista "Izy".
    5.  **Frontend:** A resposta do bot é exibida na interface. O histórico completo da conversa (incluindo a nova pergunta e resposta) é salvo no array `chatHistory` no objeto `User` e persistido no Firestore.

### 3.5. Gamificação (Conquistas)

-   **Tela:** `/dashboard/achievements`
-   **Lógica:** `src/lib/achievements.ts` (definição das conquistas), com a lógica de desbloqueio distribuída pelos componentes relevantes.
-   **Fluxo:**
    1.  Ações específicas do usuário (ex: adicionar a primeira planta, fazer 5 anotações no diário) disparam uma verificação.
    2.  O código verifica se o critério foi atendido E se o ID da conquista ainda NÃO está no array `achievements` do usuário.
    3.  Se ambas as condições forem verdadeiras, o ID da conquista é adicionado ao array `achievements` do usuário, e uma notificação (toast) é exibida.
    4.  A página "Minhas Conquistas" compara o array de conquistas do usuário com a lista completa de conquistas disponíveis para exibir o que foi desbloqueado.

---

## 4. Componentes e UI

-   **Biblioteca de Componentes:** `shadcn/ui`. Os componentes base estão em `src/components/ui` e não devem ser modificados diretamente.
-   **Componentes de Lógica:** Componentes reutilizáveis com lógica de aplicação estão em `src/components` (ex: `auth`, `plants`).
-   **Layout Principal:** O layout do dashboard (`src/app/dashboard/layout.tsx`) implementa a barra lateral de navegação (`Sidebar`) que é responsiva.
-   **Estilização:** Usa Tailwind CSS. As cores e fontes primárias são definidas em `src/app/globals.css` e `tailwind.config.ts` através de variáveis CSS HSL, permitindo fácil theming.
