
var jsplumbDeom = {
  targetContainerClass: '.targetContainer',
  sourceContainerClass: '.sourceContainer',
  baseStyle: {...containerConfig.baseStyle},
  mainDOM() {
    const {sourceContainerClass, targetContainerClass } = this;
    // dom
    $(".removeIcon").bind('click', function(evt) {
      $(evt.target).parents()[1].remove()
    })
    $(".left-panel").css({
      height: (document.documentElement.clientHeight - 50) + 'px'
    });
    $(sourceContainerClass).find('.diagram-panel').draggable({
      helper: 'clone',
      scope: 'diadrag'
    });
    $(targetContainerClass).droppable({
      scope: 'diadrag',
      drop: (evt, ui) => {
        const dragUI = ui.draggable[0];
        this.dropHTML(ui.draggable[0], ui.position);
        // 删除节点
        $(".delete-node").bind('click', function(event) {
          jsPlumb.remove(event.target.dataset.id)
        })
      }
    });
    jsPlumb.setContainer("drawing");
   
  },
  init() {
    var $this = this;
    $this.mainDOM();
    // 初始化
    jsPlumb.importDefaults({
      ConnectionsDetachable: false
    })
    jsPlumb.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
    // 点击
    jsPlumb.bind("click", function(e, originalEvent){
    })
    // 双击线
    jsPlumb.bind("dblclick", function(e, originalEvent){
      if(confirm('是否删除该支线？')) {
        jsPlumb.deleteConnection(e);
      }
    })
    // 链接线
    jsPlumb.bind("beforeDrop", function(e){
        var info = e;
        var inputRes = prompt("请输入条件", "");
        console.log(info,info.connection.getOverlay("label"),'info')
        if(inputRes) {
          info.connection.getOverlay("label").setLabel(inputRes);
        }
        if (!info.connection.source.dataset.pid) {
        return true
        }
        return info.connection.source.dataset.pid !== info.connection.target.dataset.id
    });
    $.ajax({
      type: "GET",
      url: "./api/data.json",
      dataType: "json",
      success: function(data){
        //  data = JSON.parse(sessionStorage.getItem('drawArr'))
         $this.drawInit(data);
         $(".delete-node").bind('click', function(event) {
          jsPlumb.remove(event.target.dataset.id)
        })
      }
    });
  },
  addModel() {
    const interfaceData = $('#interfaceName').val();
    const decriptionData = $('#decription').val();
    var appendHTML = `
        <div data-type="oneUI" class="panel panel-info diagram-panel">
          <div class="panel-heading">${interfaceData}
          <span title="删除节点" class="glyphicon glyphicon-remove-circle icon removeIcon"></span>
          </div>
          <div class="panel-body">
          ${decriptionData}
          </div>
        </div>
      `
    $(this.sourceContainerClass).append(appendHTML);
    this.activeModel('none');
    $('#interfaceName').val('')
    $('#decription').val('');
    this.init();

  },
  drawInit(data) {
    // chushi
    var {targetContainerClass} = this;
    var $this = this;
    var nodeList = data.nodeList;
    var lineList = data.lineList;
    var config = JSON.parse(JSON.stringify(containerConfig.baseStyle))
    nodeList.forEach(val => {
      var position = val;
      var html = $this.render(containerConfig.oneUI, position);
      $(targetContainerClass).append(html);
      $this.initSetNode(containerConfig.oneUI, position.id);
    });
    lineList.forEach(val => {
      config.connectorStyle = containerConfig[val.isAction === 0 ? 'normalConnect' : 'actionConnect']; 
      let color = val.isAction === 0 ? 'red' : 'green'
      jsPlumb.connect({
        overlays: [
          [
            'Arrow',
            {
              location: 1,
              id: 'arrow',
              length: 14,
              foldback: 0.8,
            },
          ],
          ['Label', { label: val.connectType, id: 'label', cssClass: color }],
        ],
        uuids: [val.source.id + "Continuous"+ "-in", val.target.id + "Continuous" + "-in"]
      },config);
    })
  },
  initSetNode(html, id, type) {
    jsPlumb.repaintEverything();
    const connectType = type === 0 ? 'normalConnect' : 'actionConnect';
    // 让元素可拖拽
    this.addJsPlumbDrag(id);
    this.setJsPlumbEnterPoint(id, 'Continuous', connectType);
  },
  // 添加拖拽
  addJsPlumbDrag(id) {
    jsPlumb.draggable(id, {
      containment: 'parent'
    });
  },
  // 添加节点
  setJsPlumbEnterPoint(id, action, connectstyle) {
    var config = JSON.parse(JSON.stringify(this.baseStyle));
    config.connectorStyle = containerConfig[connectstyle];
    jsPlumb.addEndpoint(id, {
        anchor: action,
        uuid: id + 'Continuous' + '-in'
    }, config);
  },
  activeModel(active) {
    $('.dialog_model').css({
      "display": active
    });
    $('#dialog').css({
      "display": active
    })
  },
  // 转换HTML
  dropHTML(dom, position) {
    const uiName = $(dom).data().type;
    const {sourceContainerClass, targetContainerClass, render } = this;
    let { left:left, top:top} = position;
    let id = jsPlumbUtil.uuid();
    left = left > 300 ? left : 320 + 'px';
    top = top ;
    let interfaceData = $(dom).find('.panel-heading').text();
    let decriptionData = $(dom).find('.panel-body').text();
    var html = '';
    html = render(containerConfig[uiName],{left,top,id,interfaceData,decriptionData} );
    $(targetContainerClass).append(html);
    this.initSetNode(html, id, 0);
  },
  // 正则替换html里的参数
  render(dom, data) {
    var re = /{{([^}]+)?}}/;
    var match = '';
    while ((match = re.exec(dom))) {
      dom = dom.replace(match[0], data[match[1]]);
    }
    return dom;
  },
  // 保存save
  savePlumb() {
    var nodeArr = [];
    var lineArr = [];
    var drawArr = {}
    $('.node').each(function(id, elem) {
      var $elem = $(elem);
      nodeArr.push({
        decriptionData: $elem.find('.panel-body').html(),
        interfaceData: $elem.find('.interface').html(),
        id: $elem.attr('id'),
        left: parseInt($elem.css("left"), 10),
        top: parseInt($elem.css("top"), 10)
      });
    });
    var connectList = jsPlumb.getAllConnections();
    $.each(connectList, function(id, val) {
      let source_id = val["sourceId"];
      let target_id = val["targetId"];
      let paintStyle = val['_jsPlumb'].paintStyle.stroke
      let conn = {
          "source": {
            "id": source_id,
            "anchor": val["endpoints"][0]["anchor"]["type"]
          },
          "target": {
            "id": target_id,
            "anchor": val["endpoints"][1]["anchor"]["type"]
          },
          "isAction": paintStyle === '#60b460' ? 0 : 1,
          "connectType": $(val.canvas.nextSibling).text()
      };
      lineArr.push(conn);
    });
    drawArr.nodeList = nodeArr;
    drawArr.lineList = lineArr;
    sessionStorage.setItem('drawArr', JSON.stringify(drawArr));
  }
};
jsPlumb.ready(function (){
  jsplumbDeom.init();
});
