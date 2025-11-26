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
const API_URL = "/api/estados/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando estados...");
    carregarEstados();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarEstados() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar estados:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        Swal.fire({
                icon: "error",
                title: "Erro!",
                text: "Erro ao carregar estados",
                timer: 2000,
                showConfirmButton: false
            });
        return; 
    }
    
    const estados = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    estados.forEach(estado => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${estado.id}</td>
            <td>${estado.nome}</td>
            <td>${estado.sigla}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${estado.id}, '${estado.nome}', '${estado.sigla}')">Editar</button>
                <button class="delete" onclick="deletarEstado(${estado.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


function abrirFormulario(id = null, nome = "", sigla = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Estado" : "Adicionar Estado"}</h3>

            <label>Nome</label>
            <input type="text" id="nome" value="${nome}">
            
            <label>Sigla</label>
            <input type="text" id="sigla" value="${sigla}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarEstado()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


async function criarEstado() {
    const data = {
        nome: document.getElementById("nome").value,
        sigla: document.getElementById("sigla").value,
    };

    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN 
        },
        body: JSON.stringify(data)
    });
    if (!resposta.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao criar estado",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await resposta.text());
        return;
    }

    fecharModal();
    carregarEstados();
}


async function salvarEdicao(id) {
    const data = {
        nome: document.getElementById("nome").value,
        sigla: document.getElementById("sigla").value,
    };

    const resposta = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN 
        },
        body: JSON.stringify(data)
    });
    if (!resposta.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao editar estado",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await resposta.text());
        return;
    }

    fecharModal();
    carregarEstados();
}


async function deletarEstado(id) {
    const confirmacao = await Swal.fire({
        title: "Tem certeza?",
        text: "Deseja realmente excluir este estado?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    });

    if (!confirmacao.isConfirmed) return;

    const resposta = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!resposta.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao deletar estado",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await resposta.text());
        return;
    }
    carregarEstados();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}