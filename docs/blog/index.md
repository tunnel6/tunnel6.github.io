---
layout: page
title: Blog
---

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    title: 'YAT 1.0 Release: Making Intranet Penetration Simpler',
    excerpt: 'We are excited to announce the release of YAT 1.0, featuring a complete redesign of the tunnel management system...',
    date: '2024-12-10',
    tags: ['Release', 'Announcement'],
    link: '/blog/yat-1.0-release'
  },
  {
    title: 'Understanding mTLS: How YAT Keeps Your Data Secure',
    excerpt: 'Learn about mutual TLS authentication and how YAT uses it to ensure secure communication between clients and Edge servers...',
    date: '2024-12-05',
    tags: ['Security', 'Technical'],
    link: '/blog/understanding-mtls'
  },
  {
    title: 'Building Custom Extensions with Vue.js',
    excerpt: 'A comprehensive guide to developing YAT extensions using Vue.js, including configuration forms and lifecycle hooks...',
    date: '2024-11-28',
    tags: ['Extensions', 'Tutorial'],
    link: '/blog/vue-extensions'
  },
  {
    title: 'P2P vs Relay: Choosing the Right Transport Mode',
    excerpt: 'Deep dive into YAT transport modes and learn when to use P2P direct connection vs Edge relay for optimal performance...',
    date: '2024-11-20',
    tags: ['Performance', 'Guide'],
    link: '/blog/transport-modes'
  },
  {
    title: 'Deploying Your First Edge Server',
    excerpt: 'Step-by-step guide to deploying an Edge server on a VPS, including configuration, security hardening, and monitoring...',
    date: '2024-11-15',
    tags: ['Tutorial', 'Edge'],
    link: '/blog/deploy-edge-server'
  },
  {
    title: 'YAT Extension Ecosystem: What\'s New',
    excerpt: 'Explore the latest extensions in the YAT marketplace, including ARD remote desktop, file server, and community contributions...',
    date: '2024-11-10',
    tags: ['Extensions', 'News'],
    link: '/blog/extension-ecosystem'
  }
])
</script>

# Blog

Latest news, tutorials, and insights from the YAT team.

<div class="blog-posts">
  <article v-for="post in posts" :key="post.link" class="blog-card">
    <div class="post-meta">
      <time>{{ post.date }}</time>
      <div class="tags">
        <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    
    <h3>
      <a :href="post.link">{{ post.title }}</a>
    </h3>
    
    <p class="excerpt">{{ post.excerpt }}</p>
    
    <a :href="post.link" class="read-more">Read More →</a>
  </article>
</div>

<style scoped>
.blog-posts {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin: 40px 0;
}

.blog-card {
  padding: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.blog-card:hover {
  border-color: var(--vp-c-brand);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: var(--vp-c-text-3);
  font-size: 0.9em;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  font-size: 0.85em;
}

.blog-card h3 {
  margin: 0 0 12px;
  font-size: 1.6em;
}

.blog-card h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.blog-card h3 a:hover {
  color: var(--vp-c-brand);
}

.excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 20px;
}

.read-more {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 600;
}

.read-more:hover {
  text-decoration: underline;
}
</style>
