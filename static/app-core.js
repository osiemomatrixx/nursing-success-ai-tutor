// App-Core.js - Shared Nursing Success AI Tutor Core Logic
// Manages sessions, clocks, shared modals, and the context-aware floating AI Mentor drawer

let isPremium = true; // Premium features unlocked
let selectedPlan = localStorage.getItem('nursing_selected_plan') || 'weekly';
let drawerChatHistory = [];

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
    // 1. Session check & redirect
    const loggedIn = localStorage.getItem('nursing_user_logged_in') === 'true';
    const onLogin = window.location.pathname === '/login' || window.location.pathname.endsWith('/login.html');
    
    if (!loggedIn && !onLogin) {
        window.location.href = '/login';
        return;
    }

    // 2. Inject Shared Modals & Floating Drawer Q&A
    if (!onLogin) {
        injectSharedModals();
        injectFloatingMentorDrawer();
        updateUserProfile();
        updateSubscriptionUI();
        initMobileSidebar();
        initHeaderClock();
        updateOpenAIStatus();
        document.body.classList.add('loaded');
    }
});

// INJECT MODALS DYNAMICALLY
function injectSharedModals() {
    if (document.getElementById('settings-modal')) return;

    // Settings Modal
    const settingsDiv = document.createElement('div');
    settingsDiv.id = 'settings-modal';
    settingsDiv.className = 'modal-overlay';
    settingsDiv.style.display = 'none';
    settingsDiv.innerHTML = `
        <div class="modal-card glass-card" style="max-width: 450px;">
            <button class="modal-close" onclick="closeSettingsModal()">×</button>
            <h2 style="color: var(--secondary); margin-bottom: 0.5rem;">AI Settings</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.85rem;">
                Configure your OpenAI API Key to connect Nurse Preceptor Sarah to the live GPT model.
            </p>
            <p id="openai-status-text" style="margin-bottom: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                Checking OpenAI connection status...
            </p>
            <div class="form-group">
                <label>OpenAI API Key</label>
                <input type="password" id="openai-key-input" placeholder="sk-proj-..." style="background: rgba(18, 26, 44, 0.4); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; width: 100%; color: white;">
            </div>
            <div class="form-group" style="margin-top: 0.75rem;">
                <label>MCP Bridge URL</label>
                <input type="text" id="mcp-bridge-input" placeholder="https://your-mcp-bridge.example/context" style="background: rgba(18, 26, 44, 0.4); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; width: 100%; color: white;">
            </div>
            <p id="mcp-status-text" style="margin-top: 0.5rem; margin-bottom: 0.25rem; font-size: 0.8rem; color: var(--text-secondary);">
                MCP bridge not configured.
            </p>
            <button class="btn-primary" onclick="saveSettings()" style="width: 100%; margin-top: 1.5rem;">Save Settings</button>
        </div>
    `;
    document.body.appendChild(settingsDiv);

    // Subscription Modal
    const subDiv = document.createElement('div');
    subDiv.id = 'subscription-modal';
    subDiv.className = 'modal-overlay';
    subDiv.style.display = 'none';
    subDiv.innerHTML = `
        <div class="modal-card glass-card">
            <button class="modal-close" onclick="closeSubscriptionModal()">×</button>
            <h2 style="color: var(--primary); text-align: center; margin-bottom: 0.5rem; font-size: 1.75rem;">Unlock Premium AI Tutor</h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
                Get access to advanced clinical rotations, detailed pathophysiology cases, and the comprehensive NCLEX mock exam engine.
            </p>
            
            <div class="plans-grid">
                <div class="plan-card active" onclick="selectPlan('weekly')">
                    <span class="plan-badge">Popular</span>
                    <h3>Weekly Plan</h3>
                    <div class="plan-price">$7 <span>/ week</span></div>
                    <p>Perfect for quick study sprints before your NCLEX exam date.</p>
                </div>
                <div class="plan-card" onclick="selectPlan('monthly')">
                    <h3>Monthly Plan</h3>
                    <div class="plan-price">$7 <span>/ month</span></div>
                    <p>Best value. Continuous learning across all 8 major departments.</p>
                </div>
            </div>
            <p id="selected-plan-summary" class="selected-plan-summary">You selected Weekly Plan. Start now for $7 and cancel anytime.</p>

            <div class="payment-form" style="margin-top: 2rem;">
                <h4 style="margin-bottom: 1rem; font-size: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Simulated Secure Checkout</h4>
                <div class="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" value="Student Nurse" disabled>
                </div>
                <div class="form-group" style="margin-top: 0.75rem;">
                    <label>Card Number</label>
                    <input type="text" placeholder="4242 •••• •••• 4242" value="4242 4242 4242 4242" disabled>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.75rem;">
                    <div class="form-group">
                        <label>Expiration Date</label>
                        <input type="text" value="12/28" disabled>
                    </div>
                    <div class="form-group">
                        <label>CVC</label>
                        <input type="text" value="***" disabled>
                    </div>
                </div>
                <button class="btn-primary" id="payment-button-text" onclick="simulatePayment()" style="width: 100%; margin-top: 1.5rem; padding: 1rem;">
                    Pay $7 and Activate Premium
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(subDiv);

    // Bind settings button click
    const settingsBtn = document.getElementById('sidebar-settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }
}

// INJECT AI MENTOR DRAWER DYNAMICALLY
function injectFloatingMentorDrawer() {
    if (document.getElementById('floating-mentor-trigger')) return;

    // Trigger Button
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'floating-mentor-trigger';
    triggerBtn.className = 'floating-mentor-trigger';
    triggerBtn.title = 'Open AI Mentor Sarah';
    triggerBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <div class="pulse-ring"></div>
    `;
    document.body.appendChild(triggerBtn);

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'mentor-drawer-backdrop';
    backdrop.className = 'mentor-drawer-backdrop';
    document.body.appendChild(backdrop);

    // Slide-out Drawer
    const drawer = document.createElement('div');
    drawer.id = 'mentor-drawer';
    drawer.className = 'mentor-drawer';
    drawer.innerHTML = `
        <div class="mentor-drawer-header">
            <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                AI Mentor Preceptor
            </h3>
            <button class="mentor-drawer-close" id="mentor-drawer-close">&times;</button>
        </div>
        <div class="mentor-drawer-body">
            <div class="drawer-context-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span id="drawer-context-text">Auto-tracking page details...</span>
            </div>
            <div class="mentor-drawer-messages" id="mentor-drawer-messages">
                <div class="message-bubble preceptor" style="display: flex; gap: 0.75rem; max-width: 90%;">
                    <img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah" style="width: 32px; height: 32px;">
                    <div class="message-content-wrapper">
                        <span class="message-sender" style="font-size: 0.7rem;">Preceptor Sarah, RN</span>
                        <div class="message-text" style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
                            Hi! I am tracking your active view. Ask me any nursing, pharmacology, or NCLEX questions about the current page content.
                        </div>
                    </div>
                </div>
            </div>
            <div class="mentor-drawer-input-area">
                <input type="text" class="mentor-drawer-input" id="mentor-drawer-input" placeholder="Ask Preceptor Sarah...">
                <button class="mentor-drawer-send" id="mentor-drawer-send">
                    <svg viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(drawer);

    // Event listeners
    triggerBtn.addEventListener('click', toggleMentorDrawer);
    backdrop.addEventListener('click', toggleMentorDrawer);
    document.getElementById('mentor-drawer-close').addEventListener('click', toggleMentorDrawer);
    document.getElementById('mentor-drawer-send').addEventListener('click', sendDrawerMessage);
    document.getElementById('mentor-drawer-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendDrawerMessage();
    });
}

function toggleMentorDrawer() {
    const drawer = document.getElementById('mentor-drawer');
    const backdrop = document.getElementById('mentor-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const isOpen = drawer.classList.toggle('open');
    if (isOpen) {
        backdrop.classList.add('active');
        updateDrawerContextUI();
    } else {
        backdrop.classList.remove('active');
    }
}

// CAPTURING CONTEXT DETAILS
function getPageSpecificContext() {
    const path = window.location.pathname;
    let contextStr = `Current View Path: ${path}\n`;

    if (path.includes('labs') || path.includes('interactive-labs')) {
        const title = document.getElementById('scenario-title')?.textContent || 'None';
        const situation = document.getElementById('sbar-situation')?.textContent || 'None';
        const background = document.getElementById('sbar-background')?.textContent || 'None';
        const assessment = document.getElementById('sbar-assessment')?.textContent || 'None';
        const recommendation = document.getElementById('sbar-recommendation')?.textContent || 'None';
        
        const hr = document.getElementById('vital-hr')?.textContent || '--';
        const bp = document.getElementById('vital-bp')?.textContent || '--/--';
        const spo2 = document.getElementById('vital-spo2')?.textContent || '--';
        
        contextStr += `Active Rotation Case: ${title}\nSBAR:\n- Situation: ${situation}\n- Background: ${background}\n- Assessment: ${assessment}\n- Recommendation: ${recommendation}\nPatient Vitals Readout: Heart Rate: ${hr} bpm, Blood Pressure: ${bp}, SpO2: ${spo2}%\n`;
    } else if (path.includes('skill-iq')) {
        const cat = document.getElementById('assessment-q-category')?.textContent || 'None';
        const text = document.getElementById('assessment-q-text')?.textContent || 'None';
        const idx = document.getElementById('assessment-q-index')?.textContent || 'None';
        contextStr += `Adaptive Assessment State: Category: ${cat}, Index: ${idx}, Question text: "${text}"\n`;
    } else if (path.includes('reference')) {
        const activeItem = document.querySelector('.ref-menu-item.active')?.textContent || 'Dosage Calculator';
        contextStr += `Selected Reference Catalog Item: ${activeItem}\n`;
        if (activeItem.includes('Calculator')) {
            const vol = document.getElementById('calc-vol')?.value || '';
            const time = document.getElementById('calc-time')?.value || '';
            const factor = document.getElementById('calc-factor')?.value || '';
            contextStr += `IV drip rates: Total Volume ${vol} mL, Time ${time} hours, Drop Factor ${factor} gtt/mL\n`;
        }
    } else if (path.includes('research')) {
        const query = document.getElementById('research-query')?.value || '';
        contextStr += `Active Research playground query: "${query}"\n`;
    } else if (path.includes('dashboard')) {
        const score = document.getElementById('dashboard-skill-iq-val')?.textContent || '185';
        const completed = document.getElementById('stats-sim-count')?.textContent || '4';
        contextStr += `Dashboard metrics: Skill IQ score ${score}, completed clinical rotations ${completed}/8\n`;
    }

    return contextStr;
}

function updateDrawerContextUI() {
    const textEl = document.getElementById('drawer-context-text');
    if (!textEl) return;

    const path = window.location.pathname;
    let label = 'General Overview';
    if (path.includes('labs') || path.includes('interactive-labs')) {
        const caseTitle = document.getElementById('scenario-title')?.textContent;
        label = caseTitle && !caseTitle.includes('Case Study') ? `Case: ${caseTitle.split(':')[0]}` : 'Interactive Labs';
    } else if (path.includes('skill-iq')) {
        label = 'Skill IQ Assessment';
    } else if (path.includes('reference')) {
        const activeItem = document.querySelector('.ref-menu-item.active')?.textContent || 'Dosage Calculator';
        label = `Ref: ${activeItem.replace(/[^\w\s-]/g, '').trim()}`;
    } else if (path.includes('research')) {
        label = 'Research Playground';
    } else if (path.includes('dashboard')) {
        label = 'Dashboard Overview';
    }
    textEl.textContent = `Context: ${label}`;
}

// SEND MESSAGE FROM DRAWER
async function sendDrawerMessage() {
    const input = document.getElementById('mentor-drawer-input');
    const msgText = input.value.trim();
    if (!msgText) return;

    input.value = '';
    appendDrawerChatMessage('user', 'Student Nurse', msgText);
    drawerChatHistory.push({ role: 'user', content: msgText });

    const typingId = appendDrawerTypingBubble();
    const apiKey = localStorage.getItem('nursing_openai_key') || null;
    const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || null;
    const activeContext = getPageSpecificContext();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msgText,
                history: drawerChatHistory,
                context: activeContext,
                mcp_bridge_url: mcpBridgeUrl,
                api_key: apiKey
            })
        });

        removeDrawerTypingBubble(typingId);

        if (!res.ok) throw new Error('API chat response failed');
        const data = await res.json();

        appendDrawerChatMessage('preceptor', 'Preceptor Sarah, RN', data.response, data.source || 'openai');
        drawerChatHistory.push({ role: 'assistant', content: data.response });

    } catch (err) {
        console.error(err);
        removeDrawerTypingBubble(typingId);
        appendDrawerChatMessage('preceptor', 'Preceptor Sarah, RN', `Connection error: ${err.message}. Configure API key or server parameters.`, 'error');
    }
}

function appendDrawerChatMessage(senderType, senderName, text, sourceLabel = null) {
    const chatBox = document.getElementById('mentor-drawer-messages');
    if (!chatBox) return;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${senderType === 'user' ? 'user' : 'preceptor'}`;
    bubble.style.display = 'flex';
    bubble.style.gap = '0.75rem';
    bubble.style.maxWidth = '90%';
    if (senderType === 'user') {
        bubble.style.alignSelf = 'flex-end';
        bubble.style.flexDirection = 'row-reverse';
    }

    const avatar = senderType === 'user' ?
        `<div class="message-avatar" style="width:32px; height:32px; border-radius:50%; font-size:0.75rem;">SN</div>` :
        `<img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah" style="width: 32px; height: 32px;">`;

    const formattedText = formatChatMessageText(text);

    bubble.innerHTML = `
        ${avatar}
        <div class="message-content-wrapper">
            <span class="message-sender" style="font-size: 0.7rem;">${senderName}</span>
            <div class="message-text" style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">${formattedText}</div>
            ${sourceLabel ? `<span class="message-source" style="font-size:0.65rem;">Source: ${sourceLabel === 'openai' ? 'OpenAI' : 'OpenAI unavailable'}</span>` : ''}
        </div>
    `;

    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendDrawerTypingBubble() {
    const chatBox = document.getElementById('mentor-drawer-messages');
    if (!chatBox) return null;

    const typingId = 'drawer-typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble preceptor typing-bubble';
    bubble.id = typingId;
    bubble.style.display = 'flex';
    bubble.style.gap = '0.75rem';
    bubble.style.maxWidth = '90%';

    bubble.innerHTML = `
        <img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah" style="width: 32px; height: 32px;">
        <div class="message-content-wrapper">
            <span class="message-sender" style="font-size: 0.7rem;">Preceptor Sarah, RN</span>
            <div class="message-text" style="font-size: 0.85rem; padding: 0.65rem 0.85rem;">
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

function removeDrawerTypingBubble(id) {
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

// USER AND INTERACTION HELPERS
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
    const onDashboard = window.location.pathname.includes('dashboard') || window.location.pathname.endsWith('dashboard.html');
    if (pageSubtitle && onDashboard) {
        pageSubtitle.textContent = `Welcome back, ${storedName}. Active Course: ${storedCourse}.`;
    }
}

function updateSubscriptionUI() {
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
    const modal = document.getElementById('subscription-modal');
    if (modal) modal.style.display = 'flex';
}

function closeSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    if (modal) modal.style.display = 'none';
}

function selectPlan(plan) {
    selectedPlan = plan;
    localStorage.setItem('nursing_selected_plan', selectedPlan);

    const cards = document.querySelectorAll('.plan-card');
    if (cards.length >= 2) {
        cards.forEach(card => card.classList.remove('active'));
        if (plan === 'weekly') {
            cards[0].classList.add('active');
        } else {
            cards[1].classList.add('active');
        }
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
    isPremium = true;
    closeSubscriptionModal();
    updateSubscriptionUI();
    alert('Thank you! Premium Access Activated. Enjoy 8 full clinical rotations and the comprehensive NCLEX mock exam engine!');
    // Reload rotations if loaded
    if (typeof loadClinicalRotations === 'function') {
        loadClinicalRotations();
    }
}

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
    alert('Settings saved. OpenAI API Key & MCP URL updated successfully.');
    updateOpenAIStatus();
}

async function updateOpenAIStatus() {
    const statusEl = document.getElementById('openai-status-text');
    if (!statusEl) return;

    try {
        const res = await fetch('/api/ai/status');
        if (!res.ok) throw new Error('status unavailable');
        const data = await res.json();
        if (data.configured) {
            statusEl.textContent = `OpenAI connected with ${data.model}. Chat and research use the live model when configured.`;
            statusEl.style.color = 'var(--success)';
        } else {
            statusEl.textContent = `OpenAI not configured. Chat and research use local demo fallback.`;
            statusEl.style.color = 'var(--warning)';
        }

        const mcpStatusEl = document.getElementById('mcp-status-text');
        if (mcpStatusEl) {
            const localMcpBridge = localStorage.getItem('nursing_mcp_bridge_url') || '';
            if (data.mcp_configured || localMcpBridge) {
                mcpStatusEl.textContent = `MCP bridge ready${localMcpBridge ? `: ${localMcpBridge}` : ''}. Notes and actions synced.`;
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

// MOBILE SIDEBAR TOGGLE
function initMobileSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!toggle || !sidebar) return;

    toggle.onclick = () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active');
    };

    if (backdrop) {
        backdrop.onclick = () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        };
    }
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

function applyStaggeredReveal(tabContainerId) {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = document.getElementById(tabContainerId);
    if (!container) return;

    const targets = container.querySelectorAll('.glass-card, .question-card, .simulator-layout, .reference-layout, .chat-layout');
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
