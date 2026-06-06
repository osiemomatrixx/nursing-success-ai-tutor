// Dashboard.js - Client-Side Dashboard & Path Library Logic

let radarChart = null;
let lineChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Dashboard/Ref Panels
    loadClinicalRotations();
    initCharts();
    bindButtonRipples();
    applyStaggeredReveal('dashboard');
});

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
    localStorage.setItem('nursing_selected_simulation_dept', deptId);
    window.location.href = '/interactive-labs';
}

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
            labels_detail: ['Emergency Room', 'Intensive Care Unit', 'Pediatrics', 'Maternity (L&D)', 'Medical-Surgical', 'Mental Health', 'Leadership & Delegation', 'Pathophysiology'],
            datasets: [{
                label: 'Competency %',
                data: currentCompetencies,
                backgroundColor: 'rgba(0, 245, 212, 0.15)',
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
    if (headerScore) headerScore.textContent = `${avg}%`;
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
