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
  browser.proxy.onProxyError.addListener(async () => {
    const errorPageUrl = browser.runtime.getURL('/proxy-error.html');
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      await browser.tabs.update(activeTab.id, { url: errorPageUrl });
    }
  });
});
