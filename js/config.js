
// Weekly point quota
const WEEKLY_LIMIT = 3000;

const CONFIG = {
  // Общие настройки циклов для Rare/Epic
  startDate: "2026-02-14",     // начало первого цикла
  cycleDays: 24,               // длительность цикла в днях

  // Пороги для Rare и Epic (один на все циклы)
  thresholds: {
    rare: 2000,
    epic: 2000,
    // Пороги для каждого события Dark Omens (по порядку файлов)
    darkOmensEvents: [1000000, 550000, 550000, 550000],
    // Пороги для каждого события Olimpus
    olimpusEvents: [71000, 71000, 71000],
    tinmanEvents: [1000000, 1000000, 1000000, 1000000, 1000000],
  },

  // Файлы событий (порядок важен для соответствия thresholds)
  olimpusFiles: ["21042026-26042026.csv", "29032026-02042026.csv", "04032026-09032026.csv"],
  darkOmensFiles: ["06052026-07052026.csv", "13042026-14042026.csv", "20032026-21032026.csv", "24022026-25022026.csv"],
  tinmanFiles: ["09052026.csv", "03052026.csv", "27042026.csv", "21042026.csv", "15042026.csv"],
  olimpusFolder: "Olimpus",
  darkOmensFolder: "Dark omens",
  tinmansFolder: "Tinman"
};

const EVENT_WEIGHTS = {
  tinman: 1.0,
  dark: 0.7,
  olimpus: 0.7,
  rare: 0.7,
  epic: 0.8
};

const RATING_CONFIG = {
  tinmanCombined: {
    weight: 1.0,
    // можно добавить другие параметры, если нужно
  }
};


const PLAYER_ALIASES = {
  "xoana": ["xoana", "С…РѕР°РїР°"],
  "CARNAGE 1": ["CARNAGE1", "CARNAGE 1"],
  "Goku": ["Goku", "GokГє"],
  "Presidio de Bangu": ["Presidio de Bangu", "PresГ­dio de Bangu"]
};

const COLUMN_CONFIG = [
  { name: "Crypt", sources: ["level 15 crypt", "level 20 crypt", "level 25 crypt"] },
  { name: "Rare Crypt", sources: ["level 10 rare crypt", "level 15 rare crypt", "level 20 rare crypt", "level 25 rare crypt", "level 30 rare crypt"] },
  { name: "Epic Crypt", sources: ["level 15 epic crypt", "level 20 epic crypt", "level 25 epic crypt", "level 30 epic crypt", "level 35 epic crypt"] },
  { name: "Citadel", sources: ["level 20 citadel", "level 25 citadel", "level 30 citadel"] },

  {
    name: "Epic monster big Chests", sources:
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
  {
    name: "Epic monster small Chests", sources:
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

  {
    name: "Tartaros Crypt", sources:
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

  "jormungandr shop": 1,
  "rise of the ancients event": 1,
  "hermes' store": 1,
  "tartaros crypt level 10": 1,
  "tartaros crypt level 15": 1,
  "tartaros crypt level 20": 1,
  "tartaros crypt level 25": 1,
  "tartaros crypt level 30": 1,
  "tartaros crypt level 35": 1,
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
  "epic fenrir squad": 120,
  "epic jormungandr squad": 120,
  "arachne's swarm epic squad": 500,
  "epic undead squad": 500,
  "shadow city": 500,
  "epic briareus squad": 500,
  "beastman": 500,

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
