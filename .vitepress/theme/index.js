import DefaultTheme from 'vitepress/theme'
import Layout from '../Layout.vue'
import './custom.css'
import HomeLanding from '../components/HomeLanding.vue'
import ReleaseNotes from '../components/ReleaseNotes.vue'
import BlogIndex from '../components/BlogIndex.vue'
import BlogArticle from '../components/BlogArticle.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
    app.component('ReleaseNotes', ReleaseNotes)
    app.component('BlogIndex', BlogIndex)
    app.component('BlogArticle', BlogArticle)
  }
}
