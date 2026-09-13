const elements = {
  shell: document.querySelector("#app-shell"),
  working: document.querySelector("#working-indicator"),
  status: document.querySelector("#status-message"),
  error: document.querySelector("#error-message"),
  empty: document.querySelector("#empty-message"),
  results: document.querySelector("#results-list"),
  actions: [...document.querySelectorAll("[data-action]")],
  mainAction: document.querySelector("#main-action"),
  emptyAction: document.querySelector("#empty-action"),
  errorAction: document.querySelector("#error-action"),
  clearAction: document.querySelector("#clear-action")
};

function hideMessage(element) {
  element.textContent = "";
  element.hidden = true;
}

export function setBusy(isBusy) {
  elements.shell.setAttribute("aria-busy", String(isBusy));
  elements.working.hidden = !isBusy;
  elements.actions.forEach((button) => {
    button.disabled = isBusy;
  });
}

export function setStatus(message) {
  elements.status.textContent = message;
}

export function showError(message) {
  hideMessage(elements.empty);
  elements.error.textContent = message;
  elements.error.hidden = false;
}

export function showEmpty(message) {
  hideMessage(elements.error);
  elements.empty.textContent = message;
  elements.empty.hidden = false;
}

export function renderList(items) {
  elements.results.replaceChildren();
  hideMessage(elements.error);
  hideMessage(elements.empty);

  items.forEach((item) => {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const summary = document.createElement("p");
    card.className = "result-card";
    title.textContent = item.title;
    summary.textContent = `${item.theatre} · ${item.city}`;
    card.append(title, summary);
    elements.results.append(card);
  });
}

export function clearResults() {
  elements.results.replaceChildren();
  hideMessage(elements.error);
  hideMessage(elements.empty);
}

export function bindHandlers(handlers) {
  elements.mainAction.addEventListener("click", handlers.load);
  elements.emptyAction.addEventListener("click", handlers.showEmpty);
  elements.errorAction.addEventListener("click", handlers.showError);
  elements.clearAction.addEventListener("click", handlers.clear);
}
