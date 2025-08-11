const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const writeLog = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  // Write to console
  console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`);
  
  // Write to file
  const logFile = path.join(logsDir, `${level}.log`);
  fs.appendFileSync(logFile, logString);
  
  // Also write to combined log
  const combinedLogFile = path.join(logsDir, 'combined.log');
  fs.appendFileSync(combinedLogFile, logString);
};

const logger = {
  info: (message, meta = {}) => writeLog('info', message, meta),
  warn: (message, meta = {}) => writeLog('warn', message, meta),
  error: (message, meta = {}) => writeLog('error', message, meta),
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('debug', message, meta);
    }
  }
};

module.exports = logger;