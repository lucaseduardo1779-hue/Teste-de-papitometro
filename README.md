# ⚽ Palpitômetro · Copa do Mundo 2026

Landing page + bolão para a Copa do Mundo de 2026 (EUA, México e Canadá).
As pessoas se identificam com **nome e e-mail**, dão palpites de placar para
**todos os 104 jogos** e disputam um **ranking** por pontos.

## Como funciona a pontuação

Estilo bolão tradicional (padrão):

- **3 pontos** — cravou o **placar exato** (ex.: palpite 2×1, deu 2×1)
- **1 ponto** — acertou só o **vencedor/empate** (ex.: palpite 2×1, deu 3×0)

Quer "1 ponto só por placar exato"? Edite `scoring.js`:

```js
export const POINTS_EXACT = 1;
export const POINTS_RESULT = 0;
```

## Rodando localmente

Requer **Node.js 22.5+** (usa o módulo nativo `node:sqlite`, sem banco externo).

```bash
npm install
npm start
```

Acesse:
- Site / palpites: http://localhost:3000
- Painel admin: http://localhost:3000/admin.html

### Variáveis de ambiente

| Variável         | Padrão        | Descrição                                  |
|------------------|---------------|--------------------------------------------|
| `PORT`           | `3000`        | Porta do servidor                          |
| `ADMIN_PASSWORD` | `copa2026`    | **Troque isto!** Senha do painel admin     |
| `DB_PATH`        | `./worldcup.db` | Caminho do arquivo SQLite                 |

> ⚠️ Em produção defina uma `ADMIN_PASSWORD` forte.

## Painel de administração (`/admin.html`)

- **Lançar resultados:** digite o placar de cada jogo e salve. O ranking
  recalcula automaticamente.
- **Editar jogos:** botão *Editar* permite definir os times, bandeiras e a
  data — essencial para o **mata-mata**, cujos times só são conhecidos depois
  da fase de grupos.
- **Participantes:** lista de quem já enviou palpites.

## Regras de palpite

- Cada participante é identificado pelo **e-mail** (único). Basta usar o mesmo
  e-mail para voltar e editar os palpites.
- Cada jogo **trava no horário do apito inicial** (`kickoff`) — depois disso o
  palpite não pode mais ser alterado.

## Sobre os dados dos jogos

Os **72 jogos da fase de grupos** estão cadastrados conforme a **tabela oficial**
da Copa 2026: confrontos, datas e horários (**horário de Brasília**). No site os
horários são sempre exibidos no fuso de Brasília, independentemente de onde o
visitante esteja.

O **mata-mata** (32 jogos) vem com os confrontos vazios ("A definir"), pois os
times só são conhecidos após a fase de grupos — preencha-os no painel admin
conforme a competição avança.

Para ajustar qualquer jogo na origem, edite `data/seed.js` (apague o arquivo
`worldcup.db` para recriar o banco do zero).

## Deploy

Guia completo, passo a passo, no **[DEPLOY.md](DEPLOY.md)** (configurado para o
**Render** via `render.yaml` — deploy automático lendo o repositório).

Resumo: é um app Node + arquivos estáticos; roda em qualquer host com Node 22+.
- Build: `npm install`
- Start: `npm start`
- Variáveis: `ADMIN_PASSWORD` (e, para persistência, `DB_PATH` apontando para um
  **disco persistente**, já que o SQLite grava em arquivo).

> ⚠️ Para os palpites e o ranking **não se perderem**, é preciso um disco
> persistente — veja a seção de persistência no `DEPLOY.md`.

## Estrutura

```
server.js        API Express + serve os arquivos estáticos
db.js            Schema SQLite + seed dos jogos
scoring.js       Regras de pontuação (configurável)
data/seed.js     Grupos, times e geração dos 104 jogos
public/          Frontend (landing, formulário, ranking, admin)
```
