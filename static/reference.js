// Reference.js - Client-Side Reference Center Logic (100% Dynamic)

document.addEventListener('DOMContentLoaded', () => {
    // Load static lab ranges and drugs list as initial dynamic catalog indices
    loadReferenceLabs();
    
    // Bind drip rate and pump calculators
    calculateIVDrip();
    calculateInfusionRate();

    // Listen to Enter key on search input for custom AI query lookup
    const searchInput = document.getElementById('ref-search');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performCustomAISearch();
            }
        });
    }

    bindButtonRipples();
    applyStaggeredReveal('pharmacology');
});

// DEFAULT CALCULATION UTILITIES
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

// LAB VALUES REFERENCE (LOADS DYNAMICALLY FROM ENDPOINT)
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
            tr.style.cursor = 'pointer';
            tr.onclick = () => selectDynamicReference(lab.name, 'lab');
            tr.innerHTML = `
                <td><strong>🧪 ${lab.name}</strong></td>
                <td>${lab.range}</td>
                <td>${lab.sig} <span style="color:var(--primary); font-size:0.75rem; margin-left:0.5rem;">(Expand &rarr;)</span></td>
            `;
            body.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

// MENU FILTER
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

// DYNAMIC SELECT HANDLER (CALLS BACKEND OPENAI TO POPULATE CONTENT)
async function selectReference(id) {
    const menuItems = document.querySelectorAll('.ref-menu-item');
    menuItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(id) || (id === 'calc' && text.includes('calculator')) || (id === 'val' && text.includes('lab values'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const detailContainer = document.getElementById('ref-detail-container');
    if (!detailContainer) return;

    if (id === 'calc') {
        // Show Dosage Calculator
        detailContainer.innerHTML = `
            <div id="ref-view-calc" class="ref-view-section active">
                <h2 style="color: var(--primary); margin-bottom: 0.5rem;">Clinical Dosage Calculator</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
                    Calculate IV infusion flow rates and medication dosages. Test your answers against standard clinical guidelines.
                </p>

                <div class="med-calc-box">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">IV Drip Rate Calculator (gtt/min)</h3>
                    <div class="calc-input-group">
                        <div class="calc-field">
                            <label>Total Volume (mL)</label>
                            <input type="number" id="calc-vol" value="1000" oninput="calculateIVDrip()">
                        </div>
                        <div class="calc-field">
                            <label>Time (hours)</label>
                            <input type="number" id="calc-time" value="8" oninput="calculateIVDrip()">
                        </div>
                        <div class="calc-field">
                            <label>Drop Factor (gtt/mL)</label>
                            <input type="number" id="calc-factor" value="15" oninput="calculateIVDrip()">
                        </div>
                    </div>
                    <div class="calc-result">
                        <span>Calculated Infusion Rate:</span>
                        <div class="calc-result-value"><span id="calc-drip-rate">31</span> <span style="font-size: 0.9rem; color: var(--text-secondary);">gtt/min</span></div>
                    </div>
                </div>

                <div class="med-calc-box" style="margin-top: 1.5rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Medication Concentration (mL/hr)</h3>
                    <div class="calc-input-group">
                        <div class="calc-field">
                            <label>Order Dose (mg/hr)</label>
                            <input type="number" id="calc-dose" value="2" oninput="calculateInfusionRate()">
                        </div>
                        <div class="calc-field">
                            <label>Total Drug in Bag (mg)</label>
                            <input type="number" id="calc-drug" value="100" oninput="calculateInfusionRate()">
                        </div>
                        <div class="calc-field">
                            <label>Bag Volume (mL)</label>
                            <input type="number" id="calc-bag" value="250" oninput="calculateInfusionRate()">
                        </div>
                    </div>
                    <div class="calc-result">
                        <span>Calculated Infusion Pump Rate:</span>
                        <div class="calc-result-value"><span id="calc-pump-rate">5.0</span> <span style="font-size: 0.9rem; color: var(--text-secondary);">mL/hr</span></div>
                    </div>
                </div>
            </div>
        `;
        calculateIVDrip();
        calculateInfusionRate();
    } else if (id === 'val') {
        // Show Lab Values Table
        detailContainer.innerHTML = `
            <div id="ref-view-val" class="ref-view-section active">
                <h2 style="color: var(--secondary); margin-bottom: 1rem;">High-Yield Lab Values Reference</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
                    Common reference intervals for NCLEX exam preparation. Click on any laboratory test row to dynamically load an in-depth clinical diagnosis profile.
                </p>
                <table class="lab-table" id="labs-table-body">
                    <thead>
                        <tr>
                            <th>Lab Test</th>
                            <th>Normal Reference Range</th>
                            <th>Clinical Significance / Warnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>
        `;
        loadReferenceLabs();
    } else {
        // Query OpenAI backend dynamically for the drug/ABG profile
        const labelText = id === 'digoxin' ? 'Digoxin' : id === 'heparin' ? 'Heparin' : id === 'furosemide' ? 'Furosemide' : 'Arterial Blood Gas';
        const type = id === 'abg' ? 'lab' : 'drug';
        selectDynamicReference(labelText, type);
    }
}

// AI CUSTOM SEARCH TRIGGER
function performCustomAISearch() {
    const query = document.getElementById('ref-search').value.trim();
    if (!query) return;
    selectDynamicReference(query, 'auto');
}

// ASYNC FETCH AND POPULATE DETAILS FROM OPENAI DYNAMICALLY
async function selectDynamicReference(queryTerm, typeHint = 'auto') {
    const detailContainer = document.getElementById('ref-detail-container');
    if (!detailContainer) return;

    detailContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; text-align: center; gap: 1.25rem;">
            <div class="logo-icon" style="animation: pulse 1.2s infinite alternate; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: rgba(0, 187, 249, 0.1); border-radius: 50%;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
            </div>
            <div>
                <h3 style="color: var(--primary); margin-bottom: 0.25rem;">Consulting AI Pharmacist</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Retrieving dynamic clinical monograph and calculation models for "${queryTerm}"...</p>
            </div>
        </div>
    `;

    try {
        const apiKey = localStorage.getItem('nursing_openai_key') || null;
        const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || null;

        const res = await fetch('/api/reference/ai-detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: queryTerm,
                mcp_bridge_url: mcpBridgeUrl,
                api_key: apiKey
            })
        });

        if (!res.ok) throw new Error('AI detail query failed');
        const data = await res.json();

        // Render response dynamically depending on what keys are returned
        if (data.classification || data.mechanism) {
            // RENDER DRUG MONOGRAPH
            detailContainer.innerHTML = `
                <div class="ref-view-section active">
                    <h2 style="color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>💊</span> <span>${data.name || queryTerm}</span>
                    </h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
                        <strong>Classification:</strong> ${data.classification || 'Unclassified Medication'}
                    </p>
                    
                    <div class="med-calc-box">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Mechanism of Action</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.mechanism || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Indications</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.indications || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem; border-color: rgba(239, 68, 68, 0.4);">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #ef4444;">Warnings & Contradictions</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.warnings || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Nursing Considerations</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.nursing_considerations || '-'}</p>
                    </div>

                    ${data.calculation_example ? `
                    <div class="med-calc-box" style="margin-top: 1.5rem; border-color: var(--secondary);">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: var(--secondary);">Clinical Dosage Calculation Walkthrough</h3>
                        <div style="background: rgba(0, 0, 0, 0.35); padding: 1.25rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.88rem; color: #00f5d4; line-height: 1.6; white-space: pre-line; border: 1px solid var(--border-color);">
                            ${data.calculation_example}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        } else {
            // RENDER LAB VALUE INFORMATION
            detailContainer.innerHTML = `
                <div class="ref-view-section active">
                    <h2 style="color: var(--secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🧪</span> <span>${data.name || queryTerm}</span>
                    </h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
                        <strong>Normal Reference Range:</strong> ${data.normal_range || 'N/A'} 
                        ${data.critical_limits ? ` | <strong style="color: #ef4444;">Critical Limits:</strong> ${data.critical_limits}` : ''}
                    </p>
                    
                    <div class="med-calc-box">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Clinical Significance</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.clinical_significance || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Causes of Elevation</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.elevation_causes || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">Causes of Depression</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.depression_causes || '-'}</p>
                    </div>

                    <div class="med-calc-box" style="margin-top: 1rem; border-color: rgba(0, 187, 249, 0.4);">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary);">Nursing Interventions</h3>
                        <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary);">${data.nursing_interventions || '-'}</p>
                    </div>
                </div>
            `;
        }

    } catch (err) {
        console.error(err);
        detailContainer.innerHTML = `
            <div class="ref-view-section active" style="text-align: center; padding: 2rem;">
                <h3 style="color: var(--danger); margin-bottom: 0.5rem;">AI Lookup Failed</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Could not load dynamic profile. Please verify your OpenAI key configurations.</p>
                <button class="btn-outline" onclick="selectReference('calc')" style="margin-top: 1rem; font-size: 0.8rem;">Return to Calculators</button>
            </div>
        `;
    }
}
