import { createApp } from 'vue'
import './style.css'
import { setupRouter } from './router';
import Antd from 'ant-design-vue';
import App from './App.vue'
import 'ant-design-vue/dist/reset.css';



const app = createApp(App)
app.use(Antd);
setupRouter(app)
app.mount('#app')
