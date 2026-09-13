const { createHash } = require("node:crypto");
const { isIP } = require("node:net");

const TIME_ZONE = "Asia/Shanghai";
const RESULT_LIMIT = 24;
const CATALOG_LIMIT = 16;
const DETAIL_CONCURRENCY = 6;
const FIRECRAWL_URL = "https://api.firecrawl.dev/v2/scrape";
const TICKET_STATUSES = new Set(["on-sale", "coming-soon", "sold-out", "closed", "unknown"]);

const REGIONS = Object.freeze({
  broadway: Object.freeze({
    name: "Broadway.com",
    url: "https://www.broadway.com/",
    currency: "USD",
    sourceIsDetail: false,
    coverage: "Broadway.com musical performances explicitly exposed for the selected date on its catalogue homepage.",
  }),
  "west-end": Object.freeze({
    name: "London Theatre Direct",
    url: "https://www.londontheatredirect.com/",
    currency: "GBP",
    sourceIsDetail: false,
    strategy: "catalogue-detail",
    coverage: `London Theatre Direct musical catalogue checked against up to ${CATALOG_LIMIT} approved show pages for the selected date.`,
  }),
  germany: Object.freeze({
    name: "Musical1",
    url: "https://www.musical1.de/musicals/hamburg/",
    currency: "EUR",
    sourceIsDetail: false,
    coverage: "Musical1 performances explicitly exposed on the prepared Hamburg musicals page.",
  }),
});

const APPROVED_HOSTS = Object.freeze({
  broadway: new Set(["broadwaydirect.com", "www.broadwaydirect.com", "broadway.com", "www.broadway.com"]),
  "west-end": new Set(["officiallondontheatre.com", "www.officiallondontheatre.com", "londontheatredirect.com", "www.londontheatredirect.com"]),
  germany: new Set(["stage-entertainment.de", "www.stage-entertainment.de", "musical1.de", "www.musical1.de"]),
});

class PublicError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function text(value, maximum = 240) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function calendarDay() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isRealIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validateListingQuery(query) {
  const region = typeof query.region === "string" ? query.region : "";
  const date = typeof query.date === "string" ? query.date : "";
  const refreshDay = typeof query.refreshDay === "string" ? query.refreshDay : "";
  const today = calendarDay();
  if (!REGIONS[region]) throw new PublicError(400, "invalid_region", "Choose Broadway, West End, or Germany.");
  if (!isRealIsoDate(date) || date < today || date > addDays(today, 6)) {
    throw new PublicError(400, "invalid_date", "Choose a real date in the current seven-day Beijing window.");
  }
  if (refreshDay !== today) {
    throw new PublicError(400, "invalid_refresh_day", "Refresh the page to use the current Beijing day.");
  }
  return { region, date, refreshDay, source: REGIONS[region] };
}

function publicUrl(value, allowedHosts = null) {
  const candidate = text(value, 1600);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return "";
    if (url.port && !['80', '443'].includes(url.port)) return "";
    if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || isIP(hostname)) return "";
    if (allowedHosts && !allowedHosts.has(hostname)) return "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function requireDetailUrl(region, value) {
  const url = publicUrl(value, APPROVED_HOSTS[region]);
  if (!url) throw new PublicError(400, "unapproved_detail_url", "That detail page is not approved for this region.");
  return url;
}

function listingSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      performances: {
        type: "array",
        maxItems: RESULT_LIMIT,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            explicitSelectedDate: { type: "boolean" },
            title: { type: "string" },
            theatre: { type: "string" },
            city: { type: "string" },
            performanceDate: { type: "string" },
            performanceTimes: { type: "array", items: { type: "string" } },
            lowestPriceAmount: { type: ["number", "null"] },
            lowestPriceDisplay: { type: "string" },
            ticketStatus: { type: "string", enum: ["on-sale", "coming-soon", "sold-out", "closed", "unknown"] },
            detailUrl: { type: "string" },
            bookingUrl: { type: "string" },
          },
          required: ["explicitSelectedDate", "title", "theatre", "city", "performanceDate", "performanceTimes", "lowestPriceAmount", "lowestPriceDisplay", "ticketStatus", "detailUrl", "bookingUrl"],
        },
      },
    },
    required: ["performances"],
  };
}

function catalogueSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      shows: {
        type: "array",
        maxItems: CATALOG_LIMIT,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            detailUrl: { type: "string" },
          },
          required: ["title", "detailUrl"],
        },
      },
    },
    required: ["shows"],
  };
}

function detailSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      theatre: { type: "string" },
      city: { type: "string" },
      performanceFacts: { type: "array", items: { type: "string" }, maxItems: 8 },
      ticketFacts: { type: "array", items: { type: "string" }, maxItems: 8 },
      excerpt: { type: "string" },
      bookingUrl: { type: "string" },
    },
    required: ["title", "theatre", "city", "performanceFacts", "ticketFacts", "excerpt", "bookingUrl"],
  };
}

async function scrape({ url, prompt, schema, region }) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new PublicError(503, "source_not_configured", "Live listings are temporarily unavailable.");
  let response;
  try {
    response = await fetch(FIRECRAWL_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        formats: [{ type: "json", prompt, schema }],
        onlyMainContent: true,
        waitFor: 3000,
        timeout: 45000,
        maxAge: 43200000,
        removeBase64Images: true,
        blockAds: true,
      }),
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    throw new PublicError(502, "source_unreachable", "The live source did not respond. Please try again.");
  }
  if (!response.ok) throw new PublicError(502, "source_rejected", "The live source could not be read. Please try again later.");
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new PublicError(502, "source_invalid_response", "The live source returned an unreadable response.");
  }
  const extracted = payload && payload.data && payload.data.json;
  if (!payload.success || !extracted || typeof extracted !== "object") {
    throw new PublicError(502, "source_missing_data", "The live source did not return usable information.");
  }
  const metadata = payload.data && payload.data.metadata;
  const finalUrl = metadata && (metadata.url || metadata.sourceURL);
  if (finalUrl && !publicUrl(finalUrl, APPROVED_HOSTS[region])) {
    throw new PublicError(502, "source_redirect_rejected", "The source redirected outside the approved website.");
  }
  return extracted;
}

function validTimes(values) {
  if (!Array.isArray(values)) return [];
  const pattern = /^(?:[01]?\d|2[0-3]):[0-5]\d(?:\s?(?:am|pm))?$/i;
  return [...new Set(values.map((value) => text(value, 16)).filter((value) => pattern.test(value)))].slice(0, 8);
}

function normalizeListings(raw, context, retrievedAt) {
  const values = Array.isArray(raw.performances) ? raw.performances : [];
  const normalized = values.flatMap((item) => {
    if (!item || typeof item !== "object" || item.explicitSelectedDate !== true || item.performanceDate !== context.date) return [];
    const title = text(item.title, 160);
    if (!title) return [];
    const theatre = text(item.theatre, 160);
    const city = text(item.city, 100);
    const performanceTimes = validTimes(item.performanceTimes);
    const priceAmount = Number(item.lowestPriceAmount);
    const priceDisplay = text(item.lowestPriceDisplay, 80);
    const lowestPrice = item.lowestPriceAmount !== null && Number.isFinite(priceAmount) && priceAmount >= 0 && priceDisplay
      ? { amount: priceAmount, currency: context.source.currency, display: priceDisplay }
      : null;
    const ticketStatus = TICKET_STATUSES.has(item.ticketStatus) ? item.ticketStatus : "unknown";
    const extractedDetailUrl = publicUrl(item.detailUrl, APPROVED_HOSTS[context.region]);
    const detailUrl = extractedDetailUrl || (context.source.sourceIsDetail ? context.source.url : "");
    const bookingUrl = publicUrl(item.bookingUrl);
    const missingFields = [];
    if (!theatre) missingFields.push("theatre");
    if (!city) missingFields.push("city");
    if (!performanceTimes.length) missingFields.push("performanceTimes");
    if (!lowestPrice) missingFields.push("lowestPrice");
    if (ticketStatus === "unknown") missingFields.push("ticketStatus");
    if (!detailUrl) missingFields.push("detailUrl");
    if (!bookingUrl) missingFields.push("bookingUrl");
    const id = createHash("sha256").update(JSON.stringify([context.region, title, theatre, context.date, detailUrl])).digest("hex").slice(0, 24);
    return [{
      id,
      region: context.region,
      title,
      theatre,
      city,
      performanceDate: context.date,
      performanceTimes,
      lowestPrice,
      ticketStatus,
      detailUrl,
      bookingUrl,
      sourceName: context.source.name,
      sourceUrl: context.source.url,
      retrievedAt,
      missingFields,
    }];
  });
  const seen = new Set();
  return normalized.filter((item) => {
    const key = JSON.stringify([item.title, item.theatre, item.city, item.performanceDate, item.performanceTimes]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((left, right) => (left.performanceTimes[0] || "99:99").localeCompare(right.performanceTimes[0] || "99:99") || left.title.localeCompare(right.title)).slice(0, RESULT_LIMIT);
}

function listingPrompt(context) {
  return `Extract only musical-theatre performances that this public source explicitly supports for ${context.date} in ${context.region}. Exclude plays, concerts, opera, archived productions, navigation, editorial articles, and promotional blocks. Set explicitSelectedDate true only with visible evidence for that exact date. Return exact visible title, theatre, city, date as YYYY-MM-DD, all local performance times, lowest advertised price amount and display with source currency, explicit ticket-sale status mapped to on-sale, coming-soon, sold-out, closed, or unknown, an approved same-source detail URL, and the direct booking URL when present. Use empty values or null for unavailable fields. Do not infer, translate, convert currency, or invent facts. Return at most ${RESULT_LIMIT} items.`;
}

async function scrapeListingPage(context, source) {
  const pageContext = { ...context, source };
  const raw = await scrape({ url: source.url, prompt: listingPrompt(pageContext), schema: listingSchema(), region: context.region });
  return normalizeListings(raw, pageContext, new Date().toISOString());
}

async function loadCatalogueDetails(context) {
  const prompt = `From this London Theatre Direct catalogue, return up to ${CATALOG_LIMIT} currently bookable musical-theatre productions and their canonical same-site show detail URLs. Prefer entries presented as musicals. Exclude plays, concerts, opera, attractions, editorial pages, navigation links, duplicates, and booking-flow URLs. Do not follow links or invent entries.`;
  const raw = await scrape({ url: context.source.url, prompt, schema: catalogueSchema(), region: context.region });
  const values = Array.isArray(raw.shows) ? raw.shows : [];
  const seen = new Set();
  const urls = values.flatMap((show) => {
    const candidate = publicUrl(show && show.detailUrl, APPROVED_HOSTS[context.region]);
    if (!candidate) return [];
    const parsed = new URL(candidate);
    if (!parsed.pathname.toLowerCase().startsWith("/musical/")) return [];
    if (seen.has(candidate)) return [];
    seen.add(candidate);
    return [candidate];
  }).slice(0, CATALOG_LIMIT);
  if (!urls.length) return { listings: [], failures: 0 };

  const listings = [];
  let failures = 0;
  for (let offset = 0; offset < urls.length; offset += DETAIL_CONCURRENCY) {
    const batch = urls.slice(offset, offset + DETAIL_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((url) => scrapeListingPage(context, {
      ...context.source,
      url,
      sourceIsDetail: true,
      strategy: undefined,
    })));
    for (const result of results) {
      if (result.status === "fulfilled") listings.push(...result.value);
      else failures += 1;
    }
  }
  return { listings, failures };
}

async function loadListings(context) {
  const fetchedAt = new Date().toISOString();
  let listings;
  let failures = 0;
  if (context.source.strategy === "catalogue-detail") {
    const result = await loadCatalogueDetails(context);
    listings = result.listings;
    failures = result.failures;
  } else {
    listings = await scrapeListingPage(context, context.source);
  }
  const seen = new Set();
  listings = listings.filter((item) => {
    const key = JSON.stringify([item.title, item.theatre, item.city, item.performanceDate, item.performanceTimes]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((left, right) => (left.performanceTimes[0] || "99:99").localeCompare(right.performanceTimes[0] || "99:99") || left.title.localeCompare(right.title)).slice(0, RESULT_LIMIT);
  const warnings = [context.source.coverage];
  if (failures) warnings.push(`${failures} catalogue show page${failures === 1 ? "" : "s"} could not be checked; other verified results are shown.`);
  return {
    region: context.region,
    selectedDate: context.date,
    dataDay: context.refreshDay,
    fetchedAt,
    source: { name: context.source.name, url: context.source.url },
    listings,
    warnings,
  };
}

function normalizeFacts(values) {
  return Array.isArray(values) ? values.map((value) => text(value, 220)).filter(Boolean).slice(0, 8) : [];
}

async function loadDetail(region, detailUrl) {
  if (!REGIONS[region]) throw new PublicError(400, "invalid_region", "Choose Broadway, West End, or Germany.");
  const url = requireDetailUrl(region, detailUrl);
  const prompt = "Extract one bounded factual musical-theatre detail from this exact page. Return the visible title, theatre, city, up to eight explicit performance facts, up to eight explicit ticket facts, a concise factual synopsis excerpt, and the direct booking URL when present. Use empty values when unavailable. Do not infer, translate, quote reviews, query seats, or follow links.";
  const raw = await scrape({ url, prompt, schema: detailSchema(), region });
  const performanceFacts = normalizeFacts(raw.performanceFacts);
  const ticketFacts = normalizeFacts(raw.ticketFacts);
  const result = {
    title: text(raw.title, 160),
    region,
    theatre: text(raw.theatre, 160),
    city: text(raw.city, 100),
    performanceFacts,
    ticketFacts,
    excerpt: text(raw.excerpt, 320),
    sourceName: REGIONS[region].name,
    sourceUrl: url,
    bookingUrl: publicUrl(raw.bookingUrl),
    retrievedAt: new Date().toISOString(),
    missingFields: [],
  };
  for (const field of ["title", "theatre", "city", "performanceFacts", "ticketFacts", "excerpt", "bookingUrl"]) {
    if (Array.isArray(result[field]) ? result[field].length === 0 : !result[field]) result.missingFields.push(field);
  }
  return result;
}

function sendError(response, error) {
  const known = error instanceof PublicError;
  response.setHeader("Cache-Control", "private, no-store");
  response.status(known ? error.status : 500).json({
    error: {
      code: known ? error.code : "internal_error",
      message: known ? error.message : "The request could not be completed.",
    },
  });
}

module.exports = {
  APPROVED_HOSTS,
  PublicError,
  loadDetail,
  loadListings,
  requireDetailUrl,
  sendError,
  validateListingQuery,
};
