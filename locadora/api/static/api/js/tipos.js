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
const API_URL = "/api/tipos/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando tipos...");
    carregarTipos();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarTipos() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar tipos:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
        return; 
    }
    
    const tipos = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    tipos.forEach(tipo => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${tipo.id}</td>
            <td>${tipo.descricao}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${tipo.id}, '${tipo.descricao}')">Editar</button>
                <button class="delete" onclick="deletarTipo(${tipo.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


function abrirFormulario(id = null, descricao = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Tipo" : "Adicionar Tipo"}</h3>

            <label>Descrição</label>
            <input type="text" id="descricao" value="${descricao}">
            

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarTipo()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


async function criarTipo() {
    const data = {
        descricao: document.getElementById("descricao").value,
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
        alert("Erro ao criar tipo");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarTipos();
}


async function salvarEdicao(id) {
    const data = {
        descricao: document.getElementById("descricao").value,
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
        alert("Erro ao editar tipo");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarTipos();
}


async function deletarTipo(id) {
    if (!confirm("Tem certeza que deseja excluir este tipo?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        alert("Erro ao excluir tipo");
        console.error(await response.text());
        return;
    }
    carregarTipos();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}