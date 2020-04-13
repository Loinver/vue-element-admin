import axios from 'axios'
import qs from 'qs'
import { Message } from 'element-ui'
import { getToken, removeToken } from '@/utils/auth'
import router from '../router'

axios.defaults.withCredentials = true // 若跨域请求需要带 cookie 身份识别
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000, // request timeout
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
})

// request interceptor
service.interceptors.request.use(
  config => {
    config.headers.token = getToken();
    config.data = qs.stringify(config.data);
    return config
  },
  error => {
    console.error(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (response.request.responseType === 'blob') {
      return Promise.resolve(res.data);
    }
    // if the custom code is not 20000, it is judged as an error.
    switch (res.code) {
      case 200:
        return Promise.resolve(res.data);
      case 403:
        // 无权限
        Message({
          message: res.msg,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(res)
      case 401:
        // 未登录或过期
        Message({
          message: res.msg,
          type: 'error',
          duration: 5 * 1000
        })
        removeToken();
        router.replace({
          path: '/login',
          query: {
            redirect: router.history.current.path
          }
        })
        break;
      case 400:
        // 参数错误
        Message({
          message: res.msg,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(res)
      default:
        Message({
          message: res.msg || '请求错误',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(res)
    }
  },
  error => {
    console.log(error, error.response) // for debug
    if (!error.response) {
      // 请求超时状态
      if (error.message.includes('timeout')) {
        Message.error('请求超时，请检查网络是否连接正常')
        return Promise.reject({ msg: '请求超时，请检查网络是否连接正常' })
      } else {
        // 可以展示断网组件
        Message.error('请求失败，请检查网络是否已连接')
        return Promise.reject({ msg: '请求失败，请检查网络是否已连接' })
      }
    }
    Message.error(`${error.response.status}${error.response.statusText}`)
    return Promise.reject({ msg: `${error.response.status}${error.response.statusText}` })
  }
)

export default service
