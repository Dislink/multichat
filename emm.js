const fs = require("fs");
const ws = require("ws");
const uuid = require("uuid");
var clients = new Object();
var ClientIP = new Object();
var clientID=0;
var operatorID=0;
var visitorID=0;
var evtList = new Object();
var evtId = 0;
var operatorsUUID = new Object();
var visitorsUUID = new Object();
var rowstr = fs.readFileSync("settings.json","utf8");
var settings = JSON.parse(rowstr);
normalFeedbackEnabled=true;
const wss = new ws.Server(
	{
		port : settings.server.port
	} 
);
//const closeBrokenConnections = setInterval(function ping() {
//	wss.clients.forEach(function each(client) {
//		if (client.isAlive === false) return client.terminate();
//	
//		client.isAlive = false;
//		client.ping('', false, true);
//	});
//}, 32000);
var clients = new Array();
try {
	function commandLine(target,command,callback){
		if( callback == null || callback == undefined || callback == '' ){
			var callback = (()=>{});
		}else if( typeof(callback) != 'function' ) {
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+callback);
		};
		new Promise(((resolve,reject)=>{
			let requestId=uuid.v4();
			target.send(
				JSON.stringify(
					{
						"body": {
							"origin": 
								{
								"type": "player"
								},
								"commandLine": command,
								"version": 1
								},
						"header": {
							"requestId": requestId,
							"messagePurpose": "commandRequest",
							"version": 1,
							"messageType": "commandRequest"
						}
					}
				)
			);
			let data={
				"target": target,
				"requestId": requestId,
				"callback": callback
			};
			resolve(data);
		})).then((data)=>{
			data.callback(data.target,data.requestId)
		});
	};
	function subscribe(target,event){
		target.send(
			JSON.stringify(
				{
					"body": {
						"eventName": event 
					},
					"header": {
						"requestId": uuid.v4(),
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}
			)
		);
	};
	function unsubscribe(target,event){
		target.send(
			JSON.stringify(
				{
					"body": {
						"eventName": event 
					},
					"header": {
						"requestId": uuid.v4(),
						"messagePurpose": "unsubscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}
			)
		);
	};
	function eventListener(target,func,name){
		if( func == undefined || func == null || func == '' ){
			var func=(()=>{});
		}else if( typeof(func) != 'function' ){
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+func);
		}else if( name != undefined && name != null && name != "" ){
			evtList[name].body=func;
			evtList[name].enable=true;
		}else{
			evtId+=1;
			var name=evtId;
			evtList[name]=func;
			evtList[name].enable=true;
		};
		target.on("message",function message(data){
			if(evtList[name].enable){
				try{
					evtList[name](data);
				}catch(err){
					throw(err);
				};
			};
		});
		return name;
	};
	function heartbeat() {
		this.isAlive = true;
	};
	function commandResponse(target,requestId,callback){
		if( callback == undefined || callback == null || callback == '' ){
			var callback=(()=>{});
		};
		eventListener(target,function (data){
			let message = JSON.parse(data);
			if( message.header.messagePurpose == "commandResponse" && message.header.requestId == requestId ){
				let rcallback=callback;
				rcallback(data);
			};
		});
	};
	wss.on("connection",function connection(currentClient,currentRequest){
			clientID += 1;
			clients[clientID]=currentClient;
			ClientIP[clientID] = currentRequest.connection.remoteAddress;
			commandLine(currentClient,'tellraw @s {"rawtext":[{"text":"ClientID:'+clientID+'"}]}');
			currentClient.isAlive = true;
			currentClient.on('pong',heartbeat);
			currentConnection(currentClient);
			for (let key in  settings.onconnect.commands){
				commandLine(currentClient,settings.onconnect.commands[key].body);
			};
			for (let key in settings.onconnect.console){
				eval(settings.onconnect.console[key].body);
			};
		}
	);
	wss.on("disconnected",function disconnected(currentClient){
			try{
				for (let key in settings.disconnected.console){
					let disconnectedClientID=getClientID(currentClient);
					eval(settings.disconnected.console[key].body);
				};
			}catch(err){
				throw err;
			};
		}
	);
	function currentConnection(currentClient){
		subscribe(currentClient,'PlayerMessage');
		eventListener(currentClient,function (data){
			let message=JSON.parse(data);
			try{
//				for (let key in settings.onmessage.commands){
//					commandLine(currentClient,settings.onmessage.commands[key].body);
//				};
				for (let key in settings.onmessage.console){
					eval(settings.onmessage.console[key].body);
				};
			}catch(err){
				throw err;
			};
			if ( message.body.eventName == "PlayerMessage" ){
				if(/^>.*/.test(message.body.properties.Message) &&  message.body.properties.MessageType == "chat" ){
					if(permissionCheck(message.body.properties.Sender,"operator")){
						try{
							var feedback=eval(message.body.properties.Message.replace(/^>*/,''));
						}catch(catchedError1){
							commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+catchedError1+'§r"}]}');
						}finally{
							let catchedError1;
							if(normalFeedbackEnabled && !(catchedError1)){
								commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§a[Feedback]§r:§7'+feedback+'§r"}]}');
							};
						};
					}else{
						commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c你需要操作员权限以执行控制台命令！"}]}');
					};
				} else if ( /^#.*/.test(message.body.properties.Message) &&  message.body.properties.MessageType == "chat" ){
					if(!(permissionCheck(message.body.properties.Sender,"visitor"))){
						try{
							var feedback=commandLine(currentClient,message.body.properties.Message.replace(/^#*/,''));
						}catch(catchedError2){
							commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+catchedError2+'§r"}]}');
						}finally{
							let catchedError2;
							if(normalFeedbackEnabled && !(catchedError2)){
								commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§a[Feedback]§r:§7'+feedback+'§r"}]}');
							};
						};
					}else{
						commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c你需要成员权限以执行游戏内指令！"}]}');
					};
				}else if(!(permissionCheck(message.body.properties.Sender,"visitor")) &&  message.body.properties.MessageType == "chat"){
					//emmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
				};
			};
		})
	};
	function getClientID(client){
		for(let key in clients){
			if(clients[key]==client){
				return key;
			};
		};
	};
	function reloadSettings(){
		var rowstr = fs.readFileSync("settings.json","utf8");
		settings = JSON.parse(rowstr);
	}
	function addOperator(name){
		operatorID+=1;
		let operatorUUID=uuid.v4();
		settings.server.permissions.operator[operatorUUID]=name;
		operatorsUUID[operatorID]=operatorUUID;
		return operatorID;
	};
	function removeOperator(operatorID){
		settings.server.permissions.operator[operatorsUUID[operatorID]]='';
	};
	function addVisitor(name){
		visitorID+=1;
		let visitorUUID=uuid.v4();
		settings.server.permissions.visitor[visitorUUID]=name;
		visitorsUUID[visitorID]=visitorUUID;
		return visitorID;
	};
	function removeVisitor(visitorID){
		settings.server.permissions.visitor[visitorsUUID[visitorID]]='';
	};
	function permissionCheck(player,permission){
		for(let key in settings.server.permissions[permission]){
			if(settings.server.permissions[permission][key]==player){
				return true;
			};
		};
	};
	function define(a,b,isVariable){
		if (isVariable){
			eval( a + ' = ' + b );
		}else{
			eval( a + ' = ' + '"' + b + '"' );
		};
	};
}catch(ERROR){
	commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[OUTERERROR]§r:§a'+outerError+'§r"}]}');
	console.warn(outerError);
};