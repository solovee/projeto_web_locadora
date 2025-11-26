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
const API_URL = "/api/generos/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando generos...");
    carregarGeneros();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarGeneros() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar generos:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao carregar gêneros",
            timer: 2000,
            showConfirmButton: false
         });
        return; 
    }
    
    const generos = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    generos.forEach(genero => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${genero.id}</td>
            <td>${genero.descricao}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${genero.id}, '${genero.descricao}')">Editar</button>
                <button class="delete" onclick="deletarGenero(${genero.id})">Excluir</button>
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
            <h3>${id ? "Editar Gênero" : "Adicionar Gênero"}</h3>

            <label>Descrição</label>
            <input type="text" id="descricao" value="${descricao}">
            

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarGenero()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


async function criarGenero() {
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
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao criar gênero",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarGeneros();
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
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao editar gênero",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarGeneros();
}


async function deletarGenero(id) {
    const confirmacao = await Swal.fire({
        title: "Tem certeza?",
        text: "Deseja realmente excluir este gênero?",
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
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Erro ao deletar gênero",
            timer: 2000,
            showConfirmButton: false
         });
        console.error(await response.text());
        return;
    }
    carregarGeneros();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}