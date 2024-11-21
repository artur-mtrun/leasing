module.exports = {
  apps: [
    {
      name: "leasing-prod",
      script: "app.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    },
    {
      name: "leasing-dev",
      script: "app.js",
      env: {
        NODE_ENV: "development",
        PORT: 3001  // inny port dla wersji deweloperskiej
      },
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      watch_options: {
        followSymlinks: false
      }
    }
  ]
} 