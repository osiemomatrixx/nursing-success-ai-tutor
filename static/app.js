// App.js - Nursing Success AI Tutor Client-Side Logic

let isPremium = true; // Unlocked
let currentSimulationDept = null;
let currentSimulationStep = 0;
let currentSimulationCase = null;
let simulationScore = 0;

let currentHeartRate = 72;
let radarChart = null;
let lineChart = null;
let chatHistory = [];
let selectedOptionIndex = null;
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScoreCount = 0;
let selectedPlan = localStorage.getItem('nursing_selected_plan') || 'weekly';
let assessmentTimerInterval = null;
let assessmentTimeLeft = 60;

const DEPARTMENTS = [
    { id: 'er', name: 'Emergency Room (ER)', desc: 'Acute asthma exacerbation triage and stabilization.', premium: false },
    { id: 'icu', name: 'Intensive Care Unit (ICU)', desc: 'Septic shock fluid resuscitation and vasopressor titration.', premium: false },
    { id: 'peds', name: 'Pediatrics', desc: 'Pediatric croup, cool mist, and dexamethasone.', premium: false },
    { id: 'maternity', name: 'Maternity (L&D)', desc: 'Postpartum hemorrhage fundal massage and uterine tone.', premium: false },
    { id: 'med_surg', name: 'Medical-Surgical', desc: 'Post-op pulmonary embolism management and heparin.', premium: false },
    { id: 'mental_health', name: 'Mental Health (Psych)', desc: 'Acute schizophrenic agitation and de-escalation.', premium: false },
    { id: 'leadership', name: 'Leadership & Delegation', desc: 'Triage assignments, staff delegation, and priority.', premium: false },
    { id: 'pathophysiology', name: 'Pathophysiology', desc: 'SIADH and Diabetes Insipidus water imbalances.', premium: false }
];

document.addEventListener('DOMContentLoaded', () => {
    // Authentication Overlay Check
    const loggedIn = localStorage.getItem('nursing_user_logged_in') === 'true';
    if (!loggedIn) {
        document.getElementById('login-overlay').style.display = 'flex';
    } else {
        document.getElementById('login-overlay').style.display = 'none';
        updateUserProfile();
    }
    
    updateSubscriptionUI();
    
    // Wire up sidebar navigation click handlers
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Initialize Dashboard/Ref Panels
    loadClinicalRotations();
    loadReferenceLabs();
    loadReferenceDrugs();
    loadQuestionsByCategory(false);
    
    // Initialize Charts
    initCharts();
    
    // Initialize scrolling ECG / SpO2 Patient Monitor
    initVitalMonitors();
    
    // Trigger initial calculation
    calculateIVDrip();
    calculateInfusionRate();

    // Conversion-focused UI interactions
    initializeSalesExperience();

    // Professional UI features
    initMobileSidebar();
    initHeaderClock();
    document.body.classList.add('loaded');

    // Surface backend AI status so OpenAI usage is visible to the user
    updateOpenAIStatus();

    // Entrance motion for key dashboard and tab elements
    applyStaggeredReveal('dashboard');

    // Initialize benchmark widgets with current learner data
    updateDashboardBenchmarks();
});

function initializeSalesExperience() {
    initPlanSelectionFromStorage();
    bindButtonRipples();
    bindSalesHeroParallax();
    rotateAuthSocialProof();
    startOfferCountdown();
}

function initPlanSelectionFromStorage() {
    selectPlan(selectedPlan);
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

function bindSalesHeroParallax() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const hero = document.querySelector('.sales-hero');
    if (!hero) return;

    const main = hero.querySelector('.sales-hero-main');
    const aside = hero.querySelector('.sales-hero-aside');

    hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateX = (0.5 - y) * 5;
        const rotateY = (x - 0.5) * 6;

        hero.classList.add('is-hovering');
        hero.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        if (main) main.style.transform = `translateZ(14px)`;
        if (aside) aside.style.transform = `translateZ(22px)`;
    });

    hero.addEventListener('pointerleave', () => {
        hero.classList.remove('is-hovering');
        hero.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        if (main) main.style.transform = 'translateZ(0)';
        if (aside) aside.style.transform = 'translateZ(0)';
    });
}

function startOfferCountdown() {
    const countdownEl = document.getElementById('offer-countdown');
    if (!countdownEl) return;

    const now = Date.now();
    let offerEnd = parseInt(localStorage.getItem('nursing_offer_ends_at') || '0', 10);
    if (!offerEnd || offerEnd < now) {
        offerEnd = now + (24 * 60 * 60 * 1000);
        localStorage.setItem('nursing_offer_ends_at', String(offerEnd));
    }

    const tick = () => {
        const diff = Math.max(0, offerEnd - Date.now());
        const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        countdownEl.textContent = `${hours}:${minutes}:${seconds}`;

        if (diff === 0) {
            offerEnd = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('nursing_offer_ends_at', String(offerEnd));
        }
    };

    tick();
    setInterval(tick, 1000);
}

// MOBILE SIDEBAR TOGGLE
function initMobileSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active');
    });

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });
    }

    // Close sidebar when a nav item is clicked on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('active');
            }
        });
    });
}

// HEADER LIVE CLOCK
function initHeaderClock() {
    const clockEl = document.getElementById('header-clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        clockEl.textContent = `${dateStr} \u2022 ${timeStr}`;
    }

    updateClock();
    setInterval(updateClock, 30000);
}

// ANNOUNCEMENT BAR DISMISS
function dismissAnnouncement() {
    const bar = document.getElementById('announcement-bar');
    if (bar) {
        bar.style.transition = 'opacity 0.3s, max-height 0.3s';
        bar.style.opacity = '0';
        bar.style.maxHeight = '0';
        bar.style.overflow = 'hidden';
        bar.style.marginBottom = '0';
        bar.style.padding = '0';
        setTimeout(() => bar.remove(), 350);
    }
}

// AUTHENTICATION AND PROFILE
function toggleAuthView(view) {
    const signinToggle = document.getElementById('auth-toggle-signin');
    const registerToggle = document.getElementById('auth-toggle-register');

    if (view === 'register') {
        document.getElementById('signin-view').style.display = 'none';
        document.getElementById('register-view').style.display = 'block';
        if (signinToggle) signinToggle.classList.remove('active');
        if (registerToggle) registerToggle.classList.add('active');
    } else {
        document.getElementById('signin-view').style.display = 'block';
        document.getElementById('register-view').style.display = 'none';
        if (signinToggle) signinToggle.classList.add('active');
        if (registerToggle) registerToggle.classList.remove('active');
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
        
        // Clear registration fields
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
        
        document.getElementById('login-overlay').style.display = 'none';
        updateUserProfile();
        switchTab('dashboard');
        
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}

function updateUserProfile() {
    const email = localStorage.getItem('nursing_user_email') || 'student@nursing.edu';
    const storedName = localStorage.getItem('nursing_user_name') || 'Student Nurse';
    const storedCourse = localStorage.getItem('nursing_user_course') || 'NCLEX Prep Fast Track';
    
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    
    if (sidebarUsername) sidebarUsername.textContent = storedName;
    if (sidebarAvatar) {
        const initials = storedName.split(' ').map(n => n[0]).join('').toUpperCase();
        sidebarAvatar.textContent = initials.slice(0, 2);
    }
    
    const pageSubtitle = document.getElementById('page-subtitle');
    const activeTab = document.querySelector('.nav-item.active');
    if (pageSubtitle && activeTab && activeTab.getAttribute('data-tab') === 'dashboard') {
        pageSubtitle.textContent = `Welcome back, ${storedName}. Active Course: ${storedCourse}.`;
    }
}

// SUBSCRIPTIONS & PREMIUM SYSTEM
function updateSubscriptionUI() {
    isPremium = true; // Unlocked
    const subStatus = document.getElementById('subscription-status');
    const upgradeBadge = document.getElementById('premium-upgrade-badge');
    const activeBadge = document.getElementById('premium-active-badge');
    
    if (isPremium) {
        if (subStatus) subStatus.textContent = 'Premium Account';
        if (upgradeBadge) upgradeBadge.style.display = 'none';
        if (activeBadge) activeBadge.style.display = 'flex';
    } else {
        if (subStatus) subStatus.textContent = 'Free Account';
        if (upgradeBadge) upgradeBadge.style.display = 'flex';
        if (activeBadge) activeBadge.style.display = 'none';
    }
}

function openSubscriptionModal() {
    document.getElementById('subscription-modal').style.display = 'flex';
}

function closeSubscriptionModal() {
    document.getElementById('subscription-modal').style.display = 'none';
}

function selectPlan(plan) {
    selectedPlan = plan;
    localStorage.setItem('nursing_selected_plan', selectedPlan);

    const cards = document.querySelectorAll('.plan-card');
    cards.forEach(card => card.classList.remove('active'));
    if (plan === 'weekly') {
        cards[0].classList.add('active');
    } else {
        cards[1].classList.add('active');
    }

    updateSelectedPlanSummary();
}

function updateSelectedPlanSummary() {
    const summaryEl = document.getElementById('selected-plan-summary');
    const paymentBtn = document.getElementById('payment-button-text');
    if (!summaryEl || !paymentBtn) return;

    if (selectedPlan === 'monthly') {
        summaryEl.textContent = 'You selected Monthly Plan. Best value for long-term NCLEX preparation and all premium rotations.';
        paymentBtn.textContent = 'Pay $7 and Activate Monthly Premium';
    } else {
        summaryEl.textContent = 'You selected Weekly Plan. Start now for $7 and cancel anytime.';
        paymentBtn.textContent = 'Pay $7 and Activate Premium';
    }
}

function simulatePayment() {
    localStorage.setItem('nursing_is_premium', 'true');
    closeSubscriptionModal();
    updateSubscriptionUI();
    loadClinicalRotations();
    
    // Update radar chart parameters if unlocked
    if (radarChart) {
        radarChart.data.datasets[0].data[6] = 35; // Leadership initial premium estimate
        radarChart.data.datasets[0].data[7] = 30; // Pathophysiology initial premium estimate
        radarChart.update();
    }
    
    alert('Thank you! Premium Access Activated. Enjoy 8 full clinical rotations and the comprehensive NCLEX mock exam engine!');
}

// SETTINGS & OPENAI CONFIG
function openSettingsModal() {
    const key = localStorage.getItem('nursing_openai_key') || '';
    const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || '';
    document.getElementById('openai-key-input').value = key;
    document.getElementById('mcp-bridge-input').value = mcpBridgeUrl;
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const key = document.getElementById('openai-key-input').value.trim();
    const mcpBridgeUrl = document.getElementById('mcp-bridge-input').value.trim();
    localStorage.setItem('nursing_openai_key', key);
    localStorage.setItem('nursing_mcp_bridge_url', mcpBridgeUrl);
    closeSettingsModal();
    alert('Settings saved. OpenAI API Key updated successfully.');
}

// TAB MANAGEMENT
function switchTab(tabName) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        if (tab.id === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    // Smooth title transition
    if (pageTitle) {
        pageTitle.style.transition = 'opacity 0.15s';
        pageTitle.style.opacity = '0';
    }
    if (pageSubtitle) {
        pageSubtitle.style.transition = 'opacity 0.15s';
        pageSubtitle.style.opacity = '0';
    }
    setTimeout(() => {
        if (pageTitle) pageTitle.style.opacity = '1';
        if (pageSubtitle) pageSubtitle.style.opacity = '1';
    }, 160);
    
    if (tabName === 'dashboard') {
        pageTitle.textContent = 'Path Library';
        pageSubtitle.textContent = "Welcome back, Student Nurse. Select a structured learning path or clinical rotation below.";
        loadClinicalRotations();
        updateDashboardProgressBars();
    } else if (tabName === 'simulation') {
        pageTitle.textContent = 'Interactive Labs';
        pageSubtitle.textContent = 'Virtual patient lab environments with real-time clinical judgment feedback.';
        loadSimulationDepts();
    } else if (tabName === 'nclex') {
        pageTitle.textContent = 'Skill IQ Assessments';
        pageSubtitle.textContent = 'Measure and benchmark your clinical judgment standings.';
        resetSkillIQAssessment();
    } else if (tabName === 'pharmacology') {
        pageTitle.textContent = 'Reference Center';
        pageSubtitle.textContent = 'High-yield nursing references, lab values, and dosage calculators.';
    } else if (tabName === 'chat') {
        pageTitle.textContent = 'AI Mentor Support';
        pageSubtitle.textContent = 'Clarify nursing concepts and clinical protocols with Iris, your AI Tutor.';
    } else if (tabName === 'research') {
        pageTitle.textContent = 'Research Playground';
        pageSubtitle.textContent = 'Query scientific literature and trial data with agentic synthesis.';
    }

    applyStaggeredReveal(tabName);
}

function applyStaggeredReveal(tabName) {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tab = document.getElementById(tabName);
    if (!tab) return;

    const targets = tab.querySelectorAll('.glass-card, .question-card, .quiz-actions, .simulator-layout, .reference-layout, .chat-layout');
    if (!targets.length) return;

    targets.forEach((el, index) => {
        el.classList.add('reveal-item');
        el.style.setProperty('--reveal-delay', `${index * 70}ms`);

        if (prefersReduced) {
            el.classList.add('is-visible');
            return;
        }

        el.classList.remove('is-visible');
        requestAnimationFrame(() => {
            el.classList.add('is-visible');
        });
    });
}

// DASHBOARD CLINCAL ROTATIONS GRID
function loadClinicalRotations() {
    const grid = document.getElementById('dashboard-dept-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    DEPARTMENTS.forEach(dept => {
        const isLocked = dept.premium && !isPremium;
        const card = document.createElement('div');
        card.className = `dept-card glass-card ${isLocked ? 'locked' : ''}`;
        
        const isCompleted = localStorage.getItem(`sim_completed_${dept.id}`) === 'true';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; width: 100%;">
                <h4 style="font-size: 1.1rem; color: var(${isLocked ? '--text-secondary' : '--primary'});">${dept.name}</h4>
                ${isLocked ? '<span style="color: var(--warning); font-size: 0.8rem;">🔒 Premium</span>' : 
                  isCompleted ? '<span style="color: var(--success); font-size: 0.8rem;">✅ Completed</span>' : 
                  '<span style="color: var(--primary); font-size: 0.8rem;">Ready</span>'}
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.4;">${dept.desc}</p>
            ${isLocked ? 
              `<button class="btn-primary" onclick="openSubscriptionModal()" style="width: 100%; background: var(--warning); border-color: var(--warning); color: black;">Unlock Rotation</button>` : 
              `<button class="btn-outline" onclick="selectAndStartSimulation('${dept.id}')" style="width: 100%;">Start Case</button>`
            }
        `;
        grid.appendChild(card);
    });
    
    // Update dashboard completed count
    let completedCount = 0;
    DEPARTMENTS.forEach(dept => {
        if (localStorage.getItem(`sim_completed_${dept.id}`) === 'true') {
            completedCount++;
            const badge = document.getElementById(`badge-${dept.id}`);
            if (badge) badge.style.display = 'inline-block';
        }
    });
    
    const countEl = document.getElementById('stats-sim-count');
    if (countEl) countEl.textContent = completedCount;

    updateDashboardBenchmarks();
}

function selectAndStartSimulation(deptId) {
    switchTab('simulation');
    loadSimulationDepts(deptId);
}

// SIMULATION TAB CONTROLLER
function loadSimulationDepts(selectedDeptId = null) {
    const panel = document.getElementById('sim-dept-panel');
    if (!panel) return;
    
    panel.innerHTML = `<h3>Rotations</h3>`;
    
    DEPARTMENTS.forEach(dept => {
        const isLocked = dept.premium && !isPremium;
        const item = document.createElement('div');
        item.className = `dept-card ${isLocked ? 'locked' : ''} ${selectedDeptId === dept.id ? 'active' : ''}`;
        
        if (selectedDeptId === dept.id && !isLocked) {
            currentSimulationDept = dept.id;
        }
        
        item.innerHTML = `
            <div class="dept-icon">${dept.id.toUpperCase().slice(0, 3)}</div>
            <div class="dept-info">
                <h3>${dept.name}</h3>
                <p>${dept.desc.slice(0, 45)}...</p>
            </div>
            ${isLocked ? '<span class="lock-badge">🔒 Premium</span>' : ''}
        `;
        
        if (!isLocked) {
            item.onclick = () => {
                document.querySelectorAll('#sim-dept-panel .dept-card').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                currentSimulationDept = dept.id;
                loadCasePreview(dept.id);
            };
        } else {
            item.onclick = () => {
                openSubscriptionModal();
            };
        }
        
        panel.appendChild(item);
    });
    
    if (selectedDeptId) {
        const isLocked = DEPARTMENTS.find(d => d.id === selectedDeptId).premium && !isPremium;
        if (!isLocked) {
            loadCasePreview(selectedDeptId);
        }
    } else if (!currentSimulationDept) {
        const firstAvail = DEPARTMENTS.find(d => !d.premium || isPremium);
        if (firstAvail) {
            currentSimulationDept = firstAvail.id;
            const items = panel.querySelectorAll('.dept-card');
            if (items.length > 0) items[0].classList.add('active');
            loadCasePreview(firstAvail.id);
        }
    }
}

async function loadCasePreview(deptId) {
    try {
        const res = await fetch(`/api/simulation/case/${deptId}`);
        if (!res.ok) throw new Error('Failed to fetch case details');
        const data = await res.json();
        
        currentSimulationCase = data;
        currentSimulationStep = 0;
        simulationScore = 0;
        
        document.getElementById('start-sim-container').style.display = 'flex';
        document.getElementById('decision-box').style.display = 'none';
        
        document.getElementById('scenario-title').textContent = data.title;
        document.getElementById('scenario-text').textContent = data.desc;
        
        document.getElementById('sbar-situation').textContent = "Awaiting start...";
        document.getElementById('sbar-background').textContent = "-";
        document.getElementById('sbar-assessment').textContent = "-";
        document.getElementById('sbar-recommendation').textContent = "-";
        
        // Grab initial vitals
        const casesRes = await fetch('/api/simulation/cases');
        const casesData = await casesRes.json();
        const initVitals = casesData[deptId].initialVitals;
        
        updateMonitorVitals(initVitals);
        document.getElementById('monitor-alarm').style.display = 'none';
        
    } catch (err) {
        console.error(err);
        alert('Error loading case study.');
    }
}

function startActualCase() {
    if (!currentSimulationCase) return;
    
    document.getElementById('start-sim-container').style.display = 'none';
    document.getElementById('decision-box').style.display = 'block';
    
    document.getElementById('sbar-situation').textContent = currentSimulationCase.sbar.s;
    document.getElementById('sbar-background').textContent = currentSimulationCase.sbar.b;
    document.getElementById('sbar-assessment').textContent = currentSimulationCase.sbar.a;
    document.getElementById('sbar-recommendation').textContent = currentSimulationCase.sbar.r;
    
    renderSimulationStep();
}

function renderSimulationStep() {
    if (!currentSimulationCase) return;
    
    const step = currentSimulationCase.steps[currentSimulationStep];
    document.getElementById('scenario-text').innerHTML = `<strong>Step ${currentSimulationStep + 1} of ${currentSimulationCase.steps.length}:</strong><br><br>${step.text}`;
    
    updateMonitorVitals(step.vitals);
    checkVitalsAlert(step.vitals);
    
    const optionsDiv = document.getElementById('decision-options');
    optionsDiv.innerHTML = '';
    
    step.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-command-btn';
        btn.innerHTML = `
            <div class="cmd-num">ACTION ${String.fromCharCode(65 + idx)}</div>
            <div>${opt.text}</div>
        `;
        btn.onclick = () => submitSimulationAction(idx);
        optionsDiv.appendChild(btn);
    });
}

async function submitSimulationAction(optIdx) {
    try {
        const res = await fetch('/api/simulation/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dept: currentSimulationDept,
                step: currentSimulationStep,
                option_index: optIdx
            })
        });
        
        if (!res.ok) throw new Error('Action submittal failed');
        const result = await res.json();
        
        simulationScore += result.score;
        alert(`Preceptor Feedback:\n\n${result.feedback}`);
        
        if (result.next === 'complete') {
            localStorage.setItem(`sim_completed_${currentSimulationDept}`, 'true');
            growCompetency(currentSimulationDept);
            loadClinicalRotations();
            
            alert(`Case Completed! Total Score for this rotation: ${simulationScore} points.`);
            
            document.getElementById('scenario-text').innerHTML = `<h3>🎉 Clinical Rotation Completed!</h3><p>You have successfully managed the patient in this department. Your clinical competency score has improved!</p>`;
            document.getElementById('decision-box').style.display = 'none';
            document.getElementById('start-sim-container').style.display = 'none';
            
            updateMonitorVitals({ hr: 72, bp: "120/80", spo2: 98, rr: 16 });
            document.getElementById('monitor-alarm').style.display = 'none';
        } else {
            currentSimulationStep = result.next;
            renderSimulationStep();
        }
    } catch (err) {
        console.error(err);
        alert('Error processing simulation action.');
    }
}

// PATIENT VITAL SIGNS MONITOR (CANVAS ANIMATIONS)
function updateMonitorVitals(vitals) {
    if (!vitals) return;
    document.getElementById('vital-hr').textContent = vitals.hr || '--';
    document.getElementById('vital-bp').textContent = vitals.bp || '--/--';
    document.getElementById('vital-spo2').textContent = vitals.spo2 || '--';
    
    if (vitals.hr) {
        currentHeartRate = vitals.hr;
    }
}

function checkVitalsAlert(vitals) {
    const alarm = document.getElementById('monitor-alarm');
    if (!alarm) return;
    
    if (vitals && (vitals.spo2 < 90 || vitals.hr > 115 || vitals.hr < 55)) {
        alarm.style.display = 'block';
    } else {
        alarm.style.display = 'none';
    }
}

function initVitalMonitors() {
    const ecgCanvas = document.getElementById('ecg-canvas');
    const spo2Canvas = document.getElementById('spo2-canvas');
    
    if (!ecgCanvas || !spo2Canvas) return;
    
    const ecgCtx = ecgCanvas.getContext('2d');
    const spo2Ctx = spo2Canvas.getContext('2d');
    
    function resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    resizeCanvas(ecgCanvas);
    resizeCanvas(spo2Canvas);
    
    window.addEventListener('resize', () => {
        resizeCanvas(ecgCanvas);
        resizeCanvas(spo2Canvas);
    });
    
    let ecgX = 0;
    let spo2X = 0;
    
    function drawSweep(ctx, canvas, color, x, getValFunc) {
        const h = canvas.height;
        const w = canvas.width;
        const y = (h / 2) + getValFunc(x) * (h / 3);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        
        ctx.fillStyle = '#030712';
        ctx.fillRect(x + 1, 0, 15, h);
        
        ctx.beginPath();
        const lastY = canvas.lastY || y;
        ctx.moveTo(x - 1, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        canvas.lastY = y;
    }
    
    function getECGValue(x) {
        const beatDuration = (60 / currentHeartRate) * 120;
        const cycle = x % beatDuration;
        
        if (cycle < 10) {
            return -Math.sin((cycle / 10) * Math.PI) * 0.15;
        } else if (cycle >= 10 && cycle < 13) {
            return 0;
        } else if (cycle >= 13 && cycle < 15) {
            return 0.1;
        } else if (cycle >= 15 && cycle < 18) {
            return -1.0;
        } else if (cycle >= 18 && cycle < 21) {
            return 0.4;
        } else if (cycle >= 21 && cycle < 26) {
            return 0;
        } else if (cycle >= 26 && cycle < 36) {
            return -Math.sin(((cycle - 26) / 10) * Math.PI) * 0.3;
        } else {
            return 0;
        }
    }
    
    function getSpO2Value(x) {
        const beatDuration = (60 / currentHeartRate) * 120;
        const cycle = x % beatDuration;
        
        if (cycle < 35) {
            let val = -Math.sin((cycle / 35) * Math.PI);
            if (cycle > 20 && cycle < 28) {
                val += 0.25 * Math.sin(((cycle - 20) / 8) * Math.PI);
            }
            return val * 0.65;
        } else {
            return 0;
        }
    }
    
    function animate() {
        const ecgW = ecgCanvas.width;
        const spo2W = spo2Canvas.width;
        
        ecgX = (ecgX + 2.0) % ecgW;
        spo2X = (spo2X + 2.0) % spo2W;
        
        drawSweep(ecgCtx, ecgCanvas, '#00f5d4', ecgX, getECGValue);
        drawSweep(spo2Ctx, spo2Canvas, '#00b4d8', spo2X, getSpO2Value);
        
        requestAnimationFrame(animate);
    }
    
    ecgCtx.fillStyle = '#030712';
    ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    spo2Ctx.fillStyle = '#030712';
    spo2Ctx.fillRect(0, 0, spo2Canvas.width, spo2Canvas.height);
    
    animate();
}

// NCLEX PREP SECTION
function getRequestedQuestionCount(defaultCount = 20) {
    const savedCount = parseInt(localStorage.getItem('nursing_question_count') || '', 10);
    const startingCount = Number.isFinite(savedCount) && savedCount > 0 ? savedCount : defaultCount;
    const answer = window.prompt(
        'How many questions do you want?\n\nQuick choices: 10, 25, 50, 100, 250, 500, 1000',
        String(startingCount)
    );
    if (answer === null) return defaultCount;

    const parsed = parseInt(answer.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 1) return defaultCount;
    localStorage.setItem('nursing_question_count', String(Math.min(parsed, 1000)));
    return Math.min(parsed, 1000);
}

async function loadQuestionsByCategory(promptForCount = true, defaultCount = null) {
    const select = document.getElementById('nclex-category-select');
    if (!select) return;
    
    const category = select.value;
    const effectiveDefaultCount = defaultCount ?? (category === 'mock_exam' ? 1000 : 20);
    const requestedCount = promptForCount ? getRequestedQuestionCount(effectiveDefaultCount) : effectiveDefaultCount;
    const apiKey = localStorage.getItem('nursing_openai_key') || '';
    
    if (category === 'mock_exam') {
        if (!isPremium) {
            alert('🔒 The Comprehensive Mock Exam is a Premium feature. Please subscribe to unlock.');
            select.value = 'all';
            loadQuestionsByCategory(false, 20);
            return;
        }
        
        try {
            const count = requestedCount;
            const res = await fetch(`/api/questions?category=all&count=${encodeURIComponent(count)}&api_key=${encodeURIComponent(apiKey)}`);
            const data = await res.json();
            
            quizQuestions = data;
            currentQuizIndex = 0;
            quizScoreCount = 0;
            
            document.getElementById('quiz-question-counter').textContent = `Mock Exam: Question 1 of ${quizQuestions.length}`;
            renderQuizQuestion();
        } catch (err) {
            console.error(err);
        }
        return;
    }
    
    try {
        let url = '/api/questions';
        const params = new URLSearchParams();
        if (category !== 'all') {
            params.set('category', category);
        }
        params.set('count', String(requestedCount));
        if (apiKey) {
            params.set('api_key', apiKey);
        }
        url += `?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        
        quizQuestions = data;
        currentQuizIndex = 0;
        quizScoreCount = 0;
        
        document.getElementById('quiz-question-counter').textContent = `Question 1 of ${quizQuestions.length}`;
        renderQuizQuestion();
    } catch (err) {
        console.error(err);
    }
}

function startMockExam() {
    switchTab('nclex');
    const select = document.getElementById('nclex-category-select');
    if (select) {
        select.value = 'mock_exam';
        loadQuestionsByCategory(true, 1000);
    }
}

function renderQuizQuestion() {
    const questionCard = document.querySelector('.question-card');
    const categoryEl = document.getElementById('nclex-category');
    const textEl = document.getElementById('nclex-text');
    const optionsDiv = document.getElementById('nclex-options');
    const rationaleBox = document.getElementById('rationale-box');
    const btnSubmit = document.getElementById('btn-submit-nclex');
    const btnNext = document.getElementById('btn-next-nclex');
    
    rationaleBox.classList.remove('show');
    btnSubmit.style.display = 'block';
    btnNext.style.display = 'none';
    
    if (quizQuestions.length === 0) {
        textEl.textContent = 'No questions available in this category.';
        optionsDiv.innerHTML = '';
        btnSubmit.style.display = 'none';
        return;
    }
    
    const q = quizQuestions[currentQuizIndex];
    categoryEl.textContent = q.category;
    textEl.textContent = q.question;
    optionsDiv.innerHTML = '';
    selectedOptionIndex = null;
    
    q.options.forEach((opt, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.innerHTML = `
            <div class="option-checkbox">${String.fromCharCode(65 + idx)}</div>
            <div class="option-content">${opt}</div>
        `;
        optionDiv.onclick = () => {
            document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
            optionDiv.classList.add('selected');
            selectedOptionIndex = idx;
        };
        optionsDiv.appendChild(optionDiv);
    });
}

function submitNclexAnswer() {
    if (selectedOptionIndex === null) {
        alert('Please select an option first.');
        return;
    }
    
    clearInterval(assessmentTimerInterval);
    const q = quizQuestions[currentQuizIndex];
    const optionsDiv = document.getElementById('nclex-options');
    const optionEls = optionsDiv.querySelectorAll('.quiz-option');
    const rationaleBox = document.getElementById('rationale-box');
    const rationaleText = document.getElementById('rationale-text');
    const btnSubmit = document.getElementById('btn-submit-nclex');
    const btnNext = document.getElementById('btn-next-nclex');
    
    optionEls.forEach(el => {
        el.onclick = null;
        el.style.cursor = 'default';
    });
    
    const isCorrect = selectedOptionIndex === q.correctIndex;
    if (isCorrect) {
        quizScoreCount++;
    }
    
    optionEls.forEach((el, idx) => {
        if (idx === q.correctIndex) {
            el.classList.add('correct');
        } else if (idx === selectedOptionIndex) {
            el.classList.add('incorrect');
        }
    });
    
    rationaleBox.classList.add('show');
    rationaleText.innerHTML = q.rationale;
    
    btnSubmit.style.display = 'none';
    btnNext.style.display = 'block';
    
    if (currentQuizIndex === quizQuestions.length - 1) {
        btnNext.textContent = 'Finish Assessment';
    } else {
        btnNext.textContent = 'Next Question';
    }
}

function loadNextNclexQuestion() {
    if (currentQuizIndex < quizQuestions.length - 1) {
        currentQuizIndex++;
        const select = document.getElementById('nclex-category-select');
        const countText = select.value === 'mock_exam' ? 'Mock Exam' : 'Question';
        document.getElementById('quiz-question-counter').textContent = `${countText} ${currentQuizIndex + 1} of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    } else {
        const scorePct = Math.round((quizScoreCount / quizQuestions.length) * 100);
        
        let history = JSON.parse(localStorage.getItem('nclex_score_history') || '[75, 78, 80, 82]');
        history.push(scorePct);
        localStorage.setItem('nclex_score_history', JSON.stringify(history));
        
        if (lineChart) {
            lineChart.data.labels.push(`Assessment ${lineChart.data.labels.length + 1}`);
            lineChart.data.datasets[0].data.push(scorePct);
            lineChart.update();
        }
        
        updateNCLEXStats(history);
        showSkillIQResults(scorePct);
    }
}

// PHARMACOLOGY REFERENCE & DOSAGE CALCULATOR
async function loadReferenceLabs() {
    try {
        const res = await fetch('/api/reference/labs');
        if (!res.ok) throw new Error('Failed to fetch labs');
        const data = await res.json();
        
        const table = document.getElementById('labs-table-body');
        if (!table) return;
        const body = table.querySelector('tbody');
        if (!body) return;
        body.innerHTML = '';
        
        data.forEach(lab => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${lab.name}</strong></td>
                <td>${lab.range}</td>
                <td>${lab.sig}</td>
            `;
            body.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadReferenceDrugs() {
    try {
        const res = await fetch('/api/reference/drugs');
        if (!res.ok) throw new Error('Failed to fetch drugs');
        const data = await res.json();
        
        document.getElementById('drug-name-digoxin').textContent = data.digoxin.name;
        document.getElementById('drug-class-digoxin').innerHTML = `Class: <span style="font-weight: normal; color: var(--text-secondary);">${data.digoxin.class}</span>`;
        document.getElementById('drug-ind-digoxin').innerHTML = `Indications: <span style="font-weight: normal; color: var(--text-secondary);">${data.digoxin.ind}</span>`;
        document.getElementById('drug-act-digoxin').innerHTML = `Action: <span style="font-weight: normal; color: var(--text-secondary);">${data.digoxin.action}</span>`;
        document.getElementById('drug-nurse-digoxin').innerHTML = `Critical Nursing Considerations: <br><span style="font-weight: normal; color: var(--text-secondary);">${data.digoxin.nursing}</span>`;
        
        document.getElementById('drug-name-heparin').textContent = data.heparin.name;
        document.getElementById('drug-class-heparin').innerHTML = `Class: <span style="font-weight: normal; color: var(--text-secondary);">${data.heparin.class}</span>`;
        document.getElementById('drug-ind-heparin').innerHTML = `Indications: <span style="font-weight: normal; color: var(--text-secondary);">${data.heparin.ind}</span>`;
        document.getElementById('drug-act-heparin').innerHTML = `Action: <span style="font-weight: normal; color: var(--text-secondary);">${data.heparin.action}</span>`;
        document.getElementById('drug-nurse-heparin').innerHTML = `Critical Nursing Considerations: <br><span style="font-weight: normal; color: var(--text-secondary);">${data.heparin.nursing}</span>`;
        
        document.getElementById('drug-name-furosemide').textContent = data.furosemide.name;
        document.getElementById('drug-class-furosemide').innerHTML = `Class: <span style="font-weight: normal; color: var(--text-secondary);">${data.furosemide.class}</span>`;
        document.getElementById('drug-ind-furosemide').innerHTML = `Indications: <span style="font-weight: normal; color: var(--text-secondary);">${data.furosemide.ind}</span>`;
        document.getElementById('drug-act-furosemide').innerHTML = `Action: <span style="font-weight: normal; color: var(--text-secondary);">${data.furosemide.action}</span>`;
        document.getElementById('drug-nurse-furosemide').innerHTML = `Critical Nursing Considerations: <br><span style="font-weight: normal; color: var(--text-secondary);">${data.furosemide.nursing}</span>`;
        
    } catch (err) {
        console.error(err);
    }
}

function selectReference(id) {
    const menuItems = document.querySelectorAll('.ref-menu-item');
    menuItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(id) || (id === 'calc' && text.includes('calculator')) || (id === 'val' && text.includes('lab values'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const sections = document.querySelectorAll('.ref-view-section');
    sections.forEach(sec => {
        if (sec.id === `ref-view-${id}`) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });
}

function filterReferenceMenu() {
    const query = document.getElementById('ref-search').value.toLowerCase();
    const items = document.querySelectorAll('.ref-menu-item');
    
    items.forEach(item => {
        if (item.textContent.toLowerCase().includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function calculateIVDrip() {
    const vol = parseFloat(document.getElementById('calc-vol').value) || 0;
    const time = parseFloat(document.getElementById('calc-time').value) || 0;
    const factor = parseFloat(document.getElementById('calc-factor').value) || 0;
    
    if (time <= 0) {
        document.getElementById('calc-drip-rate').textContent = '0';
        return;
    }
    
    const rate = (vol * factor) / (time * 60);
    document.getElementById('calc-drip-rate').textContent = Math.round(rate);
}

function calculateInfusionRate() {
    const dose = parseFloat(document.getElementById('calc-dose').value) || 0;
    const drug = parseFloat(document.getElementById('calc-drug').value) || 0;
    const bag = parseFloat(document.getElementById('calc-bag').value) || 0;
    
    if (drug <= 0) {
        document.getElementById('calc-pump-rate').textContent = '0.0';
        return;
    }
    
    const rate = (dose * bag) / drug;
    document.getElementById('calc-pump-rate').textContent = rate.toFixed(1);
}

// AI PRECEPTOR CHAT ENGINE
function handleChatKeyDown(event) {
    if (event.key === 'Enter') {
        sendUserChatMessage();
    }
}

function sendSuggestedMessage(msgText) {
    document.getElementById('chat-input').value = msgText;
    sendUserChatMessage();
}

async function sendUserChatMessage() {
    const input = document.getElementById('chat-input');
    const msgText = input.value.trim();
    if (!msgText) return;
    
    input.value = '';
    appendChatMessage('user', 'Student Nurse', msgText);
    
    chatHistory.push({ role: 'user', content: msgText });
    const typingId = appendChatTypingBubble();
    
    const apiKey = localStorage.getItem('nursing_openai_key') || null;
    
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msgText,
                history: chatHistory,
                api_key: apiKey
            })
        });
        
        removeChatTypingBubble(typingId);
        
        if (!res.ok) throw new Error('Chat API response failed');
        const data = await res.json();
        
        appendChatMessage('preceptor', 'Preceptor Sarah, RN', data.response, data.source || 'openai');
        chatHistory.push({ role: 'assistant', content: data.response });
        
    } catch (err) {
        console.error(err);
        removeChatTypingBubble(typingId);
        appendChatMessage('preceptor', 'Preceptor Sarah, RN', `[Connection error: ${err.message}. Please verify your API key or backend connection status.]`, 'connection_error');
    }
}

function appendChatMessage(senderType, senderName, text, sourceLabel = null) {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${senderType === 'user' ? 'user' : 'preceptor'}`;
    
    const avatarImg = senderType === 'user' ? 
      `<div class="message-avatar">${localStorage.getItem('nursing_user_email') ? localStorage.getItem('nursing_user_email').slice(0,2).toUpperCase() : 'SN'}</div>` : 
    `<img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah">`;
      
    const formattedText = formatChatMessageText(text);
    
    bubble.innerHTML = `
        ${avatarImg}
        <div class="message-content-wrapper">
            <span class="message-sender">${senderName}</span>
            <div class="message-text">${formattedText}</div>
            ${sourceLabel ? `<span class="message-source">Source: ${sourceLabel === 'openai' ? 'OpenAI' : 'OpenAI unavailable'}</span>` : ''}
        </div>
    `;
    
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function updateOpenAIStatus() {
    const statusEl = document.getElementById('openai-status-text');
    if (!statusEl) return;

    try {
        const res = await fetch('/api/ai/status');
        if (!res.ok) throw new Error('status unavailable');
        const data = await res.json();
        if (data.configured) {
            statusEl.textContent = `OpenAI connected with ${data.model}. Chat and research use the live model when an API key is configured.`;
            statusEl.style.color = 'var(--success)';
        } else {
            statusEl.textContent = `OpenAI not configured on the server. Chat and research are currently using local demo fallback.`;
            statusEl.style.color = 'var(--warning)';
        }

        const mcpStatusEl = document.getElementById('mcp-status-text');
        if (mcpStatusEl) {
            const localMcpBridge = localStorage.getItem('nursing_mcp_bridge_url') || '';
            if (data.mcp_configured || localMcpBridge) {
                mcpStatusEl.textContent = `MCP bridge ready${localMcpBridge ? `: ${localMcpBridge}` : ''}. The research workflow will include external MCP context when available.`;
                mcpStatusEl.style.color = 'var(--success)';
            } else {
                mcpStatusEl.textContent = 'MCP bridge not configured.';
                mcpStatusEl.style.color = 'var(--text-secondary)';
            }
        }
    } catch (err) {
        statusEl.textContent = 'OpenAI status could not be verified.';
        statusEl.style.color = 'var(--warning)';
    }
}

function appendChatTypingBubble() {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return null;
    
    const typingId = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble preceptor typing-bubble';
    bubble.id = typingId;
    
    bubble.innerHTML = `
        <img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah">
        <div class="message-content-wrapper">
            <span class="message-sender">Preceptor Sarah, RN</span>
            <div class="message-text">
                <span class="typing-dot">.</span>
                <span class="typing-dot">.</span>
                <span class="typing-dot">.</span>
            </div>
        </div>
    `;
    
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingId;
}

function removeChatTypingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function formatChatMessageText(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
        
    return html;
}

// RADAR AND LINE CHART INITIALIZATION
function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Charts will not be initialized.');
        return;
    }
    const radarCtx = document.getElementById('radar-chart');
    const lineCtx = document.getElementById('line-chart');
    
    if (!radarCtx || !lineCtx) return;
    
    const currentCompetencies = [
        localStorage.getItem('competency_er') ? parseInt(localStorage.getItem('competency_er')) : 50,
        localStorage.getItem('competency_icu') ? parseInt(localStorage.getItem('competency_icu')) : 45,
        localStorage.getItem('competency_peds') ? parseInt(localStorage.getItem('competency_peds')) : 55,
        localStorage.getItem('competency_maternity') ? parseInt(localStorage.getItem('competency_maternity')) : 60,
        localStorage.getItem('competency_med_surg') ? parseInt(localStorage.getItem('competency_med_surg')) : 40,
        localStorage.getItem('competency_mental_health') ? parseInt(localStorage.getItem('competency_mental_health')) : 50,
        localStorage.getItem('competency_leadership') ? parseInt(localStorage.getItem('competency_leadership')) : (isPremium ? 35 : 0),
        localStorage.getItem('competency_pathophysiology') ? parseInt(localStorage.getItem('competency_pathophysiology')) : (isPremium ? 30 : 0)
    ];
    
    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['ER', 'ICU', 'Pediatrics', 'Maternity', 'Med-Surg', 'Mental Health', 'Leadership', 'Patho'],
            datasets: [{
                label: 'Competency %',
                data: currentCompetencies,
                backgroundColor: 'rgba(0, 245, 212, 0.2)',
                borderColor: '#00f5d4',
                pointBackgroundColor: '#00f5d4',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00f5d4',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#94a3b8', font: { size: 10, family: 'Outfit' } },
                    ticks: {
                        color: '#64748b',
                        backdropColor: 'transparent',
                        showLabelBackdrop: false,
                        stepSize: 20
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
    
    let scoreHistory = [75, 78, 80, 82];
    const storedHistory = localStorage.getItem('nclex_score_history');
    if (storedHistory) {
        scoreHistory = JSON.parse(storedHistory);
    } else {
        localStorage.setItem('nclex_score_history', JSON.stringify(scoreHistory));
    }
    
    updateNCLEXStats(scoreHistory);
    
    const labels = scoreHistory.map((_, idx) => `Quiz ${idx + 1}`);
    
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Success Probability %',
                data: scoreHistory,
                fill: true,
                backgroundColor: 'rgba(131, 56, 236, 0.15)',
                borderColor: '#8338ec',
                tension: 0.4,
                pointBackgroundColor: '#c084fc',
                pointBorderColor: '#fff',
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { family: 'Outfit' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { family: 'Outfit' } },
                    min: 50,
                    max: 100
                }
            }
        }
    });
}

function updateNCLEXStats(history) {
    if (!history || history.length === 0) return;
    const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
    
    const headerScore = document.getElementById('header-nclex-score');
    const statsScore = document.getElementById('stats-nclex-score');
    
    if (headerScore) headerScore.textContent = `${avg}%`;
    if (statsScore) statsScore.textContent = `${avg}%`;

    updateDashboardBenchmarks();
}

function updateDashboardBenchmarks() {
    const history = JSON.parse(localStorage.getItem('nclex_score_history') || '[75, 78, 80, 82]');
    const avgScore = history.length ? Math.round(history.reduce((sum, val) => sum + val, 0) / history.length) : 82;

    let completedCount = 0;
    DEPARTMENTS.forEach((dept) => {
        if (localStorage.getItem(`sim_completed_${dept.id}`) === 'true') {
            completedCount++;
        }
    });

    let currentIq = parseInt(localStorage.getItem('nursing_skill_iq_score') || '', 10);
    if (Number.isNaN(currentIq) || currentIq <= 0) {
        currentIq = Math.round(avgScore * 2.25);
        localStorage.setItem('nursing_skill_iq_score', String(currentIq));
    }

    const headerScore = document.getElementById('header-nclex-score');
    const dashScore = document.getElementById('dashboard-skill-iq-val');
    if (headerScore) headerScore.textContent = currentIq;
    if (dashScore) dashScore.textContent = currentIq;

    updateDashboardProgressBars(currentIq);

    const competencyAverage = Math.round(DEPARTMENTS.reduce((sum, dept) => {
        const defaultValue = dept.id === 'leadership' ? 35 : dept.id === 'pathophysiology' ? 30 : 50;
        return sum + (parseInt(localStorage.getItem(`competency_${dept.id}`), 10) || defaultValue);
    }, 0) / DEPARTMENTS.length);
}

function setPathwayMetric(key, value) {
    const normalizedValue = Math.max(0, Math.min(100, value));
    const labelEl = document.getElementById(`pathway-${key}-label`);
    const fillEl = document.getElementById(`pathway-${key}-fill`);

    if (labelEl) labelEl.textContent = `${normalizedValue}%`;
    if (fillEl) fillEl.style.width = `${normalizedValue}%`;
}

function growCompetency(deptId) {
    const stored = localStorage.getItem(`competency_${deptId}`);
    let currentVal = stored ? parseInt(stored) : (deptId === 'leadership' ? 35 : deptId === 'pathophysiology' ? 30 : 50);
    
    currentVal = Math.min(100, currentVal + 15);
    localStorage.setItem(`competency_${deptId}`, currentVal);
    
    if (radarChart) {
        const idx = DEPARTMENTS.findIndex(d => d.id === deptId);
        if (idx !== -1) {
            radarChart.data.datasets[0].data[idx] = currentVal;
            radarChart.update();
        }
    }
}

// AI CLINICAL RESEARCH SYSTEM
let researchChart = null;

async function runClinicalResearch() {
    const queryEl = document.getElementById('research-query');
    const query = queryEl.value.trim();
    if (!query) {
        alert('Please enter a research query.');
        return;
    }
    
    const includeTrials = document.getElementById('include-trials').checked;
    const includePubmed = document.getElementById('include-pubmed').checked;
    
    if (!includeTrials && !includePubmed) {
        alert('Please select at least one data source.');
        return;
    }
    
    document.getElementById('research-loading').style.display = 'block';
    
    document.getElementById('research-report-card').style.display = 'none';
    document.getElementById('research-chart-card').style.display = 'none';
    document.getElementById('research-trials-card').style.display = 'none';
    document.getElementById('research-pubmed-card').style.display = 'none';
    
    const apiKey = localStorage.getItem('nursing_openai_key') || null;
    
    try {
        const res = await fetch('/api/research/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                include_trials: includeTrials,
                include_pubmed: includePubmed,
                mcp_bridge_url: localStorage.getItem('nursing_mcp_bridge_url') || null,
                api_key: apiKey
            })
        });
        
        document.getElementById('research-loading').style.display = 'none';
        
        if (!res.ok) throw new Error('Research synthesis API failed');
        const data = await res.json();
        
        document.getElementById('research-report-card').style.display = 'block';
        document.getElementById('research-report-content').innerHTML = formatChatMessageText(data.report);
        const sourceBadge = document.getElementById('research-source-badge');
        if (sourceBadge) {
            if (data.source === 'openai') {
                sourceBadge.textContent = `OpenAI connected • ${data.model || 'gpt-4o-mini'}`;
                sourceBadge.style.borderColor = 'var(--primary)';
                sourceBadge.style.color = 'var(--primary)';
            } else if (data.source === 'openai_unavailable') {
                sourceBadge.textContent = 'OpenAI unavailable';
                sourceBadge.style.borderColor = 'var(--warning)';
                sourceBadge.style.color = 'var(--warning)';
            } else {
                sourceBadge.textContent = 'OpenAI status unknown';
                sourceBadge.style.borderColor = 'var(--text-secondary)';
                sourceBadge.style.color = 'var(--text-secondary)';
            }
        }
        const workflowEl = document.getElementById('research-workflow');
        if (workflowEl) {
            const steps = Array.isArray(data.workflow_steps) ? data.workflow_steps : [];
            workflowEl.innerHTML = steps.length
                ? `<strong style="color: var(--text-primary);">Agentic workflow:</strong> ${steps.map(step => step).join(' • ')}`
                : '';
        }
        
        const trialsList = document.getElementById('research-trials-list');
        trialsList.innerHTML = '';
        if (data.trials && data.trials.length > 0) {
            document.getElementById('research-trials-card').style.display = 'block';
            data.trials.forEach(t => {
                const item = document.createElement('div');
                item.className = 'med-calc-box';
                item.style.marginBottom = '0.5rem';
                item.innerHTML = `
                    <h4 style="color: var(--warning); margin-bottom: 0.25rem;">[${t.nctId}] ${t.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong>Status:</strong> ${t.status} | <strong>Sponsor:</strong> ${t.sponsor}
                    </p>
                    <p style="font-size: 0.85rem; line-height: 1.4;">${t.summary}</p>
                `;
                trialsList.appendChild(item);
            });
        }
        
        const pubmedList = document.getElementById('research-pubmed-list');
        pubmedList.innerHTML = '';
        if (data.articles && data.articles.length > 0) {
            document.getElementById('research-pubmed-card').style.display = 'block';
            data.articles.forEach(a => {
                const item = document.createElement('div');
                item.className = 'med-calc-box';
                item.style.marginBottom = '0.5rem';
                item.innerHTML = `
                    <h4 style="color: var(--secondary); margin-bottom: 0.25rem;">${a.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                        <strong>Journal:</strong> ${a.journal} (${a.pubDate})
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong>Authors:</strong> ${a.authors}
                    </p>
                    <span class="badge-outline" style="font-size: 0.75rem; color: var(--primary); border-color: var(--primary);">PMID: ${a.pmid}</span>
                `;
                pubmedList.appendChild(item);
            });
        }
        
        renderResearchChart(data.trials, data.articles);
        
    } catch (err) {
        console.error(err);
        document.getElementById('research-loading').style.display = 'none';
        alert(`Research Synthesis failed: ${err.message}`);
    }
}

function renderResearchChart(trials, articles) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Skipping research chart rendering.');
        const summaryEl = document.getElementById('research-chart-summary');
        if (summaryEl) {
            summaryEl.innerHTML = `Retrieved <strong>${trials.length}</strong> active clinical trials and <strong>${articles.length}</strong> medical articles. (Chart.js is not loaded, chart cannot be displayed).`;
        }
        return;
    }
    document.getElementById('research-chart-card').style.display = 'block';
    const canvas = document.getElementById('research-chart');
    const summaryEl = document.getElementById('research-chart-summary');
    
    if (researchChart) {
        researchChart.destroy();
    }
    
    const statuses = {};
    trials.forEach(t => {
        statuses[t.status] = (statuses[t.status] || 0) + 1;
    });
    
    const labels = Object.keys(statuses);
    const trialCounts = Object.values(statuses);
    
    if (trials.length === 0) {
        researchChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['PubMed Publications'],
                datasets: [{
                    data: [articles.length],
                    backgroundColor: ['rgba(0, 180, 216, 0.6)'],
                    borderColor: ['#00b4d8'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
                    }
                }
            }
        });
        summaryEl.innerHTML = `No clinical trials found. Rendered <strong>${articles.length}</strong> journal publications retrieved from PubMed database.`;
        return;
    }
    
    researchChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Trial Statuses',
                data: trialCounts,
                backgroundColor: 'rgba(255, 186, 8, 0.4)',
                borderColor: '#ffd166',
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b', font: { family: 'Outfit' } },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#64748b', font: { family: 'Outfit', precision: 0 } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    min: 0,
                    suggestedMax: Math.max(...trialCounts) + 1
                }
            }
        }
    });
    
    summaryEl.innerHTML = `Retrieved <strong>${trials.length}</strong> active clinical trials and <strong>${articles.length}</strong> medical articles. Chart shows trial status distribution.`;
}

/* ==========================================================================
   PLURALSIGHT WORKFLOW HELPER METHODS
   ========================================================================== */

function switchSbarTab(tabId) {
    const tabButtons = document.querySelectorAll('.sbar-tab-btn');
    tabButtons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const tabContents = document.querySelectorAll('.sbar-tab-content');
    tabContents.forEach(content => {
        if (content.id === `sbar-tab-content-${tabId}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

function startSkillIQAssessment() {
    const select = document.getElementById('nclex-category-select');
    if (!select) return;
    const category = select.value;
    
    if (category === 'mock_exam' && !isPremium) {
        alert('🔒 The Comprehensive Mock Exam is a Premium feature. Please subscribe to unlock.');
        select.value = 'all';
        return;
    }

    document.getElementById('skill-iq-welcome-view').style.display = 'none';
    document.getElementById('skill-iq-active-view').style.display = 'block';
    document.getElementById('skill-iq-results-view').style.display = 'none';

    loadQuestionsByCategorySilent(category, 5);
}

async function loadQuestionsByCategorySilent(category, count) {
    const apiKey = localStorage.getItem('nursing_openai_key') || '';
    
    try {
        let url = '/api/questions';
        const params = new URLSearchParams();
        if (category !== 'all') {
            params.set('category', category);
        }
        params.set('count', String(count));
        if (apiKey) {
            params.set('api_key', apiKey);
        }
        url += `?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        
        quizQuestions = data;
        currentQuizIndex = 0;
        quizScoreCount = 0;
        
        document.getElementById('quiz-question-counter').textContent = `Question 1 of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    } catch (err) {
        console.error(err);
        // Fallback to local high-quality mock questions if API is offline
        quizQuestions = [
            {
                category: "Safe and Effective Care Environment",
                question: "A nurse is preparing to delegate tasks to an unlicensed assistive personnel (UAP). Which task is most appropriate for the nurse to delegate?",
                options: [
                    "Performing an admission skin assessment on a new patient.",
                    "Administering a scheduled oral medication to a stable patient.",
                    "Assisting a stable patient with ambulating in the hallway.",
                    "Providing discharge teaching to a patient going home."
                ],
                correctIndex: 2,
                rationale: "Ambulating a stable patient is within the scope of a UAP. Assessments, teaching, and medication administration require clinical judgment and must be performed by licensed nursing staff."
            },
            {
                category: "Pharmacological and Parenteral Therapies",
                question: "A patient is receiving an intravenous infusion of heparin. Which laboratory value should the nurse monitor to adjust the heparin infusion rate?",
                options: [
                    "Prothrombin time (PT)",
                    "Activated partial thromboplastin time (aPTT)",
                    "International normalized ratio (INR)",
                    "Platelet count"
                ],
                correctIndex: 1,
                rationale: "Activated partial thromboplastin time (aPTT) is used to monitor heparin efficacy and guide dose titrations. PT/INR is used to monitor warfarin therapy."
            },
            {
                category: "Physiological Adaptation",
                question: "A patient with a history of heart failure presents with shortness of breath, lung crackles, and jugular venous distention. Which medication is the priority to administer?",
                options: [
                    "Atenolol",
                    "Furosemide",
                    "Lisinopril",
                    "Spironolactone"
                ],
                correctIndex: 1,
                rationale: "The patient is experiencing fluid volume overload (crackles, JVD). Furosemide, a loop diuretic, is the priority drug to rapidly promote fluid excretion and reduce pulmonary congestion."
            },
            {
                category: "Reduction of Risk Potential",
                question: "A nurse is caring for a patient post-op day 1 abdominal surgery. Which intervention is most effective for preventing deep vein thrombosis (DVT)?",
                options: [
                    "Massaging the patient's calves twice daily.",
                    "Encouraging early and frequent ambulation.",
                    "Keeping the patient's knees in a flexed position.",
                    "Limiting fluid intake to 1000 mL per day."
                ],
                correctIndex: 1,
                rationale: "Early ambulation is the single most effective intervention to promote venous return and prevent venous stasis/DVT. Calf massage and knee flexion are contraindicated."
            },
            {
                category: "Leadership",
                question: "A nurse is delegating care tasks for a shift. Which client should be assigned to the most experienced nurse on the unit?",
                options: [
                    "A client undergoing a routine postoperative recovery who is stable.",
                    "A client with chronic COPD receiving continuous oxygen at 2 L/min.",
                    "A client newly diagnosed with type 1 diabetes requiring insulin teaching.",
                    "A client admitted 2 hours ago with crushing chest pain and ST-segment elevation."
                ],
                correctIndex: 3,
                rationale: "Crushing chest pain and ST elevation indicates acute MI. This client is hemodynamically unstable and requires advanced assessment and rapid intervention by the most experienced RN."
            }
        ];
        currentQuizIndex = 0;
        quizScoreCount = 0;
        document.getElementById('quiz-question-counter').textContent = `Question 1 of ${quizQuestions.length}`;
        renderQuizQuestion();
        startQuestionTimer();
    }
}

function startQuestionTimer() {
    clearInterval(assessmentTimerInterval);
    assessmentTimeLeft = 60;
    
    const timerFill = document.getElementById('skill-iq-timer-fill');
    const timerLbl = document.getElementById('skill-iq-question-timer-lbl');
    
    if (timerFill) timerFill.style.width = '100%';
    if (timerLbl) timerLbl.textContent = '60s';
    
    assessmentTimerInterval = setInterval(() => {
        assessmentTimeLeft--;
        if (timerLbl) timerLbl.textContent = `${assessmentTimeLeft}s`;
        if (timerFill) {
            const pct = (assessmentTimeLeft / 60) * 100;
            timerFill.style.width = `${pct}%`;
        }
        
        if (assessmentTimeLeft <= 0) {
            clearInterval(assessmentTimerInterval);
            handleQuestionTimeout();
        }
    }, 1000);
}

function handleQuestionTimeout() {
    alert("⏰ Time is up for this question!");
    if (selectedOptionIndex === null) {
        selectedOptionIndex = 0; // select first option as fallback
    }
    submitNclexAnswer();
}

function showSkillIQResults(scorePct) {
    clearInterval(assessmentTimerInterval);
    
    document.getElementById('skill-iq-welcome-view').style.display = 'none';
    document.getElementById('skill-iq-active-view').style.display = 'none';
    document.getElementById('skill-iq-results-view').style.display = 'flex';
    
    let skillIqVal = 185; 
    if (scorePct === 100) skillIqVal = 285;
    else if (scorePct >= 80) skillIqVal = 230;
    else if (scorePct >= 60) skillIqVal = 175;
    else if (scorePct >= 40) skillIqVal = 120;
    else if (scorePct >= 20) skillIqVal = 65;
    else skillIqVal = 25;
    
    let rating = 'Proficient';
    let ratingClass = 'proficient';
    let strokeColor = '#8338ec'; 
    let percentile = 82;
    let description = '';
    
    if (skillIqVal >= 200) {
        rating = 'Expert';
        ratingClass = 'expert';
        strokeColor = '#00f5d4'; 
        percentile = Math.round(90 + (skillIqVal - 200) / 10);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score demonstrates superior clinical judgment, excellent pharmacology safety management, and rapid priority decision skills. You are highly ready for clinical placement.`;
    } else if (skillIqVal >= 100) {
        rating = 'Proficient';
        ratingClass = 'proficient';
        strokeColor = '#c084fc'; 
        percentile = Math.round(50 + (skillIqVal - 100) * 0.4);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score demonstrates solid foundational competency, ready safe practice skills, and good patient safety management. Focus on pharmacology to reach the Expert level.`;
    } else {
        rating = 'Novice';
        ratingClass = 'novice';
        strokeColor = '#64748b'; 
        percentile = Math.round(10 + skillIqVal * 0.4);
        description = `You scored higher than ${percentile}% of nursing students in Cohort A. This score suggests opportunities for improvement in delegation, critical care, and safety guidelines. We recommend revising the core learning paths before re-assessing.`;
    }
    
    document.getElementById('results-score-num').textContent = skillIqVal;
    
    const pill = document.getElementById('results-rating-pill');
    if (pill) {
        pill.textContent = rating;
        pill.className = `rating-level-pill ${ratingClass}`;
    }
    
    const header = document.getElementById('results-title-header');
    if (header) header.textContent = `Your Skill IQ is ${rating}`;
    
    const desc = document.getElementById('results-percentile-desc');
    if (desc) desc.textContent = description;
    
    const circle = document.getElementById('score-wheel-fill');
    if (circle) {
        circle.style.stroke = strokeColor;
        const circumference = 2 * Math.PI * 50; 
        const offset = circumference * (1 - (skillIqVal / 300));
        circle.style.strokeDashoffset = offset;
    }
    
    const tableBody = document.getElementById('results-subskills-body');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td>Safe Care Environment</td>
                <td class="${scorePct >= 80 ? 'level-high' : 'level-med'}">${scorePct >= 80 ? 'Expert' : 'Proficient'}</td>
            </tr>
            <tr>
                <td>Pharmacological Therapies</td>
                <td class="${scorePct >= 60 ? 'level-med' : 'level-low'}">${scorePct >= 60 ? 'Proficient' : 'Novice'}</td>
            </tr>
            <tr>
                <td>Physiological Adaptation</td>
                <td class="${scorePct >= 100 ? 'level-high' : 'level-med'}">${scorePct >= 100 ? 'Expert' : 'Proficient'}</td>
            </tr>
            <tr>
                <td>Clinical Judgment Speed</td>
                <td class="${assessmentTimeLeft > 30 ? 'level-high' : 'level-med'}">${assessmentTimeLeft > 30 ? 'High' : 'Medium'}</td>
            </tr>
        `;
    }
    
    localStorage.setItem('nursing_skill_iq_score', String(skillIqVal));
    localStorage.setItem('nursing_skill_iq_rating', rating);
    
    const headerScore = document.getElementById('header-nclex-score');
    if (headerScore) headerScore.textContent = skillIqVal;
    
    const dashScore = document.getElementById('dashboard-skill-iq-val');
    if (dashScore) dashScore.textContent = skillIqVal;
    
    updateDashboardProgressBars(skillIqVal);
}

function resetSkillIQAssessment() {
    clearInterval(assessmentTimerInterval);
    document.getElementById('skill-iq-welcome-view').style.display = 'block';
    document.getElementById('skill-iq-active-view').style.display = 'none';
    document.getElementById('skill-iq-results-view').style.display = 'none';
}

function updateDashboardProgressBars(skillIqVal = null) {
    const currentIq = skillIqVal || parseInt(localStorage.getItem('nursing_skill_iq_score') || '185', 10);
    
    const nclexPct = Math.round((currentIq / 300) * 100);
    const nclexLbl = document.getElementById('path-nclex-progress-lbl');
    const nclexFill = document.getElementById('path-nclex-progress-fill');
    if (nclexLbl) nclexLbl.textContent = `${nclexPct}%`;
    if (nclexFill) nclexFill.style.width = `${nclexPct}%`;
    
    let completedCount = 0;
    DEPARTMENTS.forEach((dept) => {
        if (localStorage.getItem(`sim_completed_${dept.id}`) === 'true') {
            completedCount++;
        }
    });
    const rotationsPct = Math.round((completedCount / DEPARTMENTS.length) * 100);
    const rotationsLbl = document.getElementById('path-rotations-progress-lbl');
    const rotationsFill = document.getElementById('path-rotations-progress-fill');
    if (rotationsLbl) rotationsLbl.textContent = `${rotationsPct}%`;
    if (rotationsFill) rotationsFill.style.width = `${rotationsPct}%`;
    
    const pharmPct = 60; 
    const pharmLbl = document.getElementById('path-pharm-progress-lbl');
    const pharmFill = document.getElementById('path-pharm-progress-fill');
    if (pharmLbl) pharmLbl.textContent = `${pharmPct}%`;
    if (pharmFill) pharmFill.style.width = `${pharmPct}%`;
}

