<script setup>
defineProps({
  block: { type: Boolean, default: false }
})
</script>

<template>
  <a
    class="header-get-started-button"
    :class="{ 'header-get-started-button--block': block }"
    href="https://dash.tunnel6.com"
  >
    Get Started
  </a>
</template>

<style scoped>
.header-get-started-button {
  display: inline-flex;
  align-items: center;
  height: 38px;
  margin-left: 16px;
  padding: 0 18px;
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 20px;
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition:
    color 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;
}

.header-get-started-button:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.header-get-started-button:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}

.header-get-started-button--block {
  justify-content: center;
  width: 100%;
  height: 44px;
  margin-top: 20px;
  margin-left: 0;
}

@media (max-width: 767px) {
  .header-get-started-button:not(.header-get-started-button--block) {
    display: none;
  }
}
</style>
