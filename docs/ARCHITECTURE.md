This structure was designed for a small to medium-sized project, using Expo Router, NativeWind, and consuming an external API. The goal is to maintain organization, scalability, and clarity by separating the responsibilities of each part of the code.

```plaintext
├── app/                  # 📂 Roteamento (Expo Router)
│   ├── (auth)/           # 🔐 Rotas de autenticação
│   │   ├── _layout.tsx   #    Layout do fluxo de autenticação
│   │   └── auth.tsx      #    Tela de autenticação (login/register)
│   ├── (tabs)/           # 📑 Rotas principais (navegação por abas)
│   │   ├── _layout.tsx   #    Layout das abas (configuração do Tabs)
│   │   └── index.tsx     #    Tela Home (primeira aba)
│   └── _layout.tsx       # 🌍 Layout global da aplicação (providers, fontes)
│
├── src/                  # 💻 Código fonte da aplicação
│   ├── api/              # 🌐 Lógica de comunicação com a API
│   │   ├── index.ts      #    Configuração do client (ex: Axios, Fetch)
│   │   └── services/     #    Funções específicas por recurso da API
│   │       ├── auth.ts   #    (login, logout)
│   │       └── user.ts   #    (getUser, updateUser)
│   │
│   ├── components/       # 🧩 Componentes reutilizáveis
│   │   ├── core/         #    Componentes de UI genéricos (Button, Input, Card)
│   │   └── features/     #    Componentes específicos de uma funcionalidade
│   │
│   ├── contexts/         # 📦 Gerenciamento de estado global com Context API
│   │   └── AuthContext.tsx #  Contexto para dados de autenticação
│   │
│   ├── hooks/            # 🪝 Hooks customizados
│   │   └── useAuth.ts    #    Hook para acessar o AuthContext
│   │
│   ├── lib/              # 🛠️ Funções utilitárias e helpers
│   │   └── utils.ts      #    Formatadores de data, validadores, etc.
│   │
│   ├── constants/        # 📏 Constantes (cores, temas, dimensões)
│   │   └── theme.ts      #    Definições de cores, fontes, espaçamentos
│   │
│   └── @types/           # 📝 Tipagens TypeScript
│       └── index.d.ts    #    Tipos globais e de respostas da API
│
├── assets/               # 🎨 Arquivos estáticos
│   ├── fonts/
│   └── images/
│
├── .env.example          # 📄 Exemplo de variáveis de ambiente
├── app.json              # ⚙️ Configuração do Expo
├── tailwind.config.js    # 🎨 Configuração do NativeWind
└── tsconfig.json         # 📜 Configuração do TypeScript
```
