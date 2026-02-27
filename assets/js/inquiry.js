/* ============================================================
   inquiry.js — Inquiry form submission to Firebase
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inquiryForm');
    const formWrap = document.getElementById('form-wrap');
    const successEl = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const unitSelect = document.getElementById('preferred-unit');
    const checkInGroup = document.getElementById('checkin-group');
    const checkOutGroup = document.getElementById('checkout-group');

    // Show/hide date fields based on unit type selection
    if (unitSelect) {
        unitSelect.addEventListener('change', () => {
            const val = unitSelect.value;
            const isAirbnb = val.includes('airbnb') || val === 'white-unit' || val === 'red-unit';
            if (checkInGroup) checkInGroup.style.display = isAirbnb ? '' : 'none';
            if (checkOutGroup) checkOutGroup.style.display = isAirbnb ? '' : 'none';
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate house rules checkbox
        const agreed = document.getElementById('house-rules-agree').checked;
        if (!agreed) {
            showError('Please agree to the House Rules & Cancellation Policy to proceed.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Set button loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';

        try {
            const res = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                formWrap.style.display = 'none';
                successEl.classList.add('show');
            } else {
                showError(result.message || 'Something went wrong. Please try again.');
                resetBtn();
            }
        } catch (err) {
            showError('Network error. Please check your connection and try again.');
            resetBtn();
        }
    });

    function showError(msg) {
        let errEl = document.getElementById('form-error');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = 'form-error';
            errEl.style.cssText = 'color:#ef4444;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);padding:12px 16px;border-radius:8px;font-size:0.85rem;margin-bottom:16px;';
            form.prepend(errEl);
        }
        errEl.textContent = msg;
        errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        resetBtn();
    }

    function resetBtn() {
        submitBtn.disabled = false;
        btnText.textContent = 'Send Inquiry';
    }
});
