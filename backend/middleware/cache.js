const NodeCache = require('node-cache');

// Create a new instance, default TTL is 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * Express middleware to cache responses in memory
 * @param {number} durationInSeconds - How long to cache the response
 */
function cacheResponse(durationInSeconds = 60) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    // Key includes URL and query params
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      return res.json(cachedBody);
    } else {
      // Intercept the res.json method to save the body before it sends
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful requests
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, durationInSeconds);
        }
        originalJson(body);
      };
      next();
    }
  };
}

/**
 * Manually invalidate a cache key via regex or prefix
 */
function invalidateCache(prefix) {
  const keys = cache.keys();
  const keysToDelete = keys.filter(k => k.includes(prefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
  }
}

module.exports = { cache, cacheResponse, invalidateCache };
