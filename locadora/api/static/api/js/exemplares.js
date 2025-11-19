// Função auxiliar para obter o CSRF token dos cookies do Django
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const CSRF_TOKEN = getCookie('csrftoken');
const API_URL = "/api/exemplares/";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando exemplares...");
    carregarExemplares();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarExemplares() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        console.error("Erro ao carregar exemplares:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do Django.");
        return;
    }

    const exemplares = await response.json();
    console.log("Exemplares recebidos:", exemplares);

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    exemplares.forEach(exemplar => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${exemplar.codigo_interno}</td>
            <td>${exemplar.disponivel}</td>
            <td>${exemplar.midia}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${exemplar.codigo_interno}, ${exemplar.disponivel}, ${exemplar.midia})">Editar</button>
                <button class="delete" onclick="deletarExemplar(${exemplar.codigo_interno})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =================== FORMULÁRIO ===================
function abrirFormulario(codigo_interno = null, disponivel = "", midia = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${codigo_interno ? "Editar Exemplar" : "Adicionar Exemplar"}</h3>

            <label>Disponível</label>
            <input type="number" id="disponivel" value="${disponivel}">

            <label>Mídia (ID)</label>
            <input type="number" id="midia" value="${midia}">

            <button class="modal-save" onclick="${codigo_interno ? `salvarEdicao(${codigo_interno})` : "criarExemplar()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// =================== CRIAR ===================
async function criarExemplar() {
    const data = {
        disponivel: Number(document.getElementById("disponivel").value),
        midia: Number(document.getElementById("midia").value),
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Erro ao criar exemplar");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarExemplares();
}

// =================== EDITAR ===================
async function salvarEdicao(codigo_interno) {
    const data = {
        disponivel: Number(document.getElementById("disponivel").value),
        midia: Number(document.getElementById("midia").value),
    };

    const response = await fetch(`${API_URL}${codigo_interno}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Erro ao editar exemplar");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarExemplares();
}

// =================== DELETAR ===================
async function deletarExemplar(id) {
    if (!confirm("Tem certeza que deseja excluir este exemplar?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });

    if (!response.ok) {
        alert("Erro ao excluir exemplar");
        console.error(await response.text());
        return;
    }

    carregarExemplares();
}

// =================== FECHAR MODAL ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
