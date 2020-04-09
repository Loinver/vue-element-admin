// import parseTime, formatTime and set to filter
export { parseTime, formatTime } from '@/utils'

/**
 * Show plural label if time is plural number
 * @param {number} time
 * @param {string} label
 * @return {string}
 */
function pluralize(time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

/**
 * @param {number} time
 */
export function timeAgo(time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}

/**
 * Number formatting
 * like 10000 => 10k
 * @param {number} num
 * @param {number} digits
 */
export function numberFormatter(num, digits) {
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
/**
 * 格式化时间戳 [秒级,是否是整天]
 * @param {*} param0
 */
export function formatTimer([ms, isDay]) {
  if (ms === 0 || ms === null) {
    return ''
  } else {
    const dt = new Date(Number(ms));
    if (isDay) {
      return [
        [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-')
      ].join(' ')
        .replace(/(?=\b\d\b)/g, '0');
    }
    return [
      [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-'), [dt.getHours(), dt.getMinutes(), dt.getSeconds()].join(':')
    ].join(' ')
      .replace(/(?=\b\d\b)/g, '0');
  }
}
/**
 * 格式化金额  传入分
 * @param {*} val
 */
export function formatMoney(val) {
  return parseFloat(val / 100).toFixed(2)
}
/**
 * 获取终端名称
 * @param {*} val
 */
export function getClientName(val) {
  let str = [];
  if (typeof val === Array) {
    if (val && val.length > 0) {
      str = val.map(item => {
        return item.name;
      });
    }
  } else {
    str = ['设置错误']
  }
  return str.join(',');
}
/**
 * 获取属性名称
 * @param {*} val
 */
export function getNewsType(val) {
  switch (val) {
    case null:
      return "无";
    case "1":
      return "轮播banner";
    case "2":
      return "头条";
    default:
      return "轮播banner，头条";
  }
}
/**
 * 获取跳转方式
 * @param {*} val
 */
export function getLinkType(val) {
  switch (val) {
    case '0':
    case null:
      return "无";
    case "1":
      return "链接";
    case "2":
      return "富文本";
    default:
      return "其他";
  }
}
/**
 * 获取用户组
 * @param {*} val
 */
export function getUserGroup(val) {
  switch (val) {
    case '0':
    case null:
      return "无";
    case "1":
      return "全部用户";
    case "2":
      return "注册用户";
    default:
      return "其他";
  }
}
/**
 * 获取消息发送状态
 * @param {*} val
 */
export function getMsgPushStatus(val) {
  switch (val) {
    case 0:
      return "已发送";
    case 1:
      return "推送中";
    case 2:
      return "推送成功";
    case 3:
      return "推送失败";
    case 4:
      return '取消推送'
    case 5:
      return '未推送'
  }
}
/*
 * 区域转换
 * @param {*} val
 */
export function getAreaName(val) {
  let str = [];
  if (val && val.length > 0) {
    str = val.map(item => {
      return item.name;
    });
  }
  return str.join(',');
}
