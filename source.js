import { config } from "./config.js";
import { addDays, dayDifference, getCalendarDay } from "./finder.js";

let sampleCache = null;
let loadedItems = new Map();

function pause(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function readSample() {
  if (sampleCache) return sampleCache;
  const response = await fetch(config.sampleDataPath, { cache: "no-store" });
  if (!response.ok) throw new Error("The local sample data could not be loaded.");
  sampleCache = await response.json();
  return sampleCache;
}

function moveListingToCurrentWindow(item, fixtureDay, currentDay) {
  const offset = dayDifference(fixtureDay, item.performanceDate);
  return { ...item, performanceDate: addDays(currentDay, offset) };
}

export const source = Object.freeze({
  async load(params = {}) {
    await pause(config.sampleDelayMs);
    if (params.forceError) throw new Error("This controlled error proves the recovery state is readable.");
    const data = await readSample();
    if (!params.region || !params.date) {
      return params.forceEmpty ? { ...data.foundation, listings: [] } : data.foundation;
    }

    const currentDay = getCalendarDay(config.timeZone);
    const listings = data.listings
      .map((item) => moveListingToCurrentWindow(item, data.sampleBaseDate, currentDay))
      .filter((item) => item.region === params.region && item.performanceDate === params.date)
      .slice(0, config.resultLimit);
    loadedItems = new Map(listings.map((item) => [item.id, item]));
    return {
      region: params.region,
      selectedDate: params.date,
      dataDay: currentDay,
      fetchedAt: data.fetchedAt,
      source: data.sources[params.region],
      listings: params.forceEmpty ? [] : listings,
      warnings: ["Fictional local data for interaction testing only."]
    };
  },

  async detail(id) {
    await pause(config.sampleDelayMs);
    const data = await readSample();
    const loadedItem = loadedItems.get(id);
    const detail = [...data.details, ...data.foundation.details].find((item) => item.id === id);
    if (!detail || (!loadedItem && !id.startsWith("foundation-"))) throw new Error("No sample detail was found for that item.");
    const { id: privateId, ...normalizedDetail } = detail;
    return {
      ...normalizedDetail,
      excerpt: normalizedDetail.excerpt.slice(0, config.detailExcerptLimit),
      theatre: loadedItem?.theatre || normalizedDetail.theatre,
      city: loadedItem?.city || normalizedDetail.city
    };
  },

  async save() { throw new Error("source.save() is not used in this project."); },
  async list() { return []; }
});
