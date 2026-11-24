import { createContentLoader } from 'vitepress'
import { supportedBlogLanguages } from './blogLanguages.js'

function extractExcerpt(file) {
  const paragraph = file.content
    .split(/\n{2,}/)
    .map(block => block.trim())
    .find(
      block =>
        block &&
        !block.startsWith('#') &&
        !block.startsWith('<!--') &&
        !block.startsWith('---')
    )

  if (paragraph) file.excerpt = paragraph
}

function buildLink(lang, slug) {
  return lang === 'en'
    ? `/blog/${slug}.html`
    : `/blog/${slug}.html?lang=${lang}`
}

function parsePost({ frontmatter, url, excerpt, html }) {
  const match = url.match(/^\/blog\/(en|zh|es|ja)\/([^/]*?)(?:\.html)?$/)
  const slug = match?.[2]

  if (!match || !slug || slug === 'index') return null

  return {
    lang: match[1],
    slug,
    title: frontmatter.title,
    author: frontmatter.author,
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
    excerpt: frontmatter.excerpt ?? excerpt ?? frontmatter.description ?? '',
    link: buildLink(match[1], slug),
    html
  }
}

export default createContentLoader(
  supportedBlogLanguages.map(lang => `blog/${lang}/*.md`),
  {
    excerpt: extractExcerpt,
    render: true,
    transform: data =>
      data
        .filter(({ frontmatter }) => frontmatter.publish === true)
        .map(parsePost)
        .filter(Boolean)
        .sort(
          (a, b) =>
            String(b.date ?? '').localeCompare(String(a.date ?? '')) ||
            a.link.localeCompare(b.link)
        )
  }
)
