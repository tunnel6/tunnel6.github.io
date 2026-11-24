import { readdirSync, readFileSync } from 'node:fs'
import { isPublished } from '../.vitepress/components/blogPublish.js'

const languageDirectories = ['en', 'zh', 'es', 'ja']
const slugs = new Set()

for (const language of languageDirectories) {
  const directory = new URL(`./${language}/`, import.meta.url)

  for (const file of readdirSync(directory)) {
    const match = file.match(/^((?!index)[^/]+)\.md$/)
    if (
      match &&
      isPublished(readFileSync(new URL(`./${file}`, directory), 'utf8'))
    ) {
      slugs.add(match[1])
    }
  }
}

export default {
  paths: [...slugs].map(slug => ({ params: { slug } }))
}
