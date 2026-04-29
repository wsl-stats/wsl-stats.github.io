// ======================== CONFIGURATION ========================
// Define columns: each column has a display name and a list of source patterns (case-insensitive)
// The patterns are matched against the "Source:" line in chest files.
// You can add new columns by adding an object to this array.
const COLUMN_CONFIG = [
  { name: "Crypt", sources: ["level 15 crypt", "level 20 crypt", "level 25 crypt"] },
  { name: "Rare Crypt", sources: ["level 10 rare crypt", "level 15 rare crypt", "level 20 rare crypt", "level 25 rare crypt", "level 30 rare crypt"] },
  { name: "Epic Crypt", sources: ["level 15 epic crypt", "level 20 epic crypt", "level 25 epic crypt", "level 30 epic crypt", "level 35 epic crypt"] },
  { name: "Citadel", sources: ["level 20 citadel", "level 25 citadel", "level 30 citadel"] },
 
  { name: "Epic monster big Chests", sources: 
	  [
	  "beastman",
	  "epic briareus squad",
	  "arachne's swarm epic squad",
	  "epic undead squad",
	  "Shadow City",
	  "epic basilisk squad",
	  "epic inferno squad",
	  "dark omens event"
	  ] 
  },  
  { name: "Epic monster small Chests", sources: 
	  [
	  "epic chimera squad",
	  "epic jormungandr squad",
	  "epic fenrir squad"
	  ] 
  },
  
  { name: "Heroic Monster", sources: ["heroic monster"] },   // matches all heroic monster levels
  { name: "Hermes' Store", sources: ["hermes' store"] },
  { name: "Tinman", sources: ["Rise of the Ancients event"] },
  { name: "Jormungandr Shop", sources: ["jormungandr shop"] },

  { name: "Tartaros Crypt", sources: 
	  [
	  "tartaros crypt level 10",
	  "tartaros crypt level 15",
	  "tartaros crypt level 20",
	  "tartaros crypt level 25",
	  "tartaros crypt level 30",
	  "tartaros crypt level 35"
	  ] 
  },
  
  
];



const POINTS_CONFIG = {
	
  "jormungandr shop":1,
  "rise of the ancients event":1,
  "hermes' store":1,
  "tartaros crypt level 10":1,
  "tartaros crypt level 15":1,
  "tartaros crypt level 20":1,
  "tartaros crypt level 25":1,
  "tartaros crypt level 30":1,
  "tartaros crypt level 35":1,
  // ----- Крипты (Crypt) -----
  "level 10 rare crypt": 2,
  "level 15 rare crypt": 8,
  "level 15 epic crypt": 12,
  "level 20 crypt": 16,
  "level 20 rare crypt": 28,
  "level 20 epic crypt": 45,
  "level 25 crypt": 55,
  "level 25 rare crypt": 72,
  "level 25 epic crypt": 90,
  "level 30 rare crypt": 120,
  "level 30 epic crypt": 140,
  "level 35 epic crypt": 200,

  // ----- Цитадели (Citadel) -----
  "level 30 citadel": 60,
  "level 25 citadel": 28,
  "level 20 citadel": 12,

  // ----- Эпические отряды (Squads) -----
  "epic fenrir squad": 120,
  "epic jormungandr squad": 120,
  "epic inferno squad": 500,
  "epic basilisk squad": 500,      // базовое значение, но будет переопределено для конкретных сундуков
  "epic chimera squad": 120,
  "epic fenrir squad":120,
  "epic jormungandr squad":120,
  "arachne's swarm epic squad": 500,
  "epic undead squad":500,
  "shadow city":500,
  "epic briareus squad":500,
  "beastman":500,

  // ----- Героические монстры (Heroic Monsters) -----
  "level 16 heroic monster": 5,
  "level 17 heroic monster": 10,
  "level 18 heroic monster": 15,
  "level 19 heroic monster": 20,
  "level 20 heroic monster": 30,
  "level 21 heroic monster": 40,
  "level 22 heroic monster": 50,
  "level 23 heroic monster": 60,
  "level 24 heroic monster": 70,
  "level 25 heroic monster": 80,
  "level 26 heroic monster": 90,
  "level 27 heroic monster": 105,
  "level 28 heroic monster": 120,
  "level 29 heroic monster": 140,
  "level 30 heroic monster": 150,
  "level 31 heroic monster": 200,
  "level 32 heroic monster": 225,
  "level 33 heroic monster": 250,
  "level 34 heroic monster": 300,
  "level 35 heroic monster": 350,
  "level 36 heroic monster": 400,
  "level 37 heroic monster": 450,
  "level 38 heroic monster": 500,
  "level 39 heroic monster": 550,
  "level 40 heroic monster": 625,
  "level 41 heroic monster": 700,
  "level 42 heroic monster": 775,
  "level 43 heroic monster": 850,
  "level 44 heroic monster": 925,
  "level 45 heroic monster": 1000,

  // ----- Специфичные сундуки от Epic Basilisk squad -----
  "epic basilisk squad|basilisk chest": 500,
  "dark omens event|arcane chest": 500
};

// Weekly point quota
const WEEKLY_LIMIT = 900;
document.getElementById("weeklyLimit").innerHTML = `<span style="color:#fbbf24; font-weight:bold;">${WEEKLY_LIMIT} points</span>`;

function buildPointsMap() {
  const map = new Map();
  for (const [key, value] of Object.entries(POINTS_CONFIG)) {

	map.set(key.toLowerCase(), value);
  
    
  }
  return map;
}

const POINTS_MAP = buildPointsMap();

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  };

// Helper: extract level number from source string (e.g., "level 20 rare crypt" → 20)
function extractLevel(source) {
  const match = source.match(/level\s+(\d+)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

function normalizeMungandrSource(source) {
  if (!source) return source;
  // Замена конкретного искажения JГіrmungandr на Jormungandr
  let fixed = source.replace(/JГіrmungandr/gi, 'Jormungandr');
  const lower = fixed.toLowerCase();
  if (lower.includes('mungandr')) {
    if (lower.includes('shop')) return 'jormungandr shop';
    if (lower.includes('squad')) return 'epic jormungandr squad';
	if (lower.includes('chest')) return `Jormungandr's Chest`;
  }
  return fixed;  // возвращаем исправленное название без дополнительной замены
}

// ======================== LOAD CHEST FILES FOR CURRENT WEEK ========================
function getWeekDatesMSK() {
  const now = new Date();
  const mskNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const day = mskNow.getUTCDay();
  let diffToMonday = (day === 0 ? 6 : day - 1);
  const mondayMSK = new Date(mskNow);
  mondayMSK.setUTCDate(mskNow.getUTCDate() - diffToMonday);
  mondayMSK.setUTCHours(0, 0, 0, 0);
  const sundayMSK = new Date(mondayMSK);
  sundayMSK.setUTCDate(mondayMSK.getUTCDate() + 6);
  sundayMSK.setUTCHours(23, 59, 59, 999);
  return { start: mondayMSK, end: sundayMSK };
}

function formatDateForFile(dateMSK) {
  const yyyy = dateMSK.getUTCFullYear();
  const mm = String(dateMSK.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dateMSK.getUTCDate()).padStart(2, '0');
  return `chests_${yyyy}-${mm}-${dd}.txt`;
}

async function loadAllChestsForWeek() {
  const { start, end } = getWeekDatesMSK();
  document.getElementById('periodAt').textContent =
    `From: ${formatDate(start)} — To: ${formatDate(end)} Moscow`;
 
  return await loadAllChestsByRange(start, end);

}


async function loadTimestamp() {
  try {
    const response = await fetch(`last_update.txt?v=${Date.now()}`);
    if (response.ok) {
      const timestamp = await response.text();
      document.getElementById("generatedAt").textContent = `Updated: ${timestamp.trim()} Moscow`;
      return;
    }
  } catch (e) { /* ignore */ }

}


// ======================== AGGREGATION PER COLUMN CONFIG ========================
// For each entry, find which column it belongs to (first match)
function assignEntryToColumn(entry, columnConfig) {
  const sourceLower = entry.sourceRaw.toLowerCase();
  for (let col of columnConfig) {
    for (let pattern of col.sources) {
      if (sourceLower.includes(pattern.toLowerCase())) {
        return col.name;
      }
    }
  }
  return null; // not assigned to any column
}

function aggregateByPlayerAndColumn(entries, columnConfig) {
  const playerMap = new Map(); // key: player, value: { total: number, columns: Map<columnName, Map<groupKey, {count, pointsSum}>> }

  for (const e of entries) {
    const colName = assignEntryToColumn(e, columnConfig);
    if (!colName) continue; // skip entries that don't match any column

    if (!playerMap.has(e.player)) {
      playerMap.set(e.player, {
        total: 0,
		    CitadelTotal:0,
        columns: new Map()
      });
    }
    const playerData = playerMap.get(e.player);
    playerData.total += e.points;
	if(colName=="Citadel"){
		playerData.CitadelTotal += e.points;
	}

    let colMap = playerData.columns.get(colName);
    if (!colMap) {
      colMap = new Map();
      playerData.columns.set(colName, colMap);
    }

    // Determine grouping key: if source contains a level, use the level number;
    // otherwise use the chest name (e.g., "Basilisk Chest") which is stored in e.chestName
    const level = extractLevel(e.sourceRaw);
    const groupKey = level !== null ? level : e.chestName;

    let groupData = colMap.get(groupKey);
    if (!groupData) {
      groupData = { count: 0, pointsSum: 0 };
      colMap.set(groupKey, groupData);
    }
    groupData.count += 1;
    groupData.pointsSum += e.points;
  }

  return playerMap;
}

function renderCellContent(levelMap) {
    if (!levelMap || levelMap.size === 0) return "";
    const lines = [];
    let totalPoints = 0;
    const numericKeys = [];
    const stringKeys = [];
    for (let key of levelMap.keys()) {
        if (typeof key === 'number') numericKeys.push(key);
        else stringKeys.push(key);
    }
    numericKeys.sort((a,b) => a - b);
    stringKeys.sort();

    for (const level of numericKeys) {
        const data = levelMap.get(level);
        totalPoints += data.pointsSum;
        lines.push(`<span class="chest-detail-line">${level} (${data.count}): ${data.pointsSum}</span>`);
    }
    for (const name of stringKeys) {
        const data = levelMap.get(name);
        totalPoints += data.pointsSum;
        lines.push(`<span class="chest-detail-line">${name} (${data.count}): ${data.pointsSum}</span>`);
    }
    lines.push(`<span class="chest-detail-total">Total: ${totalPoints}</span>`);


    return lines.join('');
}

// ======================== RENDER MAIN TABLE ========================
let currentDataTable = null;

async function renderMainTable() {

  
   try {
    showLoader();

  const entries = await loadAllChestsForWeek();
  renderTableFromEntries(entries);

  } finally {
    hideLoader();
  }
  
}

// Cycle info display
function updateCycleInfo() {
  const { start, end } = getWeekDatesMSK();
  const opts = { day:"2-digit", month:"2-digit", year:"numeric" };
  const startStr = start.toLocaleString("ru-RU", opts);
  const endStr = end.toLocaleString("ru-RU", opts);
  document.getElementById("cycleInfo").textContent = `${startStr} — ${endStr} msk`;
}
updateCycleInfo();

// ======================== EVENT HANDLERS (unchanged) ========================
function renderEventButtons(containerId, files, folder, tableWrapId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  files.forEach(file => {
    const btn = document.createElement("button");
    btn.className = "event-btn";
    btn.textContent = file.replace(".csv", "");
    btn.onclick = () => toggleEvent(folder, file, tableWrapId, btn);
    container.appendChild(btn);
  });
}

async function loadEventTable(folder, file, wrapId) {
  const wrap = document.getElementById(wrapId);
  try {
    const response = await fetch(`${folder}/${file}?v=` + Date.now());
    const text = await response.text();
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let delimiter = ";";
    if (lines[0].includes("\t")) delimiter = "\t";
    else if (lines[0].includes(",")) delimiter = ",";
    const rows = lines.map(l => l.split(delimiter).map(x => x.trim()));
    const headers = rows[0];
    const data = rows.slice(1).filter(r => r.length === headers.length);
    wrap.innerHTML = `<table id="eventTable" class="display event-table">\x3ctable>`;
    $('#eventTable').DataTable({
      destroy: true,
      data: data,
      columns: headers.map(h => ({ title: h })),
      order: [[1, "desc"]],
      paging: false,
      info: false,
      searching: true,
      autoWidth: false
    });
  } catch(err) { console.error("Event load error:", err); }
}

let currentOpen = {};
async function toggleEvent(folder, file, tableWrapId, btn) {
  const wrap = document.getElementById(tableWrapId);
  if (currentOpen[tableWrapId] === file) {
    wrap.innerHTML = "";
    currentOpen[tableWrapId] = null;
    btn.classList.remove("active");
    return;
  }
  btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  await loadEventTable(folder, file, tableWrapId);
  currentOpen[tableWrapId] = file;
}

const olimpusFiles = ["04032026-09032026.csv","29032026-02042026.csv", "21042026-26042026.csv"];
const darkOmensFiles = ["24022026-25022026.csv", "20032026-21032026.csv", "13042026-14042026.csv"];
renderEventButtons("olimpusList", olimpusFiles, "Olimpus", "TableWrap");
renderEventButtons("darkOmensList", darkOmensFiles, "Dark omens", "TableWrap");

// ======================== ARCHIVE (unchanged) ========================

async function loadCsvFromPath(path) {
  try {
    const response = await fetch(path + "?v=" + new Date().getTime());
    if (!response.ok) throw new Error("HTTP " + response.status);
    const text = await response.text();
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let generatedAt = "";
    if (lines[0].startsWith("# GeneratedAt:")) {
      generatedAt = lines[0].replace("# GeneratedAt:", "").trim();
      document.getElementById("generatedAt").textContent = "Updated: " + generatedAt + " Moscow";
    }
    const dataRows = lines.filter(l => !l.startsWith("#")).map(l => l.split(",").map(c => c.trim()));
    if (dataRows.length < 2) throw new Error("CSV empty");
    const headers = dataRows[0];
    const totalIndex = headers.findIndex(h => h.trim().toLowerCase() === "total");
    const data = dataRows.slice(1).filter(r => r.length === headers.length);
    const cleaned = data.sort((a,b) => (parseInt(b[headers.length-1])||0) - (parseInt(a[headers.length-1])||0));
    if ($.fn.DataTable.isDataTable('#statsTable')) {
      $('#statsTable').DataTable().destroy();
    }
    const thead = document.querySelector("#statsTable thead");
    thead.innerHTML = "";
    const headerRow = document.createElement("tr");
    headers.forEach(h => { const th = document.createElement("th"); th.textContent = h; headerRow.appendChild(th); });
    thead.appendChild(headerRow);
    document.querySelector("#statsTable tbody").innerHTML = "";
    $('#statsTable').DataTable({
      data: cleaned,
      columns: headers.map((h, i) => ({ title: h, visible: i !== totalIndex })),
      order: [[headers.length-1, "desc"]],
      paging: false,
      info: true,
      autoWidth: false,
      createdRow: function(row, data, dataIndex) {
        const points = parseInt(data[headers.length-1] || "0");
        if(points >= WEEKLY_LIMIT) $(row).addClass("done");
        else $(row).addClass("not-done");
        if(dataIndex === 0) $(row).addClass("top-1");
        else if(dataIndex < 10) $(row).addClass("top-player");
      }
    });
  } catch(err) { console.error("Archive load error:", err); }
}


// ======================== ACCORDION ========================
document.querySelectorAll(".event-header").forEach(header => {
  header.addEventListener("click", () => {
    const card = header.closest(".event-card");
    const bodyId = header.dataset.target;
    const body = document.getElementById(bodyId);
    const isOpen = card.classList.contains("open");
    document.querySelectorAll(".event-card").forEach(c => {
      c.classList.remove("open");
      if(c.querySelector(".event-body")) c.querySelector(".event-body").style.display = "none";
    });
    if (!isOpen) {
      card.classList.add("open");
      if(body) body.style.display = "block";
    }
  });
});

// Start
renderMainTable();


function renderPointsTable() {
  const container = document.getElementById("chestPoints");
  if (!container) return;

  let html = '<table style="width:100%; border-collapse:collapse; background:#111827; border-radius:8px;">';
  html += '<thead><tr style="border-bottom:1px solid #374151;"><th style="text-align:left; padding:5px;">Source / Chest</th><th style="text-align:right; padding:5px;">Points</th> </tr></thead><tbody>';

  for (const [key, points] of Object.entries(POINTS_CONFIG)) {
	if(points>1){
		html += `<tr><td style="padding:5px;">${key}</td><td style="text-align:right; padding:5px;">${points}</td></tr>`;
	}
    
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

renderPointsTable();

async function loadAllChestsByRange(startDate, endDate) {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

const files = [];
let cur = new Date(startDate);

while (cur <= endDate) {
  files.push({
    fileName: formatDateForFile(cur),
    fileDate: new Date(cur) // 👈 ВОТ ОН
  });

  cur.setDate(cur.getDate() + 1);
}

  const entries = [];

for (const { fileName, fileDate } of files) {
    try {
      const resp = await fetch(`Data/${fileName}?v=${Date.now()}`);
      if (!resp.ok) continue;

      const text = await resp.text();
      const lines = text.split(/\r?\n/);

      let currentChest = null, currentPlayer = null, currentSource = null;

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const lower = line.toLowerCase();

        if (!lower.startsWith("from:") && !lower.startsWith("source:")) {
          currentChest = line;
          continue;
        }

        if (lower.startsWith("from:")) {
          currentPlayer = line.substring(5).trim();
          continue;
        }

        if (lower.startsWith("source:")) {
          currentSource = line.substring(7).trim();

          if (currentPlayer && currentSource) {
            const normalizedSource = normalizeMungandrSource(currentSource);
            const normalizedChest = normalizeMungandrSource(currentChest || '');

            const normSource = normalizedSource.toLowerCase();
            const normChest = normalizedChest.toLowerCase();

            let points = POINTS_MAP.get(`${normSource}|${normChest}`);
            if (points === undefined) {
              points = POINTS_MAP.get(normSource) || 0;
            }

            if (points > 0) {
              entries.push({
                player: currentPlayer,
                chestName: normalizedChest,
                sourceRaw: normalizedSource,
                points: points,
                date: new Date(fileDate)
              });
            }
          }

          currentChest = null;
          currentPlayer = null;
          currentSource = null;
        }
      }
    } catch (e) {}
  }

  return entries;
}

function showLoader() {
  document.getElementById("overlay").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("overlay").classList.add("hidden");
}


async function loadByCustomRange() {
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;

  if (!from || !to) {
    alert("Select both dates");
    return;
  }

  const start = new Date(from);
  const end = new Date(to);

  if (start > end) {
    alert("Invalid date range");
    return;
  }

 try {
    showLoader();

    const entries = await loadAllChestsByRange(start, end);
	document.getElementById('periodAt').textContent = `From: ${formatDate(startDate)} — To: ${formatDate(endDate)} Moscow`;
    renderTableFromEntries(entries);

  } finally {
    hideLoader();
  }
 
}

function renderTableFromEntries(entries) {
  const playerMap = aggregateByPlayerAndColumn(entries, COLUMN_CONFIG);

  const allColumnNames = COLUMN_CONFIG.map(c => c.name);

  const activeColumns = allColumnNames.filter(colName => {
    for (let playerData of playerMap.values()) {
      const colMap = playerData.columns.get(colName);
      if (colMap && colMap.size > 0) return true;
    }
    return false;
  });

  const headers = ["Player", ...activeColumns, "Citadel points", "Total Points"];

  const players = Array.from(playerMap.keys());
  const rows = [];

  for (const player of players) {
    const data = playerMap.get(player);
    const row = [player];

    for (const colName of activeColumns) {
      const colMap = data.columns.get(colName);
      row.push(renderCellContent(colMap));
    }


	row.push(data.CitadelTotal);
	row.push(data.total);
    rows.push(row);
  }

  rows.sort((a,b) => b[b.length-1] - a[a.length-1]);

  if ($.fn.DataTable.isDataTable('#statsTable')) {
    $('#statsTable').DataTable().destroy();
  }

  const thead = document.querySelector("#statsTable thead");
  thead.innerHTML = "";

  const headerRow = document.createElement("tr");

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  document.querySelector("#statsTable tbody").innerHTML = "";

  $('#statsTable').DataTable({
    data: rows,
    columns: headers.map((h, idx) => ({
      title: h,
      className: idx === 0 || idx === headers.length-1 ? 'dt-left' : 'dt-center',
      render: function(data, type) {
        if (type === 'display' && idx !== 0 && idx !== headers.length-1) {
          return data;
        }
        return data;
      }
    })),
    order: [[headers.length-1, "desc"]],
    paging: false,
    info: true,
    autoWidth: false,
    createdRow: function(row, data, dataIndex) {
      const totalPoints = parseInt(data[headers.length-1] || 0);

      if (totalPoints >= WEEKLY_LIMIT) $(row).addClass("done");
      else $(row).addClass("not-done");

      if (dataIndex === 0) $(row).addClass("top-1");
      else if (dataIndex < 10) $(row).addClass("top-player");
    }
  });

  loadTimestamp();
}
