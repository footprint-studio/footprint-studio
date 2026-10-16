import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '足迹地球',
  description: '把旅行与居住足迹变成可交互的 3D 地球，嵌入博客、主页与简历。',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { property: 'og:title', content: '足迹地球 · Footprint Globe' }],
    [
      'meta',
      {
        property: 'og:description',
        content: '把旅行与居住足迹变成可交互的 3D 地球。无 token、开源、可嵌入。',
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
      { text: '示例', link: '/examples/', activeMatch: '^/examples/' },
      {
        text: 'v1.0.0',
        items: [
          {
            text: '更新日志',
            link: 'https://github.com/footprint-studio/footprint-studio/releases',
          },
          { text: 'NPM', link: 'https://www.npmjs.com/package/footprint-globe' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
        {
          text: '参考',
          items: [
            { text: '配置协议', link: '/guide/config-protocol' },
            { text: '数据格式', link: '/guide/data-formats' },
            { text: '隐私与安全', link: '/guide/privacy' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: '总览', link: '/api/' },
            { text: 'FootprintGlobe 类', link: '/api/footprint-globe' },
            { text: 'Web Component', link: '/api/web-component' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '总览', link: '/examples/' },
            { text: '旅行博客', link: '/examples/travel' },
            { text: '开发者主页', link: '/examples/developer' },
            { text: '团队分布', link: '/examples/team' },
            { text: '简历', link: '/examples/resume' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/footprint-studio/footprint-studio' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/footprint-globe' },
    ],
    footer: {
      message: '由 Footprint Studio 维护 · MIT Licensed',
      copyright: 'Copyright © 2025 Footprint Studio',
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '未找到结果',
            resetButtonTitle: '清除条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
  },
});
