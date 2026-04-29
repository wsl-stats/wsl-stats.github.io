const DASHBOARD_CONFIG = {
  cycleDays: 24,

  startDate: "2026-03-01",

  thresholds: {
    rare: 2000,
    epic: 4000,
    darkOmens: 10000,
    olimpus: 8000
  }
};

async function initDashboard(entries) {
  setTimeout(() => {
    renderDashboard(entries);
  }, 0); // 👈 асинхронно, не блокирует UI
}

function getCycleIndex(date) {
  const start = new Date(DASHBOARD_CONFIG.startDate);
  const diff = new Date(date) - start;

  const cycleMs = DASHBOARD_CONFIG.cycleDays * 24 * 60 * 60 * 1000;

  return Math.floor(diff / cycleMs);
}


function buildChestStats(entries) {
  const cycles = new Map();

  for (const e of entries) {
    if (!e.date) continue;

    const cycle = getCycleIndex(e.date);

    if (!cycles.has(cycle)) {
      cycles.set(cycle, {
        rare: 0,
        epic: 0
      });
    }

    const bucket = cycles.get(cycle);
    const src = e.sourceRaw.toLowerCase();

    if (src.includes("rare crypt")) {
      bucket.rare += e.points;
    }

    if (src.includes("epic crypt")) {
      bucket.epic += e.points;
    }
  }

  return cycles;
}


function aggregateByPlayer(entries, filterFn) {
  const map = new Map();

  for (const e of entries) {
    if (!filterFn(e)) continue;

    if (!map.has(e.player)) {
      map.set(e.player, 0);
    }

    map.set(e.player, map.get(e.player) + e.points);
  }

  return map;
}


function renderDashboard(entries) {
  const container = document.getElementById("dashboard");

  container.innerHTML = `
    <h2>📊 Analytics Dashboard</h2>

    <canvas id="darkChart"></canvas>
    <canvas id="olimpusChart"></canvas>
    <canvas id="rareChart"></canvas>
    <canvas id="epicChart"></canvas>
  `;

  renderDarkOmens(entries);
  renderOlimpus(entries);
  renderRare(entries);
  renderEpic(entries);
}


function renderDarkOmens(entries) {
  const data = aggregateByPlayer(entries, e =>
    e.sourceRaw.toLowerCase().includes("dark omens")
  );

  renderBarChart("darkChart", data, DASHBOARD_CONFIG.thresholds.darkOmens);
}

function renderOlimpus(entries) {
  const data = aggregateByPlayer(entries, e =>
    e.sourceRaw.toLowerCase().includes("olimpus")
  );

  renderBarChart("olimpusChart", data, DASHBOARD_CONFIG.thresholds.olimpus);
}

function renderRare(entries) {
  const cycles = buildChestStats(entries);

  const labels = [];
  const values = [];

  for (const [cycle, data] of cycles) {
    labels.push("Cycle " + cycle);
    values.push(data.rare);
  }

  new Chart(document.getElementById("rareChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Rare Points",
        data: values
      }]
    }
  });
}

function renderEpic(entries) {
  const cycles = buildChestStats(entries);

  const labels = [];
  const values = [];

  for (const [cycle, data] of cycles) {
    labels.push("Cycle " + cycle);
    values.push(data.epic);
  }

  new Chart(document.getElementById("epicChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Epic Points",
        data: values
      }]
    }
  });
}


function renderBarChart(canvasId, map, threshold) {
  const labels = Array.from(map.keys());
  const data = Array.from(map.values());

  new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Points",
        data
      }]
    },
    options: {
      plugins: {
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: threshold,
              yMax: threshold
            }
          }
        }
      }
    }
  });
}

