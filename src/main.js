import { createApp } from 'vue'
import './style.css'
import { setupRouter } from './router';
import App from './App.vue'



const app = createApp(App)
setupRouter(app)
app.mount('#app')
