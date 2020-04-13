import { login, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
  roles: [],
  permissions: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
};

const actions = {
  // 用户登陆
  login({ commit }, userInfo) {
    const { account, password, code } = userInfo;
    return new Promise((resolve, reject) => {
      login({ userName: account.trim(), password: password, code: code }).then(response => {
        commit('SET_TOKEN', response.token)
        setToken(response.token);
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (response.roles && response.roles.length > 0) { // 验证返回的roles是否是一个非空数组
          commit('SET_ROLES', response.roles)
          commit('SET_PERMISSIONS', response.permissions)
        } else {
          reject(new Error('无权限!'))
          commit('SET_ROLES', ['ROLE_DEFAULT'])
        }
        commit('SET_NAME', response.name)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 用户退出登陆
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', []);
      commit('SET_PERMISSIONS', [])
      removeToken()
      resetRouter()
      resolve()
    })
  },
  // 移除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

