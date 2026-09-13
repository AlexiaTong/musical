import { source } from "./source.js";
import {
  bindHandlers,
  clearResults,
  renderList,
  setBusy,
  setStatus,
  showEmpty,
  showError
} from "./ui.js";

async function loadSample(params = {}) {
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
  load: () => loadSample(),
  showEmpty: () => loadSample({ forceEmpty: true }),
  showError: () => loadSample({ forceError: true }),
  clear: () => {
    clearResults();
    setStatus("");
  }
});

setStatus("Choose a foundation state to inspect.");
