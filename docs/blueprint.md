# **App Name**: IzyBotanic

## Core Features:

- Armazenamento de Dados do Usuário: Simular um sistema backend multiusuário usando localStorage para salvar dados do usuário, coleções de plantas, entradas de diário, conquistas e histórico de chat
- Autenticação de Usuário: Permitir que os usuários se inscrevam usando nome, e-mail e senha. As senhas devem ser criptografadas usando o algoritmo SHA-256
- Análise de Planta por IA: Usar a API Gemini, com modo JSON e um responseSchema, para identificar a planta, avaliar sua saúde e diagnosticar quaisquer problemas com base na imagem fornecida pelo usuário. A saída deve descrever a frequência de rega, as necessidades de luz solar, dicas de especialistas e tratamentos. Gemini deve incorporar informações sobre a planta de uma ferramenta para raciocinar quando usar essas informações. Retornar um plano de cuidados completo, potenciais pragas e doenças, e sugerir possíveis tratamentos.
- Exibição da Análise: Exibir os resultados da análise de IA em um formato visualmente rico e fácil de entender
- Painel: Exibir alertas de cuidados críticos, um calendário de cuidados que exibe todas as tarefas de cuidados futuros e dicas sazonais, em uma visualização rápida.
- Chat de Especialista em IA: Funcionalidade de chat de especialista em IA usando a API Gemini, e exibindo-o usando uma interface de conversação que permite aos usuários fazer perguntas de acompanhamento para Izy. O histórico do chat deve ser usado para fornecer contexto para a IA, permitindo respostas mais relevantes e úteis.
- Recomendações e Conquistas: Incluir uma camada de gamificação com conquistas e um mecanismo de recomendação alimentado por IA que sugere novas plantas com base na coleção atual do usuário para impulsionar o engajamento do usuário

## Style Guidelines:

- Cor primária: Verde suave (#A7D1AB) para evocar a natureza e o crescimento, criando uma atmosfera calma e convidativa.
- Cor de fundo: Verde muito claro (#F2F9F3), quase branco, proporcionando um pano de fundo limpo e fresco.
- Cor de destaque: Marrom terroso (#B18F62), usado com moderação para destaques e chamadas para ação para adicionar calor e sofisticação.
- Fonte do título: 'Belleza', uma sans-serif humanista com personalidade, para uma sensação elegante e sofisticada.
- Fonte do corpo: 'Alegreya', uma serif humanista para textos mais longos para garantir legibilidade e elegância.
- Usar ícones de linha com cantos arredondados e detalhes moderados para corresponder ao tema orientado para a natureza.
- Efeitos de transição sutis e animações nas interações do usuário para uma experiência de usuário aprimorada