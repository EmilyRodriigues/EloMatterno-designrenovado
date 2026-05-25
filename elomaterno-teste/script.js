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




// --- teste como funciona ---
    const steps = document.querySelectorAll('.step-card');
    const img1 = document.getElementById('mockup-img-1');
    const img2 = document.getElementById('mockup-img-2');
    
    if (steps.length > 0 && img1 && img2) {
        let currentImgSrc = img1.src; // Armazena o estado da imagem atual

        const stepObserverOptions = {
            root: null,
            // A imagem só muda quando o card cruzar a linha dos 40% a 60% da tela (o meio)
            rootMargin: '-40% 0px -40% 0px', 
            threshold: 0
        };

        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Atualiza os estilos do texto (destaca o card focado)
                    steps.forEach(step => step.classList.remove('is-active'));
                    entry.target.classList.add('is-active');

                    // 2. Obtém a nova imagem que precisa ser carregada
                    const newImageSrc = entry.target.getAttribute('data-image');

                    // 3. Executa o Cross-fade apenas se a imagem for diferente da atual
                    if (newImageSrc !== currentImgSrc) {
                        
                        // Descobre qual tag <img> está aparecendo e qual está escondida
                        const activeImg = img1.classList.contains('active') ? img1 : img2;
                        const hiddenImg = img1.classList.contains('active') ? img2 : img1;

                        // Carrega a nova imagem na tag escondida
                        hiddenImg.src = newImageSrc;

                        // Aguarda a imagem fazer o download completo para não piscar
                        hiddenImg.onload = () => {
                            // Inverte as classes para disparar a transição CSS de opacidade
                            activeImg.classList.remove('active');
                            hiddenImg.classList.add('active');
                            
                            // Atualiza a referência da imagem atual
                            currentImgSrc = newImageSrc;
                        };
                    }
                }
            });
        }, stepObserverOptions);

        // Inicializa a observação para cada card de passo
        steps.forEach(step => stepObserver.observe(step));
    }