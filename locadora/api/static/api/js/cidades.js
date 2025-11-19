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
const API_URL = "/api/cidades/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando cidades...");
    carregarCidades();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarCidades() {
    const response = await fetch(API_URL);
    // Verificação de erro para o caso de o servidor ainda retornar HTML (500)
    if (!response.ok) {
        console.error("Erro ao carregar cidades:", response.statusText);
        // Tente ler o corpo como texto para ver o erro (se for HTML)
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
        return; 
    }
    
    const cidades = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    cidades.forEach(cidade => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${cidade.id}</td>
            <td>${cidade.nome}</td>
            <td>${cidade.estado}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${cidade.id}, '${cidade.nome}', '${cidade.estado}')">Editar</button>
                <button class="delete" onclick="deletarCidade(${cidade.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


// =================== FORMULÁRIO PARA CRIAR/EDITAR (Função Faltante) ===================
function abrirFormulario(id = null, nome = "", estado = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Cidade" : "Adicionar Cidade"}</h3>

            <label>Nome</label>
            <input type="text" id="nome" value="${nome}">
            
            <label>Estado</label>
            <input type="text" id="estado" value="${estado}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarCidade()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


// =================== CRIAR ===================
async function criarCidade() {
    const data = {
        nome: document.getElementById("nome").value,
        estado: document.getElementById("estado").value,
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
    carregarCidades();
}


// =================== EDITAR ===================
async function salvarEdicao(id) {
    const data = {
        nome: document.getElementById("nome").value,
        estado: document.getElementById("estado").value,
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
    carregarCidades();
}


// =================== DELETAR ===================
async function deletarCidade(id) {
    if (!confirm("Tem certeza que deseja excluir esta cidade?")) return;

    await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });

    carregarCidades();
}


// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}