/**
 * dashboard_all_players.js – 4 графика для всех игроков:
 * Dark Omens, Olimpus, Rare Crypts, Epic Crypts.
 * Не изменяет исходный код, подключается как дополнение.
 */

(function() {
    // ---------- НАСТРОЙКИ ПО УМОЛЧАНИЮ ----------
    const DEFAULT_DAYS = 24;
    const DEFAULT_RARE_MIN = 100;
    const DEFAULT_EPIC_MIN = 200;
    const DEFAULT_DARK_MIN = 500;
    const DEFAULT_OLIMPUS_MIN = 500;

    // Событийные файлы (из оригинального index.html)
    const OLIMPUS_FILES = ["04032026-09032026.csv", "29032026-02042026.csv", "21042026-26042026.csv"];
    const DARK_OMENS_FILES = ["24022026-25022026.csv", "20032026-21032026.csv", "13042026-14042026.csv"];

    // Глобальные ссылки на графики (чтобы перерисовывать)
    let charts = { dark: null, olimpus: null, rare: null, epic: null };

    // ---------- СОЗДАНИЕ DOM-КОНТЕЙНЕРА ----------
    function createDashboard() {
        if (document.getElementById('allPlayersDashboard')) return;

        const dashboardHtml = `
        <div id="allPlayersDashboard" style="margin-top: 50px; background: #0f172a; border-radius: 28px; border: 1px solid #1f2937; padding: 20px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="background: linear-gradient(135deg, #38bdf8, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 1.8rem;">📊 Аналитика по всем игрокам</h2>
            </div>

            <!-- Панель настроек -->
            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; background: #111827; padding: 20px; border-radius: 20px; margin-bottom: 30px;">
                <div><label style="color:#9ca3af;">📅 Старт (Rare/Epic):</label><br><input type="date" id="dpStartDate" value="${getDefaultStartDate()}" style="background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div><label style="color:#9ca3af;">📆 Период (дней):</label><br><input type="number" id="dpPeriodDays" value="${DEFAULT_DAYS}" style="width:80px; background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div><label style="color:#9ca3af;">🎯 Rare min:</label><br><input type="number" id="dpRareMin" value="${DEFAULT_RARE_MIN}" style="width:90px; background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div><label style="color:#9ca3af;">🎯 Epic min:</label><br><input type="number" id="dpEpicMin" value="${DEFAULT_EPIC_MIN}" style="width:90px; background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div><label style="color:#9ca3af;">🌑 Dark Omens min:</label><br><input type="number" id="dpDarkMin" value="${DEFAULT_DARK_MIN}" style="width:90px; background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div><label style="color:#9ca3af;">🏛️ Olimpus min:</label><br><input type="number" id="dpOlimpusMin" value="${DEFAULT_OLIMPUS_MIN}" style="width:90px; background:#1e293b; border:1px solid #334155; color:white; padding:6px; border-radius:8px;"></div>
                <div style="display: flex; align-items: end;"><button id="dpRefreshBtn" style="background:#0ea5e9; border:none; padding:8px 20px; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">🔄 Обновить</button></div>
            </div>

            <!-- Сетка из 4 графиков (по 2 в ряд) -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
                <div class="graph-card"><h3 style="color:#e2e8f0; margin-top:0;">🌑 Dark Omens</h3><div id="darkOmensGraphContainer" style="height: 400px; overflow-y: auto; border-radius: 12px;"><canvas id="darkOmensChart" width="100%" height="auto" style="min-height: 800px;"></canvas></div><div id="darkOmensStats" style="margin-top: 8px; font-size:0.8rem; color:#94a3b8;"></div></div>
                <div class="graph-card"><h3 style="color:#e2e8f0; margin-top:0;">🏛️ Olimpus</h3><div id="olimpusGraphContainer" style="height: 400px; overflow-y: auto; border-radius: 12px;"><canvas id="olimpusChart" width="100%" height="auto" style="min-height: 800px;"></canvas></div><div id="olimpusStats" style="margin-top: 8px; font-size:0.8rem; color:#94a3b8;"></div></div>
                <div class="graph-card"><h3 style="color:#e2e8f0; margin-top:0;">💎 Rare Crypts</h3><div id="rareGraphContainer" style="height: 400px; overflow-y: auto; border-radius: 12px;"><canvas id="rareChart" width="100%" height="auto" style="min-height: 800px;"></canvas></div><div id="rareStats" style="margin-top: 8px; font-size:0.8rem; color:#94a3b8;"></div></div>
                <div class="graph-card"><h3 style="color:#e2e8f0; margin-top:0;">🔥 Epic Crypts</h3><div id="epicGraphContainer" style="height: 400px; overflow-y: auto; border-radius: 12px;"><canvas id="epicChart" width="100%" height="auto" style="min-height: 800px;"></canvas></div><div id="epicStats" style="margin-top: 8px; font-size:0.8rem; color:#94a3b8;"></div></div>
            </div>
        </div>
        <style>
            .graph-card {
                background: #111827;
                border-radius: 20px;
                padding: 15px;
                border: 1px solid #1f2937;
                transition: 0.2s;
            }
            .graph-card:hover {
                border-color: #374151;
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }
            .graph-card canvas {
                width: 100%;
                height: auto;
            }
            /* стили для полосы прокрутки */
            #darkOmensGraphContainer::-webkit-scrollbar, #olimpusGraphContainer::-webkit-scrollbar,
            #rareGraphContainer::-webkit-scrollbar, #epicGraphContainer::-webkit-scrollbar {
                width: 6px;
                background: #1e293b;
                border-radius: 10px;
            }
            #darkOmensGraphContainer::-webkit-scrollbar-thumb, #olimpusGraphContainer::-webkit-scrollbar-thumb,
            #rareGraphContainer::-webkit-scrollbar-thumb, #epicGraphContainer::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 10px;
            }
        </style>
        `;

        const container = document.createElement('div');
        container.innerHTML = dashboardHtml;
        const tableWrap = document.getElementById('TableWrap');
        if (tableWrap && tableWrap.parentNode) {
            tableWrap.insertAdjacentElement('afterend', container);
        } else {
            document.body.appendChild(container);
        }

        document.getElementById('dpRefreshBtn')?.addEventListener('click', () => refreshAllGraphs());
    }

    function getDefaultStartDate() {
        const d = new Date();
        d.setDate(d.getDate() - DEFAULT_DAYS);
        return d.toISOString().split('T')[0];
    }

    // ---------- ЗАГРУЗКА ДАННЫХ ----------
    // Загрузка событий (Dark Omens / Olimpus) – сумма по всем файлам
    async function loadEventTotalPoints(folder, files) {
        const playerPoints = new Map();
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
                    const points = parseFloat(row[pointsCol]);
                    if (player && !isNaN(points) && points > 0) {
                        playerPoints.set(player, (playerPoints.get(player) || 0) + points);
                    }
                }
            } catch(e) { /* тихо пропускаем */ }
        }
        const result = Array.from(playerPoints.entries()).map(([player, points]) => ({ player, points }));
        result.sort((a,b) => b.points - a.points);
        return result;
    }

    // Загрузка Rare / Epic сундуков за указанный диапазон дат
    async function loadRareEpicData(startDate, endDate) {
        if (typeof window.loadAllChestsByRange !== 'function') {
            console.warn('loadAllChestsByRange not found');
            return { rare: [], epic: [] };
        }
        const entries = await window.loadAllChestsByRange(startDate, endDate);
        const rareMap = new Map(); // player -> points
        const epicMap = new Map();
        for (const e of entries) {
            const src = e.sourceRaw.toLowerCase();
            if (src.includes('rare crypt')) {
                rareMap.set(e.player, (rareMap.get(e.player) || 0) + e.points);
            } else if (src.includes('epic crypt')) {
                epicMap.set(e.player, (epicMap.get(e.player) || 0) + e.points);
            }
        }
        const rare = Array.from(rareMap.entries()).map(([player, points]) => ({ player, points })).sort((a,b)=>b.points - a.points);
        const epic = Array.from(epicMap.entries()).map(([player, points]) => ({ player, points })).sort((a,b)=>b.points - a.points);
        return { rare, epic };
    }

    // Вспомогательные функции парсинга CSV
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

    function findColumn(headers, possibleNames) {
        return headers.findIndex(h => possibleNames.some(name => h.toLowerCase().includes(name.toLowerCase())));
    }

    // ---------- ОТРИСОВКА ГОРИЗОНТАЛЬНОГО БАРЧАРТА С ПРОКРУТКОЙ ----------
    function drawHorizontalBarChart(canvasId, data, minThreshold, labelPrefix) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Уничтожаем старый график
        if (canvas.chart) {
            canvas.chart.destroy();
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
        const barColors = values.map(v => v >= minThreshold ? '#10b981' : '#ef4444');

        // Вычисляем высоту canvas: для каждого игрока примерно 40px + отступы
        const barHeight = 36;
        const totalHeight = data.length * barHeight + 50;
        canvas.height = totalHeight;
        canvas.style.height = `${totalHeight}px`;
        canvas.width = canvas.parentElement.clientWidth || 600;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: labelPrefix,
                    data: values,
                    backgroundColor: barColors,
                    borderRadius: 6,
                    barPercentage: 0.9,
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
                },
                elements: { bar: { borderWidth: 0 } }
            }
        });
        canvas.chart = chart;

        // Добавляем горизонтальную линию порога (annotation через плагин? Рисуем вручную после рендера)
        // Но проще добавить комментарий под графиком, либо нарисовать вторым датасетом. 
        // Сделаем дополнительный плагин прямо здесь:
        const originalDraw = chart.draw;
        chart.draw = function() {
            originalDraw.apply(this, arguments);
            const ctx = this.ctx;
            const xAxis = this.scales.x;
            const thresholdX = xAxis.getPixelForValue(minThreshold);
            if (thresholdX && isFinite(thresholdX)) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(thresholdX, 0);
                ctx.lineTo(thresholdX, this.chartArea.bottom);
                ctx.strokeStyle = '#f59e0b';
                ctx.setLineDash([6, 6]);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                // подпись
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 10px Arial';
                ctx.fillText(`норма: ${minThreshold}`, thresholdX + 5, 15);
            }
        };
        chart.draw();
    }

    // ---------- ОБНОВЛЕНИЕ ВСЕХ ГРАФИКОВ ----------
    async function refreshAllGraphs() {
        // Считываем настройки UI
        const startDate = new Date(document.getElementById('dpStartDate').value);
        const days = parseInt(document.getElementById('dpPeriodDays').value) || DEFAULT_DAYS;
        const rareMin = parseInt(document.getElementById('dpRareMin').value) || DEFAULT_RARE_MIN;
        const epicMin = parseInt(document.getElementById('dpEpicMin').value) || DEFAULT_EPIC_MIN;
        const darkMin = parseInt(document.getElementById('dpDarkMin').value) || DEFAULT_DARK_MIN;
        const olimpusMin = parseInt(document.getElementById('dpOlimpusMin').value) || DEFAULT_OLIMPUS_MIN;

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days - 1);

        // Показать индикатор загрузки
        showLoadingStatus();

        try {
            // Загружаем события параллельно
            const [darkData, olimpusData, { rare: rareData, epic: epicData }] = await Promise.all([
                loadEventTotalPoints('Dark omens', DARK_OMENS_FILES),
                loadEventTotalPoints('Olimpus', OLIMPUS_FILES),
                loadRareEpicData(startDate, endDate)
            ]);

            // Отрисовываем 4 графика
            drawHorizontalBarChart('darkOmensChart', darkData, darkMin, 'Очки Dark Omens');
            drawHorizontalBarChart('olimpusChart', olimpusData, olimpusMin, 'Очки Olimpus');
            drawHorizontalBarChart('rareChart', rareData, rareMin, 'Очки Rare Crypt');
            drawHorizontalBarChart('epicChart', epicData, epicMin, 'Очки Epic Crypt');

            // Обновляем статистику (кто выполнил норму)
            updateStatsText('darkOmensStats', darkData, darkMin);
            updateStatsText('olimpusStats', olimpusData, olimpusMin);
            updateStatsText('rareStats', rareData, rareMin);
            updateStatsText('epicStats', epicData, epicMin);
        } catch (err) {
            console.error(err);
            document.querySelectorAll('#darkOmensStats, #olimpusStats, #rareStats, #epicStats').forEach(el => {
                if (el) el.innerHTML = '<span style="color:#f87171;">❌ Ошибка загрузки данных</span>';
            });
        }
    }

    function updateStatsText(elementId, data, min) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!data || data.length === 0) {
            el.innerHTML = '📭 Нет данных';
            return;
        }
        const totalPlayers = data.length;
        const completed = data.filter(d => d.points >= min).length;
        const percent = totalPlayers ? Math.round(completed / totalPlayers * 100) : 0;
        el.innerHTML = `👥 Всего: ${totalPlayers} | ✅ Выполнили норму (≥${min}): ${completed} (${percent}%)`;
    }

    function showLoadingStatus() {
        const ids = ['darkOmensStats', 'olimpusStats', 'rareStats', 'epicStats'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '⏳ Загрузка...';
        });
    }

    // Перехват обновлений главной таблицы (если пользователь меняет даты в оригинальном интерфейсе)
    function hookIntoMainUpdates() {
        if (typeof window.renderTableFromEntries === 'function') {
            const original = window.renderTableFromEntries;
            window.renderTableFromEntries = function(entries) {
                original(entries);
                setTimeout(() => refreshAllGraphs(), 200);
            };
        }
        if (typeof window.loadByCustomRange === 'function') {
            const originalLoad = window.loadByCustomRange;
            window.loadByCustomRange = async function() {
                await originalLoad();
                setTimeout(() => refreshAllGraphs(), 300);
            };
        }
    }

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    function init() {
        createDashboard();
        // Ждём, пока подгрузятся основные данные страницы, затем рисуем графики
        setTimeout(() => {
            refreshAllGraphs();
            hookIntoMainUpdates();
        }, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();