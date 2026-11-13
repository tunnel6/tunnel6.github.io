<template>
  <a
    class="header-github-link"
    href="https://github.com/tunnel6/yat"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-1.94c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.11-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.05.78 2.12v3.15c0 .31.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  </a>
</template>

<style scoped>
.header-github-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 2px;
  color: var(--vp-c-text-2);
  transition: color 0.25s ease;
}

.header-github-link:hover {
  color: var(--vp-c-text-1);
}

.header-github-link svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
