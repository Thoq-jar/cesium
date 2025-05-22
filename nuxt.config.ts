// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["nuxt-monaco-editor"],
  compatibilityDate: '2025-05-22',
  monacoEditor: {
    locale: "en",
    componentName: {
      codeEditor: "MonacoEditor",
      diffEditor: "MonacoDiffEditor",
    },
  },
  nitro: {
    devProxy: {
      '/': {
        target: 'http://localhost:4324',
      },
    },
    server: {
      port: 4324
    }
  }
});
