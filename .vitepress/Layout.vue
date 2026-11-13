<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-after>
      <HeaderGitHubLink />
    </template>
    <template #nav-bar-content-after>
      <HeaderGetStartedButton />
    </template>
    <template #nav-screen-content-after>
      <HeaderGetStartedButton block />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import HeaderGitHubLink from './components/HeaderGitHubLink.vue'
import HeaderGetStartedButton from './components/HeaderGetStartedButton.vue'
</script>
