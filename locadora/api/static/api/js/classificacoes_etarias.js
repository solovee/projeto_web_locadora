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
const API_URL = "/api/classificacoes_etarias/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando classificações etárias...");
    carregarClassificacoesEtarias();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

async function carregarClassificacoesEtarias() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.error("Erro ao carregar classificações etárias:", response.statusText);
        const errorText = await response.text();
        console.error("Resposta do servidor:", errorText);
        alert("Erro ao carregar dados. Verifique o console do servidor (Django).");
        return; 
    }
    
    const classificacoes = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    classificacoes.forEach(classificacao => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${classificacao.id}</td>
            <td>${classificacao.descricao}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${classificacao.id}, '${classificacao.descricao}')">Editar</button>
                <button class="delete" onclick="deletarClassificacao(${classificacao.id})">Excluir</button>
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
            <h3>${id ? "Editar Classificação Etária" : "Adicionar Classificação Etária"}</h3>

            <label>Descrição</label>
            <input type="text" id="descricao" value="${descricao}">
            

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarClassificacao()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


async function criarClassificacao() {
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
        alert("Erro ao criar classificação etária");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarClassificacoesEtarias();
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
        alert("Erro ao editar classificação etária");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarClassificacoesEtarias();
}


async function deletarClassificacao(id) {
    if (!confirm("Tem certeza que deseja excluir esta classificação etária?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!response.ok) {
        alert("Erro ao excluir classificação etária");
        console.error(await response.text());
        return;
    }

    carregarClassificacoesEtarias();
}


function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}