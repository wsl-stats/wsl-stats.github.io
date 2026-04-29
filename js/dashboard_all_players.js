/**
 * dashboard_cycles.js
 * - Dark Omens / Olimpus: отдельный график на каждое событие (файл)
 * - Rare / Epic: отдельный график со всеми циклами (строка: "PlayerName – Cycle N")
 * - Английский язык, нумерация, прокрутка, линии порога
 */

(function() {
    const CONFIG = {
        // Общие настройки циклов для Rare/Epic
        startDate: "2026-04-03",     // начало первого цикла
        cycleDays: 24,               // длительность цикла в днях

        // Пороги для Rare и Epic (один на все циклы)
        thresholds: {
            rare: 2000,
            epic: 2000,
            // Пороги для каждого события Dark Omens (по порядку файлов)
            darkOmensEvents: [1000000, 1000000, 1000000],
            // Пороги для каждого события Olimpus
            olimpusEvents: [71000, 71000, 71000]
        },

        // Файлы событий (порядок важен для соответствия thresholds)
        olimpusFiles: ["04032026-09032026.csv", "29032026-02042026.csv", "21042026-26042026.csv"],
        darkOmensFiles: ["24022026-25022026.csv", "20032026-21032026.csv", "13042026-14042026.csv"],
        olimpusFolder: "Olimpus",
        darkOmensFolder: "Dark omens"
    };

    let charts = {};

   function createDashboard() {
    if (document.getElementById('cyclesDashboard')) return;

    // Генерация вкладок Dark Omens
    let darkTabsHtml = '<div class="tabs">';
    let darkContentsHtml = '';
    CONFIG.darkOmensFiles.forEach((file, idx) => {
        const fileName = file.replace('.csv', '');
        const activeClass = idx === 0 ? 'active' : '';
        darkTabsHtml += `<button class="tab-btn ${activeClass}" data-section="dark" data-tab="${idx}">${fileName}</button>`;
        darkContentsHtml += `
            <div class="tab-content ${activeClass}" id="darkContent_${idx}">
                <div class="chart-wrap"><canvas id="dark_${idx}"></canvas></div>
                <div class="card-footer" id="darkStats_${idx}"></div>
            </div>
        `;
    });
    darkTabsHtml += '</div>';

    // Генерация вкладок Olimpus
    let olimpusTabsHtml = '<div class="tabs">';
    let olimpusContentsHtml = '';
    CONFIG.olimpusFiles.forEach((file, idx) => {
        const fileName = file.replace('.csv', '');
        const activeClass = idx === 0 ? 'active' : '';
        olimpusTabsHtml += `<button class="tab-btn ${activeClass}" data-section="olimpus" data-tab="${idx}">${fileName}</button>`;
        olimpusContentsHtml += `
            <div class="tab-content ${activeClass}" id="olimpusContent_${idx}">
                <div class="chart-wrap"><canvas id="olimpus_${idx}"></canvas></div>
                <div class="card-footer" id="olimpusStats_${idx}"></div>
            </div>
        `;
    });
    olimpusTabsHtml += '</div>';

    const html = `
    <div id="cyclesDashboard" style="margin: 50px auto 20px; max-width: 1400px; padding: 0 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 28px;">📊 WSL Analytics</h2>
            <p style="color:#64748b;">All players · Events in tabs · All cycles for Rare/Epic with dates</p>
        </div>
        <div class="double-card2">
        <div class="card">
            <h3 style="color:#e2e8f0; margin-top:0;">🌑 Dark Omens</h3>
            ${darkTabsHtml}
            <div class="tab-contents">${darkContentsHtml}</div>
        </div>

        <div class="card">
            <h3 style="color:#e2e8f0; margin-top:0;">🏛️ Olimpus</h3>
            ${olimpusTabsHtml}
            <div class="tab-contents">${olimpusContentsHtml}</div>
        </div>
        </div>

<div class="double-card">
    <div class="card" id="rareCardPlaceholder"><div class="card-header"><span>💎</span> Rare Crypts – cycles</div><div style="padding:20px; text-align:center;">Loading...</div></div>
    <div class="card" id="epicCardPlaceholder"><div class="card-header"><span>🔥</span> Epic Crypts – cycles</div><div style="padding:20px; text-align:center;">Loading...</div></div>
</div>
    </div>
    <style>
        /* Вкладки */
        .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #1f2937; padding-bottom: 10px; }
        .tab-btn { background: #1e293b; border: none; padding: 6px 14px; border-radius: 20px; color: #94a3b8; cursor: pointer; font-size: 0.85rem; transition: 0.2s; }
        .tab-btn.active { background: #0ea5e9; color: white; }
        .tab-btn:hover:not(.active) { background: #334155; color: #e2e8f0; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .section { margin-bottom: 40px; background: #0f172a; border-radius: 24px; padding: 20px; border: 1px solid #1f2937; }
        .double-card { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 20px; }
        .double-card2 { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 20px; }
        .card { background: #111827; border-radius: 24px; border: 1px solid #1f2937; overflow: hidden; transition: 0.2s; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        .card-header { font-size: 1.2rem; font-weight: bold; padding: 12px 18px; background: #0f172a; border-bottom: 1px solid #1f2937; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }
        .chart-wrap { height: 2400px; overflow-y: auto; padding: 10px 8px; }
        .chart-wrap canvas { width: 100%; height: auto; }
        .chart-wrap::-webkit-scrollbar { width: 6px; background: #1e293b; }
        .chart-wrap::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .card-footer { padding: 8px 16px; background: #0f172a; border-top: 1px solid #1f2937; font-size: 0.8rem; color: #94a3b8; text-align: center; }
        .period-info { padding: 5px 16px 10px; background: #0f172a; font-size: 0.7rem; color: #64748b; text-align: center; border-top: 1px solid #1f2937; }
        @media (max-width: 800px) { .double-card { grid-template-columns: 1fr; } .double-card2 { grid-template-columns: 1fr; } }
    </style>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    const target = document.getElementById('dashboard') || document.body;
    target.insertAdjacentElement('afterend', div);

    // Логика переключения вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('.section');
            if (!section) return;
            const tabIdx = btn.dataset.tab;
            const sectionType = btn.dataset.section; // 'dark' или 'olimpus'
            // Снимаем активность со всех кнопок и контентов в этой секции
            section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            section.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const contentId = sectionType === 'dark' ? `darkContent_${tabIdx}` : `olimpusContent_${tabIdx}`;
            const activeContent = section.querySelector(`#${contentId}`);
            if (activeContent) activeContent.classList.add('active');
        });
    });
}

    // ----- ПАРСИНГ CSV ДЛЯ СОБЫТИЙ -----
    async function fetchEventData(url) {
        try {
            const resp = await fetch(url + '?v=' + Date.now());
            if (!resp.ok) return null;
            const text = await resp.text();
            const lines = text.trim().split(/\r?\n/);
            if (lines.length < 2) return null;
            const delim = ';';
            const headers = lines[0].split(delim).map(s => s.trim());
            let playerIdx = -1, pointsIdx = -1;
            for (let i = 0; i < headers.length; i++) {
                const h = headers[i].toLowerCase();
                if (h === 'clanmate' || h === 'player' || h === 'name') playerIdx = i;
                if (h === 'points' || h === 'total' || h === 'score') pointsIdx = i;
            }
            if (playerIdx === -1 || pointsIdx === -1) return null;
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(delim);
                if (row.length <= Math.max(playerIdx, pointsIdx)) continue;
                const player = row[playerIdx].trim();
                if (player.toLowerCase() === 'total') continue;
                const points = parseFloat(row[pointsIdx]);
                if (player && !isNaN(points) && points > 0) result.push({ player, points });
            }
            return result;
        } catch (e) { return null; }
    }

    // Загрузка одного события
    async function loadSingleEvent(folder, file) {
        const data = await fetchEventData(`${folder}/${file}`);
        if (!data) return [];
        const map = new Map();
        for (const row of data) map.set(row.player, (map.get(row.player) || 0) + row.points);
        const arr = Array.from(map.entries()).map(([p, pts]) => ({ player: p, points: pts }));
        arr.sort((a,b) => b.points - a.points);
        return arr;
    }

function generateCycles(startDate, cycleDays, maxDate) {
    const cycles = [];
    let currentStart = new Date(startDate);
    const endLimit = maxDate ? new Date(maxDate) : new Date();
    while (currentStart <= endLimit) {
        const cycleEnd = new Date(currentStart);
        cycleEnd.setDate(cycleEnd.getDate() + cycleDays - 1);
        cycles.push({
            start: new Date(currentStart),
            end: cycleEnd,
            label: `${currentStart.toISOString().slice(0,10)} – ${cycleEnd.toISOString().slice(0,10)}`
        });
        currentStart.setDate(currentStart.getDate() + cycleDays);
    }
    return cycles;
}

   async function loadRareEpicByCycles() {
    if (typeof window.loadAllChestsByRange !== 'function') return { rareCycles: [], epicCycles: [] };
    
    const start = new Date(CONFIG.startDate);
    const end = new Date();
    const allEntries = await window.loadAllChestsByRange(start, end);
    if (!allEntries.length) return { rareCycles: [], epicCycles: [] };

    // Определяем максимальную дату в данных
    let maxDate = start;
    for (const e of allEntries) {
        if (e.date && new Date(e.date) > maxDate) maxDate = new Date(e.date);
    }
    const cycles = generateCycles(start, CONFIG.cycleDays, maxDate);

    const rareCycles = [];
    const epicCycles = [];

    for (let ci = 0; ci < cycles.length; ci++) {
        const cycle = cycles[ci];
        const rareMap = new Map();
        const epicMap = new Map();
        for (const e of allEntries) {
            const eDate = new Date(e.date);
            if (eDate >= cycle.start && eDate <= cycle.end) {
                const src = e.sourceRaw.toLowerCase();
                if (src.includes('rare crypt')) rareMap.set(e.player, (rareMap.get(e.player) || 0) + e.points);
                else if (src.includes('epic crypt')) epicMap.set(e.player, (epicMap.get(e.player) || 0) + e.points);
            }
        }
        // Преобразуем карты в сортированные массивы
        const rarePlayers = Array.from(rareMap.entries())
            .map(([player, points]) => ({ player, points }))
            .sort((a,b) => b.points - a.points);
        const epicPlayers = Array.from(epicMap.entries())
            .map(([player, points]) => ({ player, points }))
            .sort((a,b) => b.points - a.points);
        
        rareCycles.push({
            cycleLabel: cycle.label,
            players: rarePlayers
        });
        epicCycles.push({
            cycleLabel: cycle.label,
            players: epicPlayers
        });
    }
    return { rareCycles, epicCycles };
}

function renderCycleChart(canvasId, players, threshold, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    // Если для этого canvas уже есть график – удаляем
    if (charts[canvasId]) {
        charts[canvasId].destroy();
        delete charts[canvasId];
    }
    if (!players || players.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.fillText('No data', 10, 30);
        return;
    }
    // Используем ту же логику, что и в drawHorizontalBar, но с нумерацией
    const labels = players.map((p, idx) => `${idx+1}. ${p.player}`);
    const points = players.map(p => p.points);
    const colors = points.map(p => p >= threshold ? '#10b981' : '#ef4444');
    const barHeight = 36;
    const totalHeight = players.length * barHeight + 60;
    canvas.height = totalHeight;
    canvas.style.height = `${totalHeight}px`;
    canvas.width = canvas.parentElement.clientWidth - 24;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label, data: points, backgroundColor: colors, borderRadius: 6, barPercentage: 0.85, categoryPercentage: 0.9 }] },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw} points` } } },
            scales: {
                x: { title: { display: true, text: 'Points', color: '#94a3b8' }, grid: { color: '#334155' }, ticks: { color: '#cbd5e1' } },
                y: { ticks: { color: '#cbd5e1', font: { size: 10 }, stepSize: 1, autoSkip: false }, grid: { display: false } }
            }
        }
    });
    charts[canvasId] = chart;
    // Линия порога
    const originalDraw = chart.draw;
    chart.draw = function() {
        originalDraw.apply(this, arguments);
        const xAxis = this.scales.x;
        if (!xAxis || !this.chartArea) return;
        const thresholdX = xAxis.getPixelForValue(threshold);
        if (isFinite(thresholdX)) {
            const ctx = this.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(thresholdX, this.chartArea.top);
            ctx.lineTo(thresholdX, this.chartArea.bottom);
            ctx.strokeStyle = '#f59e0b';
            ctx.setLineDash([6, 8]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`${threshold}`, thresholdX + 5, this.chartArea.top - 12);
            ctx.restore();
        }
    };
    chart.draw();
}

    // ----- ОБЩАЯ ФУНКЦИЯ ДЛЯ ГОРИЗОНТАЛЬНОГО БАРЧАРТА -----
    function drawHorizontalBar(canvasId, items, threshold, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
            delete charts[canvasId];
        }
        if (!items || items.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Arial';
            ctx.fillText('No data', 10, 30);
            return;
        }
        // Формируем метки: если есть поле cycleLabel, то "Player – CycleLabel", иначе "Player"
        const labels = items.map((item, idx) => {
            if (item.cycleLabel) return `${idx+1}. ${item.player} – ${item.cycleLabel}`;
            return `${idx+1}. ${item.player}`;
        });
        const points = items.map(item => item.points);
        const colors = points.map(p => p >= threshold ? '#10b981' : '#ef4444');

        const barHeight = 36;
        const totalHeight = items.length * barHeight + 60;
        canvas.height = totalHeight;
        canvas.style.height = `${totalHeight}px`;
        canvas.width = canvas.parentElement.clientWidth - 24;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label, data: points, backgroundColor: colors, borderRadius: 6, barPercentage: 0.85, categoryPercentage: 0.9 }] },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw} points` } } },
                scales: {
                    x: { title: { display: true, text: 'Points', color: '#94a3b8' }, grid: { color: '#334155' }, ticks: { color: '#cbd5e1' } },
                    y: { ticks: { color: '#cbd5e1', font: { size: 10 }, stepSize: 1, autoSkip: false }, grid: { display: false } }
                }
            }
        });
        charts[canvasId] = chart;

        // Линия порога
        const originalDraw = chart.draw;
        chart.draw = function() {
            originalDraw.apply(this, arguments);
            const xAxis = this.scales.x;
            if (!xAxis || !this.chartArea) return;
            const thresholdX = xAxis.getPixelForValue(threshold);
            if (isFinite(thresholdX)) {
                const ctx = this.ctx;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(thresholdX, this.chartArea.top);
                ctx.lineTo(thresholdX, this.chartArea.bottom);
                ctx.strokeStyle = '#f59e0b';
                ctx.setLineDash([6, 8]);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 24px Arial';
                ctx.fillText(`${threshold}`, thresholdX + 5, this.chartArea.top - 12);
                ctx.restore();
            }
        };
        chart.draw();
    }

    function updateStats(elementId, items, threshold) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!items || !items.length) { el.innerHTML = '📭 No data'; return; }
        const done = items.filter(item => item.points >= threshold).length;
        const percent = Math.round(done / items.length * 100);
        el.innerHTML = `👥 Total rows: ${items.length} &nbsp;|&nbsp; ✅ Achieved (≥${threshold}): ${done} (${percent}%)`;
    }

    async function refreshAll() {
        console.log('🔄 Updating dashboard...');
        try {
            // Dark Omens – отдельные графики
            for (let i = 0; i < CONFIG.darkOmensFiles.length; i++) {
                const file = CONFIG.darkOmensFiles[i];
                const data = await loadSingleEvent(CONFIG.darkOmensFolder, file);
                const threshold = CONFIG.thresholds.darkOmensEvents[i];
                drawHorizontalBar(`dark_${i}`, data, threshold, `Dark Omens points`);
                updateStats(`darkStats_${i}`, data, threshold);
            }
            // Olimpus
            for (let i = 0; i < CONFIG.olimpusFiles.length; i++) {
                const file = CONFIG.olimpusFiles[i];
                const data = await loadSingleEvent(CONFIG.olimpusFolder, file);
                const threshold = CONFIG.thresholds.olimpusEvents[i];
                drawHorizontalBar(`olimpus_${i}`, data, threshold, `Olimpus points`);
                updateStats(`olimpusStats_${i}`, data, threshold);
            }
            // Rare / Epic с циклами
           // Вместо старых вызовов drawHorizontalBar для rareCanvas / epicCanvas
const { rareCycles, epicCycles } = await loadRareEpicByCycles();

// Генерация HTML для вкладок Rare
let rareTabsHtml = '<div class="tabs">';
let rareContentsHtml = '';
rareCycles.forEach((cycle, idx) => {
    const activeClass = idx === 0 ? 'active' : '';
    rareTabsHtml += `<button class="tab-btn rare-tab ${activeClass}" data-rare-tab="${idx}">${cycle.cycleLabel}</button>`;
    rareContentsHtml += `
        <div class="tab-content ${activeClass}" id="rareContent_${idx}">
            <div class="chart-wrap"><canvas id="rareCanvas_${idx}"></canvas></div>
            <div class="card-footer" id="rareStats_${idx}"></div>
        </div>
    `;
});
rareTabsHtml += '</div>';

// Аналогично для Epic
let epicTabsHtml = '<div class="tabs">';
let epicContentsHtml = '';
epicCycles.forEach((cycle, idx) => {
    const activeClass = idx === 0 ? 'active' : '';
    epicTabsHtml += `<button class="tab-btn epic-tab ${activeClass}" data-epic-tab="${idx}">${cycle.cycleLabel}</button>`;
    epicContentsHtml += `
        <div class="tab-content ${activeClass}" id="epicContent_${idx}">
            <div class="chart-wrap"><canvas id="epicCanvas_${idx}"></canvas></div>
            <div class="card-footer" id="epicStats_${idx}"></div>
        </div>
    `;
});
epicTabsHtml += '</div>';

// Обновляем DOM: находим контейнеры Rare/Epic и заменяем их содержимое
const rareContainer = document.querySelector('#cyclesDashboard .double-card .card:first-child');
const epicContainer = document.querySelector('#cyclesDashboard .double-card .card:last-child');
if (rareContainer) {
    rareContainer.innerHTML = `
        <div class="card-header"><span>💎</span> Rare Crypts – cycles</div>
        ${rareTabsHtml}
        <div class="tab-contents">${rareContentsHtml}</div>
    `;
}
if (epicContainer) {
    epicContainer.innerHTML = `
        <div class="card-header"><span>🔥</span> Epic Crypts – cycles</div>
        ${epicTabsHtml}
        <div class="tab-contents">${epicContentsHtml}</div>
    `;
}

// Отрисовываем первый (активный) график для каждого типа
if (rareCycles.length) {
    renderCycleChart(`rareCanvas_0`, rareCycles[0].players, CONFIG.thresholds.rare, 'Rare Crypt points');
    updateStats(`rareStats_0`, rareCycles[0].players, CONFIG.thresholds.rare);
}
if (epicCycles.length) {
    renderCycleChart(`epicCanvas_0`, epicCycles[0].players, CONFIG.thresholds.epic, 'Epic Crypt points');
    updateStats(`epicStats_0`, epicCycles[0].players, CONFIG.thresholds.epic);
}

// Переключатели для Rare вкладок
document.querySelectorAll('.rare-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const idx = btn.dataset.rareTab;
        const container = btn.closest('.card');
        container.querySelectorAll('.rare-tab').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const activeContent = container.querySelector(`#rareContent_${idx}`);
        if (activeContent) activeContent.classList.add('active');
        const cycleData = rareCycles[idx];
        if (cycleData) {
            renderCycleChart(`rareCanvas_${idx}`, cycleData.players, CONFIG.thresholds.rare, 'Rare Crypt points');
            updateStats(`rareStats_${idx}`, cycleData.players, CONFIG.thresholds.rare);
        }
    });
});

// Переключатели для Epic вкладок
document.querySelectorAll('.epic-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const idx = btn.dataset.epicTab;
        const container = btn.closest('.card');
        container.querySelectorAll('.epic-tab').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const activeContent = container.querySelector(`#epicContent_${idx}`);
        if (activeContent) activeContent.classList.add('active');
        const cycleData = epicCycles[idx];
        if (cycleData) {
            renderCycleChart(`epicCanvas_${idx}`, cycleData.players, CONFIG.thresholds.epic, 'Epic Crypt points');
            updateStats(`epicStats_${idx}`, cycleData.players, CONFIG.thresholds.epic);
        }
    });
});
        } catch (err) { console.error(err); }
    }

    function hookUpdates() {
        if (window.renderTableFromEntries) {
            const orig = window.renderTableFromEntries;
            window.renderTableFromEntries = function(e) { orig(e); setTimeout(refreshAll, 200); };
        }
        if (window.loadByCustomRange) {
            const origLoad = window.loadByCustomRange;
            window.loadByCustomRange = async function() { await origLoad(); setTimeout(refreshAll, 300); };
        }
    }

    function init() {
        createDashboard();
        setTimeout(() => { refreshAll(); hookUpdates(); }, 500);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();