import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
// 获取验证码
export function getcode(data) {
  return request({
    url: '/common/Sms/sendCodeByAdmin',
    method: 'post',
    data
  })
}
// 获取用户信息
export function getInfo() {
  return request({
    url: '/user/getInfo',
    method: 'get'
  })
}
// 退出登录
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
// 修改密码
export function changePwd(params) {
  return request({
    url: '/account/User/setMyPassword',
    method: 'post',
    data: {
      oldPwd: params.oldPass,
      newPwd: params.pass,
      confirmPwd: params.checkPass
    }
  })
}
// 找回密码
export function getBackPassword(params) {
  return request({
    url: '/account/User/retrievePassword',
    method: 'post',
    data: {
      loginName: params.loginName,
      confirmPassword: params.password2,
      newPassword: params.password,
      verificationCode: params.code
    }
  })
}
