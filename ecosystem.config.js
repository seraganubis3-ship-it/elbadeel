module.exports = {
  apps: [
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
