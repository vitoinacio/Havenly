
# Havenly

Gestor de Aluguéis para Proprietários de Imóveis

---

## Visão Geral
Havenly é uma plataforma completa para gestão de aluguéis, desenvolvida para atender proprietários que desejam controle total e profissional sobre seus imóveis, inquilinos e contratos. O sistema oferece uma interface intuitiva, recursos avançados e relatórios detalhados para facilitar a administração e tomada de decisão.

## Objetivos do Projeto
- Centralizar todas as informações dos imóveis em um só lugar
- Automatizar o controle de fluxo de inquilinos (entradas, saídas, histórico)
- Gerenciar contratos de aluguel, vencimentos e reajustes
- Acompanhar pagamentos, inadimplências e recebimentos
- Gerar relatórios e estatísticas para análise financeira
- Proporcionar segurança, transparência e praticidade ao proprietário

## Funcionalidades Principais
- **Cadastro de Imóveis:** Adicione, edite e remova propriedades com todos os detalhes relevantes.
- **Gestão de Inquilinos:** Controle entradas, saídas, histórico e dados dos locatários.
- **Contratos de Aluguel:** Crie, acompanhe e gerencie contratos, datas de vencimento, reajustes e encerramentos.
- **Controle Financeiro:** Visualize pagamentos, pendências, inadimplências e fluxo de caixa.
- **Relatórios Gerenciais:** Gere relatórios detalhados sobre ocupação, receitas, despesas e desempenho dos imóveis.
- **Notificações:** Receba alertas sobre vencimentos, pagamentos e movimentações importantes.

## Tecnologias Utilizadas
- **Frontend:** [Angular](https://angular.io/) + [Ionic](https://ionicframework.com/) para interface web e mobile
- **Mobile:** [Capacitor](https://capacitorjs.com/) para integração nativa com Android
- **Estilo:** SCSS para personalização visual

## Estrutura do Projeto
- `src/` - Código-fonte principal da aplicação
- `android/` - Projeto Android para build mobile
- `assets/` - Imagens, ícones e arquivos estáticos
- `environments/` - Configurações de ambiente (produção e desenvolvimento)
- `theme/` - Variáveis e temas visuais

## Como Executar o Projeto
1. **Instale as dependências:**
	```bash
	npm install
	```
2. **Execute em ambiente de desenvolvimento:**
	```bash
	npm start
	```
3. **Build para Android:**
	```bash
	ionic build
	npx cap sync android
	npx cap open android
	```

## Contribuição
Contribuições são bem-vindas! Para sugerir melhorias, reportar bugs ou enviar novas funcionalidades:
- Abra uma issue detalhando sua sugestão ou problema
- Envie um pull request seguindo as boas práticas do projeto

## Licença
Este projeto está licenciado sob a MIT License. Consulte o arquivo LICENSE para mais detalhes.
