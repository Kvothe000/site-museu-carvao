export function initCarousel() {
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel && typeof Splide !== 'undefined') {
        new Splide('#home-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '0',
            autoplay: true,
            interval: 4000,
            pauseOnHover: true,
            arrows: true,
            pagination: true,
            width: '100%',
            fixedWidth: null,
            breakpoints: {
                992: { perPage: 1 },
                768: { perPage: 1 }
            }
        }).mount();
    }
}
