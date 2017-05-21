function WebServer(mgr)
{
    var _this = this;
    // 创建一个Socket实例
    this.socket = null;
    this.tryConnect = true;

    this.run = function ()
    {
        if (typeof navigator.msLaunchUri != 'undefined')
        {
            console.log(mgr.Config.edge.protocol + "://" + mgr.Config.edge.port);
            //up6://9006
            navigator.msLaunchUri(mgr.Config.edge.protocol+"://"+mgr.Config.edge.port, function ()
            {
                console.log('应用打开成功');
                //_this.connect();//
                //alert("success");
            }, function ()
            {
                console.log('启动失败');
            });
            setTimeout(function () { _this.connect() }, 1000);//启动定时器
        }
    };
    this.runChr = function () {
        var protocol = mgr.Config.edge.protocol + "://" + mgr.Config.edge.port;
        var html = "<iframe id='uri-fra' width=1 height=1 src='" + protocol + "'></iframe>";
        $(document.body).append(html);
        setTimeout(function () { _this.connect() }, 1000);//启动定时器
    };
    this.connect = function ()
    {
        if (!_this.tryConnect) return;
        var con = new WebSocket('ws://127.0.0.1:' + mgr.Config.edge.port);
        console.log("开始连接服务:" + 'ws://127.0.0.1:' + mgr.Config.edge.port);

        // 打开Socket 
        con.onopen = function (event)
        {
            _this.socket = con;
            _this.tryConnect = false;
            console.log("服务连接成功");
            // 发送一个初始化消息
            //socket.send('I am the client and I\'m listening!');

            // 监听消息
            con.onmessage = function (event)
            {
                mgr.recvMessage(event.data);
                //console.log('Client received a message', event);
            };

            // 监听Socket的关闭
            con.onclose = function (event)
            {
                //console.log('Client notified socket has closed', event);
            };

            // 关闭Socket.... 
            //socket.close() 
        };
        con.onerror = function (event)
        {
            console.log("连接失败");
            setTimeout(function () { _this.connect() }, 1000);//启动定时器
        };
    };
    this.close = function ()
    {
        if (this.socket) { this.socket.close(1000,"close");}
    };
    this.send = function (p)
    {
        if(this.socket)this.socket.send(JSON.stringify(p));
    };
}