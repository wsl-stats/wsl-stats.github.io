/**
 * dashboard_stacked.js
 * - Dark Omens / Olimpus: stacked horizontal bar (каждый файл отдельный цвет)
 * - Rare / Epic Crypts: обычные горизонтальные bar
 * - Все игроки, нумерация, английский, период дат
 */

(function() {
    const CONFIG = {
        startDate: "2026-04-03",
        cycleDays: 24,
        thresholds: {
            rare: 2000,
            epic: 2000
            // пороги для событий не используются в stacked, но можно оставить для статистики
        },
        olimpusFiles: ["04032026-09032026.csv", "29032026-02042026.csv", "21042026-26042026.csv"],
        darkOmensFiles: ["24022026-25022026.csv", "20032026-21032026.csv", "13042026-14042026.csv"],
        olimpusFolder: "Olimpus",
        darkOmensFolder: "Dark omens"
    };

    let charts = {};

    function createDashboard() {
        if (document.getElementById('finalDashboard')) return;
        const html = `
        <div id="finalDashboard" style="margin: 50px auto 20px; max-width: 1400px; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 28px;">📊 WSL Analytics</h2>
                <p style="color:#64748b;">All players · Rare/Epic chests · Tournament results (stacked by event)</p>
            </div>
            <div class="grid">
                <div class="card"><div class="card-header"><span>🌑</span> Dark Omens (by event)</div><div class="chart-wrap"><canvas id="darkCanvas"></canvas></div><div class="card-footer" id="darkStats"></div></div>
                <div class="card"><div class="card-header"><span>🏛️</span> Olimpus (by event)</div><div class="chart-wrap"><canvas id="olimpusCanvas"></canvas></div><div class="card-footer" id="olimpusStats"></div></div>
                <div class="card"><div class="card-header"><span>💎</span> Rare Crypts (total per period)</div><div class="chart-wrap"><canvas id="rareCanvas"></canvas></div><div class="card-footer" id="rareStats"></div><div class="period-info" id="rarePeriod"></div></div>
                <div class="card"><div class="card-header"><span>🔥</span> Epic Crypts (total per period)</div><div class="chart-wrap"><canvas id="epicCanvas"></canvas></div><div class="card-footer" id="epicStats"></div><div class="period-info" id="epicPeriod"></div></div>
            </div>
        </div>
        <style>
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; }
            .card { background: #111827; border-radius: 24px; border: 1px solid #1f2937; overflow: hidden; transition: 0.2s; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
            .card:hover { transform: translateY(-3px); border-color: #374151; }
            .card-header { font-size: 1.3rem; font-weight: bold; padding: 14px 18px; background: #0f172a; border-bottom: 1px solid #1f2937; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }
            .card-header span:first-child { font-size: 1.5rem; }
            .chart-wrap { height: 1600px; overflow-y: auto; padding: 10px 8px; }
            .chart-wrap canvas { width: 100%; height: auto; }
            .chart-wrap::-webkit-scrollbar { width: 6px; background: #1e293b; }
            .chart-wrap::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
            .card-footer { padding: 10px 16px; background: #0f172a; border-top: 1px solid #1f2937; font-size: 0.8rem; color: #94a3b8; text-align: center; }
            .period-info { padding: 5px 16px 12px; background: #0f172a; font-size: 0.7rem; color: #64748b; text-align: center; border-top: 1px solid #1f2937; }
            @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
        </style>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        const target = document.getElementById('dashboard') || document.body;
        target.insertAdjacentElement('afterend', div);
    }

    // ---------- CSV парсинг для событий (возвращает массив объектов по каждому файлу) ----------
    async function fetchAndParseEventCSV(url, fileName) {
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
            // Запоминаем имя файла (будет использовано как ключ)
            return { fileName: fileName.replace('.csv', ''), data: result };
        } catch (e) { return null; }
    }

    // Загрузка всех событий папки: возвращает массив объектов { fileName, players: Map(player->points) }
    async function loadEventsSeparate(folder, files) {
        const eventsData = [];
        for (const file of files) {
            const parsed = await fetchAndParseEventCSV(`${folder}/${file}`, file);
            if (parsed) {
                const map = new Map();
                for (const row of parsed.data) {
                    map.set(row.player, (map.get(row.player) || 0) + row.points);
                }
                eventsData.push({ fileName: parsed.fileName, pointsMap: map });
            } else {
                console.warn(`Failed to load ${folder}/${file}`);
            }
        }
        // Собираем всех игроков (уникальные имена)
        const allPlayersSet = new Set();
        eventsData.forEach(ev => ev.pointsMap.forEach((_, p) => allPlayersSet.add(p)));
        const allPlayers = Array.from(allPlayersSet);
        // Сортируем по сумме очков за все события (чтобы график был упорядочен)
        const totalMap = new Map();
        allPlayers.forEach(p => {
            let total = 0;
            eventsData.forEach(ev => total += ev.pointsMap.get(p) || 0);
            totalMap.set(p, total);
        });
        allPlayers.sort((a,b) => totalMap.get(b) - totalMap.get(a));
        // Для каждого игрока создаём массив очков по событиям
        const playerData = allPlayers.map(player => ({
            player,
            events: eventsData.map(ev => ev.pointsMap.get(player) || 0)
        }));
        return { playerData, eventNames: eventsData.map(ev => ev.fileName) };
    }

    // ---------- Rare/Epic (без изменений) ----------
    async function loadRareEpic() {
        if (typeof window.loadAllChestsByRange !== 'function') return { rare: [], epic: [] };
        const start = new Date(CONFIG.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + CONFIG.cycleDays - 1);
        const entries = await window.loadAllChestsByRange(start, end);
        const rareMap = new Map(), epicMap = new Map();
        for (const e of entries) {
            const src = e.sourceRaw.toLowerCase();
            if (src.includes('rare crypt')) rareMap.set(e.player, (rareMap.get(e.player) || 0) + e.points);
            else if (src.includes('epic crypt')) epicMap.set(e.player, (epicMap.get(e.player) || 0) + e.points);
        }
        const rare = Array.from(rareMap.entries()).map(([p, pts]) => ({ player: p, points: pts })).sort((a,b)=>b.points - a.points);
        const epic = Array.from(epicMap.entries()).map(([p, pts]) => ({ player: p, points: pts })).sort((a,b)=>b.points - a.points);
        return { rare, epic };
    }

    // ---------- Отрисовка stacked horizontal bar ----------
    function drawStackedBarChart(canvasId, playerData, eventNames, labelPrefix) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
            delete charts[canvasId];
        }
        if (!playerData || playerData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Arial';
            ctx.fillText('No data', 10, 30);
            return;
        }
        const labels = playerData.map((d, idx) => `${idx+1}. ${d.player}`);
        const datasets = eventNames.map((name, idx) => {
            const colors = ['#38bdf8', '#a78bfa', '#f59e0b', '#ec489a', '#10b981', '#f97316'];
            return {
                label: name,
                data: playerData.map(p => p.events[idx]),
                backgroundColor: colors[idx % colors.length],
                borderRadius: 0,
                barPercentage: 0.85,
                categoryPercentage: 0.9
            };
        });
        const barHeight = 36;
        const totalHeight = playerData.length * barHeight + 60;
        canvas.height = totalHeight;
        canvas.style.height = `${totalHeight}px`;
        canvas.width = canvas.parentElement.clientWidth - 24;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 10 } } },
                    tooltip: { mode: 'index', callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} points` } }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: 'Points', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#cbd5e1' }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#cbd5e1', font: { size: 10 }, stepSize: 1, autoSkip: false },
                        grid: { display: false }
                    }
                }
            }
        });
        charts[canvasId] = chart;
        chart.draw();
    }

    function drawSimpleBarChart(canvasId, data, threshold, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
            delete charts[canvasId];
        }
        if (!data || data.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Arial';
            ctx.fillText('No data', 10, 30);
            return;
        }
        const labels = data.map((d, idx) => `${idx+1}. ${d.player}`);
        const points = data.map(d => d.points);
        const colors = points.map(p => p >= threshold ? '#10b981' : '#ef4444');
        const barHeight = 36;
        const totalHeight = data.length * barHeight + 60;
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
                ctx.fillText(`Threshold: ${threshold}`, thresholdX + 5, this.chartArea.top + 12);
                ctx.restore();
            }
        };
        chart.draw();
    }

    function updateStats(elementId, data, min, label = '') {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!data || !data.length) { el.innerHTML = '📭 No data'; return; }
        const done = data.filter(d => d.points >= min).length;
        const percent = Math.round(done / data.length * 100);
        el.innerHTML = `👥 Total players: ${data.length} &nbsp;|&nbsp; ✅ Achieved (≥${min}): ${done} (${percent}%)`;
    }

    function updateStackedStats(elementId, playerData, min, eventNames) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!playerData || !playerData.length) { el.innerHTML = '📭 No data'; return; }
        const totalPlayers = playerData.length;
        // Минимум для stacked? Игрок считается выполнившим, если набрал min хотя бы в одном событии? По желанию. Сделаем суммарно >= min
        const totalPoints = playerData.map(p => p.events.reduce((a,b)=>a+b,0));
        const done = totalPoints.filter(sum => sum >= min).length;
        const percent = Math.round(done / totalPlayers * 100);
        el.innerHTML = `👥 Total players: ${totalPlayers} &nbsp;|&nbsp; ✅ Total points ≥${min}: ${done} (${percent}%) | Events: ${eventNames.join(', ')}`;
    }

    function setPeriodInfo() {
        const start = new Date(CONFIG.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + CONFIG.cycleDays - 1);
        const format = d => d.toISOString().slice(0,10);
        const periodStr = `Period: ${format(start)} — ${format(end)} (${CONFIG.cycleDays} days)`;
        const rarePeriod = document.getElementById('rarePeriod');
        const epicPeriod = document.getElementById('epicPeriod');
        if (rarePeriod) rarePeriod.innerText = periodStr;
        if (epicPeriod) epicPeriod.innerText = periodStr;
    }

    async function refreshAll() {
        console.log('🔄 Updating dashboard...');
        try {
            const darkData = await loadEventsSeparate(CONFIG.darkOmensFolder, CONFIG.darkOmensFiles);
            const olimpusData = await loadEventsSeparate(CONFIG.olimpusFolder, CONFIG.olimpusFiles);
            const { rare, epic } = await loadRareEpic();

            drawStackedBarChart('darkCanvas', darkData.playerData, darkData.eventNames, 'Dark Omens');
            drawStackedBarChart('olimpusCanvas', olimpusData.playerData, olimpusData.eventNames, 'Olimpus');
            drawSimpleBarChart('rareCanvas', rare, CONFIG.thresholds.rare, 'Rare Crypt Points');
            drawSimpleBarChart('epicCanvas', epic, CONFIG.thresholds.epic, 'Epic Crypt Points');

            updateStackedStats('darkStats', darkData.playerData, 0, darkData.eventNames);
            updateStackedStats('olimpusStats', olimpusData.playerData, 0, olimpusData.eventNames);
            updateStats('rareStats', rare, CONFIG.thresholds.rare);
            updateStats('epicStats', epic, CONFIG.thresholds.epic);
            setPeriodInfo();
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