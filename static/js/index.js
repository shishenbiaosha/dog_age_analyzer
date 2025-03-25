document.addEventListener('DOMContentLoaded', function () {
    // 初始化 AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // 添加鼠标移动视差效果
    const heroSection = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image-container');

    if (heroSection && heroImage) {
        heroSection.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = heroSection.getBoundingClientRect();

            const x = (clientX - left) / width - 0.5;
            const y = (clientY - top) / height - 0.5;

            heroImage.style.transform = `
                perspective(1000px)
                rotateY(${x * 10}deg)
                rotateX(${-y * 10}deg)
                translateZ(10px)
            `;
        });

        heroSection.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'perspective(1000px) rotateY(-5deg)';
        });
    }

    // 添加滚动动画
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());
    });

    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach((step, index) => {
        step.setAttribute('data-aos', 'fade-up');
        step.setAttribute('data-aos-delay', (index * 100).toString());
    });

    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());
    });

    // 添加计数器动画
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/,|\+/g, ''));
        const duration = 2000;
        const step = Math.ceil(target / (duration / 30));
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current >= target) {
                counter.textContent = target + '+';
                clearInterval(interval);
            } else {
                counter.textContent = current + '+';
            }
        };

        const interval = setInterval(updateCounter, 30);
    });
}); 