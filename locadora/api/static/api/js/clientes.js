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
const API_URL = "/api/clientes/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando clientes...");
    carregarClientes();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarClientes() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar clientes:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
        return; 
    }
    
    const clientes = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.sobrenome}</td>
            <td>${cliente.data_nascimento}</td>
            <td>${cliente.cpf}</td>
            <td>${cliente.email}</td>
            <td>${cliente.logradouro}</td>
            <td>${cliente.numero}</td>
            <td>${cliente.bairro}</td>
            <td>${cliente.cep}</td>
            <td>${cliente.cidade}</td>

            <td>
                <button class="edit" onclick="abrirFormulario(${cliente.id}, '${cliente.nome}', '${cliente.sobrenome}', '${cliente.data_nascimento}', '${cliente.cpf}', '${cliente.email}', '${cliente.logradouro}', ${cliente.numero}, '${cliente.bairro}', '${cliente.cep}', ${cliente.cidade})">Editar</button>
                <button class="delete" onclick="deletarCliente(${cliente.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


function abrirFormulario(id = null, nome = "", sobrenome = "", data_nascimento = "", cpf = "", email = "", logradouro = "", numero = 0, bairro = "", cep = "", cidade   = 0) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Cliente" : "Adicionar Cliente"}</h3>

            <label>Nome</label>
            <input type="text" id="nome" value="${nome}">

            <label>Sobrenome</label>
            <input type="text" id="sobrenome" value="${sobrenome}">

            <label>Data de Nascimento</label>
            <input type="date" id="data_nascimento" value="${data_nascimento}">

            <label>CPF</label>
            <input type="text" id="cpf" value="${cpf}">

            <label>Email</label>
            <input type="email" id="email" value="${email}">

            <label>Logradouro</label>
            <input type="text" id="logradouro" value="${logradouro}">

            <label>Número</label>
            <input type="number" id="numero" value="${numero}">

            <label>Bairro</label>
            <input type="text" id="bairro" value="${bairro}">

            <label>CEP</label>
            <input type="text" id="cep" value="${cep}">

            <label>Cidade ID</label>
            <input type="number" id="cidade" value="${cidade}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarCliente()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


async function criarCliente() {
    const data = {
        nome: document.getElementById("nome").value,
        sobrenome: document.getElementById("sobrenome").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        logradouro: document.getElementById("logradouro").value,
        numero: parseInt(document.getElementById("numero").value),
        bairro: document.getElementById("bairro").value,
        cep: document.getElementById("cep").value,
        cidade: parseInt(document.getElementById("cidade").value),
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
        alert("Erro ao criar cliente");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarClientes();
}


async function salvarEdicao(id) {
    const data = {
        nome: document.getElementById("nome").value,
        sobrenome: document.getElementById("sobrenome").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        logradouro: document.getElementById("logradouro").value,
        numero: parseInt(document.getElementById("numero").value),
        bairro: document.getElementById("bairro").value,
        cep: document.getElementById("cep").value,
        cidade: parseInt(document.getElementById("cidade").value),
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
        alert("Erro ao editar cliente");
        console.error(await response.text());
        return;
    }
    fecharModal();
    carregarClientes();
}


async function deletarCliente(id) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        alert("Erro ao excluir cliente");
        console.error(await response.text());
        return;
    }
    carregarClientes();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}