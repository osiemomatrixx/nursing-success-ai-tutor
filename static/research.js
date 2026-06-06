// Research.js - Client-Side AI Agentic Research Playground Logic

let researchChart = null;

document.addEventListener('DOMContentLoaded', () => {
    bindButtonRipples();
    applyStaggeredReveal('research');
});

async function runClinicalResearch() {
    const queryEl = document.getElementById('research-query');
    if (!queryEl) return;
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
    const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || null;
    
    try {
        const res = await fetch('/api/research/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                include_trials: includeTrials,
                include_pubmed: includePubmed,
                mcp_bridge_url: mcpBridgeUrl,
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
            } else {
                sourceBadge.textContent = 'OpenAI unavailable';
                sourceBadge.style.borderColor = 'var(--warning)';
                sourceBadge.style.color = 'var(--warning)';
            }
        }
        const workflowEl = document.getElementById('research-workflow');
        if (workflowEl) {
            const steps = Array.isArray(data.workflow_steps) ? data.workflow_steps : [];
            workflowEl.innerHTML = steps.length
                ? `<strong style="color: var(--text-primary);">Agentic workflow:</strong> ${steps.join(' • ')}`
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
            summaryEl.innerHTML = `Retrieved <strong>${trials.length}</strong> active clinical trials and <strong>${articles.length}</strong> medical articles.`;
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
