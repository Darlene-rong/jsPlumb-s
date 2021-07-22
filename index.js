var jsplumbDeom = {
  targetContainerClass: '.targetContainer',
  sourceContainerClass: '.sourceContainer',
  domInit() {
    // dom
    const { sourceContainerClass, targetContainerClass } = this
    $('.removeIcon').bind('click', function (evt) {
      $(evt.target).parents()[1].remove()
    })
    $(sourceContainerClass).find('.diagram-panel').draggable({
      helper: 'clone',
      scope: 'diadrag',
    })
    $(targetContainerClass).droppable({
      scope: 'diadrag',
      drop: (evt, ui) => {
        const dragUI = ui.draggable[0];
        this.dropHTML(ui.draggable[0], ui.position);
        $('.delete-node').bind('click', function (event) {
          jsPlumb.remove(event.target.dataset.id)
        })
      },
    })
  },
  jsPlumbInit() {
    var $this = this;
    // 初始化
    jsPlumb.getInstance({
      Endpoint: ['Dot', { radius: 2 }],
      Connector: 'StateMachine',
      HoverPaintStyle: { stroke: '#1e8151', strokeWidth: 2 },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 1,
            id: 'arrow',
            length: 14,
            foldback: 0.8,
          },
        ],
        ['Label', { label: 'FOO', id: 'label', cssClass: 'aLabel' }],
      ],
      Container: 'canvas',
    })
    jsPlumb.importDefaults({
      ConnectionsDetachable: false,
    })
    // 点击
    jsPlumb.bind('click', function (c) {
      if (confirm('是否删除该支线？')) {
        jsPlumb.deleteConnection(c)
      }
    })
    // 链接线
    jsPlumb.bind('beforeDrop', function (e) {
      var info = e
      var inputRes = prompt('请输入条件', '')
      if (inputRes) {
        info.connection.getOverlay('label').setLabel(inputRes)
      }
      if (!info.connection.source.dataset.pid) {
        return true
      }
      return (
        info.connection.source.dataset.pid !== info.connection.target.dataset.id
      )
    })
    jsPlumb.registerConnectionTypes({
      basic: {
        paintStyle: { stroke: '#5c96bc', strokeWidth: 2, },
        hoverPaintStyle: { stroke: '#5c96bc', strokeWidth: 3 },
      },
      selected: {
        paintStyle: { stroke: '#de5125', strokeWidth: 2 },
        hoverPaintStyle: { strokeWidth: 3 },
        cssClass: 'connector-selected',
      },
    })
  },
  init() {
    var $this = this;
    $this.domInit();
    $this.jsPlumbInit();
    $.ajax({
      type: 'GET',
      url: 'http://10.10.10.104:5000/get_events_type',
      dataType: 'json',
      success: function (data) {
        let listData = data ? data : [];
        var listHTML = ``
        listData.forEach(val => {
          listHTML+=`<option value="${val}">${val}</option> `
        });
        $("#searchselect").append(listHTML);
        $("#saveselect").append(listHTML);
      }
    });
    // this.selectInit(1);
  },
  selectInit() {
    var $this = this;
    const selVal = $("#searchselect").val();
    if($("#searchselect").val() === '请选择事件类型') {alert('请选择事件进行查询'); return;} 
    // drawArr get_process_info
    this.delConnect();
    $.ajax({
      type: 'GET',
      // url: `/api/data/${selVal}`,
      url: `http://10.10.10.104:5000/get_process_info/${selVal}`,
      dataType: 'json',
      success: function (data) {
        //  data = JSON.parse(sessionStorage.getItem('drawArr'))
        $this.drawInit(data)
        $('.delete-node').bind('click', function (event) {
          jsPlumb.remove(event.target.dataset.id)
        })
      }
    });
  },
  drawInit(data) {
    // chushi
    var { targetContainerClass } = this;
    var $this = this;
    var nodeList = data.nodeList;
    var lineList = data.lineList;
    var config = containerConfig.baseStyle;
    nodeList.forEach((val) => {
      var position = val;
      var html = $this.render(containerConfig.oneUI, position);
      $(targetContainerClass).append(html);
      $this.initSetNode(containerConfig.oneUI, position.id);
    })
    lineList.forEach((val) => {
      let color = val.isAction === true ? 'selected' : 'basic';
      jsPlumb.connect(
        {
          uuids: [
            val.sourceId + 'Continuous' + '-in',
            val.targetId + 'Continuous' + '-in'
          ],
          type: color,
          overlays: [
            [ "Arrow", {
              location: 1,
              id: "arrow",
              length: 14,
              foldback: 0.6
          } ],
            [ "Label", { label: val.connectType, cssClass:"labelClass" } ]	
        ]
        }
      )
    })
  },
  addModel() {
    // 新增节点
    const interfaceData = $('#interfaceName').val()
    const decriptionData = $('#decription').val()
    var appendHTML = `
        <div data-type="oneUI" class="panel panel-info diagram-panel" style="position: relative;margin:10px">
          <div class="panel-heading" style="width: 120px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">${interfaceData}
          <span title="删除节点" class="glyphicon glyphicon-remove-circle icon removeIcon"></span>
          </div>
          <div class="panel-body">
          ${decriptionData}
          </div>
        </div>
      `
    $(this.sourceContainerClass).append(appendHTML)
    this.activeModel('none')
    $('#interfaceName').val('')
    $('#decription').val('')
    this.domInit()
    // this.init();
  },
  activeModel(active) {
    $('.dialog_model').css({
      display: active,
    })
    $('#dialog').css({
      display: active,
    })
  },
  // 转换HTML
  dropHTML(dom, position) {
    const uiName = $(dom).data().type;
    const { sourceContainerClass, targetContainerClass, render } = this;
    let { left, top } = position;
    let id = uuid.v1();
    top = top - 160;
    let interfaceData = $(dom).find('.panel-heading').text()
    let decriptionData = $(dom).find('.panel-body').text()
    var html = $(`
      <div id="item2" class="panel panel-info diagram-panel">
        <div class="panel-heading">程序2 
        </div>
        <div class="panel-body">
          hello word
        </div>
      </div>
    `)

    html = render(containerConfig[uiName], {
      left,
      top,
      id,
      interfaceData,
      decriptionData,
    })
    $(targetContainerClass).append(html)
    this.initSetNode(uiName, id)
  },
  initSetNode(uiname, id) {
    jsPlumb.repaintEverything()
    // 让元素可拖拽
    this.addJsPlumbDrag(id)
    this.setJsPlumbEnterPoint(id)
  },
  // 添加拖拽
  addJsPlumbDrag(id) {
    jsPlumb.draggable(id, {
      containment: 'parent'
    })
  },
  // 添加节点
  setJsPlumbEnterPoint(id) {
    var config = containerConfig.baseStyle;
    jsPlumb.addEndpoint(
      id,
      {
        anchor: 'Continuous',
        uuid: id + 'Continuous' + '-in'
      },
      config
    );
  },
  // 正则替换html里的参数
  render(dom, data) {
    var re = /{{([^}]+)?}}/;
    var match = '';
    while ((match = re.exec(dom))) {
      dom = dom.replace(match[0], data[match[1]])
    };
    return dom;
  },
  delConnect() {
    $('.node').each(function (index, elem) {
      const id = $(elem).attr('id');
      jsPlumb.remove(id)
    });
  },
  // 保存save
  savePlumb() {
    var nodeArr = [];
    var lineArr = [];
    var drawArr = {
      event_type: '',
      process: {}
    };
    var connectList = jsPlumb.getAllConnections();
    const selVal = $("#saveselect").val();
    if(selVal === '请选择保存类型') {alert('请选择事件进行查询'); return;} 
    $('.node').each(function (index, elem) {
      var $elem = $(elem);
      nodeArr.push({
        isStartNode: index === 0 ? true : false,
        decriptionData: $elem.find('.panel-body').html(),
        interfaceData: $elem.find('.interface').html(),
        id: $elem.attr('id'),
        left: parseInt($elem.css('left'), 10),
        top: parseInt($elem.css('top'), 10)
      });
    });
    $.each(connectList, function (id, val) {
      let source_id = val['sourceId'];
      let target_id = val['targetId'];
      let paintStyle = val['_jsPlumb'].paintStyle.stroke;
      let conn = {
        sourceId: source_id,
        targetId: target_id,
        isAction: paintStyle === '#de5125' ? true : false,
        connectType: $(val.canvas.nextSibling).text()
      }
      lineArr.push(conn);
    });
    drawArr.event_type = selVal;
    drawArr.process.nodeList = nodeArr;
    drawArr.process.lineList = lineArr;
    $.ajax({
      type: 'POST',
      url: `http://10.10.10.104:5000/save_process`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(drawArr),
      dataType: 'json',
      success: function (data) {
       console.log(data,'ddd')
      }
    });
  },
}
jsPlumb.ready(function () {
  jsplumbDeom.init()
})
