import Vue from 'vue'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import '@/styles/index.scss' // global css
import { handleTree, selectDictLabel, parseTime ,resetForm} from './utils/index'

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import directives from './directive/permission';

Vue.use(directives);
Vue.use(Element, { locale })
// 注入全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.prototype.baseUrl = process.env.VUE_APP_BASE_API;
Vue.prototype.handleTree = handleTree;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
