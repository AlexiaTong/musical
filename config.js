export const config = Object.freeze({
  resultLimit: 24,
  compareLimit: 3,
  detailExcerptLimit: 320,
  requestTimeoutMs: 65000,
  timeZone: "Asia/Shanghai",
  daysVisible: 7,
  supportedRegionIds: Object.freeze(["broadway", "west-end", "germany"]),
  regionLabels: Object.freeze({ broadway: "Broadway", "west-end": "West End", germany: "Germany" }),
  regionCurrencies: Object.freeze({ broadway: "USD", "west-end": "GBP", germany: "EUR" }),
  features: Object.freeze({ liveData: true, comparison: true, detailsPanel: true }),
  display: Object.freeze({ unavailableLabel: "Unavailable from source", unknownStatusLabel: "Status unavailable" })
});
