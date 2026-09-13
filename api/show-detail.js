const { loadDetail, PublicError, sendError } = require("./_lib/live.js");

module.exports = async function showDetail(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendError(response, new PublicError(405, "method_not_allowed", "Use POST for performance details."));
  }
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    if (Object.keys(body).some((key) => !["region", "detailUrl"].includes(key))) {
      throw new PublicError(400, "invalid_request", "The detail request contains unsupported fields.");
    }
    const region = typeof body.region === "string" ? body.region : "";
    const detailUrl = typeof body.detailUrl === "string" && body.detailUrl.length <= 1800 ? body.detailUrl : "";
    const result = await loadDetail(region, detailUrl);
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json(result);
  } catch (error) {
    return sendError(response, error);
  }
};

