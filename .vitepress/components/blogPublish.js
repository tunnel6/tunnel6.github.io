const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---/

export function isPublished(source) {
  const frontmatter = frontmatterPattern.exec(source ?? '')?.[1]
  if (!frontmatter) return false

  return frontmatter
    .split(/\r?\n/)
    .some(line => {
      if (/^\s/.test(line)) return false

      const value = line.match(/^publish:\s*(.+?)\s*$/)?.[1]
      return value?.replace(/^['"]|['"]$/g, '').toLowerCase() === 'true'
    })
}
