module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Free Robux Generator API',
    version: 'v5.0.1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      main: '/',
      process: '/api/process (POST)',
      health: '/api/health (GET)',
      test: '/api/test (GET)'
    },
    stats: {
      memory: process.memoryUsage(),
      node_version: process.version,
      platform: process.platform
    }
  });
};