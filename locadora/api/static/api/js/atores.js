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
const API_URL = "/api/atores/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando atores...");
    carregarAtores();

    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarAtores() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar atores:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
        return; 
    }
    
    const atores = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    atores.forEach(ator => {
        const tr = document.createElement("tr");
        const dataEstreia = ator.data_estreia ? new Date(ator.data_estreia).toLocaleDateString('pt-BR') : '';

        tr.innerHTML = `
            <td>${ator.id}</td>
            <td>${ator.nome}</td>
            <td>${ator.sobrenome}</td>
            <td>${dataEstreia}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${ator.id}, '${ator.nome}', '${ator.sobrenome}', '${ator.data_estreia}')">Editar</button>
                <button class="delete" onclick="deletarAtor(${ator.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


function abrirFormulario(id = null, nome = "", sobrenome = "", data_estreia = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Ator" : "Adicionar Ator"}</h3>

            <label>Nome</label>
            <input type="text" id="nome" value="${nome}">

            <label>Sobrenome</label>
            <input type="text" id="sobrenome" value="${sobrenome}">

            <label>Data de Estreia</label>
            <input type="date" id="data_estreia" value="${data_estreia}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarAtor()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    

    document.body.appendChild(modal);
}


async function criarAtor() {
    const data = {
        nome: document.getElementById("nome").value,
        sobrenome: document.getElementById("sobrenome").value,
        data_estreia: document.getElementById("data_estreia").value,
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
        alert("Erro ao criar ator");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarAtores();
}


async function salvarEdicao(id) {
    const data = {
        nome: document.getElementById("nome").value,
        sobrenome: document.getElementById("sobrenome").value,
        data_estreia: document.getElementById("data_estreia").value,
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
        alert("Erro ao editar ator");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarAtores();
}


async function deletarAtor(id) {
    if (!confirm("Tem certeza que deseja excluir este ator?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        alert("Erro ao excluir ator");
        console.error(await response.text());
        return;
    }
    carregarAtores();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
