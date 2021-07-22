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
  endpoint: ["Dot", {radius: 2}],
  connectorStyle: containerConfig.normalConnect, // 连接线的颜色，大小样式
  connectorHoverStyle: containerConfig.connectorHoverStyle,
  paintStyle: {
    strokeStyle: 'rgb(92, 150, 188)',
    stroke: 'rgb(92, 150, 188)',
    fill: 'rgb(92, 150, 188)',
    radius: 4,
    lineWidth: 2
  }, // 端点的颜色样式
  hoverPaintStyle: { stroke: "#1e8151", strokeWidth: 1 },
  isSource: true, // 是否可以拖动（作为连线起点）
  connector: ['StateMachine'],  // 弧线
  isTarget: true, // 是否可以放置（连线终点）
  maxConnections: 5, // 设置连接点最多可以连接几条线
  // 设置线上面的箭头
  connectorOverlays: [
    [ "Arrow", {
      location: 1,
      id: "arrow",
      length: 14,
      foldback: 0.6
  } ],
  [ "Label", { label: "", id: "label", cssClass: "aLabel",
        events: {
        // dblclick: function (labelOverlay, originalEvent) {
        //   console.log('click on label overlay for :' + labelOverlay.component)
        //   console.log(labelOverlay,labelOverlay.labelText)
        //   console.log(originalEvent)
        //   var labelRes = prompt("请输入条件", labelOverlay.labelText);
        //   if(labelRes) {
        //     labelOverlay.labelText = labelRes;
        //   }
        // }
      }
 }]
  ]
}

containerConfig.baseArchors = ['RightMiddle', 'LeftMiddle']
