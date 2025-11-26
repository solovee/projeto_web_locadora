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
const API_URL = "/api/locacoes_full/"; 

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
        
        const valorFormatado = parseFloat(locacao.valor_total).toFixed(2).replace('.', ',');
        const statusCancelada = locacao.cancelada == 1 ? "Sim (1)" : "Não (0)";

        tr.innerHTML = `
            <td>${locacao.id}</td>
            <td>${locacao.data_inicio}</td>
            <td>${locacao.data_fim}</td>
            <td class="${locacao.cancelada == 1 ? 'cancelada-status' : 'ativa-status'}">${statusCancelada}</td>
            <td>${locacao.cliente}</td>
            <td>${locacao.exemplares_list}</td>
            <td>R$ ${valorFormatado}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${locacao.id}, ${locacao.cancelada})">
                    Cancelar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirFormulario(locacao_id = null, cancelada = null) {
    const isEditing = locacao_id !== null;

    const modal = document.createElement("div");
    modal.classList.add("modal");

    let formContent;

    if (isEditing) {
        formContent = `
            <h3>Editar Locação #${locacao_id} (Apenas Cancelamento)</h3>

            <label>Cancelada (0 = Não, 1 = Sim)</label>
            <input type="number" id="cancelada" min="0" max="1"
                   value="${cancelada || 0}">

            <button class="modal-save" onclick="salvarEdicaoLocacao(${locacao_id})">
                Salvar Cancelamento
            </button>
        `;
    } else {
        formContent = `
            <h3>Registrar Nova Locação</h3>

            <label>Data de Início</label>
            <input type="date" id="data_inicio" value="${new Date().toISOString().split('T')[0]}">

            <label>Data de Fim</label>
            <input type="date" id="data_fim" value="">

            <label>ID do Cliente</label>
            <input type="number" id="cliente_id" min="1" value="">
            
            <label>IDs dos Exemplares (Separe por vírgula, ex: 1,5,12)</label>
            <input type="text" id="exemplares_ids" placeholder="1, 5, 12">

            <button class="modal-save" onclick="criarLocacao()">
                Registrar Locação
            </button>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            ${formContent}
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modal);
}


async function criarLocacao() {
    const exemplares_str = document.getElementById("exemplares_ids").value;
    const exemplares_ids = exemplares_str.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cliente: parseInt(document.getElementById("cliente_id").value),
        cancelada: 0, 
        exemplares_ids: exemplares_ids 
    };
    console.log(data);
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

async function salvarEdicaoLocacao(locacao_id) {
    const nova_cancelada = parseInt(document.getElementById("cancelada").value);

    if (nova_cancelada !== 0 && nova_cancelada !== 1) {
        alert("O campo 'Cancelada' deve ser 0 ou 1.");
        return;
    }

    const data = {
        cancelada: nova_cancelada
    };

    const response = await fetch(`${API_URL}${locacao_id}/`, {
        method: "PATCH", 
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        try {
            const errorJson = JSON.parse(errorText);
            Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao editar locação",
            timer: 2000,
            showConfirmButton: false
         });
        } catch {
            Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao editar locação",
            timer: 2000,
            showConfirmButton: false
         });
        }
        return;
    }

    fecharModal();
    carregarLocacoes();
}

function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}