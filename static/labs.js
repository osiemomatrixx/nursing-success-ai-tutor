// Labs.js - Client-Side Interactive Labs & Simulation Logic

let currentSimulationDept = null;
let currentSimulationStep = 0;
let currentSimulationCase = null;
let simulationScore = 0;
let currentHeartRate = 72;

document.addEventListener('DOMContentLoaded', () => {
    // Check if a department was pre-selected from the dashboard
    const preSelectedDept = localStorage.getItem('nursing_selected_simulation_dept');
    
    // Initialize scrolling ECG / SpO2 Patient Monitor
    initVitalMonitors();
    
    // Load department rotations
    if (preSelectedDept) {
        localStorage.removeItem('nursing_selected_simulation_dept');
        loadSimulationDepts(preSelectedDept);
    } else {
        loadSimulationDepts();
    }
    
    bindButtonRipples();
    applyStaggeredReveal('simulation');
});

// SIMULATION ROTATIONS PICKER
function loadSimulationDepts(selectedDeptId = null) {
    const panel = document.getElementById('sim-dept-panel');
    if (!panel) return;
    
    panel.innerHTML = '';
    
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
        const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || '';
        const apiKey = localStorage.getItem('nursing_openai_key') || '';
        
        let url = `/api/simulation/case/${deptId}`;
        const params = new URLSearchParams();
        if (mcpBridgeUrl) params.set('mcp_bridge_url', mcpBridgeUrl);
        if (apiKey) params.set('api_key', apiKey);
        if (params.toString()) url += `?${params.toString()}`;
        
        const res = await fetch(url);
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
    
    document.getElementById('sbar-situation').textContent = currentSimulationCase.sbar.situation || currentSimulationCase.sbar.s;
    document.getElementById('sbar-background').textContent = currentSimulationCase.sbar.background || currentSimulationCase.sbar.b;
    document.getElementById('sbar-assessment').textContent = currentSimulationCase.sbar.assessment || currentSimulationCase.sbar.a;
    document.getElementById('sbar-recommendation').textContent = currentSimulationCase.sbar.recommendation || currentSimulationCase.sbar.r;
    
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
        const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || null;
        const res = await fetch('/api/simulation/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dept: currentSimulationDept,
                step: currentSimulationStep,
                option_index: optIdx,
                mcp_bridge_url: mcpBridgeUrl
            })
        });
        
        if (!res.ok) throw new Error('Action submittal failed');
        const result = await res.json();
        
        simulationScore += result.score;
        alert(`Preceptor Feedback:\n\n${result.feedback}`);
        
        if (result.next === 'complete' || result.next >= currentSimulationCase.steps.length) {
            localStorage.setItem(`sim_completed_${currentSimulationDept}`, 'true');
            growCompetency(currentSimulationDept);
            
            alert(`Case Completed! Total Score for this rotation: ${simulationScore} points.`);
            
            document.getElementById('scenario-text').innerHTML = `<h3>🎉 Clinical Rotation Completed!</h3><p>You have successfully managed the patient in this department. Your clinical competency score has improved!</p>`;
            document.getElementById('decision-box').style.display = 'none';
            document.getElementById('start-sim-container').style.display = 'none';
            
            updateMonitorVitals({ hr: 72, bp: "120/80", spo2: 98, rr: 16 });
            document.getElementById('monitor-alarm').style.display = 'none';
            
            loadSimulationDepts(currentSimulationDept);
        } else {
            currentSimulationStep = result.next;
            renderSimulationStep();
        }
    } catch (err) {
        console.error(err);
        alert('Error processing simulation action.');
    }
}

function growCompetency(deptId) {
    const stored = localStorage.getItem(`competency_${deptId}`);
    let currentVal = stored ? parseInt(stored) : (deptId === 'leadership' ? 35 : deptId === 'pathophysiology' ? 30 : 50);
    
    currentVal = Math.min(100, currentVal + 15);
    localStorage.setItem(`competency_${deptId}`, currentVal);
}

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

// CANVAS VITALS FEED SWEEPER
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
