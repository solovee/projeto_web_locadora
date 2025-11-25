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
const API_URL = "/api/classificacoes_internas/"; 

document.addEventListener("DOMContentLoaded", () => {
    console.log("Carregando classificações internas...");
    carregarClassificacoesInternas();
    document.querySelector(".add").addEventListener("click", () => {
        abrirFormulario();
    });
});

// =================== LISTAR ===================
async function carregarClassificacoesInternas() {
    const response = await fetch(API_URL);
    // Verificação de erro para o caso de o servidor ainda retornar HTML (500)
    if (!response.ok) {
        console.error("Erro ao carregar classificações internas:", response.statusText);
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
            <td>${classificacao.valor_aluguel}</td>
            <td>
                <button class="edit" onclick="abrirFormulario(${classificacao.id}, '${classificacao.descricao}', ${classificacao.valor_aluguel})">Editar</button>
                <button class="delete" onclick="deletarClassificacao(${classificacao.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


function abrirFormulario(id = null, descricao = "", valor_aluguel = 0) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Classificação Interna" : "Adicionar Classificação Interna"}</h3>

            <label>Descrição</label>
            <input type="text" id="descricao" value="${descricao}">

            <label>Valor Aluguel</label>
            <input type="number" id="valor_aluguel" value="${valor_aluguel}" step="0.01">
            <button class="modal-save"
                onclick="${id ? `salvarEdicao(${id})` : `criarClassificacao()`}">
                Salvar
            </button>


            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


// =================== CRIAR ===================
async function criarClassificacao() {
    const data = {
        descricao: document.getElementById("descricao").value,
        valor_aluguel: parseFloat(document.getElementById("valor_aluguel").value),
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
        alert("Erro ao criar classificação interna");
        console.error(await resposta.text());
        return;
    }

    fecharModal();
    carregarClassificacoesInternas();
}


// =================== EDITAR ===================
async function salvarEdicao(id) {
    const data = {
        descricao: document.getElementById("descricao").value,
        valor_aluguel: parseFloat(document.getElementById("valor_aluguel").value),
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
        alert("Erro ao editar classificação interna");
        console.error(await resposta.text());
        return;
    }
    fecharModal();
    carregarClassificacoesInternas();
}


// =================== DELETAR ===================
async function deletarClassificacao(id) {
    if (!confirm("Tem certeza que deseja excluir esta classificação interna?")) return;

    const resposta = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { 
            "X-CSRFToken": CSRF_TOKEN 
        }
    });
    if (!resposta.ok) {
        alert("Erro ao excluir classificação interna");
        console.error(await resposta.text());
        return;
    }
    carregarClassificacoesInternas();
}


// =================== AUXILIAR ===================
function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}