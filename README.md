# Rastro SQL

> Toda consulta deixa um rastro.

Jogo educacional de investigação em português para aprender SQL resolvendo casos. O projeto combina narrativa, prática em um laboratório seguro e progressão gamificada.

## Stack

- Next.js 16 e React 19
- TypeScript
- AlaSQL para execução isolada no navegador
- Vitest para testes do catálogo e regras de progressão
- Deploy planejado para Vercel

## Desenvolvimento

```bash
npm install
npm run dev
```

Como portas locais estão bloqueadas no ambiente de desenvolvimento original, a validação principal é feita com:

```bash
npm run check
npm run build
```

## Conteúdo

O catálogo gratuito possui 200 casos distribuídos em oito operações pedagógicas:

1. `SELECT` e projeção de colunas
2. filtros com `WHERE`
3. ordenação e limites
4. operadores lógicos e padrões
5. funções de agregação
6. agrupamentos
7. junções
8. subconsultas

As referências pedagógicas apontam para a documentação oficial do PostgreSQL. O laboratório atual executa um subconjunto seguro de SQL no navegador; comandos de escrita e administração são bloqueados.

## Persistência

O progresso de visitante é salvo em `localStorage`. A autenticação com e-mail e senha está preparada com Supabase e mantém o modo visitante quando não há credenciais.

Para ativar o formulário de acesso:

1. Crie um projeto no Supabase.
2. Execute a migration `supabase/migrations/001_player_progress.sql`.
3. Copie `.env.example` para `.env.local`.
4. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Cadastre as mesmas variáveis no projeto da Vercel.

A sincronização do objeto de progresso com a tabela `player_progress` é a próxima integração prevista; até lá, entrar não remove nem substitui o progresso local.

## Fluxo de contribuição

O desenvolvimento acontece em branches específicas e segue [Conventional Commits](https://www.conventionalcommits.org/). Mudanças devem ser revisadas antes de chegar à branch principal.

## Licença

Ainda não definida. Até a escolha de uma licença, todos os direitos permanecem reservados ao autor.
