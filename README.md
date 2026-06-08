# 🐕 DogDex

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
