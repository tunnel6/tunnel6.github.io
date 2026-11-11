import { readdirSync } from 'node:fs'

const directory = new URL('./', import.meta.url)

export default {
  paths: readdirSync(directory)
    .filter(path => /^v[\w.-]+$/.test(path))
    .sort((left, right) => right.localeCompare(left))
    .map(version => ({ params: { version } }))
}
