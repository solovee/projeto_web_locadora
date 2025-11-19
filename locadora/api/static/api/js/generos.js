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
const API_URL = "/api/generos/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando generos...");
    carregarGeneros();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarGeneros() {
    const response = await fetch(API_URL);
    // Verificação de erro para o caso de o servidor ainda retornar HTML (500)
    if (!response.ok) {
        console.error("Erro ao carregar generos:", response.statusText);
        // Tente ler o corpo como texto para ver o erro (se for HTML)
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
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


// =================== FORMULÁRIO PARA CRIAR/EDITAR (Função Faltante) ===================
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


// =================== CRIAR ===================
async function criarGenero() {
    const data = {
        descricao: document.getElementById("descricao").value,
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
    carregarGeneros();
}


// =================== EDITAR ===================
async function salvarEdicao(id) {
    const data = {
        descricao: document.getElementById("descricao").value,
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
    carregarGeneros();
}


// =================== DELETAR ===================
async function deletarGenero(id) {
    if (!confirm("Tem certeza que deseja excluir este gênero?")) return;

    await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });

    carregarGeneros();
}


// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}