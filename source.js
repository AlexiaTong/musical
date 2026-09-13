import { config } from "./config.js";
import { getCalendarDay } from "./finder.js";

let loadedItems = new Map();
let sampleCache = null;

function pause(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function readSample() {
  if (sampleCache) return sampleCache;
  const response = await fetch(config.sampleDataPath, { cache: "no-store" });
  if (!response.ok) throw new Error("The regression sample could not be loaded.");
  sampleCache = await response.json();
  return sampleCache;
}

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || "The live source request could not be completed.";
      throw new Error(message);
    }
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("The live source took too long to respond. Please try again.");
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export const source = Object.freeze({
  async load(params = {}) {
    if (params.forceError) throw new Error("This controlled error proves the recovery state is readable.");
    if (!params.region && !params.date) {
      await pause(config.sampleDelayMs);
      const data = await readSample();
      const listings = params.forceEmpty ? [] : data.foundation.listings;
      loadedItems = new Map(listings.map((item) => [item.id, item]));
      return { ...data.foundation, listings };
    }
    const currentDay = getCalendarDay(config.timeZone);
    const region = params.region || "broadway";
    const date = params.date || currentDay;
    const query = new URLSearchParams({ region, date, refreshDay: currentDay });
    const result = await requestJson(`/api/shows?${query.toString()}`, { headers: { Accept: "application/json" } });
    const listings = Array.isArray(result.listings) ? result.listings.slice(0, config.resultLimit) : [];
    loadedItems = new Map(listings.map((item) => [item.id, item]));
    return params.forceEmpty ? { ...result, listings: [] } : { ...result, listings };
  },

  async detail(id) {
    const item = loadedItems.get(id);
    if (item && id.startsWith("foundation-")) {
      const data = await readSample();
      const detail = data.foundation.details.find((entry) => entry.id === id);
      if (!detail) throw new Error("No regression detail was found for that item.");
      const { id: privateId, ...normalizedDetail } = detail;
      return { ...normalizedDetail, excerpt: normalizedDetail.excerpt.slice(0, config.detailExcerptLimit) };
    }
    if (!item || !item.detailUrl) throw new Error("A verified detail page is unavailable for this performance.");
    const detail = await requestJson("/api/show-detail", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ region: item.region, detailUrl: item.detailUrl })
    });
    return { ...detail, excerpt: String(detail.excerpt || "").slice(0, config.detailExcerptLimit) };
  },

  async save() { throw new Error("source.save() is not used in this project."); },
  async list() { return []; }
});
