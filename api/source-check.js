const SOURCES = Object.freeze({
  broadway: {
    url: "https://broadwaydirect.com/shows/",
    date: "2026-09-13",
  },
  "west-end": {
    url: "https://officiallondontheatre.com/london-musicals/",
    date: "2026-09-15",
  },
  germany: {
    url: "https://www.stage-entertainment.de/",
    date: "2026-09-19",
  },
});

const extractionSchema = {
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
          detailUrl: { type: "string" },
          bookingUrl: { type: "string" },
        },
        required: [
          "title",
          "theatre",
          "city",
          "performanceDate",
          "performanceTimes",
          "lowestPriceDisplay",
          "ticketStatus",
          "detailUrl",
          "bookingUrl",
        ],
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

function normalizePerformance(value) {
  const item = value && typeof value === "object" ? value : {};
  return {
    title: typeof item.title === "string" ? item.title : "",
    theatre: typeof item.theatre === "string" ? item.theatre : "",
    city: typeof item.city === "string" ? item.city : "",
    performanceDate: typeof item.performanceDate === "string" ? item.performanceDate : "",
    performanceTimes: Array.isArray(item.performanceTimes)
      ? item.performanceTimes.filter((time) => typeof time === "string").slice(0, 8)
      : [],
    lowestPriceDisplay:
      typeof item.lowestPriceDisplay === "string" ? item.lowestPriceDisplay : "",
    ticketStatus: typeof item.ticketStatus === "string" ? item.ticketStatus : "",
    detailUrlHost: safeHost(item.detailUrl),
    bookingUrlHost: safeHost(item.bookingUrl),
  };
}

module.exports = async function sourceCheck(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return send(response, 405, { error: "method_not_allowed" });
  }

  const region = typeof request.query.region === "string" ? request.query.region : "";
  const source = SOURCES[region];
  if (!source) {
    return send(response, 400, { error: "invalid_region" });
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return send(response, 503, { error: "firecrawl_not_configured" });
  }

  const prompt = [
    `Inspect only this page for musical performances on ${source.date}.`,
    "Set supportsSelectedDate true only when the page itself explicitly connects a musical to that exact date.",
    "For each supported musical, copy only explicit theatre, city, performance times, lowest displayed price, ticket status, and links.",
    "Use YYYY-MM-DD for performanceDate. Never infer, calculate, or invent a value.",
    "If an exact fact is absent, use an empty string or empty array. Return at most three performances.",
    "dateEvidence must be a short paraphrase, not a long quotation.",
  ].join(" ");

  let firecrawlResponse;
  try {
    firecrawlResponse = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: source.url,
        formats: [{ type: "json", prompt, schema: extractionSchema }],
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

  if (!firecrawlResponse.ok) {
    return send(response, 502, {
      error: "firecrawl_rejected_request",
      upstreamStatus: firecrawlResponse.status,
    });
  }

  let payload;
  try {
    payload = await firecrawlResponse.json();
  } catch {
    return send(response, 502, { error: "firecrawl_invalid_response" });
  }

  const extracted = payload && payload.data && payload.data.json;
  if (!payload.success || !extracted || typeof extracted !== "object") {
    return send(response, 502, { error: "firecrawl_extraction_missing" });
  }

  const performances = Array.isArray(extracted.performances)
    ? extracted.performances.slice(0, 3).map(normalizePerformance)
    : [];
  const exactDatePerformances = performances.filter(
    (performance) => performance.performanceDate === source.date,
  );
  const coverage = {
    selectedDate: extracted.supportsSelectedDate === true && exactDatePerformances.length > 0,
    times: exactDatePerformances.some((performance) => performance.performanceTimes.length > 0),
    theatre: exactDatePerformances.some((performance) => Boolean(performance.theatre)),
    city: exactDatePerformances.some((performance) => Boolean(performance.city)),
    price: exactDatePerformances.some((performance) => Boolean(performance.lowestPriceDisplay)),
    ticketStatus: exactDatePerformances.some((performance) => Boolean(performance.ticketStatus)),
    detailLink: exactDatePerformances.some((performance) => Boolean(performance.detailUrlHost)),
    bookingLink: exactDatePerformances.some((performance) => Boolean(performance.bookingUrlHost)),
  };

  return send(response, 200, {
    region,
    sourceHost: new URL(source.url).hostname,
    requestedDate: source.date,
    dateEvidence: typeof extracted.dateEvidence === "string" ? extracted.dateEvidence : "",
    performances,
    coverage,
    gatePassed: Object.values(coverage).every(Boolean),
  });
};

