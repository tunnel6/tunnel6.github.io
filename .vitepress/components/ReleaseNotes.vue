<script setup>
import { computed } from 'vue'
import { data as releaseNotes } from './releaseNotes.data'

const props = defineProps({
  locale: { type: String, required: true },
  version: { type: String, default: undefined }
})

const interfaceText = computed(() => {
  const translations = {
    en: {
      eyebrow: 'Product updates',
      title: 'Release Notes',
      description:
        'Learn what changed in each YAT release, from service tunnels to WireGuard networking.',
      indexTitle: 'All releases',
      pagerTitle: 'Release pagination',
      previousLabel: 'Older release',
      nextLabel: 'Newer release',
      errorLabel: 'Unable to load this release note.',
      latestLabel: 'Latest:',
      footerDescription:
        'Download the latest client to get all current fixes and networking improvements.',
      downloadLabel: 'Download YAT',
      downloadLink: '/download'
    },
    zh: {
      eyebrow: '产品更新',
      title: '更新说明',
      description: '了解每个 YAT 版本的变化，覆盖服务隧道和 WireGuard 组网能力。',
      indexTitle: '全部版本',
      pagerTitle: '版本分页',
      previousLabel: '较早版本',
      nextLabel: '较新版本',
      errorLabel: '无法加载此版本说明。',
      latestLabel: '最新版本：',
      footerDescription: '下载最新客户端，即可获得当前所有修复和组网改进。',
      downloadLabel: '下载 YAT',
      downloadLink: '/zh/download'
    }
  }

  return translations[props.locale] ?? translations.en
})

const notes = computed(() => {
  const contentLocale = props.locale === 'zh' ? 'zh-CN' : props.locale
  return releaseNotes.filter(note => note.locale === contentLocale)
})

const currentIndex = computed(() =>
  notes.value.findIndex(
    note => note.version === (props.version ?? notes.value[0]?.version)
  )
)
const currentNote = computed(() => notes.value[currentIndex.value] ?? null)
const previousNote = computed(() => notes.value[currentIndex.value + 1] ?? null)
const nextNote = computed(() => notes.value[currentIndex.value - 1] ?? null)
const markdownHtml = computed(() =>
  currentNote.value ? currentNote.value.html : interfaceText.value.errorLabel
)
</script>

<template>
  <main class="release-notes">
    <div class="release-notes-container">
      <div>
        <header class="release-notes-header">
          <p>{{ interfaceText.eyebrow }}</p>
          <h1>{{ interfaceText.title }}</h1>
          <p>{{ interfaceText.description }}</p>
        </header>

        <nav class="release-notes-index" :aria-label="interfaceText.indexTitle">
          <h2>{{ interfaceText.indexTitle }}</h2>
          <ul>
            <li v-for="(note, index) in notes" :key="note.id">
              <a
                :href="note.link"
                :class="{ active: index === currentIndex }"
                :aria-current="index === currentIndex ? 'page' : undefined"
              >
                <strong>{{ note.version }}</strong>
                <span>{{ note.summary }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <article class="release-note-content">
        <div class="vp-doc release-note-markdown" v-html="markdownHtml" />
      </article>

        <nav class="release-notes-pager" :aria-label="interfaceText.pagerTitle">
        <a v-if="previousNote" class="previous" :href="previousNote.link">
          <span>{{ interfaceText.previousLabel }}</span>
          <strong>{{ previousNote.version }}</strong>
        </a>
        <span v-else class="placeholder" />
        <a v-if="nextNote" class="next" :href="nextNote.link">
          <span>{{ interfaceText.nextLabel }}</span>
          <strong>{{ nextNote.version }}</strong>
        </a>
        <span v-else class="placeholder" />
      </nav>

      <footer class="release-notes-actions">
        <p>
          {{ interfaceText.footerDescription }}
          <strong>
            {{ interfaceText.latestLabel }} {{ notes[0]?.version }}
          </strong>
        </p>
        <a :href="interfaceText.downloadLink">
          {{ interfaceText.downloadLabel }}
        </a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.release-notes-container {
  max-width: calc(var(--vp-layout-max-width) - 64px);
  margin: 0 auto;
  padding: 56px 24px 88px;
}

.release-notes-header {
  margin-bottom: 34px;
}

.release-notes-header p:first-child {
  margin: 0 0 10px;
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.release-notes-header h1 {
  max-width: none;
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
  font-size: clamp(2rem, 3.2vw, 2.7rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.release-notes-header p:last-child {
  max-width: 42rem;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 1.0625rem;
  line-height: 1.7;
}

.release-notes-index {
  margin-bottom: 40px;
}

.release-notes-index h2 {
  margin: 0 0 14px;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.release-notes-index ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.release-notes-index a {
  display: grid;
  gap: 3px;
  padding: 13px 15px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.release-notes-index a:hover {
  border-color: var(--vp-c-brand-1);
}

.release-notes-index a.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.release-notes-index strong {
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
}

.release-notes-index span {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.5;
}

.release-note-content {
  padding: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
}

.release-note-markdown :deep(h1) {
  max-width: none;
  margin: 0 0 18px;
  padding: 0;
  font-size: 1.7rem;
  border: 0;
}

.release-note-markdown :deep(h2) {
  margin: 30px 0 14px;
  padding: 0;
  font-size: 1.3rem;
  border: 0;
}

.release-note-markdown :deep(h3) {
  margin: 26px 0 10px;
  padding: 0;
  font-size: 1.1rem;
  border: 0;
}

.release-note-markdown :deep(ul) {
  display: grid;
  gap: 9px;
  margin: 0;
  padding-left: 22px;
}

.release-note-markdown :deep(p) {
  margin: 0 0 14px;
}

.release-notes-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
}

.release-notes-pager a,
.release-notes-pager .placeholder {
  min-height: 72px;
}

.release-notes-pager a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 15px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 13px;
  background: var(--vp-c-bg);
  text-decoration: none;
}

.release-notes-pager a:hover {
  border-color: var(--vp-c-brand-1);
}

.release-notes-pager span {
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
}

.release-notes-pager strong {
  color: var(--vp-c-text-1);
  font-size: 0.98rem;
}

.release-notes-pager .next {
  text-align: right;
}

.release-notes-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 34px;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-alt);
}

.release-notes-actions p {
  max-width: 34rem;
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.release-notes-actions a {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 9px 18px;
  border-radius: 9px;
  color: #07120a;
  background: var(--vp-c-brand-1);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .release-notes-container {
    padding-top: 36px;
  }

  .release-notes-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .release-notes-actions a {
    justify-content: center;
  }
}

@media (min-width: 768px) {
  .release-notes-container {
    display: grid;
    grid-template-columns: minmax(240px, 290px) minmax(0, 1fr);
    gap: 48px;
    align-items: start;
  }
}
</style>
