<script setup>
import { computed } from 'vue'
import { data as posts } from './posts.data.js'
import { blogLanguageLabels, supportedBlogLanguages } from './blogLanguages.js'
import BlogLangSwitcher from './BlogLangSwitcher.vue'
import { useBlogLanguage } from './useBlogLanguage.js'

const props = defineProps({
  slug: { type: String, required: true }
})

const { currentLang: requestedLang, setBlogLanguage } = useBlogLanguage()

const article = computed(() => {
  const versions = posts.filter(post => post.slug === props.slug)
  return (
    versions.find(post => post.lang === requestedLang.value) ??
    versions.find(post => post.lang === 'en') ??
    versions[0]
  )
})

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(requestedLang.value === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
)

const languageState = computed(() => {
  const languages = supportedBlogLanguages
    .map(code => posts.find(post => post.slug === props.slug && post.lang === code))
    .filter(Boolean)
    .map(({ lang, link }) => ({
      code: lang,
      label: blogLanguageLabels[lang],
      link
    }))

  if (!languages.length) return null

  return {
    languages,
    currentLang: requestedLang.value,
    ariaLabel:
      requestedLang.value === 'zh'
        ? '文章语言'
        : requestedLang.value === 'es'
          ? 'Idiomas del artículo'
          : 'Article languages'
  }
})
</script>

<template>
  <article v-if="article" class="blog-article">
    <header>
      <div class="blog-article-meta">
        <time v-if="article.date" :datetime="article.date">
          {{ dateFormatter.format(new Date(article.date)) }}
        </time>
        <span v-if="article.author">{{ article.author }}</span>
        <span v-if="article.lang !== requestedLang" class="blog-language-badge">
          {{ blogLanguageLabels[article.lang] }}
        </span>
      </div>
      <h1>{{ article.title }}</h1>
      <BlogLangSwitcher
        v-if="languageState"
        v-bind="languageState"
        @select="setBlogLanguage"
      />
    </header>
    <div class="vp-doc blog-article-body" v-html="article.html" />
  </article>
</template>

<style scoped>
.blog-article {
  width: 100%;
  margin: 0 auto;
}

.blog-article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
}

.blog-language-badge {
  padding: 3px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  font-size: 0.75rem;
  font-weight: 650;
}

.blog-article h1 {
  margin: 0 0 16px;
  color: var(--vp-c-text-1);
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.025em;
}

.blog-article :deep(.blog-lang-switcher) {
  margin: 0 0 28px;
}

.blog-article-body :deep(h2) {
  margin-top: 42px;
}
</style>
