{
  "apps": [
    {
      "name": "founders-connect-backend",
      "script": "server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 4000
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 4000
      },
      "error_log": "./logs/err.log",
      "out_log": "./logs/out.log",
      "log_log": "./logs/combined.log",
      "time": true,
      "max_memory_restart": "1G",
      "restart_delay": 4000,
      "autorestart": true,
      "watch": false
    }
  ]
}