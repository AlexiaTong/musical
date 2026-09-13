const { loadListings, PublicError, sendError, validateListingQuery } = require("./_lib/live.js");

module.exports = async function shows(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendError(response, new PublicError(405, "method_not_allowed", "Use GET for musical listings."));
  }
  try {
    const context = validateListingQuery(request.query || {});
    const result = await loadListings(context);
    response.setHeader("Cache-Control", "public, max-age=0, s-maxage=900, stale-while-revalidate=21600");
    response.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=900, stale-while-revalidate=21600");
    return response.status(200).json(result);
  } catch (error) {
    return sendError(response, error);
  }
};
