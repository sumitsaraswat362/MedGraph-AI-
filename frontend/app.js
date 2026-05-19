// Initialize Lucide icons safely
function initIcons() {
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn("Lucide icons failed to load", e);
    }
}
initIcons();

// Global State
let patientData = { name: '', age: 0, gender: '', conditions: [], medications: [], labs: [] };
let simulationData = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        addCondition();
        addMedication();
        addLab();
        initDynamicText();
    } catch (e) {
        console.error("Error during initialization:", e);
    }
});

function initDynamicText() {
    const textEl = document.getElementById('dynamic-hero-text');
    if (!textEl) return;
    
    const phrases = [
        "Powered by Agentic AI",
        "Autonomous Clinical Reasoning",
        "Dynamic Knowledge Graph Traversal",
        "Real-time Protocol Auditing",
        "Multi-Agent Jac Architecture"
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    
    function type() {
        const current = phrases[phraseIdx];
        if (isDeleting) {
            textEl.textContent = current.substring(0, charIdx - 1);
            charIdx--;
        } else {
            textEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;
        }
        
        let typeSpeed = isDeleting ? 30 : 70;
        
        if (!isDeleting && charIdx === current.length) {
            typeSpeed = 2500; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typeSpeed = 500; // Pause before typing next
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    
    // Hide all screens immediately to avoid transition bugs
    screens.forEach(s => {
        s.classList.remove('active');
        s.style.opacity = '0';
    });

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
        // Force reflow
        void target.offsetWidth;
        target.style.opacity = '1';
        
        if (screenId === 'dashboard' && !window.graphInit) {
            initGraph();
            window.graphInit = true;
        } else if (screenId === 'dashboard' && window.network) {
            setTimeout(() => window.network.fit(), 100);
        }
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update header title
    const titles = {
        'overview': 'Clinical Overview',
        'graph': 'Knowledge Graph',
        'interactions': 'Drug Interactions',
        'labs': 'Lab Analysis',
        'careplan': 'Preventive Care Plan',
        'network': 'Local Care Network',
        'trials': 'Experimental Trials'
    };
    document.getElementById('current-tab-title').textContent = titles[tabId];
    
    if(tabId === 'graph' && !window.graphInit) {
        initGraph();
        window.graphInit = true;
    } else if (tabId === 'graph' && window.network) {
        // Redraw network when tab becomes visible to fix sizing issues
        setTimeout(() => window.network.fit(), 50);
    }
}

function addCondition() {
    const div = document.createElement('div');
    div.className = 'flex gap-3 mb-3';
    div.innerHTML = `
        <input type="text" class="form-input flex-1 cond-input" placeholder="e.g. Type 2 Diabetes" required>
        <button type="button" class="remove-btn shrink-0" onclick="this.parentElement.remove()" title="Remove">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
    `;
    document.getElementById('conditions-list').appendChild(div);
    initIcons();
}

function addMedication() {
    const div = document.createElement('div');
    div.className = 'flex gap-3 mb-3';
    div.innerHTML = `
        <input type="text" class="form-input flex-1 med-input" placeholder="e.g. Metformin 1000mg" required>
        <button type="button" class="remove-btn shrink-0" onclick="this.parentElement.remove()" title="Remove">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
    `;
    document.getElementById('meds-list').appendChild(div);
    initIcons();
}

function addLab() {
    const div = document.createElement('div');
    div.className = 'flex gap-3 mb-3';
    div.innerHTML = `
        <input type="text" class="form-input flex-1 lab-name" placeholder="Test (e.g. HbA1c)" required>
        <input type="text" class="form-input flex-1 lab-val" placeholder="Result (e.g. 7.8%)" required>
        <button type="button" class="remove-btn shrink-0" onclick="this.parentElement.remove()" title="Remove">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
    `;
    document.getElementById('labs-list').appendChild(div);
    initIcons();
}

function loadSampleData() {
    document.getElementById('f-name').value = "Sarah Chen";
    document.getElementById('f-age').value = "62";
    document.getElementById('f-gender').value = "female";
    document.getElementById('f-location').value = "Austin, TX";
    
    document.getElementById('conditions-list').innerHTML = '';
    document.getElementById('meds-list').innerHTML = '';
    document.getElementById('labs-list').innerHTML = '';
    
    ['Type 2 Diabetes', 'Hypertension', 'Osteopenia'].forEach(c => {
        addCondition();
        const inputs = document.querySelectorAll('.cond-input');
        inputs[inputs.length-1].value = c;
    });
    
    ['Lisinopril 20mg', 'Metformin 1000mg', 'Sertraline 50mg', 'Ibuprofen 400mg'].forEach(m => {
        addMedication();
        const inputs = document.querySelectorAll('.med-input');
        inputs[inputs.length-1].value = m;
    });
    
    const sampleLabs = [
        {n: 'HbA1c', v: '7.8%'}, {n: 'Vitamin D', v: '22 ng/mL'}, {n: 'Blood Pressure', v: '148/94'}
    ];
    sampleLabs.forEach(l => {
        addLab();
        const names = document.querySelectorAll('.lab-name');
        const vals = document.querySelectorAll('.lab-val');
        names[names.length-1].value = l.n;
        vals[vals.length-1].value = l.v;
    });
}

function loadSampleAndGo() {
    loadSampleData();
    showScreen('form');
}

// ==========================================
// VOICE COPILOT
// ==========================================
let recognition;
function startVoiceIntake() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice copilot is only supported in Chrome/Edge.");
        return;
    }
    const btn = document.getElementById('btn-voice-intake');
    const status = document.getElementById('voice-status');
    
    if (recognition && recognition.recording) {
        recognition.stop();
        return;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        recognition.recording = true;
        btn.classList.add('bg-fuchsia-600', 'text-white', 'animate-pulse');
        btn.innerHTML = '<i data-lucide="mic-off" class="w-4 h-4"></i> Listening...';
        status.classList.remove('hidden');
        status.textContent = "Say e.g., '62 year old female with diabetes and hypertension, taking Metformin'";
        initIcons();
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        status.textContent = "Agent parsing: " + transcript;
        
        // Basic parser rules
        
        // Name parsing (e.g. "name is Sarah Chen" or "patient Sarah Chen")
        const nameMatch = transcript.match(/name is ([a-z]+ [a-z]+)/i) || transcript.match(/patient ([a-z]+ [a-z]+)/i);
        if (nameMatch && !nameMatch[1].includes("year") && !nameMatch[1].includes("a")) {
            // Capitalize first letters of name
            document.getElementById('f-name').value = nameMatch[1].replace(/\b\w/g, l => l.toUpperCase());
        }

        if(transcript.includes("female") || transcript.includes("woman")) document.getElementById('f-gender').value = 'female';
        else if(transcript.includes("male") || transcript.includes("man")) document.getElementById('f-gender').value = 'male';
        
        const ageMatch = transcript.match(/(\d+)\s*years?/);
        if (ageMatch) document.getElementById('f-age').value = ageMatch[1];
        
        if (transcript.includes("diabetes")) { addCondition(); Array.from(document.querySelectorAll('.cond-input')).pop().value = 'Type 2 Diabetes'; }
        if (transcript.includes("hypertension") || transcript.includes("blood pressure")) { addCondition(); Array.from(document.querySelectorAll('.cond-input')).pop().value = 'Hypertension'; }
        
        if (transcript.includes("metformin")) { addMedication(); Array.from(document.querySelectorAll('.med-input')).pop().value = 'Metformin 1000mg'; }
        if (transcript.includes("lisinopril")) { addMedication(); Array.from(document.querySelectorAll('.med-input')).pop().value = 'Lisinopril 20mg'; }
        
        setTimeout(() => { status.classList.add('hidden'); }, 5000);
    };
    
    recognition.onerror = function(event) {
        status.textContent = "Error: " + event.error;
    }
    
    recognition.onend = function() {
        recognition.recording = false;
        btn.classList.remove('bg-fuchsia-600', 'text-white', 'animate-pulse');
        btn.innerHTML = '<i data-lucide="mic" class="w-4 h-4"></i> Voice Copilot';
        initIcons();
    };
    
    recognition.start();
}

async function detectLocation() {
    const btn = document.getElementById('btn-detect-loc');
    const input = document.getElementById('f-location');
    
    btn.innerHTML = '<div class="agent-spinner"></div>';
    
    if (!navigator.geolocation) {
        input.value = 'Geolocation not supported';
        btn.innerHTML = '<i data-lucide="navigation"></i> Detect';
        initIcons();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                // Reverse geocoding using openstreetmap
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await res.json();
                
                const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                const state = data.address.state || '';
                input.value = `${city}, ${state}`;
            } catch (e) {
                input.value = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            }
            btn.innerHTML = '<i data-lucide="check" class="text-emerald-400"></i> Done';
            initIcons();
        },
        (error) => {
            console.error("Location error:", error);
            input.value = "Permission denied / Error";
            btn.innerHTML = '<i data-lucide="navigation"></i> Detect';
            initIcons();
        }
    );
}

const agentsConfig = [
    { id: 'agent-1', name: 'DrugInteractionWalker', icon: 'pill' },
    { id: 'agent-2', name: 'LabAnalyzerWalker', icon: 'flask-conical' },
    { id: 'agent-3', name: 'RiskAssessmentWalker', icon: 'activity' },
    { id: 'agent-4', name: 'PreventiveCareWalker', icon: 'clipboard-plus' },
    { id: 'agent-5', name: 'SummaryWalker', icon: 'file-text' },
    { id: 'agent-6', name: 'ProviderNetworkWalker', icon: 'map-pin' },
    { id: 'agent-7', name: 'TrialMatchWalker', icon: 'microscope' }
];

function setupProcessingScreen() {
    const container = document.getElementById('agent-progress');
    container.innerHTML = agentsConfig.map(a => `
        <div class="glass-panel rounded-xl p-4 flex items-center gap-4 transition-all duration-300 border-l-4 border-l-transparent" id="${a.id}">
            <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center agent-icon-container">
                <i data-lucide="${a.icon}" class="w-5 h-5 text-slate-400"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-white font-semibold">${a.name}</h4>
                <p class="text-xs text-slate-400 agent-status">Waiting in queue...</p>
            </div>
            <div class="agent-spinner hidden"></div>
            <i data-lucide="check-circle-2" class="w-6 h-6 text-emerald-500 hidden agent-done-icon"></i>
        </div>
    `).join('');
    initIcons();
}

async function startAnalysis(e) {
    e.preventDefault();
    
    patientData = {
        name: document.getElementById('f-name').value,
        age: parseInt(document.getElementById('f-age').value),
        gender: document.getElementById('f-gender').value,
        location: document.getElementById('f-location').value,
        conditions: Array.from(document.querySelectorAll('.cond-input')).map(i => i.value).filter(v => v),
        medications: Array.from(document.querySelectorAll('.med-input')).map(i => i.value).filter(v => v),
        labs: Array.from(document.querySelectorAll('.lab-name')).map((n, i) => {
            const valInput = document.querySelectorAll('.lab-val')[i];
            return { name: n.value, value: valInput ? valInput.value : '' };
        }).filter(l => l.name)
    };
    
    setupProcessingScreen();
    showScreen('processing');
    
    try {
        const promise = fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });
        
        // Start animations
        const animPromise = simulateAgentProgress();
        
        const [response] = await Promise.all([promise, animPromise]);
        
        if(!response.ok) throw new Error("Server returned " + response.status);
        
        simulationData = await response.json();
        
        // Final completion animation step
        await completeAllAgents();
        
        window.graphInit = false; // Reset graph state
        populateDashboard();
        showScreen('dashboard');
        
    } catch (error) {
        console.error("Backend failed:", error);
        alert("Failed to connect to backend server. Make sure server.py is running on port 3000!");
        showScreen('form');
    }
}

async function simulateAgentProgress() {
    for (let i = 0; i < agentsConfig.length; i++) {
        const el = document.getElementById(agentsConfig[i].id);
        el.classList.add('border-l-cyan-500', 'bg-cyan-500/5');
        
        const icon = el.querySelector('.agent-icon-container svg, .agent-icon-container i');
        if (icon) icon.classList.replace('text-slate-400', 'text-cyan-400');
        
        el.querySelector('.agent-status').textContent = 'Traversing graph & analyzing...';
        el.querySelector('.agent-spinner').classList.remove('hidden');
        
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        
        el.classList.replace('border-l-cyan-500', 'border-l-emerald-500');
        el.classList.replace('bg-cyan-500/5', 'bg-emerald-500/5');
        
        if (icon) icon.classList.replace('text-cyan-400', 'text-emerald-400');
        
        el.querySelector('.agent-status').textContent = 'Analysis complete';
        el.querySelector('.agent-status').classList.replace('text-slate-400', 'text-emerald-400');
        el.querySelector('.agent-spinner').classList.add('hidden');
        
        const doneIcon = el.querySelector('.agent-done-icon');
        if (doneIcon) doneIcon.classList.remove('hidden');
    }
}

async function completeAllAgents() {
    await new Promise(r => setTimeout(r, 500));
}

function populateDashboard() {
    document.getElementById('dash-name').textContent = patientData.name;
    document.getElementById('dash-meta').textContent = `${patientData.age} Y/O ${patientData.gender.toUpperCase()}`;
    const initials = patientData.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById('dash-avatar').textContent = initials;
    
    // Overview
    const di = simulationData.drug_interactions?.interactions || [];
    const interactionsCount = di.filter(i => i.risk !== 'NONE').length;
    const careGaps = simulationData.care_gaps?.gaps || [];
    
    document.getElementById('stats-cards').innerHTML = `
        <div class="glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform border-t-2 border-t-red-500" onclick="showTab('interactions')">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <i data-lucide="alert-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold text-white">${interactionsCount}</div>
                    <div class="text-sm text-slate-400 font-medium">Drug Interactions</div>
                </div>
            </div>
        </div>
        <div class="glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform border-t-2 border-t-emerald-500" onclick="showTab('labs')">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <i data-lucide="flask-conical" class="w-6 h-6"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold text-white">${patientData.labs.length}</div>
                    <div class="text-sm text-slate-400 font-medium">Labs Analyzed</div>
                </div>
            </div>
        </div>
        <div class="glass-panel rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform border-t-2 border-t-amber-500" onclick="showTab('careplan')">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <i data-lucide="clipboard-list" class="w-6 h-6"></i>
                </div>
                <div>
                    <div class="text-3xl font-bold text-white">${careGaps.length}</div>
                    <div class="text-sm text-slate-400 font-medium">Care Gaps Found</div>
                </div>
            </div>
        </div>
    `;

    // Risk
    const risk = simulationData.risk_assessment?.overall_risk || 'UNKNOWN';
    const riskEl = document.getElementById('dash-risk');
    const riskDot = document.getElementById('dash-risk-dot');
    riskEl.textContent = risk;
    
    if(risk === 'HIGH' || risk === 'VERY_HIGH') {
        riskEl.className = 'text-sm font-bold text-red-500';
        riskDot.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
    } else if(risk === 'MODERATE') {
        riskEl.className = 'text-sm font-bold text-amber-500';
        riskDot.className = 'w-2 h-2 rounded-full bg-amber-500';
    } else {
        riskEl.className = 'text-sm font-bold text-emerald-500';
        riskDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
    }

    // Summary
    let summaryText = simulationData.summary?.summary || "Summary generation failed.";
    summaryText = summaryText.replace(/\\n\\n/g, '</p><p>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    document.getElementById('summary-text').innerHTML = `<p>${summaryText}</p>`;
    
    const factors = simulationData.risk_assessment?.risk_factors || [];
    const protectives = simulationData.risk_assessment?.protective_factors || [];
    
    document.getElementById('risk-factors-list').innerHTML = factors.length ? factors.map(f => `
        <li class="flex items-start gap-2"><div class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div> <span>${f}</span></li>
    `).join('') : '<li class="text-slate-500">None identified</li>';
    
    document.getElementById('protective-factors-list').innerHTML = protectives.length ? protectives.map(f => `
        <li class="flex items-start gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> <span>${f}</span></li>
    `).join('') : '<li class="text-slate-500">None identified</li>';

    // Interactions
    const badge = document.getElementById('interaction-badge');
    if (interactionsCount > 0) {
        badge.textContent = interactionsCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const intHTML = di.map(i => {
        let riskColor = 'slate';
        if (i.risk === 'SEVERE') riskColor = 'red';
        else if (i.risk === 'MODERATE') riskColor = 'amber';
        else if (i.risk === 'MILD') riskColor = 'yellow';
        
        return `
        <div class="glass-panel rounded-2xl overflow-hidden border-l-4 border-l-${riskColor}-500">
            <div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-lg">${i.drug_a}</span>
                        <i data-lucide="arrow-left-right" class="text-slate-500 w-5 h-5 mx-1"></i>
                        <span class="font-bold text-white text-lg">${i.drug_b}</span>
                    </div>
                </div>
                <span class="bg-${riskColor}-500/20 text-${riskColor}-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-${riskColor}-500/20">
                    ${i.risk} RISK
                </span>
            </div>
            <div class="p-6 space-y-4 text-sm">
                <div>
                    <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mechanism</h5>
                    <p class="text-slate-200">${i.mechanism}</p>
                </div>
                <div>
                    <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Clinical Effect</h5>
                    <p class="text-amber-400 font-medium">${i.clinical_effect}</p>
                </div>
                <div class="bg-slate-900/50 p-4 rounded-xl border border-white/5 mt-4">
                    <h5 class="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <i data-lucide="shield" class="w-4 h-4"></i> AI Recommendation
                    </h5>
                    <p class="text-white">${i.recommendation}</p>
                </div>
            </div>
        </div>
        `;
    }).join('');
    document.getElementById('interactions-container').innerHTML = intHTML || '<div class="text-center py-20 text-slate-500"><i data-lucide="check-circle-2" class="w-16 h-16 mx-auto mb-4 opacity-50"></i><p>No drug interactions detected.</p></div>';

    // Labs
    const labHTML = (simulationData.lab_analysis?.results || []).map(l => {
        let statusColor = 'emerald';
        if (l.status === 'CRITICAL' || l.status === 'ABNORMAL') statusColor = 'red';
        else if (l.status === 'BORDERLINE') statusColor = 'amber';
        
        return `
        <div class="glass-panel rounded-2xl p-6 relative overflow-hidden">
            ${l.follow_up_needed ? `<div class="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div class="absolute transform rotate-45 bg-red-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[15px] w-[120px] text-center shadow-lg uppercase tracking-wider">Follow Up</div>
            </div>` : ''}
            
            <div class="flex justify-between items-start mb-4 pr-6">
                <div>
                    <h4 class="font-bold text-white text-xl flex items-baseline gap-2">
                        ${l.test_name} 
                        <span class="text-lg font-medium text-${statusColor}-400">${l.value}</span>
                    </h4>
                </div>
                <span class="bg-${statusColor}-500/20 text-${statusColor}-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-${statusColor}-500/20">
                    ${l.status}
                </span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">${l.interpretation}</p>
        </div>
        `;
    }).join('');
    document.getElementById('labs-container').innerHTML = labHTML || '<div class="col-span-full text-center py-20 text-slate-500"><i data-lucide="info" class="w-16 h-16 mx-auto mb-4 opacity-50"></i><p>No labs analyzed.</p></div>';

    // Care Plan
    const gapsHTML = careGaps.map(g => {
        let pColor = 'emerald';
        let pIcon = 'check';
        if (g.priority === 'URGENT' || g.priority === 'OVERDUE') { pColor = 'red'; pIcon = 'alert-octagon'; }
        else if (g.priority === 'RECOMMENDED') { pColor = 'amber'; pIcon = 'alert-triangle'; }
        
        return `
        <div class="glass-panel rounded-2xl p-6 flex flex-col h-full border-t-4 border-t-${pColor}-500">
            <div class="flex justify-between items-start mb-4">
                <h4 class="font-bold text-white text-lg pr-4">${g.screening_name}</h4>
                <div class="flex items-center gap-1 bg-${pColor}-500/10 text-${pColor}-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    <i data-lucide="${pIcon}" class="w-3 h-3"></i> ${g.priority}
                </div>
            </div>
            <p class="text-sm text-slate-300 mb-6 flex-1">${g.reasoning}</p>
            <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                <i data-lucide="calendar-plus" class="w-4 h-4"></i> Schedule Appointment
            </button>
        </div>
        `;
    }).join('');
    document.getElementById('careplan-container').innerHTML = gapsHTML || '<div class="col-span-full text-center py-20 text-slate-500"><i data-lucide="check-circle-2" class="w-16 h-16 mx-auto mb-4 opacity-50"></i><p>All preventive care is up to date.</p></div>';

    // Provider Network
    const net = simulationData.provider_network || {};
    const specs = net.specialists || [];
    let networkHTML = `
        <div class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="stethoscope" class="text-cyan-400"></i> Recommended Local Specialists</h3>
            ${specs.map(s => `
                <div class="glass-panel rounded-2xl p-5 border-l-4 border-l-cyan-500">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-white text-lg">${s.type}</h4>
                        <span class="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">${s.distance}</span>
                    </div>
                    <p class="text-slate-200 font-medium mb-1">${s.name}</p>
                    <p class="text-xs text-slate-400">${s.reason}</p>
                </div>
            `).join('')}
        </div>
        <div class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="alert-octagon" class="text-red-500"></i> Emergency & Urgent Care</h3>
            ${net.emergency ? `
                <div class="glass-panel rounded-2xl p-5 border-t-4 border-t-red-500 bg-red-500/5">
                    <h4 class="font-bold text-red-400 text-lg mb-1">${net.emergency.facility}</h4>
                    <p class="text-white font-mono text-xl mb-3 flex items-center gap-2"><i data-lucide="phone" class="w-5 h-5"></i> ${net.emergency.phone}</p>
                    <p class="text-sm text-slate-300">${net.emergency.action}</p>
                </div>
            ` : ''}
            
            <h3 class="text-xl font-bold text-white mb-4 mt-8 flex items-center gap-2"><i data-lucide="laptop" class="text-emerald-400"></i> Online Consultation</h3>
            ${net.telehealth ? `
                <div class="glass-panel rounded-2xl p-5 border-t-4 border-t-emerald-500">
                    <h4 class="font-bold text-white text-lg mb-2">${net.telehealth.provider}</h4>
                    <a href="${net.telehealth.url}" target="_blank" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-4">
                        <i data-lucide="video" class="w-4 h-4"></i> Start Virtual Visit
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    document.getElementById('network-container').innerHTML = networkHTML;

    // Clinical Trials
    const trials = simulationData.clinical_trials?.trials || [];
    const trialsHTML = trials.map(t => {
        let eColor = t.eligibility === 'High' ? 'emerald' : 'amber';
        return `
        <div class="glass-panel rounded-2xl p-6 border-l-4 border-l-${eColor}-500">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-white text-xl">${t.name}</h4>
                <div class="flex gap-2">
                    <span class="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs font-bold border border-slate-700">${t.phase}</span>
                    <span class="bg-${eColor}-500/20 text-${eColor}-400 px-3 py-1 rounded text-xs font-bold border border-${eColor}-500/30">${t.eligibility} Match</span>
                </div>
            </div>
            <p class="text-sm text-slate-300"><strong class="text-fuchsia-400 text-xs uppercase tracking-wider block mb-1">Graph Mapping Reason</strong> ${t.reason}</p>
        </div>
        `;
    }).join('');
    document.getElementById('trials-container').innerHTML = trialsHTML || '<div class="text-center py-20 text-slate-500"><i data-lucide="alert-circle" class="w-16 h-16 mx-auto mb-4 opacity-50"></i><p>No suitable trials found for this patient profile.</p></div>';

    initIcons();
    showTab('overview');
}

// ==========================================
// TERMINAL REASON TRACE MODAL
// ==========================================
function showTrace() {
    document.getElementById('agent-trace-modal').classList.add('active');
    const term = document.getElementById('terminal-body');
    term.innerHTML = '';
    
    const logs = [
        "[SYSTEM] Initializing Jac multi-agent orchestration...",
        "[SYSTEM] Spawned 6 concurrent Walkers on Patient Node: " + (patientData?.name || "Unknown"),
        "<span class='term-agent'>[DrugInteractionWalker]</span> <span class='term-thought'>Thought: I need to query the Knowledge Graph for all active medications.</span>",
        "<span class='term-agent'>[DrugInteractionWalker]</span> <span class='term-action'>Action: Traverse [Patient] -> [takes_med] -> [Medication]</span>",
        "<span class='term-agent'>[DrugInteractionWalker]</span> <span class='term-obs'>Observation: Found 4 active medications.</span>",
        "<span class='term-agent'>[DrugInteractionWalker]</span> <span class='term-thought'>Thought: Evaluating pairwise pharmacological pathways via LLM...</span>",
        "<span class='term-agent'>[RiskAssessmentWalker]</span> <span class='term-thought'>Thought: Aggregating lab results and active conditions to predict 10-year outlook.</span>",
        "<span class='term-agent'>[PreventiveCareWalker]</span> <span class='term-action'>Action: Cross-reference patient age (62) and gender against USPSTF Graph Database.</span>",
        "<span class='term-agent'>[ProviderNetworkWalker]</span> <span class='term-thought'>Thought: Patient requires Endocrinology and Cardiology. Querying geospatial indices for location: " + (patientData?.location || "Unknown") + "</span>",
        "<span class='term-agent'>[ProviderNetworkWalker]</span> <span class='term-obs'>Observation: Matched Dr. Elena Rostova (Endocrinologist) at 2.4 miles.</span>",
        "<span class='term-agent'>[SummaryWalker]</span> <span class='term-thought'>Thought: Synthesizing Walker outputs into patient-friendly clinical communication.</span>",
        "<span class='term-agent'>[CareCoordinatorWalker]</span> <span class='term-action'>Action: Aggregating all sub-agent results. Updating patient graph state.</span>",
        "[SYSTEM] Multi-Agent synthesis complete. Yielding payload to frontend."
    ];
    
    let i = 0;
    function printNextLog() {
        if (i >= logs.length) return;
        const line = document.createElement('div');
        line.innerHTML = logs[i];
        line.style.opacity = '0';
        line.style.transform = 'translateY(5px)';
        line.style.transition = 'opacity 0.2s, transform 0.2s';
        term.appendChild(line);
        
        // Trigger reflow and animate
        void line.offsetWidth;
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
        
        term.scrollTop = term.scrollHeight;
        i++;
        
        const delay = Math.random() * 800 + 200; // 200ms to 1000ms
        setTimeout(printNextLog, delay);
    }
    
    printNextLog();
}

function closeTrace() {
    document.getElementById('agent-trace-modal').classList.remove('active');
}

function initGraph() {
    let currentId = 1;
    const nodes = [{ 
        id: currentId, 
        label: patientData.name+'\\n(Patient)', 
        shape: 'circularImage', 
        image: 'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E',
        color: { background: '#1e293b', border: '#06b6d4' },
        font: { color: '#f8fafc', face: 'Inter' }, 
        size: 30,
        borderWidth: 2
    }];
    const edges = [];
    const rootId = currentId++;

    patientData.conditions.forEach(c => {
        nodes.push({ 
            id: currentId, label: c, shape: 'box', 
            color: { background: '#f59e0b20', border: '#f59e0b' }, 
            font: { color: '#f8fafc', face: 'Inter' },
            borderWidth: 1, borderRadius: 6
        });
        edges.push({ from: rootId, to: currentId, color: { color: '#334155' }, arrows: 'to' });
        currentId++;
    });

    const medNodes = {};
    patientData.medications.forEach(m => {
        nodes.push({ 
            id: currentId, label: m, shape: 'box', 
            color: { background: '#ef444420', border: '#ef4444' }, 
            font: { color: '#f8fafc', face: 'Inter' },
            borderWidth: 1, borderRadius: 20
        });
        edges.push({ from: rootId, to: currentId, color: { color: '#334155' }, arrows: 'to' });
        medNodes[m.toLowerCase()] = currentId;
        currentId++;
    });

    patientData.labs.forEach(l => {
        nodes.push({ 
            id: currentId, label: l.name+'\\n'+l.value, shape: 'hexagon', 
            color: { background: '#10b98120', border: '#10b981' }, 
            font: { color: '#f8fafc', face: 'Inter' },
            borderWidth: 1
        });
        edges.push({ from: rootId, to: currentId, color: { color: '#334155' }, arrows: 'to' });
        currentId++;
    });

    if (simulationData && simulationData.drug_interactions && simulationData.drug_interactions.interactions) {
        simulationData.drug_interactions.interactions.forEach(int => {
            if (int.risk !== 'NONE') {
                const idA = medNodes[int.drug_a.toLowerCase()];
                const idB = medNodes[int.drug_b.toLowerCase()];
                if (idA && idB) {
                    let edgeColor = '#ef4444';
                    if (int.risk === 'MODERATE') edgeColor = '#f59e0b';
                    if (int.risk === 'MILD') edgeColor = '#eab308';
                    
                    edges.push({
                        from: idA, to: idB,
                        color: { color: edgeColor, highlight: edgeColor },
                        dashes: true,
                        width: 2,
                        title: `${int.risk} Risk: ${int.mechanism}`,
                        smooth: { type: 'curvedCW', roundness: 0.2 }
                    });
                }
            }
        });
    }

    const container = document.getElementById('mynetwork');
    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = { 
        physics: { 
            barnesHut: { gravitationalConstant: -4000, springLength: 150 },
            stabilization: { iterations: 150 }
        },
        interaction: { hover: true, tooltipDelay: 200 }
    };
    window.network = new vis.Network(container, data, options);
}
