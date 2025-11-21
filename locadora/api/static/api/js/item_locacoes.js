// =================== CSRF & Setup ===================
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
const API_URL = "/api/item_locacoes/";  // compatível com seu router

document.addEventListener("DOMContentLoaded", () => {
    carregarItemLocacoes();
    document.querySelector(".add").addEventListener("click", () => abrirFormulario());
});

// =================== LISTAR ===================
async function carregarItemLocacoes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        console.error(await response.text());
        alert("Erro ao carregar itens de locação.");
        return;
    }

    const itens = await response.json();
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    itens.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.locacao}</td>
            <td>${item.exemplar_codigo_interno}</td>
            <td>${item.valor}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${item.locacao}, ${item.exemplar_codigo_interno})">
                    Editar
                </button>

                <button class="delete" onclick="deletarItemLocacao(${item.locacao}, ${item.exemplar_codigo_interno})">
                    Excluir
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =================== FORMULÁRIO ===================
function abrirFormulario(locacao = null, exemplar = null) {
    const isEditing = locacao !== null && exemplar !== null;

    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">

            <h3>${isEditing ? "Editar Item Locação" : "Adicionar Item Locação"}</h3>

            <label>ID da Locação</label>
            <input type="number" id="locacao_id"
                   value="${locacao || ""}"
                   ${isEditing ? "disabled" : ""}>

            <label>ID do Exemplar</label>
            <input type="number" id="exemplar_id"
                   value="${exemplar || ""}"
                   ${isEditing ? "disabled" : ""}>

            <button class="modal-save"
                onclick="${isEditing ? `salvarEdicaoItemLocacao(${locacao}, ${exemplar})` : "criarItemLocacao()"}">
                Salvar
            </button>

            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// =================== CRIAR ===================
async function criarItemLocacao() {
    const data = {
        locacao: parseInt(document.getElementById("locacao_id").value),
        exemplar_codigo_interno: parseInt(document.getElementById("exemplar_id").value)
        // Valor não vai — backend calcula
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
        alert("Erro ao criar item. Veja o console.");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarItemLocacoes();
}

// =================== EDITAR ===================
async function salvarEdicaoItemLocacao(locacao, exemplar) {

    const data = {
        locacao: locacao,
        exemplar_codigo_interno: exemplar
        // valor não vai — backend recalcula
    };

    const response = await fetch(`${API_URL}${locacao}/${exemplar}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Erro ao editar item.");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarItemLocacoes();
}

// =================== DELETAR ===================
async function deletarItemLocacao(locacao, exemplar) {
    if (!confirm(`Excluir item da locação ${locacao}, exemplar ${exemplar}?`))
        return;

    const response = await fetch(`${API_URL}${locacao}/${exemplar}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });

    if (!response.ok) {
        alert("Erro ao excluir item.");
        console.error(await response.text());
        return;
    }

    carregarItemLocacoes();
}

// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
