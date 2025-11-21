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
// A URL agora aponta para o endpoint de ItemLocacoes
const API_URL = "/api/item_locacoes/"; 

document.addEventListener("DOMContentLoaded", () => {
    carregarItemLocacoes(); // Chamada corrigida
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

    const item_locacoes = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    item_locacoes.forEach(item => { // Renomeado para 'item'
        const tr = document.createElement("tr");
        
        // ⚠️ Nota: Como a PK é composta (locacao_id e exemplar_codigo_interno), 
        // usaremos os dois IDs na função de edição/exclusão.

        tr.innerHTML = `
            <td>${item.locacao}</td> <td>${item.exemplar_codigo_interno}</td> <td>${item.valor}</td> <td>
                <button class="edit"
                    onclick="abrirFormulario(
                        ${item.locacao},
                        ${item.exemplar_codigo_interno},
                        ${item.valor}
                    )">Editar</button>

                <button class="delete" onclick="deletarItemLocacao(${item.locacao}, ${item.exemplar_codigo_interno})">
                    Excluir
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =================== FORMULÁRIO ===================
// Os argumentos agora correspondem aos campos do ItemLocacao
function abrirFormulario(locacao_id = null, exemplar_id = null, valor = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    
    // Constrói a chave composta (se for edição)
    const pk_composta = locacao_id && exemplar_id ? `${locacao_id}/${exemplar_id}` : null;
    
    // O formulário de ItemLocacao geralmente não edita a chave composta, mas sim o valor
    const isEditing = pk_composta !== null;

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">

            <h3>${isEditing ? "Editar Item Locação" : "Adicionar Item Locação"}</h3>

            <label>ID da Locação</label>
            <input type="number" id="locacao_id" value="${locacao_id || ""}" ${isEditing ? 'disabled' : ''}>

            <label>ID do Exemplar</label>
            <input type="number" id="exemplar_id" value="${exemplar_id || ""}" ${isEditing ? 'disabled' : ''}>

            <label>Valor</label>
            <input type="number" step="0.01" id="valor" value="${valor}">
            
            <button class="modal-save" onclick="${isEditing ? `salvarEdicaoItemLocacao(${locacao_id}, ${exemplar_id})` : "criarItemLocacao()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>

        </div>
    `;

    document.body.appendChild(modal);
}

// =================== CRIAR ===================
async function criarItemLocacao() {
    const data = {
        locacao: parseInt(document.getElementById("locacao_id").value),
        exemplar_codigo_interno: parseInt(document.getElementById("exemplar_id").value),
        valor: parseFloat(document.getElementById("valor").value)
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
        alert("Erro ao criar item de locação. Verifique os IDs e o valor.");
        console.error("Erro:", await response.json());
        return;
    }

    fecharModal();
    carregarItemLocacoes();
}

// =================== EDITAR ===================
// Agora requer os dois IDs da chave composta para a URL
async function salvarEdicaoItemLocacao(locacao_id, exemplar_id) {
    const data = {
        // A Locacao e o Exemplar são a PK, não devem ser alterados.
        // O DRF pode requerer que os IDs sejam enviados mesmo assim, dependendo da configuração.
        locacao: locacao_id, 
        exemplar_codigo_interno: exemplar_id,
        valor: parseFloat(document.getElementById("valor").value)
    };
    
    // ⚠️ CHAVE COMPOSTA: Assume que o ViewSet customizado aceita o formato URL: /api/item_locacoes/LOCACAO_ID/EXEMPLAR_ID/
    const API_ITEM_URL = `${API_URL}${locacao_id}/${exemplar_id}/`; 

    const response = await fetch(API_ITEM_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        alert("Erro ao editar item de locação. Verifique o console.");
        console.error("Erro:", await response.json());
        return;
    }

    fecharModal();
    carregarItemLocacoes();
}

// =================== DELETAR ===================
// Agora requer os dois IDs da chave composta
async function deletarItemLocacao(locacao_id, exemplar_id) {
    if (!confirm(`Tem certeza que deseja excluir o Item (Locação ID: ${locacao_id}, Exemplar ID: ${exemplar_id})?`)) return;

    // ⚠️ CHAVE COMPOSTA: Assume que o ViewSet customizado aceita o formato URL: /api/item_locacoes/LOCACAO_ID/EXEMPLAR_ID/
    const API_ITEM_URL = `${API_URL}${locacao_id}/${exemplar_id}/`; 
    
    const response = await fetch(API_ITEM_URL, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });
    
    if (!response.ok) {
        alert("Erro ao excluir item de locação.");
        return;
    }

    carregarItemLocacoes();
}

// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}