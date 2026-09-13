export const config = Object.freeze({
  sampleDataPath: "./data/sample.json",
  sampleDelayMs: 450,
  resultLimit: 24,
  compareLimit: 3,
  detailExcerptLimit: 320,
  requestTimeoutMs: 10000,
  supportedRegionIds: Object.freeze(["broadway", "west-end", "germany"]),
  features: Object.freeze({
    liveData: false,
    comparison: false,
    detailsPanel: false
  }),
  display: Object.freeze({
    unavailableLabel: "Unavailable from source"
  })
});
