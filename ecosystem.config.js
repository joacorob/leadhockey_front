module.exports = {
  apps: [
    {
      name: "leadhockey_front",
      // Use npm to start the Next.js production server so package.json scripts handle the command.
      script: "npm",
      args: "start",

      // ----- PM2 options -----
      exec_mode: "fork", // change to "cluster" and adjust instances if you prefer clustering
      instances: 1, // or "max" to match the number of CPU cores
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",

      // ----- Environment variables (non-secret) -----
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3011,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        LEAD_BACKEND: process.env.LEAD_BACKEND,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
      }
    }
  ]
}
