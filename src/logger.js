const formatTs = () => new Date().toISOString();

const log = {
  info: (...args) => console.log(`[INFO ${formatTs()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${formatTs()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${formatTs()}]`, ...args),
  debug: (...args) => console.debug(`[DEBUG ${formatTs()}]`, ...args),
};

module.exports = log; 