// Seletores principais
const leaveBtn = document.querySelector(".leave-btn");
const createBtn = document.querySelector(".create-room");
const seeRoomBtn = document.querySelector(".see-room");
const roomList = document.getElementById("room-list");
const roomInput = document.querySelector(".roomInput");
const errorText = document.querySelector(".error-text");

// Utilitário: pegar token
function getAuthToken() {
  return sessionStorage.getItem("auth-token");
}

// Se não tiver token, volta pro login
if (!getAuthToken()) {
  window.location.href = "index.html";
}

// Botão "Sair"
if (leaveBtn) {
  leaveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("auth-token");
    window.location.href = "index.html";
  });
}

// Função para renderizar lista de salas
function renderRooms(rooms) {
  if (!roomList) return;

  roomList.innerHTML = "";

  if (!rooms || rooms.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma sala criada ainda.";
    roomList.appendChild(li);
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = room.name || `Sala ${room.id}`;

    const btn = document.createElement("button");
    btn.textContent = "Entrar";
    btn.addEventListener("click", () => {
      const params = new URLSearchParams({
        roomId: room.id,
        roomName: room.name || `Sala ${room.id}`,
      });
      window.location.href = `chat.html?${params.toString()}`;
    });

    li.appendChild(span);
    li.appendChild(btn);
    roomList.appendChild(li);
  });
}

// Função para buscar salas no backend
async function fetchRooms() {
  if (!roomList) return;
  if (errorText) errorText.textContent = "";

  try {
    const response = await axios.get("/api/chat", {
      headers: {
        Authorization: `BEARER ${getAuthToken()}`,
      },
    });

    console.log("Salas recebidas:", response.data);
    renderRooms(response.data);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    if (errorText) {
      errorText.textContent = "Erro ao carregar salas.";
    }
  }
}

// Botão "Criar sala"
if (createBtn) {
  createBtn.addEventListener("click", async () => {
    const roomName = roomInput ? roomInput.value.trim() : "";

    if (!roomName) {
      if (errorText) {
        errorText.textContent = "Digite o nome da sala.";
      }
      return;
    }

    if (errorText) errorText.textContent = "";

    try {
      const response = await axios.post(
        "/api/chat",
        { name: roomName },
        {
          headers: {
            Authorization: `BEARER ${getAuthToken()}`,
          },
        }
      );

      console.log("Sala criada:", response.data);
      roomInput.value = "";
      await fetchRooms();
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      if (errorText) {
        errorText.textContent = "Erro ao criar sala.";
      }
    }
  });
}

// Botão "Atualizar lista de salas"
if (seeRoomBtn) {
  seeRoomBtn.addEventListener("click", async () => {
    await fetchRooms();
  });
}

// Buscar salas automaticamente ao carregar o dashboard
fetchRooms();
