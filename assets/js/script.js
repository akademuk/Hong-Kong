// Main Script
document.addEventListener('DOMContentLoaded', () => {
    console.log('Crystal Planet scripts loaded');

    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const body = document.body;

    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');

            // Prevent scrolling when menu is open
            if (nav.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu on link click
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // Scroll Parallax for About Section
    const aboutSection = document.querySelector('.about');
    const parallaxBg = document.querySelector('.about__parallax-bg');

    if (aboutSection && parallaxBg) {
        let ticking = false;

        // Max safe translation: parallax image overlaps section by 50% top and 50% bottom.
        // Half of section height is the safe range we can move within without revealing background.
        const updateParallax = () => {
            const rect = aboutSection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = aboutSection.offsetHeight;
            const screenHeight = window.innerHeight;

            if (sectionTop < screenHeight && sectionTop + sectionHeight > 0) {
                const speed = parseFloat(parallaxBg.getAttribute('data-depth')) || 0.2;
                let yPos = (sectionTop - screenHeight * 0.5) * speed;

                // Clamp so the image never moves further than the overflow buffer (50% of section height)
                const maxOffset = sectionHeight * 0.45;
                if (yPos > maxOffset) yPos = maxOffset;
                if (yPos < -maxOffset) yPos = -maxOffset;

                parallaxBg.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        updateParallax();
    }

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
    });
});



// Swiper Initialization
const proudSlider = new Swiper('.proud-slider', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// Menu Slider Initialization
const menuSlider = new Swiper('.menu-swiper', {
    loop: true,
    slidesPerView: 1, // Default to 1 slide
    spaceBetween: 20,
    navigation: {
        nextEl: '.menu-swiper-next',
        prevEl: '.menu-swiper-prev',
    },
});

// Branches Logic
const pins = document.querySelectorAll('.branches__pin, .map-pin');
const popups = document.querySelectorAll('.branches__popup');
const overlay = document.getElementById('popup-overlay') || document.querySelector('.popup-overlay');

// FIX: Move popups to body to avoid stacking context issues (Safari z-index bug)
// We also move the overlay to ensure it is immediately before the popups in the DOM
if (overlay) document.body.appendChild(overlay);
popups.forEach(popup => document.body.appendChild(popup));

const closeButtons = document.querySelectorAll('.branches__close, .close-popup');
const mapContainer = document.querySelector('.branches__wrapper');

// Helper: Close All
const closeAllPopups = () => {
    popups.forEach(p => p.classList.remove('active'));
    pins.forEach(p => p.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (mapContainer) mapContainer.style.overflowX = '';

    // Unlock Lenis Scroll
    if (window.lenis) window.lenis.start();
};

// Init Branch Swipers
const branchSwipers = document.querySelectorAll('.branch-swiper');
branchSwipers.forEach(swiperEl => {
    new Swiper(swiperEl, {
        loop: true,
        observer: true,
        observeParents: true,
        grabCursor: true,
        nested: true,
        touchMoveStopPropagation: true, 
        touchStartPreventDefault: false, 
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
});

// Stop events inside popup from bubbling
popups.forEach(popup => {
    popup.addEventListener('click', (e) => e.stopPropagation());
    popup.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    popup.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
});

// Pin Click Event
pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = pin.getAttribute('data-id');
        const targetPopup = document.getElementById('branch-popup-' + id);

        closeAllPopups(); // clear others first

        if (targetPopup) {
            targetPopup.classList.add('active');
            pin.classList.add('active');
            if (overlay) overlay.classList.add('active');

            // Lock Scroll
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            if (mapContainer) mapContainer.style.overflowX = 'hidden';

            // Lock Lenis Scroll
            if (window.lenis) window.lenis.stop();
        }
    });
});

// Close Button Event
closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllPopups();
    });
});

// Overlay Click Event
if (overlay) {
    overlay.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllPopups();
    });
    // Prevent background scroll interactions on iOS
    overlay.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// Global Click (Fallback)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.branches__popup') && !e.target.closest('.branches__pin')) {
        closeAllPopups();
    }
});

// Escape Key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPopups();
});

const initRetailSlider = () => {
    const swiperContainer = document.querySelector('.retail-swiper');
    if (!swiperContainer) return;

    // 1. Функция анимации (теперь чистая и без потери данных)
    const animateCounter = (el) => {
        const target = +el.dataset.target || 0; // Берем из атрибута!
        const duration = 1000; // мс
        const start = 0;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing (опционально, для плавности)
            // const ease = 1 - Math.pow(1 - progress, 3); 
            
            const current = Math.floor(progress * target);
            el.textContent = `${current} +`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = `${target} +`; // Фиксация финала
            }
        };

        requestAnimationFrame(step);
    };

    // 2. Функция запуска анимации на активном слайде
    const runActiveCounters = (swiper) => {
        // Ищем счетчики только внутри активных слайдов
        const activeSlides = swiper.slides[swiper.activeIndex]; 
        // Если slidesPerView: 'auto', возможно нужно искать в swiper.visibleSlides (если есть такой массив в твоей версии)
        // Для простоты берем активный:
        const counters = activeSlides.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            // Сброс перед запуском не обязателен, если мы перезаписываем,
            // но для визуала можно обнулить
            counter.textContent = '0 +';
            animateCounter(counter);
        });
    };

    // 3. Инициализация Swiper
    const retailSwiper = new Swiper('.retail-swiper', {
        direction: 'horizontal',
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        speed: 500,
        
        mousewheel: {
            enabled: true,
            forceToAxis: true, 
            releaseOnEdges: true,
        },

        scrollbar: {
            el: '.swiper-scrollbar',
            draggable: true, 
            snapOnRelease: false, 
            hide: false, 
        },

        breakpoints: {
            320: { spaceBetween: 15 },
            768: { spaceBetween: 20 }
        },

        on: {
            init: function (swiper) {
                runActiveCounters(swiper);
            },
            slideChange: function (swiper) {
                runActiveCounters(swiper);
            }
        }
    });
};

// Вызов
document.addEventListener('DOMContentLoaded', initRetailSlider);

document.addEventListener('DOMContentLoaded', function() {
    const teamSwiper = new Swiper('.team-swiper', {
        slidesPerView: 'auto', 
        spaceBetween: 20,   
        grabCursor: true,   
        
        scrollbar: {
            el: '.swiper-scrollbar',
            draggable: true, 
            snapOnRelease: true, 
            dragSize: 'auto',
        },

       
        mousewheel: {
            enabled: true,
            forceToAxis: true, 
            releaseOnEdges: true, 
        },
    });
});

// Branches Desktop/Mobile Scroll Logic (Arrows)
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.branches__wrapper');
    const prevBtn = document.querySelector('.branches-scroll-btn.prev');
    const nextBtn = document.querySelector('.branches-scroll-btn.next');

    if (wrapper && prevBtn && nextBtn) {
        
        // Check visibility and update arrows
        const updateArrows = () => {
            // Tolerance of 1px for high-DPI screens calc errors
            if (wrapper.scrollLeft <= 1) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }

            if (wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1) {
                nextBtn.classList.add('hidden');
            } else {
                nextBtn.classList.remove('hidden');
            }
        };

        // Scroll amount: 50% of screen width or fixed amount
        const scrollAmount = () => wrapper.clientWidth / 2;

        prevBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });

        // Listen for scroll events to toggle arrows
        wrapper.addEventListener('scroll', updateArrows);
        
        // Initial check
        updateArrows();
        // Check on resize too
        window.addEventListener('resize', updateArrows);
    }
});

// Lenis Smooth Scroll
document.addEventListener('DOMContentLoaded', () => {
    // Check if Lenis is defined
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Loop
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Connect AOS to Lenis (optional optimization)
        // AOS usually works fine, but refreshing on scroll helps sync
        /* 
        lenis.on('scroll', () => {
             AOS.refresh(); 
        }); 
        */
        
        console.log('Lenis initialized');
        window.lenis = lenis; // Expose to global for popup logic

        // Smooth Scroll for Anchor Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        lenis.scrollTo(targetElement);
                    }
                }
            });
        });
    }
});

// News Load More Logic
document.addEventListener('DOMContentLoaded', () => {
    const newsItems = document.querySelectorAll('.news-item');
    const viewBtn = document.getElementById('view');
    const itemsPerPage = 6;
    let itemsToShow = 3; 

    // Center branches map on mobile on load
const branchesWrapper = document.querySelector('.branches__wrapper');
if (branchesWrapper && window.innerWidth <= 1280) {
    const map = branchesWrapper.querySelector('.branches__map');
    if (map) {
        const scrollTo = (map.scrollWidth - branchesWrapper.clientWidth) / 2 - 150;
        branchesWrapper.scrollLeft = scrollTo;
    }
}

// Initially hide items beyond the limit (6)
    if (newsItems.length > 0) {
        newsItems.forEach((item, index) => {
            if (index >= itemsPerPage) {
                item.style.display = 'none';
            }
        });

        // Loop through to check if we need to show the button initially
        // Note: Using a specific selector or just checking display property
        const hiddenCount = Array.from(newsItems).filter(item => item.style.display === 'none').length;
        if (hiddenCount === 0 && viewBtn) {
           viewBtn.style.display = 'none';
        }
    }

    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
             // Find currently hidden items
             const hiddenItems = Array.from(document.querySelectorAll('.news-item')).filter(item => item.style.display === 'none');
             
             if (hiddenItems.length > 0) {
                 let count = 0;
                 // Show next 3 items
                 for (let i = 0; i < hiddenItems.length; i++) {
                     if (count < itemsToShow) {
                         hiddenItems[i].style.display = ''; // Clear inline style to revert to CSS default (block/flex)
                         count++;
                     }
                 }
                 
                 // Re-check hidden items
                 const remainingHidden = Array.from(document.querySelectorAll('.news-item')).filter(item => item.style.display === 'none');
                 if (remainingHidden.length === 0) {
                     viewBtn.style.display = 'none';
                 }
             }
        });
    }
});
