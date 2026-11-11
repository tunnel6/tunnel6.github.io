<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['select'])

const props = defineProps({
  languages: { type: Array, required: true },
  currentLang: { type: String, required: true },
  ariaLabel: { type: String, required: true }
})

const isOpen = ref(false)
const currentLanguage = computed(() =>
  props.languages.find(({ code }) => code === props.currentLang)
)

function handleFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) isOpen.value = false
}

function selectLanguage(language) {
  emit('select', language.code)
  isOpen.value = false
}
</script>

<template>
  <div class="blog-lang-switcher" @focusout="handleFocusOut">
    <div class="blog-lang-anchor">
      <button
        type="button"
        :aria-label="props.ariaLabel"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span>{{ currentLanguage?.label ?? currentLang }}</span>
        <span aria-hidden="true">▾</span>
      </button>

      <div v-if="isOpen" class="blog-lang-menu">
        <button
          v-for="language in languages"
          :key="language.code"
          type="button"
          :aria-current="language.code === currentLang ? 'true' : undefined"
          @click="selectLanguage(language)"
        >
          {{ language.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-lang-switcher {
  position: relative;
  display: inline-flex;
  margin: 0;
}

.blog-lang-anchor {
  position: relative;
  display: inline-flex;
}

.blog-lang-switcher button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-size: 0.875rem;
  font-weight: 650;
  cursor: pointer;
}

.blog-lang-switcher button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.blog-lang-switcher button span:last-child {
  font-size: 0.7rem;
}

.blog-lang-menu {
  position: absolute;
  top: calc(100% + 7px);
  right: auto;
  left: 0;
  z-index: 20;
  display: grid;
  min-width: 132px;
  padding: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
}

.blog-lang-menu button {
  min-height: 36px;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.blog-lang-menu button:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.blog-lang-menu button[aria-current='true'] {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  font-weight: 700;
}

</style>
