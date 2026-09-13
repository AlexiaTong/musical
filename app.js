import { config } from "./config.js";
import { buildDateOptions, deriveLocations, filterListings, getCalendarDay, toggleComparison } from "./finder.js";
import { source } from "./source.js";
import {
  bindHandlers, clearDetail, clearResults, renderComparison, renderControls,
  renderDetail, renderList, setBusy, setStatus, showEmpty, showError
} from "./ui.js";

const today = getCalendarDay(config.timeZone);
const state = {
  region: "broadway",
  selectedDate: today,
  dates: buildDateOptions(today, config.daysVisible),
  listings: [],
  locations: [],
  location: "",
  budget: "",
  compared: [],
  fetchedAt: ""
};

function controlsViewModel() {
  return {
    region: state.region,
    selectedDate: state.selectedDate,
    dates: state.dates,
    locations: state.locations,
    location: state.location,
    budget: state.budget,
    currency: config.regionCurrencies[state.region],
    regionLabel: config.regionLabels[state.region]
  };
}

function renderCurrentListings() {
  const filtered = filterListings(state.listings, { location: state.location, budget: state.budget });
  renderControls(controlsViewModel());
  renderList(filtered.listings.map((item) => ({ ...item, isCompared: state.compared.some((entry) => entry.id === item.id) })));
  renderComparison(state.compared);

  if (filtered.listings.length === 0) {
    const message = state.listings.length === 0
      ? "No verified performances were found for this date. Try another day."
      : "No performances match these filters. Clear a filter to see the live results again.";
    showEmpty(message);
  }

  const unknownNote = filtered.unknownPriceExcluded > 0
    ? ` ${filtered.unknownPriceExcluded} ${filtered.unknownPriceExcluded === 1 ? "listing was" : "listings were"} excluded because the price is unknown.`
    : "";
  const refreshed = state.fetchedAt
    ? ` Last refreshed ${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.fetchedAt))}.`
    : "";
  setStatus(`${filtered.listings.length} of ${state.listings.length} verified performances shown.${unknownNote}${refreshed}`);
}

async function loadContext({ resetContext = false } = {}) {
  setBusy(true);
  clearResults();
  if (resetContext) {
    state.compared = [];
    state.location = "";
    state.budget = "";
    clearDetail();
    renderComparison([]);
  }
  setStatus("Loading verified performances…");
  try {
    const result = await source.load({ region: state.region, date: state.selectedDate });
    state.listings = result.listings;
    state.fetchedAt = result.fetchedAt;
    state.locations = deriveLocations(result.listings);
    renderCurrentListings();
  } catch (error) {
    showError(error instanceof Error ? error.message : "The live performances could not be loaded.");
    setStatus("The request ended with a readable error.");
  } finally {
    setBusy(false);
  }
}

async function loadFoundation(params = {}) {
  setBusy(true);
  setStatus("Refreshing live performances…");
  clearResults();
  try {
    const result = await source.load(params);
    if (result.listings.length === 0) {
      showEmpty("The live request succeeded, but it returned no verified performances.");
      setStatus("Empty state displayed.");
      return;
    }
    renderList(result.listings);
    state.fetchedAt = result.fetchedAt;
    setStatus(`${result.listings.length} verified performances loaded. Last refreshed ${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.fetchedAt))}.`);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Something went wrong while loading live performances.");
    setStatus("The request ended with a readable error.");
  } finally {
    setBusy(false);
  }
}

bindHandlers({
  load: () => loadFoundation(),
  showEmpty: () => loadFoundation({ forceEmpty: true }),
  showError: () => loadFoundation({ forceError: true }),
  clear: () => { clearResults(); setStatus(""); },
  selectRegion: (region) => {
    if (!config.supportedRegionIds.includes(region) || region === state.region) return;
    state.region = region;
    loadContext({ resetContext: true });
  },
  selectDate: (date) => {
    if (!state.dates.some((option) => option.value === date) || date === state.selectedDate) return;
    state.selectedDate = date;
    loadContext({ resetContext: true });
  },
  changeLocation: (location) => { state.location = location; renderCurrentListings(); },
  changeBudget: (budget) => { state.budget = budget; renderCurrentListings(); },
  clearFilters: () => { state.location = ""; state.budget = ""; renderCurrentListings(); },
  toggleCompare: (id) => {
    const item = state.listings.find((entry) => entry.id === id);
    if (!item) return;
    const result = toggleComparison(state.compared, item, config.compareLimit);
    if (result.rejected) {
      showError(`You can compare up to ${config.compareLimit} performances. Remove one before adding another.`);
      setStatus("The fourth comparison item was not added.");
      return;
    }
    state.compared = result.items;
    renderCurrentListings();
  },
  clearComparison: () => { state.compared = []; renderCurrentListings(); },
  viewDetail: async (id) => {
    const item = state.listings.find((entry) => entry.id === id);
    if (!item) return;
    renderDetail({ state: "loading", title: item.title });
    try {
      renderDetail({ state: "result", detail: await source.detail(id) });
    } catch (error) {
      renderDetail({ state: "error", message: error instanceof Error ? error.message : "This live detail is unavailable." });
    }
  },
  closeDetail: clearDetail
});

renderControls(controlsViewModel());
renderComparison([]);
loadContext();
