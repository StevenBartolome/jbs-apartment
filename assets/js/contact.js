// Contact form functionality
function toggleConditionalFields() {
    const unitSelect = document.getElementById('unit');
    const shortTermFields = document.getElementById('short-term-fields');
    const longTermFields = document.getElementById('long-term-fields');
    const shortTermDates = document.getElementById('short-term-dates');
    const longTermDates = document.getElementById('long-term-dates');

    // Hide all conditional fields first
    shortTermFields.classList.remove('show');
    longTermFields.classList.remove('show');
    shortTermDates.classList.remove('show');
    longTermDates.classList.remove('show');

    // Show appropriate fields based on selection
    if (unitSelect.value === 'short-term') {
        shortTermFields.classList.add('show');
        shortTermDates.classList.add('show');
    } else if (unitSelect.value === 'long-term') {
        longTermFields.classList.add('show');
        longTermDates.classList.add('show');
    }
}

// Hamburger menu functionality
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm() {
    let isValid = true;
    const form = document.getElementById('contactForm');

    // Clear previous error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.classList.remove('error');
    });

    // Validate required fields
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (!name.value.trim()) {
        showFieldError(name, 'Name is required');
        isValid = false;
    }

    if (!email.value.trim()) {
        showFieldError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }

    if (!message.value.trim()) {
        showFieldError(message, 'Message is required');
        isValid = false;
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('form-messages');
    messagesContainer.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

    // Scroll to the message
    messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messagesContainer.innerHTML = '';
        }, 5000);
    }
}

function setButtonLoading(loading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnSpinner.style.display = 'none';
    }
}

// Form submission handling with AJAX
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) {
        showMessage('Please correct the errors below.', 'error');
        return;
    }

    setButtonLoading(true);
    showMessage('Sending your message...', 'info');

    const formData = new FormData(this);

    fetch('/api/contact', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            setButtonLoading(false);

            if (data.success) {
                showMessage(data.message, 'success');
                document.getElementById('contactForm').reset();
                // Hide conditional fields after reset
                toggleConditionalFields();
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            setButtonLoading(false);
            console.error('Error:', error);
            showMessage('An error occurred while sending your message. Please try again.', 'error');
        });
});

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function () {
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });

    // Add change event listener for check-out date validation
    const checkInDate = document.getElementById('check-in-date');
    const checkOutDate = document.getElementById('check-out-date');

    if (checkInDate && checkOutDate) {
        checkInDate.addEventListener('change', function () {
            checkOutDate.setAttribute('min', this.value);
            if (this.value && checkOutDate.value && checkOutDate.value <= this.value) {
                checkOutDate.value = '';
            }
        });
    }
});