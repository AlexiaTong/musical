function parseDate(isoDate) { return new Date(`${isoDate}T12:00:00Z`); }

export function addDays(isoDate, numberOfDays) {
  const date = parseDate(isoDate);
  date.setUTCDate(date.getUTCDate() + numberOfDays);
  return date.toISOString().slice(0, 10);
}

export function dayDifference(fromDate, toDate) {
  return Math.round((parseDate(toDate) - parseDate(fromDate)) / 86400000);
}

export function getCalendarDay(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function buildDateOptions(today, count) {
  return Array.from({ length: count }, (_, offset) => {
    const value = addDays(today, offset);
    const date = parseDate(value);
    return {
      value,
      weekday: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(date),
      dayMonth: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
      isToday: offset === 0
    };
  });
}

export function deriveLocations(items) {
  const values = new Set();
  items.forEach((item) => { if (item.city) values.add(item.city); if (item.theatre) values.add(item.theatre); });
  return [...values].sort((left, right) => left.localeCompare(right));
}

export function filterListings(items, { location, budget }) {
  const maximum = budget === "" ? null : Number(budget);
  let unknownPriceExcluded = 0;
  const listings = items.filter((item) => {
    if (location && item.city !== location && item.theatre !== location) return false;
    if (maximum === null || !Number.isFinite(maximum)) return true;
    if (!item.lowestPrice) { unknownPriceExcluded += 1; return false; }
    return item.lowestPrice.amount <= maximum;
  });
  return { listings, unknownPriceExcluded };
}

export function toggleComparison(items, item, limit) {
  if (items.some((current) => current.id === item.id)) return { items: items.filter((current) => current.id !== item.id), rejected: false };
  if (items.length >= limit) return { items, rejected: true };
  return { items: [...items, item], rejected: false };
}
