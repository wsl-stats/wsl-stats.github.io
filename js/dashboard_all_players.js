/**
 * dashboard_pretty.js – 4 красивых графика для всех игроков
 * Все настройки – внизу файла (константы CONFIG)
 */

(function() {
    // ===================== НАСТРОЙКИ (меняйте здесь) =====================
    const CONFIG = {
        // 🔽 Период для Rare / Epic сундуков (дней от текущей даты назад)
        rareEpicDays: 24,
        // 🔽 Минимальные очки для выполнения нормы
        thresholds: {
            rare: 100,         // Rare Crypts
            epic: 200,         // Epic Crypts
            darkOmens: 500,    // Dark Omens
            olimpus: 500       // Olimpus
        },
        // 🔽 Пути к файлам событий (такие же, как в оригинальном index.html)
        olimpusFiles: ["04032026-09032026.csv", "29032026-02042026.csv", "21042026-26042026.csv"],
        darkOmensFiles: ["24022026-25022026.csv", "20032026-21032026.csv", "13042026-14042026.csv"],
        // 🔽 Названия папок (относительно корня)
        olimpusFolder: "Olimpus",
        darkOmensFolder: "Dark omens"
    };
    // ====================================================================

    // Глобальный объект для графиков (чтобы перерисовывать)
    let activeCharts = {};

    // Создаём контейнер дашборда
    function createDashboardContainer() {
        if (document.getElementById('prettyDashboard')) return;

        const html = `
        <div id="prettyDashboard" style="margin: 50px auto 20px; max-width: 1400px; padding: 0 16px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 28px;">📊 Аналитический центр WSL</h2>
                <p style="color:#64748b;">Сводка по всем игрокам</p>
            </div>
            <div class="dashboard-grid">
                <div class="card" data-type="dark">
                    <div class="card-header"><span class="icon">🌑</span> Dark Omens</div>
                    <div class="chart-wrapper"><canvas id="darkCanvas"></canvas></div>
                    <div class="card-footer" id="darkStats"></div>
                </div>
                <div class="card" data-type="olimpus">
                    <div class="card-header"><span class="icon">🏛️</span> Olimpus</div>
                    <div class="chart-wrapper"><canvas id="olimpusCanvas"></canvas></div>
                    <div class="card-footer" id="olimpusStats"></div>
                </div>
                <div class="card" data-type="rare">
                    <div class="card-header"><span class="icon">💎</span> Rare Crypts</div>
                    <div class="chart-wrapper"><canvas id="rareCanvas"></canvas></div>
                    <div class="card-footer" id="rareStats"></div>
                </div>
                <div class="card" data-type="epic">
                    <div class="card-header"><span class="icon">🔥</span> Epic Crypts</div>
                    <div class="chart-wrapper"><canvas id="epicCanvas"></canvas></div>
                    <div class="card-footer" id="epicStats"></div>
                </div>
            </div>
        </div>
        <style>
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
            }
            .card {
                background: linear-gradient(145deg, #111827 0%, #0f172a 100%);
                border-radius: 28px;
                border: 1px solid #1e293b;
                overflow: hidden;
                transition: all 0.25s ease;
                box-shadow: 0 12px 24px rgba(0,0,0,0.4);
            }
            .card:hover {
                transform: translateY(-4px);
                border-color: #334155;
                box-shadow: 0 20px 32px rgba(0,0,0,0.5);
            }
            .card-header {
                font-size: 1.4rem;
                font-weight: bold;
                padding: 16px 20px;
                background: rgba(15, 23, 42, 0.7);
                border-bottom: 1px solid #1e293b;
                color: #e2e8f0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .icon {
                font-size: 1.6rem;
            }
            .chart-wrapper {
                height: 400px;
                overflow-y: auto;
                padding: 12px 8px 8px 8px;
            }
            .chart-wrapper canvas {
                width: 100%;
                height: auto;
                min-height: 600px; /* будет переопределяться скриптом */
            }
            .chart-wrapper::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .chart-wrapper::-webkit-scrollbar-track {
                background: #1e293b;
                border-radius: 8px;
            }
            .chart-wrapper::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 8px;
            }
            .card-footer {
                padding: 12px 20px;
                background: #0f172a;
                border-top: 1px solid #1e293b;
                font-size: 0.85rem;
                color: #94a3b8;
                text-align: center;
            }
            @media (max-width: 800px) {
                .dashboard-grid { grid-template-columns: 1fr; }
            }
        </style>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        const target = document.getElementById('TableWrap') || document.body;
        target.insertAdjacentElement('afterend', container);
    }

    // ---------- ЗАГРУЗКА ДАННЫХ ----------
    async function loadEventPoints(folder, files) {
        const points = new Map();
        for (const file of files) {
            try {
                const resp = await fetch(`${folder}/${file}?v=${Date.now()}`);
                if (!resp.ok) continue;
                const text = await resp.text();
                const { headers, rows } = parseCSV(text);
                const playerCol = findColumn(headers, ['Player', 'Name', 'Игрок']);
                const pointsCol = findColumn(headers, ['Total', 'Points', 'Score', 'Очки', 'Баллы']);
                if (playerCol === -1 || pointsCol === -1) continue;
                for (const row of rows) {
                    const player = row[playerCol]?.trim();
                    const pts = parseFloat(row[pointsCol]);
                    if (player && !isNaN(pts) && pts > 0) {
                        points.set(player, (points.get(player) || 0) + pts);
                    }
                }
            } catch(e) { /* тихо */ }
        }
        const result = Array.from(points.entries()).map(([p, pts]) => ({ player: p, points: pts }));
        result.sort((a,b) => b.points - a.points);
        return result;
    }

    async function loadRareEpicPoints() {
        if (typeof window.loadAllChestsByRange !== 'function') {
            console.warn('loadAllChestsByRange not found');
            return { rare: [], epic: [] };
        }
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - CONFIG.rareEpicDays);
        const entries = await window.loadAllChestsByRange(startDate, endDate);
        const rareMap = new Map(), epicMap = new Map();
        for (const e of entries) {
            const src = e.sourceRaw.toLowerCase();
            if (src.includes('rare crypt')) {
                rareMap.set(e.player, (rareMap.get(e.player) || 0) + e.points);
            } else if (src.includes('epic crypt')) {
                epicMap.set(e.player, (epicMap.get(e.player) || 0) + e.points);
            }
        }
        const rare = Array.from(rareMap.entries()).map(([p, pts]) => ({ player: p, points: pts })).sort((a,b)=>b.points - a.points);
        const epic = Array.from(epicMap.entries()).map(([p, pts]) => ({ player: p, points: pts })).sort((a,b)=>b.points - a.points);
        return { rare, epic };
    }

    function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        if (!lines.length) return { headers: [], rows: [] };
        let delim = ',';
        if (lines[0].includes('\t')) delim = '\t';
        else if (lines[0].includes(';')) delim = ';';
        const headers = lines[0].split(delim).map(s=>s.trim());
        const rows = lines.slice(1).map(l=>l.split(delim).map(s=>s.trim()));
        return { headers, rows };
    }

    function findColumn(headers, names) {
        return headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));
    }

    // ---------- ОТРИСОВКА ГОРИЗОНТАЛЬНОГО БАРЧАРТА С ПРОКРУТКОЙ ----------
    function drawHorizontalChart(canvasId, data, threshold, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (activeCharts[canvasId]) {
            activeCharts[canvasId].destroy();
        }
        if (!data || data.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Arial';
            ctx.fillText('Нет данных', 10, 50);
            return;
        }

        const labels = data.map(d => d.player);
        const values = data.map(d => d.points);
        const colors = values.map(v => v >= threshold ? '#10b981' : '#ef4444');

        // авто-высота: 40px на игрока + поля
        const barHeight = 36;
        const totalHeight = data.length * barHeight + 60;
        canvas.height = totalHeight;
        canvas.style.height = `${totalHeight}px`;
        canvas.width = canvas.parentElement.clientWidth - 24;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 8,
                    barPercentage: 0.85,
                    categoryPercentage: 0.9
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} очков` } }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Очки', color: '#94a3b8' },
                        grid: { color: '#334155' },
                        ticks: { color: '#cbd5e1' }
                    },
                    y: {
                        ticks: { color: '#cbd5e1', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
        activeCharts[canvasId] = chart;

        // Рисуем линию порога (через afterDraw)
        const originalDraw = chart.draw;
        chart.draw = function() {
            originalDraw.apply(this, arguments);
            const ctx = this.ctx;
            const xAxis = this.scales.x;
            if (!xAxis) return;
            const thresholdX = xAxis.getPixelForValue(threshold);
            if (thresholdX && isFinite(thresholdX) && this.chartArea) {
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
                ctx.fillText(`норма ${threshold}`, thresholdX + 5, this.chartArea.top + 15);
                ctx.restore();
            }
        };
        chart.draw();
    }

    function updateStatsText(elementId, data, min) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!data || !data.length) {
            el.innerHTML = '📭 Нет данных за период';
            return;
        }
        const completed = data.filter(d => d.points >= min).length;
        const percent = Math.round(completed / data.length * 100);
        el.innerHTML = `👥 Всего: ${data.length} &nbsp;|&nbsp; ✅ Выполнили (≥${min}): ${completed} (${percent}%)`;
    }

    // ---------- ОСНОВНОЙ ЗАПУСК ----------
    async function refreshAll() {
        try {
            // Параллельная загрузка
            const [dark, olimpus, { rare, epic }] = await Promise.all([
                loadEventPoints(CONFIG.darkOmensFolder, CONFIG.darkOmensFiles),
                loadEventPoints(CONFIG.olimpusFolder, CONFIG.olimpusFiles),
                loadRareEpicPoints()
            ]);

            drawHorizontalChart('darkCanvas', dark, CONFIG.thresholds.darkOmens, 'Очки Dark Omens');
            drawHorizontalChart('olimpusCanvas', olimpus, CONFIG.thresholds.olimpus, 'Очки Olimpus');
            drawHorizontalChart('rareCanvas', rare, CONFIG.thresholds.rare, 'Очки Rare Crypt');
            drawHorizontalChart('epicCanvas', epic, CONFIG.thresholds.epic, 'Очки Epic Crypt');

            updateStatsText('darkStats', dark, CONFIG.thresholds.darkOmens);
            updateStatsText('olimpusStats', olimpus, CONFIG.thresholds.olimpus);
            updateStatsText('rareStats', rare, CONFIG.thresholds.rare);
            updateStatsText('epicStats', epic, CONFIG.thresholds.epic);
        } catch(err) {
            console.error(err);
        }
    }

    // Перехватываем обновления оригинальной таблицы (кнопка Search)
    function hookOriginalUpdates() {
        if (typeof window.renderTableFromEntries === 'function') {
            const orig = window.renderTableFromEntries;
            window.renderTableFromEntries = function(e) {
                orig(e);
                setTimeout(refreshAll, 200);
            };
        }
        if (typeof window.loadByCustomRange === 'function') {
            const origLoad = window.loadByCustomRange;
            window.loadByCustomRange = async function() {
                await origLoad();
                setTimeout(refreshAll, 300);
            };
        }
    }

    function init() {
        createDashboardContainer();
        setTimeout(() => {
            refreshAll();
            hookOriginalUpdates();
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();