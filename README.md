# Havenly

**Havenly** é uma aplicação moderna para gestão de imóveis, desenhada para locadores, imobiliárias e gestores que desejam controlar seus contratos de aluguel de maneira prática, intuitiva e multiplataforma. Desenvolvido com Angular, Ionic e Firebase, o projeto oferece experiência fluida tanto na web quanto em dispositivos móveis (Android/iOS), utilizando o poder do Capacitor para integração nativa.

---

## ✨ Visão Geral

O objetivo do Havenly é simplificar o gerenciamento de imóveis de aluguel, centralizando as principais funções do dia a dia de um locador em um só lugar: cadastro, consulta, filtragem, controle de vencimento, status de ocupação, cadastro de inquilinos, autenticação e muito mais.

---

## 🚀 Funcionalidades Principais

- **Cadastro de Imóveis:** Inclua informações como foto, endereço, valor do aluguel, data de vencimento, status (Alugado/Vazio) e inquilino.
- **Listagem e Filtros Dinâmicos:** Visualize todos seus imóveis, filtre por status (alugado/vazio) e pesquise por nome do imóvel ou inquilino.
- **Ações Rápidas:** Botão flutuante para adicionar e excluir imóveis (exclusão em desenvolvimento).
- **Autenticação Segura:** Registro, login e recuperação de senha através do Firebase Authentication.
- **Upload de Imagens:** Gerencie facilmente as fotos dos imóveis.
- **Persistência em Nuvem:** Todos os dados ficam armazenados no Firestore, com atualizações em tempo real.
- **Experiência Multiplataforma:** Interface responsiva otimizada para Android via Capacitor.
- **PWA Ready:** Instale como aplicativo em desktops ou dispositivos móveis.

---

## 🏗️ Arquitetura do Projeto

### Estrutura em Camadas

- **Frontend:**
  - Framework: **Angular 20.3.3**
  - UI/UX: **Ionic 8** (componentes visuais modernos, responsividade e experiência mobile-first)
  - Linguagem: **TypeScript 5.8**
  - Gerenciamento de rotas, formulários e observables (RxJS 7.8)
  - SPA (Single Page Application) com navegação fluida

- **Backend (BaaS):**
  - **Firebase**:
    - **Firestore:** Banco de dados NoSQL em tempo real para propriedades e usuários.
    - **Authentication:** Autenticação de usuários (e-mail/senha, recuperação de senha).
    - **Storage:** Upload e armazenamento das fotos dos imóveis.
    - **Hosting:** Possibilidade de deploy direto pelo Firebase Hosting.

- **Mobile/Native:**
  - **Capacitor 7.4.3:** Permite build nativo para Android e iOS, integrando funcionalidades do dispositivo (camera, status bar, haptics, etc.)

### Estrutura de Pastas

```
src/
├── app/
│   ├── home/               # Página principal, listagem e ações de imóveis
│   │   └── add-property/   # Cadastro de novo imóvel
│   ├── login/              # Autenticação
│   ├── register/           # Cadastro de usuário
│   ├── reset/              # Recuperação de senha
│   ├── services/           # Serviços (auth, property, models)
│   └── models/             # Tipos e interfaces
├── assets/                 # Imagens, ícones, etc.
├── environments/           # Configurações para diferentes ambientes
├── index.html              # HTML principal
└── main.ts                 # Bootstrap do app
```

---

## 🧰 Stacks e Versões

| Stack/Dependência        | Versão         |
| ------------------------ | -------------- |
| Angular                  | ^20.3.3        |
| Ionic                    | ^8.0.0         |
| Capacitor (Core/CLI)     | 7.4.3          |
| @angular/fire            | ^20.0.1        |
| Firebase JS SDK          | ^11.10.0       |
| RxJS                     | ~7.8.0         |
| TypeScript               | ~5.8.0         |
| Zone.js                  | ~0.15.0        |
| Ionicons                 | ^7.0.0         |

> Para detalhes completos, consulte o [package.json](https://github.com/vitoinacio/Havenly/blob/main/package.json).

---

## 🔒 Segurança e Autenticação

- **Firebase Authentication:** Todo acesso é autenticado via e-mail/senha.
- **Recuperação de Senha:** Fluxo robusto para redefinição via e-mail.
- **Proteção de rotas:** Apenas usuários autenticados acessam o painel de imóveis.

---

## ☁️ Configurações Firebase

O projeto já está pronto para integração com Firebase. Adicione suas chaves de ambiente em `src/environments/environment.ts` e `src/environments/environment.prod.ts`.

---

## 📱 Build & Execução

### Requisitos

- Node.js (>= 18.x)
- npm (>= 9.x)
- Ionic CLI (opcional para comandos rápidos)
- Android Studio/Xcode ou VSCode.

### Instalação

```bash
git clone https://github.com/vitoinacio/Havenly.git
cd Havenly
npm install
```

### Rodando no navegador

```bash
npm start
# ou
ng serve
```

### Build para produção

```bash
npm run build
```

### Build Mobile (Android/iOS)

```bash
npx cap sync
npx cap open android   # ou npx cap open ios
```

### Instale como PWA

Abra no navegador e instale como aplicativo via Chrome/Edge.

---

## 💡 Fluxo de Uso

1. **Login/Cadastro:** Usuário acessa via login ou cria conta.
2. **Painel de Imóveis:** Visualiza a lista, filtra e busca imóveis.
3. **Adicionar Imóvel:** Preenche dados e faz upload de foto.
4. **Gestão:** Pode atualizar status, buscar por inquilino ou imóvel, e futuramente excluir.
5. **Recuperação de Senha:** Se necessário, recupera acesso via e-mail.

---

## 🛠️ Testes e Qualidade

- ESLint e Angular ESLint para padronização do código
- Responsividade e acessibilidade garantidas pelo Ionic

---

## 👨‍💻 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request com melhorias, correções ou sugestões. Antes de contribuir, leia o código de conduta e siga os padrões do projeto.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📬 Contato

Desenvolvido por:  [Victor Hugo](https://github.com/vitoinacio),
                   [Julia](https://github.com/juliasntn),
                   [Ana Beatriz](https://github.com/beatizmonteiro)

Dúvidas? Sugestões? Fique à vontade para abrir uma issue ou entrar em contato!

---

> **Havenly:** Sua gestão de imóveis, simplificada, moderna e sempre à mão.
