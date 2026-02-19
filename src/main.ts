import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@phila/phila-ui-core/styles/main.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
