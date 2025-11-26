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
    document.querySelector(".add").addEventListener("click", () => abrirFormulario());
});

async function carregarLocacoes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        console.error(await response.text());
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao carregar locações",
            timer: 2000,
            showConfirmButton: false
         });
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

            ${
                id
                ? `
                    <label>Cancelada</label>
                    <input type="checkbox" id="cancelada" ${cancelada == 1 ? "checked" : ""}>
                `
                : ""
            }

            <label>ID do Cliente</label>
            <input type="number" id="cliente" value="${cliente}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarLocacao()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>

        </div>
    `;

    document.body.appendChild(modal);
}

async function criarLocacao() {
    const canceladaInput = document.getElementById("cancelada"); 
    const cancelada = canceladaInput ? (canceladaInput.checked ? 1 : 0) : 0;

    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cancelada: cancelada,
        cliente: parseInt(document.getElementById("cliente").value)
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
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao criar locação",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarLocacoes();
}

async function salvarEdicao(id) {
    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cancelada: document.getElementById("cancelada").checked ? 1 : 0,
        cliente: parseInt(document.getElementById("cliente").value)
    };

    const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao editar locação",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarLocacoes();
}

async function deletarLocacao(id) {
    const confirmacao = await Swal.fire({
        title: "Tem certeza?",
        text: "Deseja realmente excluir esta locação?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    });

    if (!confirmacao.isConfirmed) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao deletar locação",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }

    carregarLocacoes();
}

function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
