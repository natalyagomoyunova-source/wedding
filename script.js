(function () {
    'use strict';

    const envelopeWrapper = document.getElementById('envelopeContainer');
    const envelopeEl = document.getElementById('envelope');
    const waxSeal = document.getElementById('waxSeal');
    const mainContent = document.getElementById('mainContent');
    const form = document.getElementById('rsvpForm');
    const result = document.getElementById('formResult');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    /* ---------- Открытие конверта ---------- */

    let opened = false;

    function openEnvelope() {
        if (opened) return;
        opened = true;

        envelopeWrapper.classList.add('opened');
        waxSeal.setAttribute('aria-hidden', 'true');
        waxSeal.setAttribute('tabindex', '-1');

        // Когда конверт улетел — показываем контент
        window.setTimeout(() => {
            document.body.classList.remove('no-scroll');
            document.body.classList.add('content-visible');
            mainContent.setAttribute('aria-hidden', 'false');
            envelopeWrapper.setAttribute('aria-hidden', 'true');
        }, 1000);
    }

    // Клик по всей поверхности конверта ИЛИ по печати — открывает приглашение.
    // Печать — <button>, поэтому Enter/Space с клавиатуры тоже работают.
    if (envelopeEl) envelopeEl.addEventListener('click', openEnvelope);

    // Дополнительно даём клавиатурный shortcut (Enter/Space) если фокус на обёртке
    envelopeWrapper.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === envelopeWrapper) {
            e.preventDefault();
            openEnvelope();
        }
    });

    /* ---------- Отправка формы ---------- */

    if (!form) return;

    function setResult(text, type) {
        result.textContent = text;
        result.className = 'form-result ' + (type || '');
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Простейшая клиентская валидация (submit с novalidate)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submitBtn.disabled = true;
        setResult('Отправка…', 'loading');

        const formData = new FormData(form);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const json = await response.json().catch(() => ({}));

            if (response.ok && json.success) {
                setResult('Спасибо! Ваш ответ получен. Ждём вас ❤', 'success');
                form.reset();
            } else {
                setResult(json.message || 'Не удалось отправить форму. Попробуйте ещё раз.', 'error');
            }
        } catch (err) {
            setResult('Ошибка сети. Проверьте интернет и попробуйте позже.', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });
})();