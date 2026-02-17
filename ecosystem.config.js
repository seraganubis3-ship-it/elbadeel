module.exports = {
  apps: [
    {
      name: 'haiba-whatsapp',
      script: 'whatsapp-bot.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'haiba-web',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Force internal connection to bot
        WHATSAPP_API_URL: 'http://127.0.0.1:4000',
      },
    },
  ],
};
