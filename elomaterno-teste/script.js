document.addEventListener("DOMContentLoaded", () => {
    // Seleciona todos os elementos que possuem a classe 'fade-in'
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Dispara a animação quando 15% do elemento estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe que engatilha o CSS transition
                entry.target.classList.add('visible');
                // Interrompe a observação após a primeira animação (opcional)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aplica o observer em cada elemento
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});