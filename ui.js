import { config } from "./config.js";

const elements = {
  shell: document.querySelector("#app-shell"), working: document.querySelector("#working-indicator"),
  status: document.querySelector("#status-message"), error: document.querySelector("#error-message"),
  empty: document.querySelector("#empty-message"), results: document.querySelector("#results-list"),
  resultsTitle: document.querySelector("#results-title"), regions: [...document.querySelectorAll("[data-region]")],
  dates: document.querySelector("#date-controls"), location: document.querySelector("#location-filter"),
  budget: document.querySelector("#budget-filter"), budgetCurrency: document.querySelector("#budget-currency"),
  clearFilters: document.querySelector("#clear-filters"), comparison: document.querySelector("#comparison-list"),
  compareCount: document.querySelector("#compare-count"), clearComparison: document.querySelector("#clear-comparison"),
  detailPanel: document.querySelector("#detail-panel"), detailContent: document.querySelector("#detail-content"),
  closeDetail: document.querySelector("#close-detail"), mainAction: document.querySelector("#main-action"),
  emptyAction: document.querySelector("#empty-action"), errorAction: document.querySelector("#error-action"),
  clearAction: document.querySelector("#clear-action")
};

function hideMessage(element) { element.textContent = ""; element.hidden = true; }
function text(tag, value, className = "") {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  return element;
}
function safeLink(label, url) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function formattedDate(value) {
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
function missingLabels(item) {
  const labels = { theatre: "theatre", city: "city", performanceTimes: "performance time", lowestPrice: "price", ticketStatus: "ticket status", bookingUrl: "booking link", detailUrl: "detail link" };
  return item.missingFields.map((field) => labels[field] || field).join(", ");
}

export function setBusy(isBusy) {
  elements.shell.setAttribute("aria-busy", String(isBusy));
  elements.working.hidden = !isBusy;
  elements.shell.querySelectorAll("button, select, input").forEach((control) => { control.disabled = isBusy; });
  if (!isBusy) elements.clearComparison.disabled = elements.comparison.querySelectorAll(".compare-item").length === 0;
}
export function setStatus(message) { elements.status.textContent = message; }
export function showError(message) { hideMessage(elements.empty); elements.error.textContent = message; elements.error.hidden = false; }
export function showEmpty(message) { hideMessage(elements.error); elements.empty.textContent = message; elements.empty.hidden = false; }

export function renderControls(viewModel) {
  elements.regions.forEach((button) => { button.setAttribute("aria-pressed", String(button.dataset.region === viewModel.region)); });
  elements.dates.replaceChildren();
  viewModel.dates.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.date = option.value;
    button.setAttribute("aria-pressed", String(option.value === viewModel.selectedDate));
    button.setAttribute("aria-label", `${option.weekday} ${option.dayMonth}${option.isToday ? ", today in Beijing" : ""}`);
    button.append(text("span", option.weekday), text("strong", option.dayMonth));
    elements.dates.append(button);
  });
  const currentOptions = [...elements.location.options].map((option) => option.value);
  const nextOptions = ["", ...viewModel.locations];
  if (currentOptions.join("|") !== nextOptions.join("|")) {
    elements.location.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "All locations";
    elements.location.append(all);
    viewModel.locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      elements.location.append(option);
    });
  }
  elements.location.value = viewModel.location;
  elements.budget.value = viewModel.budget;
  elements.budgetCurrency.textContent = viewModel.currency;
  elements.resultsTitle.textContent = `${viewModel.regionLabel} · ${formattedDate(viewModel.selectedDate)}`;
}

export function renderList(items) {
  elements.results.replaceChildren();
  hideMessage(elements.error);
  hideMessage(elements.empty);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.append(text("p", item.city || config.display.unavailableLabel, "card-kicker"), text("h3", item.title));
    const venue = text("p", item.theatre || config.display.unavailableLabel, "venue");
    const facts = document.createElement("dl");
    facts.className = "card-facts";
    const rows = [
      ["Date", formattedDate(item.performanceDate)],
      ["Times", item.performanceTimes.length ? item.performanceTimes.join(" · ") : config.display.unavailableLabel],
      ["Price", item.lowestPrice ? item.lowestPrice.display : config.display.unavailableLabel],
      ["Status", item.ticketStatus === "unknown" ? config.display.unknownStatusLabel : item.ticketStatus.replaceAll("-", " ")]
    ];
    rows.forEach(([label, value]) => { facts.append(text("dt", label), text("dd", value)); });
    card.append(venue, facts);
    if (item.missingFields.length) card.append(text("p", `Missing from sample: ${missingLabels(item)}.`, "missing-note"));
    card.append(text("p", item.sourceName, "source-note"));
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const compare = document.createElement("button");
    compare.type = "button";
    compare.dataset.compareId = item.id;
    compare.className = item.isCompared ? "secondary selected-action" : "secondary";
    compare.textContent = item.isCompared ? "Remove from compare" : "Add to compare";
    const detail = document.createElement("button");
    detail.type = "button";
    detail.dataset.detailId = item.id;
    detail.className = "quiet";
    detail.textContent = "View details";
    actions.append(compare, detail);
    if (item.bookingUrl) actions.append(safeLink("Open sample link ↗", item.bookingUrl));
    card.append(actions);
    elements.results.append(card);
  });
}

export function clearResults() { elements.results.replaceChildren(); hideMessage(elements.error); hideMessage(elements.empty); }

export function renderComparison(items) {
  elements.comparison.replaceChildren();
  elements.compareCount.textContent = `${items.length} / ${config.compareLimit}`;
  elements.clearComparison.disabled = items.length === 0;
  if (!items.length) {
    elements.comparison.append(text("p", "Add performances to line up their time, place, price, and status.", "placeholder"));
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "compare-item";
    const heading = document.createElement("div");
    heading.append(text("h3", item.title), text("p", `${item.theatre || "Theatre unavailable"} · ${item.city || "City unavailable"}`));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet compact";
    remove.dataset.compareId = item.id;
    remove.textContent = "Remove";
    row.append(heading, remove, text("p", item.performanceTimes.length ? item.performanceTimes.join(" · ") : "Time unavailable", "compare-fact"), text("p", item.lowestPrice ? item.lowestPrice.display : "Price unavailable", "compare-fact"));
    elements.comparison.append(row);
  });
}

export function renderDetail(viewModel) {
  elements.detailPanel.hidden = false;
  elements.detailContent.replaceChildren();
  if (viewModel.state === "loading") {
    elements.detailContent.append(text("p", `Loading the fictional detail for ${viewModel.title}…`, "detail-state"));
    return;
  }
  if (viewModel.state === "error") {
    elements.detailContent.append(text("p", viewModel.message, "message error"));
    return;
  }
  const detail = viewModel.detail;
  elements.detailContent.append(text("h3", detail.title), text("p", `${detail.theatre || "Theatre unavailable"} · ${detail.city || "City unavailable"}`, "venue"), text("p", detail.excerpt));
  const columns = document.createElement("div");
  columns.className = "detail-columns";
  [["Performance facts", detail.performanceFacts], ["Ticket facts", detail.ticketFacts]].forEach(([heading, facts]) => {
    const section = document.createElement("section");
    section.append(text("h4", heading));
    const list = document.createElement("ul");
    (facts.length ? facts : [config.display.unavailableLabel]).forEach((fact) => list.append(text("li", fact)));
    section.append(list);
    columns.append(section);
  });
  elements.detailContent.append(columns, text("p", `Source: ${detail.sourceName}`, "source-note"));
  if (detail.bookingUrl) elements.detailContent.append(safeLink("Open sample booking page ↗", detail.bookingUrl));
}

export function clearDetail() { elements.detailPanel.hidden = true; elements.detailContent.replaceChildren(); }

export function bindHandlers(handlers) {
  elements.mainAction.addEventListener("click", handlers.load);
  elements.emptyAction.addEventListener("click", handlers.showEmpty);
  elements.errorAction.addEventListener("click", handlers.showError);
  elements.clearAction.addEventListener("click", handlers.clear);
  elements.regions.forEach((button) => button.addEventListener("click", () => handlers.selectRegion(button.dataset.region)));
  elements.dates.addEventListener("click", (event) => { const button = event.target.closest("[data-date]"); if (button) handlers.selectDate(button.dataset.date); });
  elements.location.addEventListener("change", () => handlers.changeLocation(elements.location.value));
  elements.budget.addEventListener("input", () => handlers.changeBudget(elements.budget.value));
  elements.clearFilters.addEventListener("click", handlers.clearFilters);
  elements.results.addEventListener("click", (event) => {
    const compare = event.target.closest("[data-compare-id]");
    const detail = event.target.closest("[data-detail-id]");
    if (compare) handlers.toggleCompare(compare.dataset.compareId);
    if (detail) handlers.viewDetail(detail.dataset.detailId);
  });
  elements.comparison.addEventListener("click", (event) => { const button = event.target.closest("[data-compare-id]"); if (button) handlers.toggleCompare(button.dataset.compareId); });
  elements.clearComparison.addEventListener("click", handlers.clearComparison);
  elements.closeDetail.addEventListener("click", handlers.closeDetail);
}
