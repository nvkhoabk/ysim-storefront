module.exports = {
  apps: [
    {
      name: "ysim-sandbox",
      cwd: "/var/www/sandbox.ysim.vn/storefront",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001 -H 127.0.0.1",

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "700M",

      time: true,
      merge_logs: true,
    },
  ],
};
