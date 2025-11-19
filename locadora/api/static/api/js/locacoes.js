// =================== CSRF ===================
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
const API_URL = "/api/locacoes/";

document.addEventListener("DOMContentLoaded", () => {
    carregarLocacoes();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarLocacoes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        console.error(await response.text());
        alert("Erro ao carregar locações.");
        return;
    }

    const locacoes = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    locacoes.forEach(locacao => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${locacao.id}</td>
            <td>${locacao.data_inicio}</td>
            <td>${locacao.data_fim}</td>
            <td>${locacao.cancelada}</td>
            <td>${locacao.cliente}</td>

            <td>
                <button class="edit"
                    onclick="abrirFormulario(
                        ${locacao.id},
                        '${locacao.data_inicio}',
                        '${locacao.data_fim}',
                        ${locacao.cancelada},
                        ${locacao.cliente}
                    )">Editar</button>

                <button class="delete" onclick="deletarLocacao(${locacao.id})">
                    Excluir
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =================== FORMULÁRIO ===================
function abrirFormulario(id = null, data_inicio = "", data_fim = "", cancelada = 0, cliente = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">

            <h3>${id ? "Editar Locação" : "Adicionar Locação"}</h3>

            <label>Data de Início</label>
            <input type="date" id="data_inicio" value="${data_inicio}">

            <label>Data de Fim</label>
            <input type="date" id="data_fim" value="${data_fim}">

            <label>Cancelada</label>
            <input type="checkbox" id="cancelada" ${cancelada == 1 ? "checked" : ""}>

            <label>ID do Cliente</label>
            <input type="number" id="cliente" value="${cliente}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarLocacao()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>

        </div>
    `;

    document.body.appendChild(modal);
}

// =================== CRIAR ===================
async function criarLocacao() {
    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cancelada: document.getElementById("cancelada").checked ? 1 : 0,
        cliente: parseInt(document.getElementById("cliente").value)
    };

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    fecharModal();
    carregarLocacoes();
}

// =================== EDITAR ===================
async function salvarEdicao(id) {
    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cancelada: document.getElementById("cancelada").checked ? 1 : 0,
        cliente: parseInt(document.getElementById("cliente").value)
    };

    await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    fecharModal();
    carregarLocacoes();
}

// =================== DELETAR ===================
async function deletarLocacao(id) {
    if (!confirm("Tem certeza que deseja excluir esta locação?")) return;

    await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });

    carregarLocacoes();
}

// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
