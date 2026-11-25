<script setup>
import CommunityBrandIcon from './CommunityBrandIcon.vue'

const links = [
  {
    name: 'GitHub',
    icon: 'github',
    link: 'https://github.com/tunnel6/yat'
  },
  {
    name: 'Discord',
    icon: 'discord',
    link: 'https://discord.com/channels/1575096620155150336/1575096620767387730'
  },
  {
    name: 'X (Twitter)',
    icon: 'x',
    link: 'https://x.com/yattool'
  }
]
</script>

<template>
  <div class="header-community-links" role="group" aria-label="Community links">
    <a
      v-for="item in links"
      :key="item.icon"
      class="header-community-link"
      :href="item.link"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="item.name"
      :title="item.name"
    >
      <span class="header-community-icon" :class="`icon-${item.icon}`">
        <CommunityBrandIcon :name="item.icon" />
      </span>
    </a>
  </div>
</template>

<style scoped>
.header-community-links {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
}

.header-community-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: background 0.25s ease, opacity 0.25s ease;
}

.header-community-link:hover {
  opacity: 0.8;
  background: var(--vp-c-bg-soft);
}

.header-community-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
}

/* 品牌原色：Discord blurple；GitHub/X 官方为黑白标识，随 light/dark 翻转 */
.header-community-icon.icon-discord {
  color: #5865f2;
}

.header-community-icon.icon-github {
  color: #181717;
}

.header-community-icon.icon-x {
  color: #000000;
}

html.dark .header-community-icon.icon-github {
  color: #f0f6fc;
}

html.dark .header-community-icon.icon-x {
  color: #ffffff;
}
</style>
