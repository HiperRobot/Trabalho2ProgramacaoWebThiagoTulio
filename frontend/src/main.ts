// Ajuste essa constante para a URL real do seu backend.
// Em Codespaces, use o endereço público que aparece para a porta 8000.
const API_BASE_URL = "https://laughing-palm-tree-66pw9jpqjc56gx-8000.app.github.dev";

let authToken: string | null = null;
let currentUsername: string | null = null;

interface Tweet {
  id: number;
  owner: number;
  owner_username: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Elementos da página
const registerForm = document.getElementById("register-form") as HTMLFormElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;
const tweetForm = document.getElementById("tweet-form") as HTMLFormElement;
const tweetFormRow = document.getElementById("tweet-form-row") as HTMLDivElement;
const tweetsContainer = document.getElementById("tweets-container") as HTMLDivElement;
const currentUserSpan = document.getElementById("current-user") as HTMLSpanElement;

const registerMsg = document.getElementById("register-message") as HTMLDivElement;
const loginMsg = document.getElementById("login-message") as HTMLDivElement;
const similarSection = document.getElementById("similar-tweets-section") as HTMLDivElement;

// Função para salvar/aplicar token e usuário atual
function setAuth(token: string | null, username: string | null) {
  authToken = token;
  currentUsername = username;

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username || "");

    tweetFormRow.classList.remove("d-none");
    document.getElementById("change-password-btn")!.classList.remove("d-none");
    currentUserSpan.textContent = `Logado como: ${username}`;
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    tweetFormRow.classList.add("d-none");
    document.getElementById("change-password-btn")!.classList.add("d-none");
    currentUserSpan.textContent = "";
  }
}

// Tenta carregar token do localStorage ao iniciar
(function initAuth() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    setAuth(token, username);
    fetchTweets();
  }
})();

// Auto-refresh dos tweets a cada 5s
setInterval(() => {
  if (authToken) {
    fetchTweets();
  }
}, 5000);

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Forçamos o tipo para um objeto simples de strings
  const baseHeaders = options.headers as Record<string, string> | undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(baseHeaders || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}


// ==================== Registro ====================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerMsg.textContent = "";

  const username = (document.getElementById("reg-username") as HTMLInputElement).value;
  const email = (document.getElementById("reg-email") as HTMLInputElement).value;
  const password = (document.getElementById("reg-password") as HTMLInputElement).value;

  try {
    const res = await apiFetch("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      registerMsg.textContent = "Erro ao registrar: " + JSON.stringify(data);
      registerMsg.classList.remove("text-success");
      registerMsg.classList.add("text-danger");
      return;
    }

    registerMsg.textContent = "Registrado com sucesso! Agora faça login.";
    registerMsg.classList.remove("text-danger");
    registerMsg.classList.add("text-success");
    registerForm.reset();
  } catch (error) {
    registerMsg.textContent = "Erro de conexão ao registrar.";
    registerMsg.classList.remove("text-success");
    registerMsg.classList.add("text-danger");
  }
});

// ==================== Login ====================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "";

  const username = (document.getElementById("login-username") as HTMLInputElement).value;
  const password = (document.getElementById("login-password") as HTMLInputElement).value;

  try {
    const res = await apiFetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.token) {
      loginMsg.textContent = "Login inválido.";
      return;
    }

    setAuth(data.token, username);
    loginMsg.textContent = "";
    fetchTweets();
  } catch (error) {
    loginMsg.textContent = "Erro de conexão no login.";
  }
});

// ==================== Logout ====================
logoutBtn.addEventListener("click", () => {
  setAuth(null, null);
  tweetsContainer.innerHTML = "";
  similarSection.innerHTML = "";
});

// ==================== Criar tweet ====================
tweetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const textarea = document.getElementById("tweet-content") as HTMLTextAreaElement;
  const content = textarea.value.trim();
  if (!content) return;

  try {
    const res = await apiFetch("/api/tweets/", {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      alert("Erro ao postar tweet.");
      return;
    }

    const data = await res.json();

    // Buscar e mostrar tweets similares
    const newTweet = data.tweet;
    const similares = data.similar_tweets || [];

showSimilarTweets(similares);

    textarea.value = "";
    fetchTweets();
  } catch (error) {
    alert("Erro de conexão ao postar tweet.");
  }
});

// ==================== Buscar tweets ====================
async function fetchTweets() {
  try {
    const res = await apiFetch("/api/tweets/");
    if (!res.ok) {
      tweetsContainer.innerHTML =
        "<div class='text-danger'>Erro ao carregar tweets (verifique se está logado).</div>";
      return;
    }

    const data: Tweet[] = await res.json();
    renderTweets(data);
  } catch (error) {
    tweetsContainer.innerHTML =
      "<div class='text-danger'>Erro de conexão ao carregar tweets.</div>";
  }
}

function renderTweets(tweets: Tweet[]) {
  tweetsContainer.innerHTML = "";

  if (tweets.length === 0) {
    tweetsContainer.innerHTML = "<div class='text-muted'>Nenhum tweet cadastrado.</div>";
    return;
  }

  tweets.forEach((tweet) => {
    const div = document.createElement("div");
    div.className = "list-group-item d-flex justify-content-between align-items-start";

    const contentDiv = document.createElement("div");
    contentDiv.className = "ms-2 me-auto";
    contentDiv.innerHTML = `
      <div class="fw-bold">@${tweet.owner_username}</div>
      <div>${tweet.content}</div>
      <small class="text-muted">${new Date(tweet.created_at).toLocaleString()}</small>
    `;

    const actionsDiv = document.createElement("div");

    // Se for o dono, pode editar e apagar.
    if (currentUsername === tweet.owner_username) {
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline-primary me-2";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => editTweet(tweet));
      actionsDiv.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-outline-danger";
      delBtn.textContent = "Excluir";
      delBtn.addEventListener("click", () => deleteTweet(tweet.id));
      actionsDiv.appendChild(delBtn);
    } else {
      // Se não for o dono, só mostra botão de excluir,
      // mas o backend só vai permitir se o usuário for admin.
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-outline-danger";
      delBtn.textContent = "Excluir";
      delBtn.addEventListener("click", () => deleteTweet(tweet.id));
      actionsDiv.appendChild(delBtn);
    }

    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);
    tweetsContainer.appendChild(div);
  });
}

// ==================== Editar tweet ====================
async function editTweet(tweet: Tweet) {
  const novoTexto = prompt("Editar tweet:", tweet.content);
  if (novoTexto === null) return;

  try {
    const res = await apiFetch(`/api/tweets/${tweet.id}/`, {
      method: "PUT",
      body: JSON.stringify({ content: novoTexto }),
    });

    if (!res.ok) {
      alert("Erro ao editar tweet (verifique se é o dono).");
      return;
    }

    fetchTweets();
  } catch (error) {
    alert("Erro de conexão ao editar tweet.");
  }
}

// ==================== Deletar tweet ====================
async function deleteTweet(id: number) {
  if (!confirm("Tem certeza que deseja excluir este tweet?")) return;

  try {
    const res = await apiFetch(`/api/tweets/${id}/`, {
      method: "DELETE",
    });

    if (res.status === 204) {
      fetchTweets();
    } else {
      alert("Erro ao excluir tweet (talvez sem permissão).");
    }
  } catch (error) {
    alert("Erro de conexão ao excluir tweet.");
  }
}

// ==================== Trocar senha ====================
document.getElementById("change-password-btn")!.addEventListener("click", async () => {
  const oldPassword = prompt("Digite sua senha atual:");
  if (!oldPassword) return;

  const newPassword = prompt("Digite sua nova senha:");
  if (!newPassword) return;

  try {
    const res = await apiFetch("/api/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("Erro ao trocar senha: " + JSON.stringify(data));
      return;
    }

    alert("Senha alterada com sucesso!");

  } catch (err) {
    alert("Erro de conexão ao trocar senha.");
  }
});

// ==================== Exibir tweets similares ====================

function showSimilarTweets(similarTweets: Tweet[]) {
  const similarSection = document.getElementById("similar-tweets-section") as HTMLDivElement;
  similarSection.innerHTML = "Tweets semelhantes ao último postado:";

  if (similarTweets.length === 0) {
    similarSection.innerHTML = "<div class='text-muted'>Nenhum tweet similar encontrado.</div>";
    return;
  }

  similarTweets.forEach((tweet) => {
    const div = document.createElement("div");
    div.className = "list-group-item d-flex justify-content-between align-items-start";

    const contentDiv = document.createElement("div");
    contentDiv.className = "ms-2 me-auto";
    contentDiv.innerHTML = `
      <div class="fw-bold">@${tweet.owner_username}</div>
      <div>${tweet.content}</div>
      <small class="text-muted">${new Date(tweet.created_at).toLocaleString()}</small>
    `;

    div.appendChild(contentDiv);
    similarSection.appendChild(div);
  });
}