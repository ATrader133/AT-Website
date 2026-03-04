console.log("ABRAR TRADERS: Enterprise Engine Booting v10.0 (Clean Architecture)");

// ==========================================
// 1. GLOBAL STATE & NOTIFICATIONS
// ==========================================
let basket = [];
let currentUnit = 'cm';
let chatHistory = [{ role: "system", content: "You are the Abrar Traders AI Assistant. You are an expert in paper packaging, GSM, Burst Factor, Kraft paper, Duplex Board, and logistics. Be helpful, professional, and concise." }];
let quizState = { use: '', weight: '' };

try {
    const stored = localStorage.getItem('at_basket');
    if (stored) basket = JSON.parse(stored);
} catch (e) { console.error("Storage Error:", e); }

window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `<span style="margin-right:8px">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

// ==========================================
// 2. GLOBAL UI FUNCTIONS
// ==========================================

// --- AI CHATBOT LOGIC ---
window.toggleChat = () => {
    const chat = document.getElementById('aiChatWindow');
    if(!chat) return;
    if(chat.classList.contains('opacity-0')) {
        chat.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        if (window.innerWidth > 768) document.getElementById('chatInput')?.focus();
    } else {
        chat.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    }
};

window.clearChatHistory = () => {
    chatHistory = [chatHistory[0]]; 
    const log = document.getElementById('chatLog');
    if(log) log.innerHTML = `<div class="bg-blue-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] border border-blue-100 dark:border-slate-700 shadow-sm">Hi! I'm your packaging engineering assistant. Tell me what you are trying to pack, and I'll calculate the exact paper grade and GSM you need.</div>`;
    window.showToast("Chat history cleared.", "success");
};

window.handleChatEnter = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendChatMessage(); } 
};

window.openProductByName = (productName) => {
    const cards = document.querySelectorAll('.product-item');
    for (let card of cards) {
        if (card.dataset.name === productName) { window.toggleChat(); window.openProductModal(card); return; }
    }
};

window.sendChatMessage = async () => {
    const input = document.getElementById('chatInput');
    const sendBtn = input.nextElementSibling; 
    const msg = input.value.trim();
    if(!msg) return;
    
    const log = document.getElementById('chatLog');
    input.disabled = true; sendBtn.disabled = true; input.classList.add('opacity-50', 'cursor-not-allowed'); sendBtn.classList.add('opacity-50', 'cursor-not-allowed');

    log.innerHTML += `<div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-md transform transition-all animate-slide-up">${msg}</div>`;
    input.value = ''; input.style.height = 'auto'; log.scrollTop = log.scrollHeight;
    chatHistory.push({ role: "user", content: msg });

    const typingId = 'typing-' + Date.now();
    log.innerHTML += `
        <div id="${typingId}" class="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] flex items-center gap-2 animate-pulse">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span><span class="w-2 h-2 bg-blue-500 rounded-full" style="animation-delay: 0.2s"></span><span class="w-2 h-2 bg-blue-600 rounded-full" style="animation-delay: 0.4s"></span>
        </div>`;
    log.scrollTop = log.scrollHeight;

    const formattedHistory = chatHistory.filter(msg => msg.role !== "system").map(msg => ({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] }));
    const systemInstruction = chatHistory.find(msg => msg.role === "system").content;

    try {
        const response = await fetch('/.netlify/functions/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: systemInstruction, contents: formattedHistory }) });
        const textResponse = await response.text();
        let data; try { data = JSON.parse(textResponse); } catch (e) { throw new Error("Invalid backend response. Ensure site is deployed on Netlify."); }
        
        document.getElementById(typingId)?.remove();
        if (data.error) throw new Error(data.error);

        const aiResponse = data.reply || "I encountered an unexpected format. Please try again.";
        let formattedHTMLResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>').replace(/\n/g, '<br>');
        
        const productKeywords = [ { key: /Kraft Paper/gi, id: "Kraft Paper" }, { key: /Duplex Board/gi, id: "Duplex Paper, Duplex Board" }, { key: /SBS/gi, id: "SBS (Solid Bleached Sulfate)" }, { key: /FBB/gi, id: "FBB (Folding Box Board)" } ];
        productKeywords.forEach(prod => { formattedHTMLResponse = formattedHTMLResponse.replace(prod.key, `<a href="javascript:void(0)" onclick="openProductByName('${prod.id}')" class="text-blue-600 dark:text-blue-400 font-bold underline decoration-blue-300 hover:text-blue-800 transition-colors">$&</a>`); });

        const actionHtml = `<div class="mt-4 flex gap-2 border-t border-blue-200/50 dark:border-slate-700 pt-3"><a href="#quote" onclick="toggleChat()" class="text-xs bg-white dark:bg-slate-700 text-blue-600 dark:text-white px-3 py-1.5 rounded-md font-bold shadow-sm border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition">Get a Quote</a><a href="#calculator" onclick="toggleChat(); window.switchTab('weight');" class="text-xs bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-md font-bold shadow-sm border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition">Calculate Weight</a></div>`;
        log.innerHTML += `<div class="bg-blue-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] border border-blue-100 dark:border-slate-700 shadow-sm animate-fade-in">${formattedHTMLResponse}${actionHtml}</div>`;
        chatHistory.push({ role: "assistant", content: aiResponse });
    } catch (error) {
        document.getElementById(typingId)?.remove();
        log.innerHTML += `<div class="bg-red-50 text-red-600 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] text-xs border border-red-200 shadow-sm">Connection error: ${error.message}</div>`;
        chatHistory.pop(); 
    } finally {
        input.disabled = false; sendBtn.disabled = false; input.classList.remove('opacity-50', 'cursor-not-allowed'); sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        log.scrollTop = log.scrollHeight; if (window.innerWidth > 768) input.focus();
    }
};

// --- QUOTE BASKET LOGIC ---
window.updateBasketUI = function() {
    localStorage.setItem('at_basket', JSON.stringify(basket));
    const countEl = document.getElementById('basketCount');
    const basketBtn = document.getElementById('quoteBasket');
    const formInput = document.getElementById('quoteProduct');
    if(countEl) countEl.textContent = basket.length;
    if(basketBtn) basketBtn.classList.toggle('hidden', basket.length === 0);
    if(formInput && basket.length > 0) formInput.value = basket.join(', ');
};

window.addToBasket = function(productName) {
    if(!basket.includes(productName)) {
        basket.push(productName);
        window.updateBasketUI();
        window.showToast(`${productName} added to Quote Basket!`, "success");
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
    } else {
        window.showToast(`${productName} is already in your basket.`, "info");
    }
};

window.toggleBasketModal = () => {
    const modal = document.getElementById('basketModal');
    if (modal && modal.classList.contains('hidden')) {
        window.renderBasketItems();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.renderBasketItems = () => {
    const list = document.getElementById('basketItemList');
    if (!list) return;
    list.innerHTML = '';
    if (basket.length === 0) { list.innerHTML = '<li class="text-gray-500 text-sm text-center py-4">Your basket is empty.</li>'; return; }
    basket.forEach((item, index) => {
        list.innerHTML += `<li class="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700"><span class="font-bold text-gray-700 dark:text-gray-200 text-sm">${item}</span><button onclick="removeFromBasket(${index})" class="text-red-400 hover:text-red-600 p-1 font-bold">✖</button></li>`;
    });
};

window.removeFromBasket = (index) => { basket.splice(index, 1); window.updateBasketUI(); window.renderBasketItems(); };
window.proceedToQuote = () => { window.toggleBasketModal(); document.getElementById('quote')?.scrollIntoView({behavior: 'smooth'}); };

// --- MODALS & UI TRIGGERS ---
window.openSampleKit = () => { document.getElementById('sampleKitModal')?.classList.remove('hidden'); document.getElementById('sampleKitModal')?.classList.add('flex'); };
window.closeSampleKit = () => { document.getElementById('sampleKitModal')?.classList.add('hidden'); document.getElementById('sampleKitModal')?.classList.remove('flex'); };
window.submitSampleKit = (e) => { e.preventDefault(); window.closeSampleKit(); window.showToast("Sample Kit requested!", "success"); };
window.openARViewer = () => { const m = document.getElementById('arViewerModal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden'; } };
window.closeARViewer = () => { const m = document.getElementById('arViewerModal'); if(m) { m.classList.add('hidden'); m.classList.remove('flex'); document.body.style.overflow = ''; } };

window.openProductModal = function(card) {
    const d = card.dataset;
    if(document.getElementById('modalProductName')) document.getElementById('modalProductName').textContent = d.name;
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    faces.forEach(face => {
        const el = document.getElementById(`face-${face}`);
        if(el) {
            el.style.backgroundImage = `url('${d.image}')`;
            if(face === 'top') el.style.boxShadow = 'inset 0 0 40px rgba(255,255,255,0.4)';
            if(face === 'right' || face === 'left') el.style.boxShadow = 'inset 0 0 50px rgba(0,0,0,0.2)';
            if(face === 'bottom') el.style.boxShadow = 'inset 0 0 60px rgba(0,0,0,0.6)';
        }
    });
    
    const cube = document.getElementById('productCube');
    if(cube) { cube.style.transform = `rotateX(-15deg) rotateY(-25deg)`; window.cubeRotation = { x: -15, y: -25 }; }
    
    if(document.getElementById('modalProductDescription')) document.getElementById('modalProductDescription').textContent = d.description;
    const specs = document.getElementById('modalProductSpecifications');
    if(specs && d.specifications) {
        specs.innerHTML = '';
        try {
            const parsedSpecs = JSON.parse(d.specifications);
            parsedSpecs.forEach((s, i) => { const border = i === parsedSpecs.length - 1 ? '' : 'border-b border-gray-200/60'; specs.innerHTML += `<li class="flex justify-between items-center py-2 ${border}"><span class="text-gray-500 text-sm font-medium">${s.label}</span><span class="font-bold text-gray-800 text-sm text-right ml-4">${s.value}</span></li>`; });
        } catch(e){}
    }
    if(document.getElementById('modalProductAdditionalInfo')) document.getElementById('modalProductAdditionalInfo').textContent = d['additional-info'];
    const addBtn = document.getElementById('modalAddToBasket');
    if(addBtn) addBtn.onclick = () => { window.addToBasket(d.name); window.closeModal(); };
    const waBtn = document.getElementById('modalWhatsAppBtn');
    if(waBtn) waBtn.href = `https://wa.me/917405108950?text=${encodeURIComponent(`Hi Abrar Traders, I am interested in getting a quote for ${d.name}. Could you please share the pricing and details?`)}`;

    const pm = document.getElementById('productModal'); const pmb = document.getElementById('productModalBackdrop');
    if(pm && pmb) { pm.classList.remove('hidden'); pmb.classList.add('open'); pm.classList.add('open'); document.body.style.overflow = 'hidden'; }
};

window.closeModal = function() {
    const pm = document.getElementById('productModal'); const pmb = document.getElementById('productModalBackdrop');
    if(pm) { pm.classList.remove('open'); setTimeout(() => pm.classList.add('hidden'), 300); }
    if(pmb) pmb.classList.remove('open');
    document.body.style.overflow = '';
};

// --- CALCULATORS & TOOLS ---
window.switchTab = function(tabName) {
    ['weight', 'reel', 'strength', 'cbm', 'thickness', 'esg', 'diecut'].forEach(t => {
        const content = document.getElementById('tool-' + t); const btn = document.getElementById('tab-' + t);
        if(content) content.classList.add('hidden');
        if(btn) btn.className = "px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
    });
    const activeContent = document.getElementById('tool-' + tabName); if(activeContent) activeContent.classList.remove('hidden');
    const activeBtn = document.getElementById('tab-' + tabName);
    if(activeBtn) {
        let colorClass = "text-blue-600";
        if(tabName === 'reel') colorClass = "text-yellow-600"; else if(tabName === 'strength') colorClass = "text-red-600"; else if(tabName === 'cbm') colorClass = "text-green-600"; else if(tabName === 'thickness') colorClass = "text-indigo-600"; else if(tabName === 'esg') colorClass = "text-emerald-600"; else if(tabName === 'diecut') { colorClass = "text-purple-600"; setTimeout(window.drawDieCut, 50); }
        activeBtn.className = `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white ${colorClass}`;
    }
};

window.setUnit = function(unit) {
    currentUnit = unit;
    ['cm', 'mm', 'inch'].forEach(u => {
        const btn = document.getElementById(`btn-${u}`);
        if(btn) btn.className = (u === unit) ? "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all bg-blue-600 text-white shadow-md transform scale-105" : "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
    });
    document.querySelectorAll('.unit-label').forEach(l => l.textContent = `(${unit})`);
    ['calcLength', 'calcWidth', 'sizePreset'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    window.calculateWeight(); 
};

window.applyPreset = function() {
    const preset = document.getElementById('sizePreset')?.value; const lInput = document.getElementById('calcLength'); const wInput = document.getElementById('calcWidth');
    if (!preset || !lInput || !wInput) return;
    if (preset === 'A2') { window.setUnit('mm'); wInput.value = 420; lInput.value = 594; } else if (preset === 'A3') { window.setUnit('mm'); wInput.value = 297; lInput.value = 420; } else if (preset === 'A4') { window.setUnit('mm'); wInput.value = 210; lInput.value = 297; } else if (preset === 'A5') { window.setUnit('mm'); wInput.value = 148; lInput.value = 210; } else if (['18x23', '23x36', '25x36', '30x40'].includes(preset)) { window.setUnit('inch'); const [w, h] = preset.split('x'); wInput.value = w; lInput.value = h; }
    window.calculateWeight();
};

window.calculateWeight = function() {
    const l = Math.max(0, parseFloat(document.getElementById('calcLength')?.value) || 0); const w = Math.max(0, parseFloat(document.getElementById('calcWidth')?.value) || 0); const gsm = Math.max(0, parseFloat(document.getElementById('calcGsm')?.value) || 0); const qty = Math.max(0, parseFloat(document.getElementById('calcQty')?.value) || 0);
    let m_l = 0, m_w = 0;
    if (currentUnit === 'cm') { m_l = l/100; m_w = w/100; } else if (currentUnit === 'mm') { m_l = l/1000; m_w = w/1000; } else if (currentUnit === 'inch') { m_l = l*0.0254; m_w = w*0.0254; }
    const totalKg = ((m_l * m_w) * gsm * qty) / 1000;
    const resTotal = document.getElementById('resTotal'); if(resTotal) resTotal.innerHTML = `${totalKg.toFixed(2)} <span class="text-xl text-blue-600 font-bold">kg</span>`;
    const moqStatus = document.getElementById('moqStatus');
    if(moqStatus) { if (totalKg === 0) moqStatus.textContent = ""; else if (totalKg < 1000) moqStatus.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded">⚠️ Below MOQ (${(1000-totalKg).toFixed(1)}kg short)</span>`; else moqStatus.innerHTML = `<span class="text-green-600 bg-green-50 px-2 py-1 rounded">✅ MOQ Met</span>`; }
};

window.calculateReel = function() {
    const rWeight = Math.max(0, parseFloat(document.getElementById('reelWeight')?.value) || 0); const rWidth = Math.max(0, parseFloat(document.getElementById('reelWidth')?.value) || 0); const rGsm = Math.max(0, parseFloat(document.getElementById('reelGsm')?.value) || 0); const cutLen = Math.max(0, parseFloat(document.getElementById('cutLength')?.value) || 0);
    if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;
    const totalLength = (rWeight * 1000 * 100) / (rGsm * rWidth); const sheets = (cutLen > 0) ? (totalLength * 100) / cutLen : 0;
    if(document.getElementById('resReelLength')) document.getElementById('resReelLength').innerHTML = `${Math.floor(totalLength)} <span class="text-sm">meters</span>`;
    if(document.getElementById('resSheets')) document.getElementById('resSheets').innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
};

window.calculateStrength = function() {
    const gsm = Math.max(0, parseFloat(document.getElementById('strGsm')?.value) || 0); const bf = Math.max(0, parseFloat(document.getElementById('strBf')?.value) || 0);
    if(document.getElementById('resBs')) document.getElementById('resBs').textContent = ((gsm * bf) / 1000).toFixed(2);
};

window.calculateCBM = function() {
    const l = Math.max(0, parseFloat(document.getElementById('cbmL')?.value) || 0); const w = Math.max(0, parseFloat(document.getElementById('cbmW')?.value) || 0); const h = Math.max(0, parseFloat(document.getElementById('cbmH')?.value) || 0); const qty = Math.max(0, parseFloat(document.getElementById('cbmQty')?.value) || 1);
    const totalCbm = (l * w * h * qty) / 1000000;
    const resCbm = document.getElementById('resCbm'); if (resCbm) resCbm.innerHTML = totalCbm.toFixed(3) + ' <span class="text-xl text-green-600">m³</span>';
    const simulator = document.getElementById('containerSimulatorResult'); if (simulator && totalCbm > 0) simulator.classList.remove('hidden');

    const maxCbm = 33.0; let fillPercentage = Math.min((totalCbm / maxCbm) * 100, 100);
    const fillBar = document.getElementById('containerFillBar'); const percentText = document.getElementById('containerPercentageText');
    
    if (fillBar) {
        setTimeout(() => {
            fillBar.style.width = fillPercentage + '%';
            fillBar.className = "absolute top-0 left-0 h-full transition-all duration-1000 ease-out w-0 flex items-center justify-end overflow-hidden shadow-[inset_-5px_0_15px_rgba(0,0,0,0.3)] " + (fillPercentage === 100 ? "bg-red-500" : fillPercentage > 85 ? "bg-green-500" : "bg-blue-500");
            if(percentText) percentText.style.color = fillPercentage === 100 ? "#ef4444" : fillPercentage > 85 ? "#10b981" : "#3b82f6";
        }, 50);
    }

    if (percentText) {
        let startTimestamp = null; const duration = 1000;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            percentText.innerText = (progress * fillPercentage).toFixed(1) + '%';
            if (progress < 1) window.requestAnimationFrame(step);
        }; window.requestAnimationFrame(step);
    }

    const statusText = document.getElementById('containerStatusText'); const palletText = document.getElementById('palletEstimateText');
    if (statusText) statusText.innerText = fillPercentage === 100 ? "Warning: Exceeds 20ft limits!" : fillPercentage > 85 ? "Optimal Load!" : "LCL recommended.";
    if (palletText) palletText.innerText = `~ ${Math.ceil(totalCbm / 1.5)} Standard Pallet(s)`;

    const palletBox = document.getElementById('palletVisualizerBox'); const canvas = document.getElementById('palletCanvas');
    if (palletBox && canvas && l > 0 && w > 0) {
        palletBox.classList.remove('hidden'); const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#c2a88f"; for(let i=10; i<360; i+=40) ctx.fillRect(i, 0, 20, 240);
        
        const pL = 120, pW = 80;
        const isRotated = (Math.floor(pL / w) * Math.floor(pW / l)) > (Math.floor(pL / l) * Math.floor(pW / w));
        const finalCols = isRotated ? Math.floor(pL / w) : Math.floor(pL / l); const finalRows = isRotated ? Math.floor(pW / l) : Math.floor(pW / w);
        const totalBoxes = finalCols * finalRows;
        
        const pxL = (isRotated ? w : l) * 3; const pxW = (isRotated ? l : w) * 3;
        const startX = (360 - (finalCols * pxL)) / 2; const startY = (240 - (finalRows * pxW)) / 2;

        for (let c = 0; c < finalCols; c++) {
            for (let r = 0; r < finalRows; r++) {
                const x = startX + (c * pxL); const y = startY + (r * pxW);
                ctx.fillStyle = "rgba(59, 130, 246, 0.85)"; ctx.fillRect(x, y, pxL, pxW);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, pxL, pxW);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + (pxL/2), y); ctx.lineTo(x + (pxL/2), y + pxW); ctx.stroke();
            }
        }
        document.getElementById('boxesPerLayerTxt').innerText = totalBoxes;
        document.getElementById('palletEfficiencyTxt').innerText = Math.round(((totalBoxes * (l * w)) / (pL * pW)) * 100) + '%';
    } else if (palletBox) palletBox.classList.add('hidden');
};

window.calculateESG = function() {
    const tons = parseFloat(document.getElementById('esgTons')?.value) || 0;
    document.getElementById('esgTrees').innerText = Math.floor(tons * 17).toLocaleString();
    document.getElementById('esgWater').innerText = Math.floor(tons * 26497).toLocaleString();
    document.getElementById('esgEnergy').innerText = Math.floor(tons * 4000).toLocaleString();
    document.getElementById('esgLandfill').innerText = Math.floor(tons * 3.3).toLocaleString();
};

window.downloadESGReport = function() {
    window.showToast("Initializing PDF Engine...", "info");
    const generatePDF = () => {
        const tons = Math.max(0, parseFloat(document.getElementById('esgTons').value) || 0);
        const trees = document.getElementById('esgTrees').innerText; const water = document.getElementById('esgWater').innerText; const energy = document.getElementById('esgEnergy').innerText;

        const element = document.createElement('div');
        element.innerHTML = `
            <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #1f2937;">
                <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #047857; margin: 0; font-size: 32px;">Certificate of Environmental Impact</h1>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Certified by ABRAR TRADERS | Sustainable Packaging</p>
                </div>
                <p style="font-size: 18px;">Procurement of <strong>${tons} Metric Tons</strong> of Recycled Board actively contributes to:</p>
                <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 12px; width: 30%; text-align: center;"><h2 style="color: #059669; font-size: 28px; margin: 0;">🌳 ${trees}</h2><p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Trees Saved</p></div>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; width: 30%; text-align: center;"><h2 style="color: #2563eb; font-size: 28px; margin: 0;">💧 ${water} L</h2><p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Water Preserved</p></div>
                    <div style="background: #fefce8; border: 1px solid #fef08a; padding: 20px; border-radius: 12px; width: 30%; text-align: center;"><h2 style="color: #ca8a04; font-size: 28px; margin: 0;">⚡ ${energy} kWh</h2><p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Energy Conserved</p></div>
                </div>
                <p style="margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center;">Generated on ${new Date().toLocaleDateString()}. Thank you for choosing a greener supply chain.</p>
            </div>`;
        element.style.position = 'absolute'; element.style.top = '-9999px'; element.style.left = '-9999px'; element.style.opacity = '1'; document.body.appendChild(element);
        
        html2pdf().set({ margin: 10, filename: 'Abrar_Traders_CSR.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save().then(() => { document.body.removeChild(element); window.showToast("Certificate Downloaded!", "success"); });
    };

    if (typeof html2pdf !== 'undefined') generatePDF(); 
    else {
        const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => { window.showToast("Generating PDF...", "success"); generatePDF(); };
        document.body.appendChild(script);
    }
};

window.drawDieCut = () => {
    const l = Math.max(10, parseFloat(document.getElementById('dieL')?.value) || 200); const w = Math.max(10, parseFloat(document.getElementById('dieW')?.value) || 150); const h = Math.max(10, parseFloat(document.getElementById('dieH')?.value) || 100);
    const viewer = document.querySelector('model-viewer'); if (viewer) { viewer.scale = `${l / 1000} ${h / 1000} ${w / 1000}`; }
    const flap = w / 2; const glueTab = 30; const totalW = glueTab + (l * 2) + (w * 2); const totalH = h + (flap * 2); const pad = 20; 

    const svgContent = `
        <svg id="generatedSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW + (pad*2)} ${totalH + (pad*2)}" class="w-full max-w-full h-auto" style="max-height: 50vh;">
            <style>.cut { stroke: #111827; stroke-width: 2; fill: none; stroke-linejoin: round; } .fold { stroke: #ef4444; stroke-width: 2; stroke-dasharray: 8,6; fill: none; } .dark-mode .cut { stroke: #f9fafb; }</style>
            <g transform="translate(${pad}, ${pad})">
                <line class="fold" x1="${glueTab}" y1="${flap}" x2="${totalW}" y2="${flap}" /><line class="fold" x1="${glueTab}" y1="${flap + h}" x2="${totalW}" y2="${flap + h}" /><line class="fold" x1="${glueTab}" y1="${flap}" x2="${glueTab}" y2="${flap + h}" /><line class="fold" x1="${glueTab + l}" y1="${flap}" x2="${glueTab + l}" y2="${flap + h}" /><line class="fold" x1="${glueTab + l + w}" y1="${flap}" x2="${glueTab + l + w}" y2="${flap + h}" /><line class="fold" x1="${glueTab + (l*2) + w}" y1="${flap}" x2="${glueTab + (l*2) + w}" y2="${flap + h}" />
                <path class="cut" d="M ${glueTab} ${flap} L 0 ${flap + 10} L 0 ${flap + h - 10} L ${glueTab} ${flap + h}" /><path class="cut" d="M ${glueTab} ${flap} L ${glueTab} 0 L ${glueTab + l} 0 L ${glueTab + l} ${flap}" /><path class="cut" d="M ${glueTab + l} ${flap} L ${glueTab + l} 0 L ${glueTab + l + w} 0 L ${glueTab + l + w} ${flap}" /><path class="cut" d="M ${glueTab + l + w} ${flap} L ${glueTab + l + w} 0 L ${glueTab + (l*2) + w} 0 L ${glueTab + (l*2) + w} ${flap}" /><path class="cut" d="M ${glueTab + (l*2) + w} ${flap} L ${glueTab + (l*2) + w} 0 L ${totalW} 0 L ${totalW} ${flap}" /><path class="cut" d="M ${glueTab} ${flap + h} L ${glueTab} ${totalH} L ${glueTab + l} ${totalH} L ${glueTab + l} ${flap + h}" /><path class="cut" d="M ${glueTab + l} ${flap + h} L ${glueTab + l} ${totalH} L ${glueTab + l + w} ${totalH} L ${glueTab + l + w} ${flap + h}" /><path class="cut" d="M ${glueTab + l + w} ${flap + h} L ${glueTab + l + w} ${totalH} L ${glueTab + (l*2) + w} ${totalH} L ${glueTab + (l*2) + w} ${flap + h}" /><path class="cut" d="M ${glueTab + (l*2) + w} ${flap + h} L ${glueTab + (l*2) + w} ${totalH} L ${totalW} ${totalH} L ${totalW} ${flap + h}" /><line class="cut" x1="${totalW}" y1="${flap}" x2="${totalW}" y2="${flap + h}" />
            </g>
        </svg>
    `;
    const svgContainer = document.getElementById('svgContainer'); if (svgContainer) svgContainer.innerHTML = svgContent;
};

window.downloadSVG = () => {
    const svgElement = document.getElementById('generatedSvg'); if (!svgElement) return;
    let source = '<?xml version="1.0" standalone="no"?>\r\n' + new XMLSerializer().serializeToString(svgElement);
    const link = document.createElement("a"); link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    link.download = `AbrarTraders_Box_${document.getElementById('dieL').value}x${document.getElementById('dieW').value}x${document.getElementById('dieH').value}mm.svg`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    window.showToast("SVG Die-Line Downloaded!", "success");
};

// --- QUIZ LOGIC ---
window.quizSelect = function(step, value) {
    quizState[step] = value;
    if (step === 'use') { const step1 = document.getElementById('quiz-step-1'); const step2 = document.getElementById('quiz-step-2'); if(step1 && step2) { step1.style.opacity = '0'; setTimeout(() => { step1.classList.add('hidden'); step2.classList.remove('hidden'); void step2.offsetWidth; step2.style.opacity = '1'; }, 300); } } 
    else if (step === 'weight') { const step2 = document.getElementById('quiz-step-2'); if(step2) { step2.style.opacity = '0'; setTimeout(() => { step2.classList.add('hidden'); showQuizResult(); }, 300); } }
};
window.quizBack = function() { const step1 = document.getElementById('quiz-step-1'); const step2 = document.getElementById('quiz-step-2'); if(step1 && step2) { step2.style.opacity = '0'; setTimeout(() => { step2.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState.use = ''; }, 300); } };
window.quizReset = function() { const step1 = document.getElementById('quiz-step-1'); const step3 = document.getElementById('quiz-step-3'); if(step1 && step3) { step3.style.opacity = '0'; setTimeout(() => { step3.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState = { use: '', weight: '' }; }, 300); } };
window.showQuizResult = function() {
    let result = { title: 'Kraft Paper', desc: 'Versatile and strong. Standard recommendation.' };
    if (quizState.use === 'packaging') { if (quizState.weight === 'heavy') result = { title: 'Laminated Paper Board', desc: 'Maximum protection.' }; else if (quizState.weight === 'medium') result = { title: 'Duplex Board', desc: 'The industry standard.' }; } 
    else if (quizState.use === 'printing') { if (quizState.weight === 'heavy') result = { title: 'SBS', desc: 'Premium coated board.' }; else if (quizState.weight === 'medium') result = { title: 'FBB', desc: 'Perfect for vibrant colors.' }; else result = { title: 'Maplitho Paper', desc: 'Standard high-quality bond paper.' }; } 
    else if (quizState.use === 'industrial') { if (quizState.weight === 'heavy') result = { title: 'Grey Board', desc: 'Thick recycled board.' }; }
    if(document.getElementById('quiz-result-title')) document.getElementById('quiz-result-title').textContent = result.title;
    if(document.getElementById('quiz-result-desc')) document.getElementById('quiz-result-desc').textContent = result.desc;
    if(document.getElementById('quiz-add-btn')) document.getElementById('quiz-add-btn').onclick = () => window.addToBasket(result.title);
    const step3 = document.getElementById('quiz-step-3'); if(step3) { step3.classList.remove('hidden'); void step3.offsetWidth; step3.style.opacity = '1'; }
};

// ==========================================
// 3. THE INITIALIZATION ENGINE (Perfect Closure)
// ==========================================
function initAbrarEngine() {
    window.updateBasketUI();
    window.switchTab('weight'); 

    // Calculators Listeners
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));
    document.getElementById('esgTons')?.addEventListener('input', window.calculateESG);

    // Product Search Logic
    const searchInput = document.getElementById('productSearch');
    const searchDropdown = document.getElementById('searchDropdown');
    const products = document.querySelectorAll('.product-item');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if(searchDropdown) searchDropdown.innerHTML = ''; 
            if(term.length === 0) { if(searchDropdown) searchDropdown.classList.add('hidden'); products.forEach(item => item.style.display = 'block'); return; }
            let hasResults = false;
            if(searchDropdown) { searchDropdown.classList.remove('hidden'); searchDropdown.style.display = 'flex'; }
            products.forEach(item => {
                const name = item.dataset.name.toLowerCase(); const desc = item.dataset.description.toLowerCase();
                if(name.includes(term) || desc.includes(term)) {
                    hasResults = true; item.style.display = 'block'; item.classList.remove('aos-animate'); setTimeout(() => item.classList.add('aos-animate'), 50);
                    if(searchDropdown) {
                        const div = document.createElement('div'); div.className = 'flex items-center gap-4 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 focus:bg-gray-100 outline-none';
                        div.tabIndex = 0; 
                        div.innerHTML = `<img src="${item.dataset.image}" alt="" class="w-10 h-10 rounded object-cover"><div><div class="font-bold text-gray-800 text-sm">${item.dataset.name}</div><div class="text-xs text-gray-500">${item.dataset.category}</div></div>`;
                        div.onclick = div.onkeydown = (ev) => { 
                            if(ev.type === 'click' || ev.key === 'Enter') { window.openProductModal(item); searchDropdown.classList.add('hidden'); searchInput.value = ''; products.forEach(p => p.style.display = 'block'); }
                        };
                        searchDropdown.appendChild(div);
                    }
                } else { item.style.display = 'none'; }
            });
            if(!hasResults && searchDropdown) searchDropdown.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">No products found</div>`;
        });
        document.addEventListener('click', (e) => { if (searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) searchDropdown.classList.add('hidden'); });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            products.forEach(item => {
                if(filter === 'all' || item.dataset.category.includes(filter)) { item.style.display = 'block'; item.classList.add('aos-animate'); } 
                else { item.style.display = 'none'; }
            });
        });
    });

    document.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => window.openProductModal(card)));
    document.getElementById('closeProductModal')?.addEventListener('click', window.closeModal);
    document.getElementById('productModalBackdrop')?.addEventListener('click', window.closeModal);

    const quoteBasketBtn = document.getElementById('quoteBasket');
    if (quoteBasketBtn) {
        const oldClone = quoteBasketBtn.cloneNode(true);
        quoteBasketBtn.parentNode.replaceChild(oldClone, quoteBasketBtn);
        oldClone.addEventListener('click', window.toggleBasketModal);
    }

    // Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    const iconDark = document.getElementById('themeIconDark'); const iconLight = document.getElementById('themeIconLight');
    if (localStorage.getItem('at_theme') === 'dark') { document.documentElement.classList.add('dark'); document.body.classList.add('dark-mode'); if(iconDark) iconDark.classList.add('hidden'); if(iconLight) iconLight.classList.remove('hidden'); }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark'); document.body.classList.toggle('dark-mode'); 
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('at_theme', isDark ? 'dark' : 'light');
            if (isDark) { iconDark.classList.add('hidden'); iconLight.classList.remove('hidden'); window.showToast("Midnight theme activated 🌙", "info"); } 
            else { iconLight.classList.add('hidden'); iconDark.classList.remove('hidden'); window.showToast("Light theme activated ☀️", "info"); }
        });
    }

    // Translations Logic
    const translations = {
        en: { home: "Home", products: "Products", tools: "Pro Tools", blog: "Blog", contact: "Contact", heroTitle: "ABRAR TRADERS" },
        hi: { home: "होम", products: "उत्पाद", tools: "उपकरण", blog: "ब्लॉग", contact: "संपर्क", heroTitle: "अबरार ट्रेडर्स" },
        gu: { home: "ઘર", products: "ઉત્પાદનો", tools: "સાધનો", blog: "બ્લોગ", contact: "સંપર્ક", heroTitle: "અબરાર ટ્રેડર્સ" }
    };
    document.querySelectorAll('.nav-link').forEach((el, i) => { const keys = ["home", "products", "tools", "blog", "contact"]; if(keys[i]) el.setAttribute('data-i18n', keys[i]); });
    document.querySelector('h1 span.bg-gradient-to-r')?.setAttribute('data-i18n', 'heroTitle');
    document.getElementById('langToggle')?.addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (translations[lang]?.[key]) el.innerText = translations[lang][key]; });
        window.showToast(`Language changed to ${lang.toUpperCase()}`, "info");
    });

    // Mobile Menu
    const menuButton = document.getElementById('menuButton'); const mobileMenu = document.getElementById('mobileMenu'); const menuBackdrop = document.getElementById('menuBackdrop');
    const doToggleMenu = () => {
        if(!mobileMenu) return; const isOpen = mobileMenu.classList.contains('open');
        menuButton?.classList.toggle('menu-open', !isOpen); mobileMenu.classList.toggle('open', !isOpen); menuBackdrop?.classList.toggle('open', !isOpen);
        document.body.classList.toggle('menu-opened', !isOpen); document.body.style.overflow = isOpen ? '' : 'hidden';
    };
    menuButton?.addEventListener('click', doToggleMenu); menuBackdrop?.addEventListener('click', doToggleMenu); document.getElementById('closeMenuButton')?.addEventListener('click', doToggleMenu); document.querySelectorAll('#mobileMenu a').forEach(l => l.addEventListener('click', doToggleMenu));

    // Nav Scroll & ToTop Button
    const scrollBtn = document.getElementById('scrollTopBtn'); const progressCircle = document.getElementById('scrollProgress');
    const nav = document.getElementById('mainNav'); let lastScrollY = window.scrollY;
    
    if(scrollBtn && progressCircle) {
        const radius = progressCircle.r.baseVal.value; const circumference = radius * 2 * Math.PI;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`; progressCircle.style.strokeDashoffset = circumference;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { scrollBtn.classList.remove('opacity-0', 'invisible'); scrollBtn.classList.add('opacity-100', 'visible'); } 
            else { scrollBtn.classList.remove('opacity-100', 'visible'); scrollBtn.classList.add('opacity-0', 'invisible'); }
            const scrollTop = window.scrollY; const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            progressCircle.style.strokeDashoffset = circumference - ((scrollTop / docHeight) * circumference);
        }, { passive: true });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
            if (currentScrollY > lastScrollY && currentScrollY > 300) nav.style.transform = 'translateY(-150%)'; else nav.style.transform = 'translateY(0)';
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-button').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling; const icon = button.querySelector('svg');
            document.querySelectorAll('.faq-answer').forEach(ans => { if(ans !== answer) { ans.style.maxHeight = null; const prevIcon = ans.previousElementSibling?.querySelector('svg'); if(prevIcon) prevIcon.style.transform = "rotate(0deg)"; } });
            if (answer.style.maxHeight) { answer.style.maxHeight = null; if(icon) icon.style.transform = "rotate(0deg)"; } 
            else { answer.style.maxHeight = answer.scrollHeight + "px"; if(icon) icon.style.transform = "rotate(180deg)"; }
        });
    });

    // Ajax Form Submission
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const submitBtn = quoteForm.querySelector('button[type="submit"]'); const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...'; submitBtn.disabled = true; submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            try {
                const response = await fetch(quoteForm.action, { method: 'POST', body: new FormData(quoteForm), headers: { 'Accept': 'application/json' } });
                if (response.ok) { window.showToast("Quote requested successfully!", "success"); quoteForm.reset(); if (typeof basket !== 'undefined') { basket = []; window.updateBasketUI(); } } 
                else { window.showToast("Problem submitting your form.", "info"); }
            } catch (error) { window.showToast("Network error.", "info"); } 
            finally { submitBtn.innerText = originalText; submitBtn.disabled = false; submitBtn.classList.remove('opacity-75', 'cursor-not-allowed'); }
        });
    }

    // AI Copilot Dragger (Touch & Mouse Support)
    const chatWindow = document.getElementById('aiChatWindow');
    if (chatWindow) {
        const header = chatWindow.querySelector('.bg-white\\/50') || chatWindow.firstElementChild; 
        if(header) {
            header.style.cursor = 'grab';
            let isDraggingChat = false, offsetX = 0, offsetY = 0;
            
            const startDrag = (e) => {
                if(e.target.tagName === 'BUTTON' || e.target.closest('button')) return; // Ignore buttons
                isDraggingChat = true; header.style.cursor = 'grabbing';
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const rect = chatWindow.getBoundingClientRect();
                offsetX = clientX - rect.left; offsetY = clientY - rect.top;
                chatWindow.style.right = 'auto'; chatWindow.style.bottom = 'auto';
            };
            const onDrag = (e) => {
                if (!isDraggingChat) return;
                if(e.touches && e.cancelable) e.preventDefault(); 
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                chatWindow.style.left = `${clientX - offsetX}px`;
                chatWindow.style.top = `${clientY - offsetY}px`;
            };
            const endDrag = () => { isDraggingChat = false; header.style.cursor = 'grab'; };

            header.addEventListener('mousedown', startDrag);
            header.addEventListener('touchstart', startDrag, {passive: false});
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, {passive: false});
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
        }
    }

    // 3D Box Physics
    const scene = document.getElementById('cubeScene'); const cube = document.getElementById('productCube');
    let isDragging = false; let previousMousePosition = { x: 0, y: 0 }; window.cubeRotation = { x: -15, y: -25 };
    if (scene && cube) {
        scene.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition = { x: e.offsetX, y: e.offsetY }; });
        document.addEventListener('mouseup', () => isDragging = false);
        const applyDynamicLighting = () => {
            const front = document.getElementById('face-front'); const right = document.getElementById('face-right'); const left = document.getElementById('face-left');
            const normalizedY = (window.cubeRotation.y % 360 + 360) % 360;
            if(front) front.style.filter = `brightness(${100 - Math.min(60, Math.abs(normalizedY > 180 ? normalizedY - 360 : normalizedY))}%)`;
            if(right) right.style.filter = `brightness(${40 + Math.min(60, Math.abs((normalizedY - 90) % 180))}%)`;
            if(left) left.style.filter = `brightness(${40 + Math.min(60, Math.abs((normalizedY + 90) % 180))}%)`;
        };
        scene.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            window.cubeRotation.x -= (e.offsetY - previousMousePosition.y) * 0.5; window.cubeRotation.y += (e.offsetX - previousMousePosition.x) * 0.5;
            cube.style.transform = `rotateX(${window.cubeRotation.x}deg) rotateY(${window.cubeRotation.y}deg)`;
            previousMousePosition = { x: e.offsetX, y: e.offsetY }; applyDynamicLighting();
        });
        scene.addEventListener('touchstart', (e) => { isDragging = true; const touch = e.touches[0]; const rect = scene.getBoundingClientRect(); previousMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }; }, {passive: true});
        document.addEventListener('touchend', () => isDragging = false);
        scene.addEventListener('touchmove', (e) => {
            if (!isDragging) return; if(e.cancelable) e.preventDefault(); 
            const touch = e.touches[0]; const rect = scene.getBoundingClientRect(); const currentX = touch.clientX - rect.left; const currentY = touch.clientY - rect.top;
            window.cubeRotation.x -= (currentY - previousMousePosition.y) * 0.6; window.cubeRotation.y += (currentX - previousMousePosition.x) * 0.6;
            cube.style.transform = `rotateX(${window.cubeRotation.x}deg) rotateY(${window.cubeRotation.y}deg)`;
            previousMousePosition = { x: currentX, y: currentY }; applyDynamicLighting();
        }, {passive: false});
    }

    // GSM Visualizer Slider
    const visualSlider = document.getElementById('gsmVisualSlider'); const valDisplay = document.getElementById('gsmValueDisplay'); const descText = document.getElementById('gsmDescText'); const isoPaper = document.getElementById('isometricPaper');
    if (visualSlider && isoPaper) {
        visualSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value); valDisplay.textContent = val;
            let desc = '';
            if (val <= 80) desc = "Tracing Paper — Extremely thin and flexible."; else if (val <= 120) desc = "Standard Printer Paper — Your everyday office A4 sheet."; else if (val <= 160) desc = "Light Flyers — Good for folding without cracking."; else if (val <= 220) desc = "Brochure Covers — Feels like a high-quality magazine cover."; else if (val <= 280) desc = "Standard Business Cards — Holds its shape well."; else if (val <= 350) desc = "Heavy Cardstock — Used for premium product boxes."; else desc = "Rigid Packaging — Unbending. Used for luxury boxes.";
            descText.textContent = desc;
            const thicknessPixels = Math.max(1, Math.floor((val / 450) * 45)); 
            let shadows = [`-30px 30px 40px rgba(0,0,0,0.15)`]; 
            for(let i = 1; i <= thicknessPixels; i++) shadows.push(`-${i}px ${i}px 0px var(--edge-light)`);
            shadows.push(`-${thicknessPixels + 1}px ${thicknessPixels + 1}px 0px var(--edge-dark)`);
            isoPaper.style.boxShadow = shadows.join(', ');
            isoPaper.style.transform = `rotateX(60deg) rotateY(0deg) rotateZ(-45deg) translateZ(${thicknessPixels}px) translate(-${thicknessPixels/2}px, -${thicknessPixels/2}px)`;
        });
        visualSlider.dispatchEvent(new Event('input'));
    }

    // Micro-interactions & Footer Parallax
    document.querySelectorAll('.action-button, .btn-glow').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect(); const x = (e.clientX - rect.left) - (rect.width / 2); const y = (e.clientY - rect.top) - (rect.height / 2);
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
            Array.from(btn.children).forEach(child => { if (child.tagName.toLowerCase() !== 'svg') child.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`; });
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) scale(1)`; btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; 
            Array.from(btn.children).forEach(child => { child.style.transform = `translate(0px, 0px)`; child.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; });
            setTimeout(() => { btn.style.transition = ''; Array.from(btn.children).forEach(c => c.style.transition = ''); }, 500);
        });
    });

    const footerElement = document.querySelector('footer'); const footerTiltLayer = document.getElementById('footer-tilt-layer');
    if (footerElement && footerTiltLayer && window.matchMedia("(min-width: 768px)").matches) {
        footerElement.addEventListener('mousemove', (e) => {
            const rect = footerElement.getBoundingClientRect();
            const tiltX = (((e.clientY - rect.top) - (rect.height / 2)) / (rect.height / 2)) * -12; const tiltY = (((e.clientX - rect.left) - (rect.width / 2)) / (rect.width / 2)) * 12;
            footerTiltLayer.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        footerElement.addEventListener('mouseleave', () => {
            footerTiltLayer.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`; footerTiltLayer.style.transition = 'transform 1s cubic-bezier(0.25, 1, 0.5, 1)';
            setTimeout(() => { footerTiltLayer.style.transition = 'transform 0.1s ease-out'; }, 1000);
        });
        footerElement.addEventListener('mouseenter', () => { footerTiltLayer.style.transition = 'transform 0.1s ease-out'; });
    }

    // App-like Transitions
    document.body.style.opacity = '0';
    requestAnimationFrame(() => { document.body.style.transition = 'opacity 0.6s ease-out'; document.body.style.opacity = '1'; });
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => {
            const target = link.getAttribute('href');
            if (target && target.includes('.html') && !target.startsWith('http') && !document.startViewTransition) {
                e.preventDefault(); document.body.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'; document.body.style.opacity = '0'; document.body.style.transform = 'scale(0.98)';
                setTimeout(() => { window.location.href = target; }, 400);
            }
        });
    });

    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('loaded'); observer.unobserve(entry.target); } });
    }, { rootMargin: "250px 0px" });
    lazyImages.forEach(img => imageObserver.observe(img));

    // Enterprise Keyboard Shortcuts
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); window.toggleChat(); } });

    // External Plugins Init
    if (typeof Lenis !== 'undefined') { const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true }); function raf(time) { lenis.raf(time); requestAnimationFrame(raf); } requestAnimationFrame(raf); }
    if (document.getElementById('typed') && typeof Typed !== 'undefined') new Typed('#typed', { strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'], typeSpeed: 50, backSpeed: 25, loop: true });
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    if (typeof Splide !== 'undefined' && document.querySelector('.splide')) new Splide('.splide', { type: 'loop', perPage: 3, gap: '1.5rem', pagination: true, arrows: false, autoplay: true, interval: 5000, breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } } }).mount();
    if (typeof VanillaTilt !== 'undefined') VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 12, speed: 400, glare: true, "max-glare": 0.2, perspective: 1000 });
    
    // Cloud Cursor Engine
    if (window.matchMedia("(min-width: 768px)").matches) {
        const cursor = document.getElementById('customCursor'); const follower = document.getElementById('cursorFollower');
        const cloudCanvas = document.createElement('canvas'); cloudCanvas.id = 'cloudCanvas';
        cloudCanvas.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-[99997] transition-opacity duration-300';
        document.body.appendChild(cloudCanvas); const ctx = cloudCanvas.getContext('2d', { alpha: true });
        let width = window.innerWidth; let height = window.innerHeight; cloudCanvas.width = width; cloudCanvas.height = height;
        window.addEventListener('resize', () => { width = window.innerWidth; height = window.innerHeight; cloudCanvas.width = width; cloudCanvas.height = height; });
        let particles = []; let mouseX = width / 2; let mouseY = height / 2; let followerX = mouseX; let followerY = mouseY; let currentAngle = 0; let targetAngle = 0;

        document.addEventListener('mousemove', (e) => {
            if (!document.body.classList.contains('has-custom-cursor')) document.body.classList.add('has-custom-cursor');
            const dx = e.clientX - mouseX; const dy = e.clientY - mouseY; const speed = Math.sqrt(dx * dx + dy * dy);
            mouseX = e.clientX; mouseY = e.clientY;
            if (speed > 2) targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (speed > 8) particles.push({ x: mouseX - Math.cos(currentAngle * (Math.PI / 180)) * 20, y: mouseY - Math.sin(currentAngle * (Math.PI / 180)) * 20, radius: Math.min(speed * 0.4, 15) + 5, opacity: 0.6, growth: 0.3, fadeRate: 0.015 });
        });

        function animateFlightEngine() {
            let deltaAngle = targetAngle - currentAngle; deltaAngle = Math.atan2(Math.sin(deltaAngle * Math.PI / 180), Math.cos(deltaAngle * Math.PI / 180)) * (180 / Math.PI); currentAngle += deltaAngle * 0.15; 
            followerX += (mouseX - followerX) * 0.2; followerY += (mouseY - followerY) * 0.2;
            if(cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) rotate(${currentAngle}deg) translate(-50%, -50%)`;
            if(follower) follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) rotate(${currentAngle}deg) translate(-20px, -50%)`;
            ctx.clearRect(0, 0, width, height); const isDark = document.documentElement.classList.contains('dark');
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i]; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                if (isDark) { gradient.addColorStop(0, `rgba(96, 122, 251, ${p.opacity})`); gradient.addColorStop(1, `rgba(96, 122, 251, 0)`); } 
                else { gradient.addColorStop(0, `rgba(167, 192, 255, ${p.opacity})`); gradient.addColorStop(1, `rgba(167, 192, 255, 0)`); }
                ctx.fillStyle = gradient; ctx.fill(); p.radius += p.growth; p.opacity -= p.fadeRate;
                if (p.opacity <= 0) { particles.splice(i, 1); i--; }
            }
            requestAnimationFrame(animateFlightEngine);
        }
        animateFlightEngine();
        document.querySelectorAll('a, button, input, textarea, select, .product-card').forEach(el => {
            el.addEventListener('mouseenter', () => { if(cursor) cursor.classList.add('scale-150', 'text-indigo-600'); if(follower) follower.classList.add('w-20', 'opacity-100'); cloudCanvas.style.opacity = '0'; });
            el.addEventListener('mouseleave', () => { if(cursor) cursor.classList.remove('scale-150', 'text-indigo-600'); if(follower) follower.classList.remove('w-20', 'opacity-100'); cloudCanvas.style.opacity = '1'; });
        });
    }
}

// ==========================================
// 4. THE LAUNCH MECHANISM
// ==========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAbrarEngine);
} else {
    initAbrarEngine();
}
