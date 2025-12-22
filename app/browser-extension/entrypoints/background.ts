export default defineBackground(async () => {
  await browser.proxy.settings.clear({});
  await browser.proxy.settings.set({
    value: {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: 'http',
          host: 'localhost',
          port: 8000,
        },
      },
    },
    scope: 'regular',
  });
});
