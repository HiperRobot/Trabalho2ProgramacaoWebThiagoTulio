# Trabalho2ProgramacaoWebThiagoTulio

Túlio Gomes Vuolo - 1920306
Thiago Henriques - 2211171


# MiniTwitter – Trabalho 2 de Programação para Web

Este projeto é um **MiniTwitter** desenvolvido para o Trabalho 2 de Programação para Web, com:

* **Back-end** em **Python + Django + Django REST Framework** (API REST)
* **Front-end** separado em **TypeScript + HTML + CSS + Bootstrap 5**
* Autenticação via **Token** (DRF authtoken)
* Controle de permissões:

  * Usuário comum só vê e edita **seus próprios tweets**
  * Usuário **admin** vê todos os tweets e pode **apagar** qualquer um (mas não editar tweet de outro usuário)
* CORS habilitado
* Documentação automática da API via **Swagger**

O projeto foi pensado para rodar em **GitHub Codespaces**, com **dois servidores diferentes**:

1. Servidor Django (backend) rodando na porta **8000**
2. Servidor `lite-server` (frontend) rodando na porta **3000**

> ⚠️ **IMPORTANTE:** no Codespaces, é preciso marcar as portas **8000** e **3000** como **Public** para que o navegador consiga acessar os dois serviços.

---

## 1. Estrutura do projeto

```text
Trabalho2ProgramacaoWebThiagoTulio/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── mini_twitter/
│   ├── tweets/
│   └── accounts/
└── frontend/
    ├── index.html
    ├── css/
    ├── src/
    │   └── main.ts
    ├── dist/
    ├── package.json
    └── tsconfig.json
```

### 1.1. Backend

* `backend/requirements.txt`
  Lista de dependências do backend (Django, DRF, CORS, Swagger etc.).

* `backend/mini_twitter/settings.py`
  Configuração do Django, DRF, CORS, CSRF e Swagger.

* `backend/tweets/`

  * `models.py` → modelo `Tweet`
  * `serializers.py` → `TweetSerializer`
  * `views.py` → `TweetViewSet` (CRUD)
  * `permissions.py` → `IsOwnerOrAdminDeleteOnly` (controle de edição/remoção)
  * `urls.py` → rotas `/api/tweets/`

* `backend/accounts/`

  * `serializers.py` → `UserRegisterSerializer`
  * `views.py` → `UserRegisterView`
  * `urls.py` → rotas `/api/auth/register/` e `/api/auth/login/`

### 1.2. Frontend

* `frontend/index.html`
  Página com formulários de registro, login e lista de tweets, usando Bootstrap 5.

* `frontend/src/main.ts`
  Lógica em TypeScript:

  * Chama a API (`/api/auth/register/`, `/api/auth/login/`, `/api/tweets/`)
  * Controla token de autenticação
  * Renderiza a lista de tweets e ações (criar/editar/excluir).

---

## 2. Pré-requisitos (GitHub Codespaces)

No GitHub Codespaces, o ambiente já vem com:

* Python 3
* Node.js + npm

Não é necessário instalar nada na máquina local, tudo roda dentro do Codespace.

---

## 3. Instalação de dependências (Backend e Frontend)

> Esta seção deve ser feita **antes** de tentar rodar o backend e o frontend.

### 3.1. Backend – instalar dependências com `requirements.txt`

1. Abrir um terminal no Codespaces.

2. Ir para a pasta `backend`:

   ```bash
   cd backend
   ```

3. Criar e ativar o ambiente virtual (apenas na primeira vez):

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

4. Instalar as dependências do backend a partir do `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```

Esse comando instala, por exemplo:

* `Django`
* `djangorestframework`
* `django-cors-headers`
* `drf-yasg`
* `djangorestframework-authtoken` (se usado)

### 3.2. Frontend – instalar dependências com `npm install`

1. Abrir um **segundo terminal** no Codespaces.

2. Ir para a pasta `frontend`:

   ```bash
   cd frontend
   ```

3. Instalar as dependências do frontend (TypeScript, lite-server, etc.):

   ```bash
   npm install
   ```

---

## 4. Backend – como rodar (Terminal 1)

### 4.1. Ativar ambiente virtual (sempre que abrir o Codespace)

No terminal dedicado ao backend:

```bash
cd backend
source .venv/bin/activate
```

### 4.2. Aplicar migrações (quando necessário)

```bash
python manage.py migrate
```

### 4.3. Criar superusuário (somente na primeira vez)

```bash
python manage.py createsuperuser
# informe username, email e senha
```

### 4.4. Rodar o servidor Django

```bash
python manage.py runserver 0.0.0.0:8000
```

A saída deve mostrar algo como:

```text
Starting development server at http://0.0.0.0:8000/
```

### 4.5. Tornar a porta 8000 **Pública** no Codespaces

1. No VS Code do Codespaces, abra a aba **Ports**.
2. Encontre a linha da porta **8000**.
3. Na coluna de visibilidade (Private/Public), clique e selecione **Public**.

> 🔴 Se a porta 8000 estiver **Private**, o frontend (rodando em outra porta) não conseguirá acessar a API e você verá mensagens como **"Erro de conexão no login"** ou **"Erro de conexão ao registrar."**

### 4.6. URL do backend

Depois de tornar a porta 8000 pública, o Codespaces gera uma URL do tipo:

```text
https://<seu-codespace>-8000.app.github.dev/
```

Exemplo:

```text
https://special-space-umbrella-xxxx-8000.app.github.dev/
```

Você pode testar a API acessando:

* Swagger:
  `https://<seu-codespace>-8000.app.github.dev/swagger/`

---

## 5. Frontend – como rodar (Terminal 2)

### 5.1. Certificar que as dependências foram instaladas

No terminal dedicado ao frontend:

```bash
cd frontend
npm install   # se ainda não tiver rodado
```

### 5.2. Configurar `API_BASE_URL` no `main.ts`

No arquivo `frontend/src/main.ts`, existe uma constante:

```ts
const API_BASE_URL = "https://seu-codespace-8000.app.github.dev";
```

Ela deve apontar para a **URL do backend** (porta 8000) do seu Codespace.

Passos:

1. Abra a aba **Ports** e clique em **Open in Browser** na porta 8000.
2. Copie a URL base, por exemplo:

   ```text
   https://special-space-umbrella-xxxx-8000.app.github.dev
   ```
3. Cole esse valor em `API_BASE_URL` no `main.ts`.

> Se a URL do Codespace mudar, é necessário atualizar `API_BASE_URL` e recompilar o frontend.

### 5.3. Compilar o TypeScript

Ainda em `frontend`:

```bash
npm run build
```

Isso gera o JavaScript compilado em `dist/main.js`.

### 5.4. Rodar o servidor do frontend (`lite-server`)

```bash
npm run start
```

Esse comando:

* Compila o TypeScript (`npm run build`)
* Sobe o servidor estático (`lite-server`) na porta **3000**

Você verá algo assim:

```text
[Browsersync] Access URLs:
 Local: http://localhost:3000
```

### 5.5. Tornar a porta 3000 **Pública** no Codespaces

1. Vá na aba **Ports**.
2. Encontre a porta **3000**.
3. Marque a visibilidade como **Public**.

O Codespace vai fornecer uma URL do tipo:

```text
https://<seu-codespace>-3000.app.github.dev/
```

Exemplo:

```text
https://special-space-umbrella-xxxx-3000.app.github.dev/
```

Essa é a URL do **frontend**.

---

## 6. Resumo dos dois terminais e dois servidores

* **Terminal 1 – Backend (Django)**

  ```bash
  cd backend
  source .venv/bin/activate
  python manage.py runserver 0.0.0.0:8000
  ```

  * Porta: **8000**
  * Visibilidade: **Public**
  * URL: `https://<seu-codespace>-8000.app.github.dev/`

* **Terminal 2 – Frontend (lite-server)**

  ```bash
  cd frontend
  npm install        # uma vez
  npm run build
  npm run start
  ```

  * Porta: **3000**
  * Visibilidade: **Public**
  * URL: `https://<seu-codespace>-3000.app.github.dev/`

> Os dois servidores precisam estar rodando ao mesmo tempo, cada um em um terminal, e as portas **8000** e **3000** precisam estar marcadas como **Public**.

---

## 7. Usando a aplicação

### 7.1. Acessar o frontend

Abra no navegador:

```text
https://<seu-codespace>-3000.app.github.dev/
```

Você verá:

* Formulário de **Registro**
* Formulário de **Login**
* Área de **Novo Tweet** (aparece após login)
* Lista de **Tweets** do usuário logado (ou de todos, se admin)

### 7.2. Fluxo básico

1. **Registrar usuário**

   * Preencha o formulário de registro (usuário, email, senha).
   * Ao sucesso, aparece “Registrado com sucesso! Agora faça login.”.

2. **Fazer login**

   * Preencha usuário e senha.
   * Ao logar:

     * O frontend salva o token no `localStorage`.
     * Exibe “Logado como: `<username>`”.
     * Mostra o formulário de novo tweet.
     * Carrega os tweets do usuário (ou todos, se admin).

3. **Criar tweet**

   * Digite uma mensagem de até 280 caracteres.
   * Clique em “Postar”.
   * O tweet aparece na lista.

4. **Editar e excluir**

   * Se o tweet é do usuário logado:

     * Botões “Editar” e “Excluir” ficam disponíveis.
   * Se o usuário for admin:

     * Consegue excluir qualquer tweet (mas não editar tweet de outro usuário – a permissão de edição é controlada no backend).

5. **Logout**

   * Clicar em “Logout”.
   * O token é removido do `localStorage`, a UI volta ao estado inicial.

---

## 8. Documentação via Swagger

A documentação Swagger fica em:

```text
https://<seu-codespace>-8000.app.github.dev/swagger/
```

Lá é possível:

* Ver todos os endpoints da API:

  * `POST /api/auth/register/`
  * `POST /api/auth/login/`
  * `GET/POST /api/tweets/`
  * `GET/PUT/PATCH/DELETE /api/tweets/{id}/`
* Testar as requisições diretamente pelo navegador.

---

## 9. Problemas comuns e soluções

### 9.1. “Erro de conexão no login” ou “Erro de conexão ao registrar”

Causas prováveis:

1. **Porta 8000 não está Public**

   * Vá na aba **Ports** e marque a porta 8000 como **Public**.

2. **`API_BASE_URL` incorreta no `main.ts`**

   * Copie exatamente a URL do backend (porta 8000) gerada pelo Codespaces.
   * Atualize `API_BASE_URL`.
   * Rode `npm run build` novamente.

3. **Backend não está rodando**

   * Verifique se o terminal do backend está com:

     ```bash
     python manage.py runserver 0.0.0.0:8000
     ```

### 9.2. 404 em `/`

Isso é normal no Django, ele não tem rota para `/` por padrão.
Use:

* `/swagger/`
* `/api/tweets/`
* `/api/auth/register/`
* `/api/auth/login/`

---

