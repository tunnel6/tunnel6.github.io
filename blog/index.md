---
layout: page
title: Blog
description: Product updates, engineering notes, and practical guides from the YAT team.
pageClass: blog-home
---

<script setup>
import { data as posts } from '../.vitepress/components/posts.data.js'
</script>

<BlogIndex :posts="posts" />
