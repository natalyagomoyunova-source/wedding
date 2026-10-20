(function () {
    'use strict';

    // 1. Логика открытия конверта
    const envelopeWrapper = document.getElementById('envelopeContainer');
    const envelopeEl = document.getElementById('envelope');
    const waxSeal = document.getElementById('waxSeal');
    const mainContent = document.getElementById('mainContent');
    let opened = false;

    function openEnvelope() {
        if (opened) return;
        opened = true;

        envelopeWrapper.classList.add('opened');
        
        setTimeout(() => {
            document.body.classList.remove('no-scroll');
            document.body.classList.add('content-visible');
            mainContent.setAttribute('aria-hidden', 'false');
            envelopeWrapper.setAttribute('aria-hidden', 'true');
            // Активируем первый блок, чтобы он сразу появился
            document.querySelectorAll('.reveal')[0].classList.add('active');
        }, 1000);
    }

    if (envelopeEl) envelopeEl.addEventListener('click', openEnvelope);

    // 2. Анимация появления блоков при скролле
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Срабатывает один раз
            }
        });
    }, {
        threshold: 0.15 // Блок появляется, когда виден на 15%
    });

    // Подключаем Observer только после открытия конверта (опционально)
    // Но для простоты можно запустить сразу, он не будет мешать конверту
    revealElements.forEach(el => revealObserver.observe(el));


    // 3. Обратный отсчет (Таймер)
    const targetDate = new Date('July 25, 2026 15:00:00').getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            return; // Если дата прошла
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
        if(hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
        if(minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if(secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }

    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown();


    // 4. Отправка формы RSVP
    const form = document.getElementById('rsvpForm');
    const result = document.getElementById('formResult');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            submitBtn.disabled = true;
            result.textContent = 'Отправка...';
            result.className = 'form-result';

            const formData = new FormData(form);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const json = await response.json().catch(() => ({}));

                if (response.ok && json.success) {
                    result.textContent = 'Спасибо! Ваш ответ получен. Ждём вас ❤';
                    result.className = 'form-result success';
                    form.reset();
                } else {
                    result.textContent = json.message || 'Не удалось отправить. Попробуйте ещё раз.';
                    result.className = 'form-result error';
                }
            } catch (err) {
                result.textContent = 'Ошибка сети. Проверьте интернет.';
                result.className = 'form-result error';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
})();