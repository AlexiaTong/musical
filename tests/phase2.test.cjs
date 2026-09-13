const test = require("node:test");
const assert = require("node:assert/strict");
const shows = require("../api/shows.js");
const showDetail = require("../api/show-detail.js");

function responseRecorder() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

function beijingDay() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

test("listing validation rejects unsupported input without scraping", async () => {
  const invalidRegion = responseRecorder();
  await shows({ method: "GET", query: { region: "other", date: beijingDay(), refreshDay: beijingDay() } }, invalidRegion);
  assert.equal(invalidRegion.statusCode, 400);
  assert.equal(invalidRegion.body.error.code, "invalid_region");

  const staleRefresh = responseRecorder();
  await shows({ method: "GET", query: { region: "broadway", date: beijingDay(), refreshDay: "2020-01-01" } }, staleRefresh);
  assert.equal(staleRefresh.statusCode, 400);
  assert.equal(staleRefresh.body.error.code, "invalid_refresh_day");
});

test("detail validation rejects unsafe and cross-region URLs", async () => {
  for (const detailUrl of [
    "http://localhost/private",
    "https://user:password@www.broadway.com/shows/wicked/",
    "https://www.musical1.de/musicals/hamburg/",
    "not a url",
  ]) {
    const response = responseRecorder();
    await showDetail({ method: "POST", body: { region: "broadway", detailUrl } }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error.code, "unapproved_detail_url");
  }
});

test("successful listings are normalized and receive shared cache headers", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    async json() {
      return {
        success: true,
        data: {
          metadata: { url: "https://www.broadway.com/shows/wicked/" },
          json: {
            performances: [{
              explicitSelectedDate: true,
              title: "Wicked",
              theatre: "Gershwin Theatre",
              city: "New York",
              performanceDate: beijingDay(),
              performanceTimes: ["7:00pm", "invalid"],
              lowestPriceAmount: 126.72,
              lowestPriceDisplay: "from $126.72",
              ticketStatus: "on-sale",
              detailUrl: "https://www.broadway.com/shows/wicked/",
              bookingUrl: "https://www.broadway.com/shows/wicked/buy-tickets/",
            }],
          },
        },
      };
    },
  });
  try {
    const response = responseRecorder();
    await shows({ method: "GET", query: { region: "broadway", date: beijingDay(), refreshDay: beijingDay() } }, response);
    assert.equal(response.statusCode, 200);
    assert.match(response.headers["cache-control"], /s-maxage=900/);
    assert.equal(response.body.listings.length, 1);
    assert.deepEqual(response.body.listings[0].performanceTimes, ["7:00pm"]);
    assert.equal(response.body.listings[0].lowestPrice.currency, "USD");
    assert.equal(response.body.dataDay, beijingDay());
  } finally {
    global.fetch = originalFetch;
  }
});

