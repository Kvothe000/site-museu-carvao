export function initHistoryModal() {
    const overlay = document.getElementById('history-gallery-modal-overlay');
    if (!overlay) return;

    const modalContainer = document.getElementById('history-gallery-modal');
    const closeBtn = document.getElementById('close-history-modal');
    const titleEl = document.getElementById('history-modal-title-el');
    const carouselWrapper = document.getElementById('modal-carousel-wrapper');
    const triggerButtons = document.querySelectorAll('.view-images-btn');

    let activeTrigger = null;
    let currentCarouselListeners = [];

    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function getFocusableElements() {
        return Array.from(modalContainer.querySelectorAll(focusableElementsString));
    }

    function handleTabKey(e) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    function initDynamicCarousel(container) {
        const track = container.querySelector('.carousel-track');
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.indicator-dot');
        const prevBtn = container.querySelector('.carousel-btn-prev');
        const nextBtn = container.querySelector('.carousel-btn-next');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;

        function updateActiveDot(index) {
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function scrollToSlide(index) {
            if (index < 0 || index >= slides.length) return;
            currentIndex = index;
            const slideWidth = slides[0].offsetWidth;
            track.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            });
            updateActiveDot(index);
        }

        const handlePrev = (e) => {
            e.preventDefault();
            let index = currentIndex - 1;
            if (index < 0) index = slides.length - 1;
            scrollToSlide(index);
        };

        const handleNext = (e) => {
            e.preventDefault();
            let index = currentIndex + 1;
            if (index >= slides.length) index = 0;
            scrollToSlide(index);
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', handlePrev);
            currentCarouselListeners.push({ el: prevBtn, type: 'click', fn: handlePrev });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', handleNext);
            currentCarouselListeners.push({ el: nextBtn, type: 'click', fn: handleNext });
        }

        dots.forEach((dot, index) => {
            const handleDot = (e) => {
                e.preventDefault();
                scrollToSlide(index);
            };
            dot.addEventListener('click', handleDot);
            currentCarouselListeners.push({ el: dot, type: 'click', fn: handleDot });
        });

        let isScrolling;
        const handleScroll = () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const slideWidth = slides[0].offsetWidth;
                if (slideWidth > 0) {
                    const index = Math.round(track.scrollLeft / slideWidth);
                    currentIndex = index;
                    updateActiveDot(index);
                }
            }, 100);
        };

        track.addEventListener('scroll', handleScroll, { passive: true });
        currentCarouselListeners.push({ el: track, type: 'scroll', fn: handleScroll });
    }

    function destroyCarousel() {
        currentCarouselListeners.forEach(listener => {
            listener.el.removeEventListener(listener.type, listener.fn);
        });
        currentCarouselListeners = [];
        carouselWrapper.innerHTML = '';
    }

    function openModal(topic, triggerEl) {
        activeTrigger = triggerEl;

        // Set title dynamically based on active language translations
        const currentLang = localStorage.getItem('language') || 'pt';
        const titleKey = `hist_modal_title_${topic}`;
        if (window.translations && window.translations[currentLang] && window.translations[currentLang][titleKey]) {
            titleEl.textContent = window.translations[currentLang][titleKey];
            titleEl.setAttribute('data-i18n', titleKey);
        } else {
            titleEl.textContent = 'Galeria';
            titleEl.removeAttribute('data-i18n');
        }

        // Dynamically build and inject carousel to lazy-load images only upon opening modal
        const images = ['foto1', 'foto2', 'foto3'];
        let carouselHtml = `
            <div class="carousel-container">
                <div class="carousel-track">
        `;
        images.forEach((imgName) => {
            carouselHtml += `
                <div class="carousel-slide">
                    <picture>
                        <source srcset="img/${topic}/${imgName}.webp" type="image/webp">
                        <img src="img/${topic}/${imgName}.jpg" loading="lazy" class="carousel-image" alt="Imagem de ${topic}">
                    </picture>
                </div>
            `;
        });
        carouselHtml += `
                </div>
                <button class="carousel-btn carousel-btn-prev" aria-label="Foto anterior">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button class="carousel-btn carousel-btn-next" aria-label="Próxima foto">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
                <div class="carousel-indicators">
        `;
        images.forEach((_, index) => {
            carouselHtml += `
                <button class="indicator-dot${index === 0 ? ' active' : ''}" data-slide="${index}" aria-label="Ir para slide ${index + 1}"></button>
            `;
        });
        carouselHtml += `
                </div>
            </div>
        `;

        carouselWrapper.innerHTML = carouselHtml;

        // Initialize carousel controls on the injected HTML
        initDynamicCarousel(carouselWrapper);

        overlay.classList.add('active');
        overlay.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            closeBtn.focus();
        }, 100);

        overlay.addEventListener('keydown', handleTabKey);
    }

    function closeModal() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        overlay.removeEventListener('keydown', handleTabKey);

        // Destroy carousel listeners and empty container to release memory
        destroyCarousel();

        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null;
        }
    }

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const topic = btn.getAttribute('data-topic');
            openModal(topic, btn);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
}
