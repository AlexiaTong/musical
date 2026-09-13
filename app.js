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
  compared: []
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
      ? "No fictional sample performances are scheduled for this date. Try another day."
      : "No performances match these filters. Clear a filter to see the loaded sample again.";
    showEmpty(message);
  }

  const unknownNote = filtered.unknownPriceExcluded > 0
    ? ` ${filtered.unknownPriceExcluded} ${filtered.unknownPriceExcluded === 1 ? "listing was" : "listings were"} excluded because the price is unknown.`
    : "";
  setStatus(`${filtered.listings.length} of ${state.listings.length} fictional performances shown.${unknownNote}`);
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
  setStatus("Loading fictional local performances…");
  try {
    const result = await source.load({ region: state.region, date: state.selectedDate });
    state.listings = result.listings;
    state.locations = deriveLocations(result.listings);
    renderCurrentListings();
  } catch (error) {
    showError(error instanceof Error ? error.message : "The sample performances could not be loaded.");
    setStatus("The request ended with a readable error.");
  } finally {
    setBusy(false);
  }
}

async function loadFoundation(params = {}) {
  setBusy(true);
  setStatus("Loading the local sample…");
  clearResults();
  try {
    const result = await source.load(params);
    if (result.listings.length === 0) {
      showEmpty("The sample request succeeded, but it returned no items.");
      setStatus("Empty state displayed.");
      return;
    }
    renderList(result.listings);
    setStatus(`${result.listings.length} sample items loaded from the local file.`);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Something went wrong while loading the sample.");
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
      renderDetail({ state: "error", message: error instanceof Error ? error.message : "This sample detail is unavailable." });
    }
  },
  closeDetail: clearDetail
});

renderControls(controlsViewModel());
renderComparison([]);
loadContext();
