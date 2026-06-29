export function initStoryCarousel() {
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.indicator-dot');
    const prevBtn = carousel.querySelector('.carousel-btn-prev');
    const nextBtn = carousel.querySelector('.carousel-btn-next');

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

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let index = currentIndex - 1;
            if (index < 0) index = slides.length - 1; // loop
            scrollToSlide(index);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let index = currentIndex + 1;
            if (index >= slides.length) index = 0; // loop
            scrollToSlide(index);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSlide(index);
        });
    });

    // Sincroniza bolinhas quando rolar manualmente (scroll horizontal)
    let isScrolling;
    track.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            const slideWidth = slides[0].offsetWidth;
            const index = Math.round(track.scrollLeft / slideWidth);
            currentIndex = index;
            updateActiveDot(index);
        }, 100);
    }, { passive: true });
}
