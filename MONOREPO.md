# MonoRepo — Guia Central e Guardrails Basicos

## 1. Objetivo do Monorepo
Este repositorio centraliza multiplos projetos em pastas internas, cada um com seu escopo proprio.
O objetivo e compartilhar contexto, padroes e uma governanca minima comum entre todos os projetos.

## 2. Guardrails Basicos Padroes
- Cada projeto deve ficar em uma pasta propria na raiz do monorepo.
- Todo projeto novo deve ser cadastrado no registro central deste arquivo.
- Todo projeto deve ter ao menos um documento de entrada (README, Codex ou equivalente).
- Nomes de pastas devem ser curtos, descritivos e sem espacos.
- Alteracoes que afetem multiplos projetos devem indicar impacto cruzado no PR/commit.
- Toda mudanca de plano (escopo, prioridade, abordagem, ferramenta) deve ser registrada com motivo em `docs/plan-change-log.md`.
- Todo erro relevante encontrado durante execucao deve ser registrado com causa e correcao em `docs/error-log.md`.
- Todo incremento deve incluir testes automatizados de `unit` e `integration` para o comportamento alterado.
- PR sem cobertura de `unit` e `integration` para a mudanca deve ser reprovado.

## 3. Regra Obrigatoria para Agentes
Qualquer agente deve ler este `MONOREPO.md` antes de entrar em qualquer projeto interno.

Checklist de entrada do agente:
1. Localizar o projeto no registro central.
2. Ler o bloco do projeto (objetivo, status, stack e documento de entrada).
3. So entao atuar na pasta do projeto.

Se o projeto nao estiver cadastrado, o cadastro deve ser feito primeiro neste arquivo e somente depois a atuacao pode comecar.

## 4. Fluxo de Criacao de Novo Projeto
1. Criar a pasta do projeto na raiz do monorepo.
2. Adicionar o bloco do projeto na secao `Registro Central de Projetos`.
3. Criar o documento inicial do projeto (README, Codex ou equivalente).
4. Validar consistencia de nome, caminho e status.
5. Somente apos isso iniciar a implementacao.

## 5. Registro Central de Projetos
Formato oficial: blocos por projeto (nao tabela).

Campos obrigatorios por bloco:
- `Nome`
- `Pasta`
- `Objetivo`
- `Status` (`Planejamento`, `Em desenvolvimento`, `Ativo`, `Pausado`, `Arquivado`)
- `Stack principal`
- `Responsavel`
- `Criado em`
- `Ultima atualizacao`
- `Documento de entrada`

## 6. Projetos Cadastrados
### Projeto: TNS
- `Nome`: TNS
- `Pasta`: /TNS
- `Objetivo`: A definir
- `Status`: Em desenvolvimento
- `Stack principal`: A definir
- `Responsavel`: Adriano Dantas
- `Criado em`: A definir
- `Ultima atualizacao`: A definir
- `Documento de entrada`: /TNS/Codex-TNS.md

## 7. Template para Novo Cadastro
Copie e preencha o bloco abaixo para cada novo projeto:

```md
### Projeto: <NOME_DO_PROJETO>
- `Nome`: <nome oficial>
- `Pasta`: /<pasta-na-raiz>
- `Objetivo`: <resumo curto do objetivo>
- `Status`: <Planejamento|Em desenvolvimento|Ativo|Pausado|Arquivado>
- `Stack principal`: <tecnologias principais>
- `Responsavel`: <nome do responsavel>
- `Criado em`: <AAAA-MM-DD>
- `Ultima atualizacao`: <AAAA-MM-DD>
- `Documento de entrada`: /<pasta>/<arquivo-inicial>.md
```

## 8. Registro Obrigatorio de Contexto
Para manter historico tecnico reutilizavel:

1. Sempre registrar mudancas de plano em `docs/plan-change-log.md`, incluindo:
- contexto,
- decisao anterior,
- decisao nova,
- motivo da mudanca,
- impacto no backlog/sprint.

2. Sempre registrar erros e correcoes em `docs/error-log.md`, incluindo:
- sintoma,
- causa raiz,
- correcao aplicada,
- prevencao para recorrencia.

3. Regras de operacao:
- O registro deve ser feito no mesmo ciclo de trabalho da mudanca/erro.
- Entradas devem ser curtas e objetivas.
- Priorizar fatos verificaveis (comando, arquivo, workflow ou etapa impactada).
