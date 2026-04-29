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

    // ----- СОЗДАНИЕ DOM (гибкая структура с отдельными карточками для каждого события) -----
    function createDashboard() {
        if (document.getElementById('cyclesDashboard')) return;

        // Генерация HTML для Dark Omens событий
        let darkHtml = '';
        CONFIG.darkOmensFiles.forEach((file, idx) => {
            const fileName = file.replace('.csv', '');
            darkHtml += `
                <div class="event-card">
                    <div class="card-header"><span>🌑</span> Dark Omens – ${fileName}</div>
                    <div class="chart-wrap"><canvas id="dark_${idx}"></canvas></div>
                    <div class="card-footer" id="darkStats_${idx}"></div>
                </div>
            `;
        });

        // Генерация HTML для Olimpus событий
        let olimpusHtml = '';
        CONFIG.olimpusFiles.forEach((file, idx) => {
            const fileName = file.replace('.csv', '');
            olimpusHtml += `
                <div class="event-card">
                    <div class="card-header"><span>🏛️</span> Olimpus – ${fileName}</div>
                    <div class="chart-wrap"><canvas id="olimpus_${idx}"></canvas></div>
                    <div class="card-footer" id="olimpusStats_${idx}"></div>
                </div>
            `;
        });

        const html = `
        <div id="cyclesDashboard" style="margin: 50px auto 20px; max-width: 1400px; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 28px;">📊 WSL Analytics</h2>
                <p style="color:#64748b;">All players · Each event separately · All cycles for Rare/Epic</p>
            </div>

            <div style="margin-bottom: 40px;">
                <h3 style="color:#e2e8f0;">🌑 Dark Omens</h3>
                <div class="events-grid">${darkHtml}</div>
            </div>

            <div style="margin-bottom: 40px;">
                <h3 style="color:#e2e8f0;">🏛️ Olimpus</h3>
                <div class="events-grid">${olimpusHtml}</div>
            </div>

            <div class="double-card">
                <div class="card"><div class="card-header"><span>💎</span> Rare Crypts – all cycles</div><div class="chart-wrap"><canvas id="rareCanvas"></canvas></div><div class="card-footer" id="rareStats"></div><div class="period-info" id="rarePeriod"></div></div>
                <div class="card"><div class="card-header"><span>🔥</span> Epic Crypts – all cycles</div><div class="chart-wrap"><canvas id="epicCanvas"></canvas></div><div class="card-footer" id="epicStats"></div><div class="period-info" id="epicPeriod"></div></div>
            </div>
        </div>
        <style>
            .events-grid { display: flex; flex-direction: column; gap: 25px; }
            .event-card, .card { background: #111827; border-radius: 24px; border: 1px solid #1f2937; overflow: hidden; transition: 0.2s; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
            .double-card { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 20px; }
            .card-header { font-size: 1.2rem; font-weight: bold; padding: 12px 18px; background: #0f172a; border-bottom: 1px solid #1f2937; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }
            .chart-wrap { height: 2400px; overflow-y: auto; padding: 10px 8px; }
            .chart-wrap canvas { width: 100%; height: auto; }
            .chart-wrap::-webkit-scrollbar { width: 6px; background: #1e293b; }
            .chart-wrap::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
            .card-footer { padding: 8px 16px; background: #0f172a; border-top: 1px solid #1f2937; font-size: 0.8rem; color: #94a3b8; text-align: center; }
            .period-info { padding: 5px 16px 10px; background: #0f172a; font-size: 0.7rem; color: #64748b; text-align: center; border-top: 1px solid #1f2937; }
            @media (max-width: 800px) { .double-card { grid-template-columns: 1fr; } }
        </style>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        const target = document.getElementById('dashboard') || document.body;
        target.insertAdjacentElement('afterend', div);
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

    // ----- ГЕНЕРАЦИЯ ЦИКЛОВ ДЛЯ RARE/EPIC -----
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
                label: `Cycle ${cycles.length+1}`
            });
            currentStart.setDate(currentStart.getDate() + cycleDays);
        }
        return cycles;
    }

    async function loadRareEpicByCycles() {
        if (typeof window.loadAllChestsByRange !== 'function') return { rare: [], epic: [] };
        // Определяем максимальную дату в данных (загрузим все сундуки от startDate до сегодня)
        const start = new Date(CONFIG.startDate);
        const end = new Date();
        const allEntries = await window.loadAllChestsByRange(start, end);
        if (!allEntries.length) return { rare: [], epic: [] };

        // Находим максимальную дату среди записей (нужна для ограничения циклов)
        let maxDate = start;
        for (const e of allEntries) {
            if (e.date && new Date(e.date) > maxDate) maxDate = new Date(e.date);
        }
        const cycles = generateCycles(start, CONFIG.cycleDays, maxDate);

        // Для каждого цикла собираем очки rare/epic по игрокам
        const rareCyclesData = [];  // массив объектов: { cycleIndex, player, points }
        const epicCyclesData = [];

        for (let ci = 0; ci < cycles.length; ci++) {
            const cycle = cycles[ci];
            const rareMap = new Map(), epicMap = new Map();
            // Фильтруем записи, попадающие в цикл
            for (const e of allEntries) {
                const eDate = new Date(e.date);
                if (eDate >= cycle.start && eDate <= cycle.end) {
                    const src = e.sourceRaw.toLowerCase();
                    if (src.includes('rare crypt')) rareMap.set(e.player, (rareMap.get(e.player) || 0) + e.points);
                    else if (src.includes('epic crypt')) epicMap.set(e.player, (epicMap.get(e.player) || 0) + e.points);
                }
            }
            // Преобразуем в массив и добавляем метку цикла
            for (const [player, points] of rareMap) rareCyclesData.push({ player, cycle: ci, cycleLabel: cycle.label, points });
            for (const [player, points] of epicMap) epicCyclesData.push({ player, cycle: ci, cycleLabel: cycle.label, points });
        }

        // Сортируем: сначала все записи для игрока по убыванию суммы по циклам? лучше сгруппировать для отображения.
        // Для графика нам нужен массив объектов с полями player, cycleLabel, points
        // Сначала соберём всех игроков и все циклы, чтобы создать строки "Player – Cycle X"
        const rareResult = [];
        const epicResult = [];
        // Группируем по игроку и циклу, чтобы не дублировать
        const rareMapAll = new Map(); // key: "player|cycleLabel"
        for (const item of rareCyclesData) {
            const key = `${item.player}|${item.cycleLabel}`;
            rareMapAll.set(key, { player: item.player, cycleLabel: item.cycleLabel, points: item.points });
        }
        for (const item of rareMapAll.values()) rareResult.push(item);
        const epicMapAll = new Map();
        for (const item of epicCyclesData) {
            const key = `${item.player}|${item.cycleLabel}`;
            epicMapAll.set(key, { player: item.player, cycleLabel: item.cycleLabel, points: item.points });
        }
        for (const item of epicMapAll.values()) epicResult.push(item);

        // Сортировка: сначала по игроку (по сумме очков за все циклы, чтобы сильные игроки были сверху), затем по циклу
        // Сначала вычислим общую сумму очков по игроку для Rare
        const rarePlayerTotal = new Map();
        rareResult.forEach(r => rarePlayerTotal.set(r.player, (rarePlayerTotal.get(r.player) || 0) + r.points));
        rareResult.sort((a,b) => {
            if (rarePlayerTotal.get(b.player) !== rarePlayerTotal.get(a.player)) return rarePlayerTotal.get(b.player) - rarePlayerTotal.get(a.player);
            return a.cycleLabel.localeCompare(b.cycleLabel);
        });
        const epicPlayerTotal = new Map();
        epicResult.forEach(r => epicPlayerTotal.set(r.player, (epicPlayerTotal.get(r.player) || 0) + r.points));
        epicResult.sort((a,b) => {
            if (epicPlayerTotal.get(b.player) !== epicPlayerTotal.get(a.player)) return epicPlayerTotal.get(b.player) - epicPlayerTotal.get(a.player);
            return a.cycleLabel.localeCompare(b.cycleLabel);
        });

        return { rare: rareResult, epic: epicResult, cycles };
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
                ctx.font = 'bold 10px Arial';
                ctx.fillText(`${threshold}`, thresholdX + 5, this.chartArea.top + 12);
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
            const { rare, epic, cycles } = await loadRareEpicByCycles();
            drawHorizontalBar('rareCanvas', rare, CONFIG.thresholds.rare, 'Rare Crypt points');
            drawHorizontalBar('epicCanvas', epic, CONFIG.thresholds.epic, 'Epic Crypt points');
            updateStats('rareStats', rare, CONFIG.thresholds.rare);
            updateStats('epicStats', epic, CONFIG.thresholds.epic);
            // Отобразить информацию о периодах циклов
            const periodInfo = cycles.map(c => `${c.label}: ${c.start.toISOString().slice(0,10)} – ${c.end.toISOString().slice(0,10)}`).join('; ');
            const rarePeriodDiv = document.getElementById('rarePeriod');
            const epicPeriodDiv = document.getElementById('epicPeriod');
            if (rarePeriodDiv) rarePeriodDiv.innerText = `Cycles: ${periodInfo}`;
            if (epicPeriodDiv) epicPeriodDiv.innerText = `Cycles: ${periodInfo}`;
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