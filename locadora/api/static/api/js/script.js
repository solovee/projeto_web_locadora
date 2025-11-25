document.addEventListener("DOMContentLoaded", () => {
    const titulo = document.querySelector("header h1");

    if (titulo) {
        titulo.style.cursor = "pointer";  

        titulo.addEventListener("click", () => {
            window.location.href = "/";
        });
    }
});
