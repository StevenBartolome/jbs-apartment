/* ============================================================
   main.js — Shared JS for all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Navbar: scroll class + hamburger ─────────────────── */
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
        document.addEventListener('click', e => {
            if (!e.target.closest('.navbar')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
            }
        });
    }

    /* ── Fade-up Intersection Observer ────────────────────── */
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 80}ms`;
            io.observe(el);
        });
    }

    /* ── Hero Slideshow ────────────────────────────────────── */
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    if (slides.length > 1) {
        let current = 0;
        const go = (n) => {
            slides[current].classList.remove('active');
            indicators[current]?.classList.remove('active');
            current = (n + slides.length) % slides.length;
            slides[current].classList.add('active');
            indicators[current]?.classList.add('active');
        };
        indicators.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
        setInterval(() => go(current + 1), 5000);
    }

    /* ── Availability Calendar ─────────────────────────────── */
    const calWraps = document.querySelectorAll('.calendar-wrap[data-unit]');
    calWraps.forEach(wrap => {
        const unit = wrap.dataset.unit;
        // Sample booked / pending dates (admin-controlled in real setup)
        const sampleBooked = {
            'white': [3, 4, 5, 18, 19, 20],
            'red': [7, 8, 12, 25, 26],
            'apartment': [1, 10, 11, 23, 24]
        };
        const samplePending = {
            'white': [10, 11],
            'red': [14, 15],
            'apartment': [16, 17]
        };
        const booked = sampleBooked[unit] || [];
        const pending = samplePending[unit] || [];
        renderCalendar(wrap, booked, pending);
    });

    /* ── Date input min today ──────────────────────────────── */
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(i => i.setAttribute('min', today));

    /* ── Check-in → Check-out min sync ────────────────────── */
    const cin = document.getElementById('check-in-date');
    const cout = document.getElementById('check-out-date');
    if (cin && cout) {
        cin.addEventListener('change', () => {
            const next = new Date(cin.value);
            next.setDate(next.getDate() + 1);
            const minStr = next.toISOString().split('T')[0];
            cout.setAttribute('min', minStr);
            if (cout.value && cout.value <= cin.value) cout.value = minStr;
        });
    }

});

/* ── Calendar Render Helper ──────────────────────────────── */
function renderCalendar(wrap, booked = [], pending = []) {
    const monthLabel = wrap.querySelector('.cal-month-label');
    const grid = wrap.querySelector('.calendar-grid');
    const prevBtn = wrap.querySelector('.cal-prev');
    const nextBtn = wrap.querySelector('.cal-next');
    if (!grid) return;

    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const todayDate = now.getDate();
    const todayMonth = month;
    const todayYear = year;

    const draw = () => {
        if (monthLabel) monthLabel.textContent = `${MONTHS[month]} ${year}`;
        grid.innerHTML = '';
        // Day name headers
        DAYS.forEach(d => {
            const el = document.createElement('div');
            el.className = 'cal-day-name';
            el.textContent = d;
            grid.appendChild(el);
        });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            const el = document.createElement('div');
            el.className = 'cal-day empty';
            grid.appendChild(el);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement('div');
            let cls = 'cal-day';
            if (d === todayDate && month === todayMonth && year === todayYear) cls += ' today';
            if (booked.includes(d)) cls += ' booked';
            else if (pending.includes(d)) cls += ' pending';
            else cls += ' available';
            el.className = cls;
            el.textContent = d;
            grid.appendChild(el);
        }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { month--; if (month < 0) { month = 11; year--; } draw(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { month++; if (month > 11) { month = 0; year++; } draw(); });
    draw();
}
