module.exports = {
  apps: [
    {
      name: 'simplisleep-api',
      script: 'index.mjs',
      node_args: '--env-file=.env',
      env: {
        APP_ROOT: '.'
      },
      max_memory_restart: '200M'
    }
  ]
};
