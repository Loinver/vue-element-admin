import request from '@/utils/request'

/**
 * 获取角色列表
 */
export function getRolesList(params) {
  return request({
    url: '/role/getList',
    method: 'post',
    data: params
  })
}

/**
 * 获取所有权限列表
 */
export function getRolesTree(params) {
  return request({
    url: '/role/getRole',
    method: 'post',
    data: {
      roleId: params.roleId
    }
  })
}
/**
 * 添加角色
 * @param {*} params
 */
export function addRole(params) {
  return request({
    url: `/role/addRole`,
    method: 'post',
    data: {
      roleName: params.roleName,
      authData: JSON.stringify(params.ids),
      remark: params.remark
    }
  })
}

/**
 * 编辑角色
 * @param {*} params
 */
export function editRole(params) {
  return request({
    url: `/role/editRole`,
    method: 'post',
    data: {
      roleId: params.roleId,
      roleName: params.roleName,
      authData: JSON.stringify(params.authData),
      remark: params.remark
    }
  })
}
/**
 * 根据角色id获取角色权限
 * @param {*} params
 */
export function getRolesById(params) {
  return request({
    url: `/role/getRole`,
    method: 'post',
    data: {
      roleId: params.roleId
    }
  })
}
