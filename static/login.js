// Login.js - Client-Side Login & Registration Logic

document.addEventListener('DOMContentLoaded', () => {
    const loggedIn = localStorage.getItem('nursing_user_logged_in') === 'true';
    if (loggedIn) {
        window.location.href = '/dashboard';
        return;
    }
    
    initializeSalesExperience();
});

function initializeSalesExperience() {
    bindButtonRipples();
    rotateAuthSocialProof();
}

function useDemoLogin() {
    const emailEl = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    if (!emailEl || !passwordEl) return;

    emailEl.value = 'student@nursing.edu';
    passwordEl.value = 'password';
    handleLogin({ preventDefault: () => {} });
}

function rotateAuthSocialProof() {
    const quoteEl = document.getElementById('auth-proof-quote');
    const authorEl = document.getElementById('auth-proof-author');
    const passRateEl = document.getElementById('proof-pass-rate');
    const learnersEl = document.getElementById('proof-active-learners');

    if (!quoteEl || !authorEl || !passRateEl || !learnersEl) return;

    const snippets = [
        {
            quote: '"I stopped second-guessing priority questions after one week of simulations."',
            author: '- Senior Nursing Student, Boston',
            passRate: '92%',
            learners: '4,200+'
        },
        {
            quote: '"The SBAR and vitals feedback made my first clinical rotation way less stressful."',
            author: '- ADN Student, Houston',
            passRate: '94%',
            learners: '4,500+'
        },
        {
            quote: '"I finally understand why each intervention matters, not just what to memorize."',
            author: '- BSN Candidate, Seattle',
            passRate: '96%',
            learners: '4,800+'
        }
    ];

    let idx = 0;
    animateProofValue(passRateEl, snippets[0].passRate);
    animateProofValue(learnersEl, snippets[0].learners);

    setInterval(() => {
        idx = (idx + 1) % snippets.length;
        quoteEl.textContent = snippets[idx].quote;
        authorEl.textContent = snippets[idx].author;
        animateProofValue(passRateEl, snippets[idx].passRate);
        animateProofValue(learnersEl, snippets[idx].learners);
    }, 5000);
}

function animateProofValue(element, targetText) {
    if (!element) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        element.textContent = targetText;
        return;
    }

    const hasPercent = targetText.includes('%');
    const hasPlus = targetText.includes('+');
    const targetNum = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(targetNum)) {
        element.textContent = targetText;
        return;
    }

    const currentNum = parseInt((element.textContent || '').replace(/[^0-9]/g, ''), 10) || 0;
    const duration = 650;
    const start = performance.now();

    element.classList.add('is-animating');

    function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(currentNum + (targetNum - currentNum) * eased);

        let rendered = value.toLocaleString();
        if (hasPercent) rendered += '%';
        if (hasPlus) rendered += '+';
        element.textContent = rendered;

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            element.classList.remove('is-animating');
        }
    }

    requestAnimationFrame(frame);
}

function toggleAuthView(view) {
    if (view === 'register') {
        document.getElementById('signin-view').style.display = 'none';
        document.getElementById('register-view').style.display = 'block';
    } else {
        document.getElementById('signin-view').style.display = 'block';
        document.getElementById('register-view').style.display = 'none';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const address = document.getElementById('register-address').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const course = document.getElementById('register-course').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, address, email, course, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        
        alert(`🎉 Registration Successful!\n\nA confirmation email has been simulated and printed to the server console.\n\nYou can now log in with your email and password.`);
        
        // Clear fields
        document.getElementById('register-name').value = '';
        document.getElementById('register-address').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        
        // Switch back to sign in
        toggleAuthView('signin');
        
        // Auto-fill signin email
        document.getElementById('login-email').value = email;
        
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        
        localStorage.setItem('nursing_user_email', data.email);
        localStorage.setItem('nursing_user_name', data.name);
        localStorage.setItem('nursing_user_course', data.course);
        localStorage.setItem('nursing_user_logged_in', 'true');
        
        window.location.href = '/dashboard';
        
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

function bindButtonRipples() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');
    if (!buttons.length || prefersReduced) return;

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'btn-ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

            button.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
}
