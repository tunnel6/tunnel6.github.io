<script setup>
import { computed } from 'vue'
import { blogLanguageLabels, supportedBlogLanguages } from './blogLanguages'
import BlogLangSwitcher from './BlogLangSwitcher.vue'
import { useBlogLanguage } from './useBlogLanguage.js'

const props = defineProps({
  posts: { type: Array, required: true },
})

const { currentLang, setBlogLanguage } = useBlogLanguage()

const interfaceText = computed(() => {
  const translations = {
    en: {
      dateLocale: 'en-US',
      eyebrow: 'YAT Blog',
      title: 'Build, connect, and stay in control',
      lede:
        'Product updates, security notes, architecture decisions, and practical guides for running YAT.',
      listLabel: 'Latest posts',
      readMoreLabel: 'Read article',
      languageSwitcherLabel: 'Blog language',
      emptyLabel: 'No articles have been published yet.'
    },
    zh: {
      dateLocale: 'zh-CN',
      eyebrow: 'YAT 博客',
      title: '构建连接，保持掌控',
      lede: '发布产品更新、安全说明、架构决策，以及运行和维护 YAT 的实践经验。',
      listLabel: '最新文章',
      readMoreLabel: '阅读文章',
      languageSwitcherLabel: '博客语言',
      emptyLabel: '暂未发布文章。'
    },
    es: {
      dateLocale: 'es-ES',
      eyebrow: 'Blog de YAT',
      title: 'Construye, conecta y mantén el control',
      lede:
        'Actualizaciones de producto, notas de seguridad, decisiones de arquitectura y guías prácticas para usar YAT.',
      listLabel: 'Últimas entradas',
      readMoreLabel: 'Leer artículo',
      languageSwitcherLabel: 'Idioma del blog',
      emptyLabel: 'Todavía no hay artículos publicados.'
    },
    ja: {
      dateLocale: 'ja-JP',
      eyebrow: 'YAT ブログ',
      title: '構築、接続、そして制御を維持',
      lede:
        'YAT を運用するための製品アップデート、セキュリティノート、アーキテクチャの決定、実践ガイドを公開しています。',
      listLabel: '最新記事',
      readMoreLabel: '記事を読む',
      languageSwitcherLabel: 'ブログの言語',
      emptyLabel: '公開済みの記事はまだありません。'
    }
  }

  return translations[currentLang.value]
})

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(interfaceText.value.dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
)

const visiblePosts = computed(() => {
  const groups = new Map()

  for (const post of props.posts) {
    if (!groups.has(post.slug)) groups.set(post.slug, [])
    groups.get(post.slug).push(post)
  }

  return [...groups.values()]
    .map(versions => {
      const selected =
        versions.find(post => post.lang === currentLang.value) ??
        versions.find(post => post.lang === 'en') ??
        versions[0]

      return {
        ...selected,
        tags: selected.tags ?? [],
        fallbackLanguage:
          selected.lang !== currentLang.value
            ? blogLanguageLabels[selected.lang]
            : null,
        excerpt: selected.excerpt || selected.description || ''
      }
    })
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
})

const languageState = computed(() => ({
  languages: supportedBlogLanguages
    .map(code => {
      const languagePost = props.posts.find(post => post.lang === code)
      return languagePost
        ? { code, label: blogLanguageLabels[code], link: languagePost.link }
        : null
    })
    .filter(Boolean),
  currentLang: currentLang.value,
  ariaLabel: interfaceText.value.languageSwitcherLabel
}))
</script>

<template>
  <main class="blog-shell">
    <header class="blog-hero">
      <p class="blog-eyebrow">{{ interfaceText.eyebrow }}</p>
      <h1>{{ interfaceText.title }}</h1>
      <p class="blog-lede">{{ interfaceText.lede }}</p>
      <BlogLangSwitcher
        v-if="languageState.languages.length"
        v-bind="languageState"
        @select="setBlogLanguage"
      />
    </header>

    <section class="blog-grid" :aria-label="interfaceText.listLabel">
      <article v-for="post in visiblePosts" :key="post.link" class="blog-card">
        <div class="blog-card-meta">
          <time v-if="post.date" :datetime="post.date">
          {{ dateFormatter.format(new Date(post.date)) }}
          </time>
          <span v-if="post.author" class="blog-author">{{ post.author }}</span>
          <span v-for="tag in post.tags" :key="tag" class="blog-tag">{{ tag }}</span>
          <span v-if="post.fallbackLanguage" class="blog-tag">{{ post.fallbackLanguage }}</span>
        </div>
        <h2><a :href="post.link">{{ post.title }}</a></h2>
        <p v-if="post.excerpt" v-html="post.excerpt" />
        <a class="blog-read-more" :href="post.link">
          {{ interfaceText.readMoreLabel }}
        </a>
      </article>
    </section>

    <p v-if="!visiblePosts.length" class="blog-empty">
      {{ interfaceText.emptyLabel }}
    </p>
  </main>
</template>
