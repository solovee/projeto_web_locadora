// SeuApp/static/api/js/locacoes_full.js

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
const API_URL = "/api/locacoes_full/"; // URL da nova API

document.addEventListener("DOMContentLoaded", () => {
    carregarLocacoes();
    document.querySelector(".add").addEventListener("click", () => abrirFormulario());
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
        
        // Formata o valor e o status de cancelada
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

// =================== FORMULÁRIO (Criação e Edição de Cancelamento) ===================
function abrirFormulario(locacao_id = null, cancelada = null) {
    const isEditing = locacao_id !== null;

    const modal = document.createElement("div");
    modal.classList.add("modal");

    // Conteúdo do Modal:
    let formContent;

    if (isEditing) {
        // Modo Edição: Apenas campo 'Cancelada'
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
        // Modo Criação: Data Início/Fim, Cliente, Exemplares (lista de IDs)
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

// SeuApp/static/api/js/locacoes_full.js

// ... (Funções getCookie, CSRF_TOKEN, API_URL e carregarLocacoes)

// ... (Função abrirFormulario no modo de Criação)

async function criarLocacao() {
    const exemplares_str = document.getElementById("exemplares_ids").value;
    // Transforma "1, 5, 12" em [1, 5, 12]
    const exemplares_ids = exemplares_str.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const data = {
        data_inicio: document.getElementById("data_inicio").value,
        data_fim: document.getElementById("data_fim").value,
        cliente: parseInt(document.getElementById("cliente_id").value),
        cancelada: 0, 
        // CAMPO CHAVE: Envia a lista de IDs para o Serializer
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

    // ... (Tratamento de erro e sucesso)

    if (!response.ok) {
        // ... (Alerta de erro)
        return;
    }

    fecharModal();
    carregarLocacoes();
}

// ... (Funções salvarEdicaoLocacao e fecharModal)

// =================== EDITAR LOCAÇÃO (APENAS CANCELADA) ===================
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
        method: "PATCH", // Usamos PATCH para enviar apenas o campo 'cancelada'
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
            alert("Erro ao editar locação: " + JSON.stringify(errorJson));
        } catch {
            alert("Erro ao editar locação. Veja o console.");
        }
        return;
    }

    fecharModal();
    carregarLocacoes();
}

// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}