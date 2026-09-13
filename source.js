import { config } from "./config.js";

let sampleCache = null;

function pause(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function readSample() {
  if (sampleCache) {
    return sampleCache;
  }

  const response = await fetch(config.sampleDataPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("The local sample data could not be loaded.");
  }

  sampleCache = await response.json();
  return sampleCache;
}

export const source = Object.freeze({
  async load(params = {}) {
    await pause(config.sampleDelayMs);
    if (params.forceError) {
      throw new Error("This controlled error proves the recovery state is readable.");
    }

    const data = await readSample();
    return params.forceEmpty ? { ...data, listings: [] } : data;
  },

  async detail(id) {
    const data = await readSample();
    const detail = data.details.find((item) => item.id === id);
    if (!detail) {
      throw new Error("No sample detail was found for that item.");
    }
    return detail;
  },

  async save() {
    throw new Error("source.save() is not used in this project.");
  },

  async list() {
    return [];
  }
});
