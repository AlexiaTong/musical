const { loadListings, PublicError, sendError } = require("./_lib/live.js");

const SOURCES = Object.freeze({
  broadway: Object.freeze({
    name: "Broadway.com catalogue check",
    url: "https://www.broadway.com/",
    currency: "USD",
    sourceIsDetail: false,
    coverage: "Temporary bounded catalogue check.",
  }),
  "west-end": Object.freeze({
    name: "London Theatre Direct catalogue check",
    url: "https://www.londontheatredirect.com/",
    currency: "GBP",
    sourceIsDetail: false,
    coverage: "Temporary bounded catalogue check.",
  }),
});

module.exports = async function catalogCheck(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendError(response, new PublicError(405, "method_not_allowed", "Use GET for the catalogue check."));
  }
  const region = typeof request.query.region === "string" ? request.query.region : "";
  const source = SOURCES[region];
  if (!source) return sendError(response, new PublicError(400, "invalid_region", "Choose Broadway or West End."));
  try {
    const result = await loadListings({ region, date: "2026-09-15", refreshDay: "2026-09-13", source });
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json(result);
  } catch (error) {
    return sendError(response, error);
  }
};

