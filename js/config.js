var containerConfig = {}
containerConfig.oneUI =
  '<div data-type="oneUI" id="{{id}}" style="top:{{top}}px;left:{{left}}px" class="node panel panel-info diagram-panel"><div class="panel-heading"><span class="interface"  data-interface="{{interfaceData}}">{{interfaceData}}</span> <span class="delete-node pull-right" data-type="deleteNode" data-id="{{id}}">X</span></div><div class="panel-body" data-decrip="{{decriptionData}}">{{decriptionData}}</div></div>'
// 基本连接线样式
containerConfig.normalConnect = {
  stroke: "#5c96bc",
  strokeWidth: 2,
  outlineStroke: 'transparent',
  outlineWidth: 4,
};
containerConfig.actionConnect = {
  stroke: '#60b460',
  strokeWidth: 3,
  outlineStroke: 'transparent',
  outlineWidth: 4,
}
// 鼠标悬浮在连接线上的样式
containerConfig.baseStyle = {
  endpoint: ['Dot', { radius: 2 }],
  connectorStyle: containerConfig.normalConnect, // 连接线的颜色，大小样式
  paintStyle: {
    strokeStyle: 'rgb(92, 150, 188)',
    stroke: 'rgb(92, 150, 188)',
    fill: 'rgb(92, 150, 188)',
    radius: 3,
    lineWidth: 2,
  },
  // 端点的颜色样式
  hoverPaintStyle: { stroke: '#1e8151', strokeWidth: 1 },
  isSource: true, // 是否可以拖动（作为连线起点）
  connector: ['StateMachine'], // 弧线
  isTarget: true, // 是否可以放置（连线终点）
  maxConnections: -1, // 设置连接点最多可以连接几条线
  // 设置线上面的箭头
  connectorOverlays: [
    ['Arrow', {
      width: 10,
      length: 10,
      location: 0.7
    }],
    ['Label', {
      label: '',
      cssClass: '',
      labelStyle: {
        color: 'red'
      }
    }]
  ]
}

containerConfig.baseArchors = ['RightMiddle', 'LeftMiddle']
