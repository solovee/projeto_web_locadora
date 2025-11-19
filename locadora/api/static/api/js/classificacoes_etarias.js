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
const API_URL = "/api/classificacoes_etarias/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando classificações etárias...");
    carregarClassificacoesEtarias();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarClassificacoesEtarias() {
    const response = await fetch(API_URL);
    // Verificação de erro para o caso de o servidor ainda retornar HTML (500)
    if (!response.ok) {
        console.error("Erro ao carregar classificações etárias:", response.statusText);
        // Tente ler o corpo como texto para ver o erro (se for HTML)
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


// =================== FORMULÁRIO PARA CRIAR/EDITAR (Função Faltante) ===================
function abrirFormulario(id = null, descricao = "") {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content">
            <h3>${id ? "Editar Classificação Etária" : "Adicionar Classificação Etária"}</h3>

            <label>Descrição</label>
            <input type="text" id="descricao" value="${descricao}">
            

            <button onclick="${id ? `salvarEdicao(${id})` : "criarClassificacao()"}">
                Salvar
            </button>
            <button onclick="this.parentElement.parentElement.remove()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


// =================== CRIAR ===================
async function criarClassificacao() {
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
    carregarClassificacoesEtarias();
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
    carregarClassificacoesEtarias();
}


// =================== DELETAR ===================
async function deletarClassificacao(id) {
    if (!confirm("Tem certeza que deseja excluir esta classificação etária?")) return;

    await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });

    carregarClassificacoesEtarias();
}


// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}