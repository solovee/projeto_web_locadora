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

async function carregarCidades() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar cidades:", response.statusText);
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


async function criarCidade() {
    const data = {
        nome: document.getElementById("nome").value,
        estado: document.getElementById("estado").value,
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
        alert("Erro ao criar cidade");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarCidades();
}


async function salvarEdicao(id) {
    const data = {
        nome: document.getElementById("nome").value,
        estado: document.getElementById("estado").value,
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
        alert("Erro ao editar cidade");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarCidades();
}


async function deletarCidade(id) {
    if (!confirm("Tem certeza que deseja excluir esta cidade?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        alert("Erro ao excluir cidade");
        console.error(await response.text());
        return;
    }

    carregarCidades();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}