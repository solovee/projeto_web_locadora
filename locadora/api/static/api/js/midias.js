// =================== CSRF ===================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const CSRF_TOKEN = getCookie('csrftoken');
const API_URL = "/api/midias/";

document.addEventListener("DOMContentLoaded", () => {
    carregarMidias();
    document.querySelector(".add").addEventListener("click", () => abrirFormulario());
});

// =================== LISTAR ===================
async function carregarMidias() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        console.error(await response.text());
        alert("Erro ao carregar mídias.");
        return;
    }

    const midias = await response.json();
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    midias.forEach(midia => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${midia.id}</td>
            <td>${midia.titulo}</td>
            <td>${midia.ano_lancamento}</td>
            <td>${midia.codigo_barras}</td>
            <td>${midia.duracao_em_minutos}</td>
            <td>${midia.ator_principal}</td>
            <td>${midia.ator_coadjuvante}</td>
            <td>${midia.genero}</td>
            <td>${midia.classificacao_etaria}</td>
            <td>${midia.tipo}</td>
            <td>${midia.classificacao_interna}</td>

            <td>
                <button class="edit" 
                    onclick="abrirFormulario(
                        ${midia.id},
                        '${midia.titulo}',
                        ${midia.ano_lancamento},
                        '${midia.codigo_barras}',
                        ${midia.duracao_em_minutos},
                        ${midia.ator_principal},
                        ${midia.ator_coadjuvante},
                        ${midia.genero},
                        ${midia.classificacao_etaria},
                        ${midia.tipo},
                        ${midia.classificacao_interna}
                    )">
                    Editar
                </button>

                <button class="delete" onclick="deletarMidia(${midia.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


// =================== FORMULÁRIO ===================
function abrirFormulario(
    id = null,
    titulo = "",
    ano_lancamento = "",
    codigo_barras = "",
    duracao_em_minutos = "",
    ator_principal = "",
    ator_coadjuvante = "",
    genero = "",
    classificacao_etaria = "",
    tipo = "",
    classificacao_interna = ""
) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <h3>${id ? "Editar Mídia" : "Adicionar Mídia"}</h3>

            <label>Título</label>
            <input type="text" id="titulo" value="${titulo}">

            <label>Ano de Lançamento</label>
            <input type="number" id="ano_lancamento" value="${ano_lancamento}">

            <label>Código de Barras</label>
            <input type="text" id="codigo_barras" value="${codigo_barras}">

            <label>Duração (min)</label>
            <input type="number" id="duracao_em_minutos" value="${duracao_em_minutos}">

            <label>Ator Principal (ID)</label>
            <input type="number" id="ator_principal" value="${ator_principal}">

            <label>Ator Coadjuvante (ID)</label>
            <input type="number" id="ator_coadjuvante" value="${ator_coadjuvante}">

            <label>Gênero ID</label>
            <input type="number" id="genero" value="${genero}">

            <label>Classificação Etária ID</label>
            <input type="number" id="classificacao_etaria" value="${classificacao_etaria}">

            <label>Tipo ID</label>
            <input type="number" id="tipo" value="${tipo}">

            <label>Classificação Interna ID</label>
            <input type="number" id="classificacao_interna" value="${classificacao_interna}">

            <button class="modal-save" onclick="${id ? `salvarEdicao(${id})` : "criarMidia()"}">Salvar</button>
            <button class="modal-cancel" onclick="fecharModal()">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);
}


// =================== CRIAR ===================
async function criarMidia() {
    const data = coletarDadosFormulario();

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN 
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Erro ao criar mídia");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarMidias();
}


// =================== EDITAR ===================
async function salvarEdicao(id) {
    const data = coletarDadosFormulario();

    const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN 
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Erro ao editar mídia");
        console.error(await response.text());
        return;
    }

    fecharModal();
    carregarMidias();
}


// =================== DELETAR ===================
async function deletarMidia(id) {
    if (!confirm("Deseja excluir esta mídia?")) return;

    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": CSRF_TOKEN }
    });

    if (!response.ok) {
        alert("Erro ao excluir mídia");
        console.error(await response.text());
        return;
    }

    carregarMidias();
}


// =================== AUXILIAR ===================
function coletarDadosFormulario() {
    return {
        titulo: document.getElementById("titulo").value,
        ano_lancamento: Number(document.getElementById("ano_lancamento").value),
        codigo_barras: document.getElementById("codigo_barras").value,
        duracao_em_minutos: Number(document.getElementById("duracao_em_minutos").value),
        ator_principal: Number(document.getElementById("ator_principal").value),
        ator_coadjuvante: Number(document.getElementById("ator_coadjuvante").value),
        genero: Number(document.getElementById("genero").value),
        classificacao_etaria: Number(document.getElementById("classificacao_etaria").value),
        tipo: Number(document.getElementById("tipo").value),
        classificacao_interna: Number(document.getElementById("classificacao_interna").value)
    };
}

function fecharModal() {
    const modal = document.querySelector(".modal");
    if (modal) modal.remove();
}
