import { createApp } from 'vue'
import './style.css'
import { setupRouter } from './router';
import App from './App.vue'
import "ant-design-vue/dist/antd.css";

import { DatePicker } from "ant-design-vue";


const app = createApp(App)
app.use(DatePicker);
setupRouter(app)
app.mount('#app')
