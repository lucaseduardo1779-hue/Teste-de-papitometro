# ⚽ Palpitômetro · Copa do Mundo 2026

Landing page + bolão para a Copa do Mundo de 2026 (EUA, México e Canadá).
As pessoas se identificam com **nome e e-mail**, dão palpites de placar para
**todos os 104 jogos** e disputam um **ranking** por pontos.

## Como funciona a pontuação

Por padrão: **1 ponto para cada placar exato cravado** (foi o pedido original).

Quer premiar também quem acertou só o vencedor (estilo bolão tradicional)?
Edite `scoring.js`:

```js
export const POINTS_EXACT = 3;   // cravou o placar exato
export const POINTS_RESULT = 1;  // acertou só quem venceu / empate
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

Os 12 grupos vêm do sorteio oficial da Copa 2026. Os **confrontos da fase de
grupos estão todos corretos** (todos contra todos dentro de cada grupo).
As **datas e horários são aproximados** — ajuste no painel admin se precisar.
O mata-mata vem com jogos vazios ("A definir"), a serem preenchidos no admin
conforme a competição avança.

Para ajustar grupos/datas na origem, edite `data/seed.js` (apague o arquivo
`worldcup.db` para recriar o banco do zero).

## Deploy

É um app Node + arquivos estáticos; roda em qualquer host que suporte Node 22+
(Render, Railway, Fly.io, etc.). Configure:

1. Comando de build: `npm install`
2. Comando de start: `npm start`
3. Variáveis: `ADMIN_PASSWORD` (e opcionalmente `PORT`, `DB_PATH`)

> Para manter os palpites entre deploys, aponte `DB_PATH` para um **disco
> persistente** (volume), já que o SQLite grava em arquivo.

## Estrutura

```
server.js        API Express + serve os arquivos estáticos
db.js            Schema SQLite + seed dos jogos
scoring.js       Regras de pontuação (configurável)
data/seed.js     Grupos, times e geração dos 104 jogos
public/          Frontend (landing, formulário, ranking, admin)
```
