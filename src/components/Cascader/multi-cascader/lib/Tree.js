import Node from './Node.js'
export default class TreeStore {
  constructor(options) {
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option]
      }
    }
    this.nodesMap = {}
    this.nodeList = []
    this.selectedIds = []
    this.maxLevel = 0
    this.root = new Node({
      data: this.data,
      store: this
    })
  }
}
