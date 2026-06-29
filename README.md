<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# DogDex

> É um projeto gamificado para catalogar, interagir e ajudar os cachorros que vivem no campus da universidade UNESC.

O **DogDex** é uma aplicação web inspirada no universo Pokémon. Através da leitura de QR Codes acoplados nas coleiras dos cachorros da universidade, os alunos podem "capturar" os cães virtualmente para preencher sua DogDex. Mais do que um jogo, o projeto tem um forte viés social: o engajamento dos usuários e o incentivo a doações de suprimentos ou dinheiro e também promover a adoção desses animais comunitários.

---

## Como Funciona?

Cada cachorro mapeado na universidade possui uma coleira com um QR Code exclusivo. Ao escanear o código com o celular, o usuário tenta realizar uma captura virtual.

Se for bem-sucedido, o cachorro é registrado na sua **DogDex**, exibindo:

* Número na Pokédex
* Nome, Idade e Raça
* Descrição da personalidade e história
* Sprite exclusivo desenhado manualmente

---

## Estrutura da Aplicação

### Área do Usuário
* **Landing Page:** Apresentação do projeto e opções de acesso (Login, Criar Conta, Login com Google).
* **DogDex:** Painel principal do usuário mostrando os cachorros capturados, silhuetas dos que ainda faltam, versões Shiny e evoluções desbloqueadas.

### Sistema de Administração
Acesso restrito para a gestão da plataforma:
* Adicionar e editar informações de novos cachorros.
* Adicionar sprites do Aseprite.
* Gerar os QR Codes para as coleiras.
* Visualizar estatísticas de uso e metas globais.
>>>>>>> da5465eb1a0ae519224aaff946daf75cea0db5a6
