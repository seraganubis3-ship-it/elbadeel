module.exports = {
  apps: [
    {
      name: 'haiba-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Use all CPU cores (Cluster Mode) - scaling & zero-downtime reloads
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Error handling restart delay
      exp_backoff_restart_delay: 100,
    },
    {
      name: 'haiba-whatsapp',
      script: 'whatsapp-bot.js',
      instances: 1, // Bot must be a singleton
      exec_mode: 'fork', // Cannot cluster the bot session
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
