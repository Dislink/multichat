const fs = require("fs");
const ws = require("ws");
const uuid = require("uuid");
var clients = {};
var ClientIP = {};
var clientId=0;
var onLineClients=0;
var operatorId=0;
var visitorId=0;
var evtList = {};
var operatorsUUID = {};
var visitorsUUID = {};
var rowstr = fs.readFileSync("C:/Users/Administrator/Desktop/settings.json","utf8");
var settings = JSON.parse(rowstr);
normalFeedbackEnabled=true;
showFeedback=true;
try{
const wss = new ws.Server(
	{
		port : settings.server.port
	} 
);
/*const closeBrokenConnections = setInterval(function ping() {
	wss.clients.forEach(function each(client) {
		if (client.isAlive === false)
		{			
			return client.terminate();
		};
		client.isAlive = false;
		client.ping('', false, true);
	});
}, 5000);*/
const broadcast=setInterval(function (){
	for(let i=0;i<clientId;i++){
		try{
			ad();
		}catch(e){
		};
	};
},1000*60*10);
var clients = new Array();
	function commandLine(target,command,callback=(()=>{})){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		if( typeof(callback) != 'function' ){
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
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
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
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
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
	function eventListener(target,func=(()=>{}),name){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		if( typeof(func) != 'function' ){
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+func);
		};
		let clientId=getClientId(target);
		commandLine(target,'say '+clientId);
		if(isEmpty(name)){
			if(!(typeof(evtList[clientId]) == "object")){
				evtList[clientId]=new Object();
				evtList[clientId].initialized=true;
				evtList[clientId].evtId=0;
			};
			var filled = false;
			for(let i=0;i<evtList[clientId].evtId+1;i++){
				if(isEmpty(evtList[clientId][i])&&i>0){
					var name=i;
					var filled=true;
					break;
				};
			};
			if(!(filled)){
				while(isUsed(evtList[clientId],evtList[clientId].evtId)||evtList[clientId].evtId==0){
					evtList[clientId].evtId+=1;
				};
				var name=evtList[clientId].evtId;
			};
			if(!(typeof(evtList[clientId][name]) == "object")){
				evtList[clientId][name]=new Object();
			};
			evtList[clientId][name].body=func;
			evtList[clientId][name].enable=true;
			evtList[clientId][name].destroy=function (){
				delete evtList[clientId][name];
			};
		}else{
			if(!(typeof(evtList[clientId]) == "object")){
				evtList[clientId]=new Object();
				evtList[clientId].initialized=true;
				evtList[clientId].evtId=0;
			};
			if(!(isUsed(evtList[clientId],name))){
				if(!(typeof(evtList[clientId][name]) == "object")){
					evtList[clientId][name]=new Object();
				};
				evtList[clientId][name].body=func;
				evtList[clientId][name].enable=true;
				evtList[clientId][name].destroy=function (){
					delete evtList[clientId][name];
				};
			}else{
				throw ReferenceError("'"+name+"'"+" is already used!");
				return false;
			};
		};
		return name;
	};
	function runEvent(target,data){
		clientId=getClientId(target);
		for(let key in evtList[clientId]){
			if(evtList[clientId][key].enable){
				evtList[clientId][key].body(data);
			};
		};
		for(let key in evtList[clientId].evtId){
			if(evtList[clientId][key].enable){
				evtList[clientId][key].body(data);
			};
		};
	};
	function heartbeat() {
		this.isAlive = true;
	};
	function commandResponse(target,requestId=false,callback=(()=>{})){
		let responseId=uuid.v4();
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		let clientId=getClientId(target);
		if( requestId ){
			let evtId=eventListener(target,function (data){
				let message = JSON.parse(data);
				if( message.header.messagePurpose == "commandResponse" && message.header.requestId == requestId ){
					let responseId=callback;
					responseId(data);
					evtList[clientId][evtId].destroy();
				};
			},responseId);
		}else{
			let evtId=eventListener(target,function (data){
				let message = JSON.parse(data);
				if( message.header.messagePurpose == "commandResponse" ){
					let evtId=callback;
					evtId(data);
				};
			});
			return evtId;
		};
		
	};
	wss.on("connection",function connection(currentClient,currentRequest){
		var filled=false
		for(let i=0;i<clientId+1;i++){
			if(isEmpty(clients[i])&&i>0){
				clients[i]=currentClient;
				var filled=true;
				break;
			};
		};
		if(!(filled)){
			clientId+=1;
			clients[clientId]=currentClient;
		};
		onLineClients+=1;
		ClientIP[clientId] = currentRequest.connection.remoteAddress;
		commandLine(currentClient,'tellraw @s {"rawtext":[{"text":"ClientId:'+clientId+'"}]}');
		currentClient.isAlive = true;
		currentClient.on('pong',heartbeat);
		currentClient.on("message",function (data){
			runEvent(currentClient,data);
		});
		currentClient.on("close",function (){
			let clientId=getClientId(currentClient);
			onLineClients-=1;
			for(let key in settings.ondisconnection.console){
				eval(settings.ondisconnection.console[key].body);
			};
			delete evtList[clientId];
			delete clients[clientId];
		});
		currentConnection(currentClient);
		for (let key in  settings.onconnection.commands){
			commandLine(currentClient,settings.onconnection.commands[key].body);
		};
		for (let key in settings.onconnection.console){
			eval(settings.onconnection.console[key].body);
		};
	});
	function currentConnection(currentClient){
		subscribe(currentClient,'PlayerMessage');
		eventListener(currentClient,function (data){
			let message=JSON.parse(data);
			try{
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
							if(normalFeedbackEnabled && showFeedback){
								commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§a[Feedback]§r:§7'+feedback+'§r"}]}');
							};
						};
					}else{
						commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c你需要操作员权限以执行控制台命令！"}]}');
					};
				} else if ( /^#.*/.test(message.body.properties.Message) &&  message.body.properties.MessageType == "chat" ){
					if(!(permissionCheck(message.body.properties.Sender,"member"))){
						try{
							var feedback=commandLine(currentClient,replaceAll(message.body.properties.Message.replace(/^#*/,'')));
						}catch(catchedError2){
							commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+catchedError2+'§r"}]}');
						}finally{
							let catchedError2;
							if(normalFeedbackEnabled && showFeedback){
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
		},'system');
	};
	function getClientId(client){
		for(let key in clients){
			if(clients[key]==client){
				return key;
			};
		};
	};
	function reloadSettings(){
		let rowstr = fs.readFileSync("settings.json","utf8");
		settings = JSON.parse(rowstr);
	}
	function addOperator(name){
		operatorId+=1;
		let operatorUUID=uuid.v4();
		settings.server.permissions.operator[operatorUUID]=name;
		operatorsUUID[operatorId]=operatorUUID;
		return operatorId;
	};
	function removeOperator(operatorId){
		settings.server.permissions.operator[operatorsUUID[operatorId]]='';
	};
	function addVisitor(name){
		visitorId+=1;
		let visitorUUID=uuid.v4();
		settings.server.permissions.visitor[visitorUUID]=name;
		visitorsUUID[visitorId]=visitorUUID;
		return visitorId;
	};
	function removeVisitor(visitorId){
		settings.server.permissions.visitor[visitorsUUID[visitorId]]='';
	};
	function permissionCheck(player,permission){
		for(let key in settings.server.permissions[permission]){
			if(settings.server.permissions[permission][key]==player){
				return true;
			};
		};
	};
	function ad(clientId=clientId){
		commandLine(clients[clientId],'say \u52a0\u6211\u0051\u0051\u597d\u53cb\u0020\u0051\u0051\uff1a\u0031\u0036\u0030\u0030\u0035\u0031\u0035\u0033\u0031\u0034');
		commandLine(clients[clientId],'title @a title \u52a0\u6211\u0051\u0051\u597d\u53cb\u0020\u0051\u0051\uff1a\u0031\u0036\u0030\u0030\u0035\u0031\u0035\u0033\u0031\u0034');
		return 'QQ:1600515314'
	};
	function replaceAll(string,pattern=/\$r/){
		while(pattern.test(string)){
			var string = string.replace(pattern,'');
		};
		return string;
	};
	function isEmpty(string){
		if( string == undefined || string == null || string == '' ){
			return true;
		}else{
			return false;
		};
	};
	function isUsed(object,name){
		for(let key in object){
			if(key == name){
				return true;
			};
		};
	};
}catch(ERROR){
	commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+ERROR+'§r"}]}');
	console.warn(ERROR);
};
