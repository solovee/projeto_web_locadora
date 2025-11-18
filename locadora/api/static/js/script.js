document.addEventListener("DOMContentLoaded", () => {
    const titulo = document.querySelector("header h1");

    if (titulo) {
        titulo.style.cursor = "pointer";  // deixa claro que é clicável

        titulo.addEventListener("click", () => {
            // Redirecionar para a página inicial do Django
            window.location.href = "/";
            // Se quiser usar outra URL do Django, coloque aqui
        });
    }
});
