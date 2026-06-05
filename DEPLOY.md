# 🚀 Deploy no Render

Guia passo a passo para colocar o Palpitômetro no ar usando o **Render**.
Não precisa instalar nada no seu computador — é tudo pelo navegador.

---

## ⚠️ Antes de começar: persistência dos dados (importante!)

O app guarda os palpites e o ranking num arquivo SQLite. No Render:

- **Plano gratuito (`free`):** o serviço **hiberna** após ~15 min sem acesso e,
  ao reiniciar (ou a cada novo deploy), **o arquivo de dados é apagado**. Ou seja,
  os palpites e o ranking se perdem. 👉 **Ótimo para testar**, ruim para valer.
- **Plano pago (`starter`, ~US$7/mês) + disco persistente:** os dados ficam
  salvos para sempre. 👉 **Use este para o bolão de verdade.**

Mais abaixo explico como ativar a persistência (é só descomentar 3 trechos do
`render.yaml`). Se preferir manter de graça e garantido, me chame que eu troco o
banco para **PostgreSQL** (o Render oferece Postgres gerenciado).

---

## Passo a passo (modo Blueprint — mais fácil)

1. **Garanta que o código está no GitHub.**
   Já está, no repositório `Teste-de-papitometro`. Faça o deploy a partir da
   branch que você quiser (ex.: faça o merge para `main`).

2. **Crie uma conta no Render:** https://render.com → *Get Started* (pode entrar
   com a conta do GitHub).

3. No painel do Render, clique em **New +** → **Blueprint**.

4. **Conecte o repositório** `Teste-de-papitometro` e autorize o Render a acessá-lo.

5. O Render vai **ler o arquivo `render.yaml`** automaticamente e mostrar o
   serviço `palpitometro-copa-2026`. Clique em **Apply** / **Create**.

6. Aguarde o build (uns 2–3 min). Quando terminar, o Render te dá uma URL tipo:
   `https://palpitometro-copa-2026.onrender.com` 🎉

7. **Pegue a senha do admin:** no painel do serviço → aba **Environment** →
   variável `ADMIN_PASSWORD`. Você pode **trocar por uma senha sua** ali mesmo
   (depois clique em *Save* — o serviço reinicia).

   - Site dos palpites: `https://SEU-APP.onrender.com`
   - Painel admin: `https://SEU-APP.onrender.com/admin.html`

---

## 🔒 Ativando a persistência (plano pago)

Para que palpites e ranking **nunca se percam**, edite o `render.yaml`:

1. Troque `plan: free` por `plan: starter`.
2. Descomente as 2 linhas de `DB_PATH`:
   ```yaml
   - key: DB_PATH
     value: /data/worldcup.db
   ```
3. Descomente o bloco do disco:
   ```yaml
   disk:
     name: data
     mountPath: /data
     sizeGB: 1
   ```
4. Faça commit/push. O Render aplica as mudanças no próximo deploy.

---

## Deploy manual (sem Blueprint), caso prefira

1. **New +** → **Web Service** → conecte o repositório.
2. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Em **Environment**, adicione:
   - `NODE_VERSION` = `22`
   - `ADMIN_PASSWORD` = (uma senha forte sua)
   - (persistência) `DB_PATH` = `/data/worldcup.db` + adicione um **Disk** em
     `/data` na aba *Disks* (requer plano pago).
4. **Create Web Service**.

---

## Dúvidas comuns

- **A primeira visita demora a abrir (plano free):** normal — o serviço estava
  hibernando e está "acordando". Depois fica rápido.
- **Esqueci a senha do admin:** veja/edite em *Environment → `ADMIN_PASSWORD`*.
- **Quero domínio próprio** (ex.: `bolao.seusite.com`): dá pra configurar em
  *Settings → Custom Domains*.
- **Precisa de Node 22+:** já está fixado em `.node-version` e no `render.yaml`.
