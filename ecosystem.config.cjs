module.exports = {
  apps: [
    {
      name: 'simplisleep-api',
      script: 'index.mjs',
      node_args: '--env-file=.env --experimental-sqlite --max-old-space-size=128',
      env: {
        APP_ROOT: '.'
      },
      max_memory_restart: '200M'
    }
  ]
};
