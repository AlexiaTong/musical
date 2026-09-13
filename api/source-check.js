const SOURCES = Object.freeze({
  "broadway-direct": {
    region: "broadway",
    url: "https://broadwaydirect.com/shows/",
    date: "2026-09-15",
  },
  "broadway-com": {
    region: "broadway",
    url: "https://www.broadway.com/shows/wicked/",
    date: "2026-09-15",
  },
  "official-london-theatre": {
    region: "west-end",
    url: "https://officiallondontheatre.com/london-musicals/",
    date: "2026-09-15",
  },
  "london-theatre-direct": {
    region: "west-end",
    url: "https://www.londontheatredirect.com/musical/hadestown-tickets",
    date: "2026-09-15",
  },
  "stage-entertainment": {
    region: "germany",
    url: "https://www.stage-entertainment.de/",
    date: "2026-09-13",
  },
  musical1: {
    region: "germany",
    url: "https://www.musical1.de/musicals/hamburg/",
    date: "2026-09-13",
  },
});

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    supportsSelectedDate: { type: "boolean" },
    dateEvidence: { type: "string" },
    performances: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          theatre: { type: "string" },
          city: { type: "string" },
          performanceDate: { type: "string" },
          performanceTimes: { type: "array", items: { type: "string" } },
          lowestPriceDisplay: { type: "string" },
          ticketStatus: { type: "string" },
          bookingUrl: { type: "string" },
        },
        required: ["title", "theatre", "city", "performanceDate", "performanceTimes", "lowestPriceDisplay", "ticketStatus", "bookingUrl"],
      },
    },
  },
  required: ["supportsSelectedDate", "dateEvidence", "performances"],
};

function send(response, status, body) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.status(status).json(body);
}

function safeHost(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

function normalize(value, source) {
  const item = value && typeof value === "object" ? value : {};
  return {
    title: typeof item.title === "string" ? item.title : "",
    theatre: typeof item.theatre === "string" ? item.theatre : "",
    city: typeof item.city === "string" ? item.city : "",
    performanceDate: typeof item.performanceDate === "string" ? item.performanceDate : "",
    performanceTimes: Array.isArray(item.performanceTimes) ? item.performanceTimes.filter((time) => typeof time === "string").slice(0, 8) : [],
    lowestPriceDisplay: typeof item.lowestPriceDisplay === "string" ? item.lowestPriceDisplay : "",
    ticketStatus: typeof item.ticketStatus === "string" ? item.ticketStatus : "",
    detailUrlHost: new URL(source.url).hostname,
    bookingUrlHost: safeHost(item.bookingUrl),
  };
}

module.exports = async function sourceCheck(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return send(response, 405, { error: "method_not_allowed" });
  }

  const provider = typeof request.query.provider === "string" ? request.query.provider : "";
  const source = SOURCES[provider];
  if (!source) return send(response, 400, { error: "invalid_provider" });

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return send(response, 503, { error: "firecrawl_not_configured" });

  const prompt = [
    `Inspect only this page for musical performances on ${source.date}.`,
    "Set supportsSelectedDate true only if the page explicitly connects a musical to that exact date.",
    "Extract up to three matching performances with title, theatre, city, all times on that date, lowest displayed price, ticket availability/status, and the ticket-booking link.",
    "Use YYYY-MM-DD for performanceDate. Never infer, calculate, or invent facts.",
    "If an exact fact is absent, use an empty string or array. Keep dateEvidence to a short paraphrase.",
  ].join(" ");

  let upstream;
  try {
    upstream = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: source.url,
        formats: [{ type: "json", prompt, schema }],
        onlyMainContent: true,
        waitFor: 3000,
        timeout: 45000,
        maxAge: 86400000,
        removeBase64Images: true,
        blockAds: true,
      }),
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    return send(response, 502, { error: "firecrawl_unreachable" });
  }

  if (!upstream.ok) return send(response, 502, { error: "firecrawl_rejected_request", upstreamStatus: upstream.status });

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return send(response, 502, { error: "firecrawl_invalid_response" });
  }

  const extracted = payload && payload.data && payload.data.json;
  if (!payload.success || !extracted || typeof extracted !== "object") {
    return send(response, 502, { error: "firecrawl_extraction_missing" });
  }

  const performances = Array.isArray(extracted.performances)
    ? extracted.performances.slice(0, 3).map((item) => normalize(item, source))
    : [];
  const exact = performances.filter((item) => item.performanceDate === source.date);
  const coverage = {
    selectedDate: extracted.supportsSelectedDate === true && exact.length > 0,
    times: exact.some((item) => item.performanceTimes.length > 0),
    theatre: exact.some((item) => Boolean(item.theatre)),
    city: exact.some((item) => Boolean(item.city)),
    price: exact.some((item) => Boolean(item.lowestPriceDisplay)),
    ticketStatus: exact.some((item) => Boolean(item.ticketStatus)),
    detailLink: exact.length > 0,
    bookingLink: exact.some((item) => Boolean(item.bookingUrlHost)),
  };

  return send(response, 200, {
    provider,
    region: source.region,
    sourceHost: new URL(source.url).hostname,
    requestedDate: source.date,
    dateEvidence: typeof extracted.dateEvidence === "string" ? extracted.dateEvidence : "",
    performances,
    coverage,
    gatePassed: Object.values(coverage).every(Boolean),
  });
};

