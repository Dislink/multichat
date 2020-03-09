const fs = require("fs");
var clients = new Object();
var clientID=0
fs.readFile("/path/file","utf8",function read(err,data){
	if ( err ){
		console.log(err) 
	}else{
		settings=data;
	}
});

const ws = require("ws");
const uuid = require("uuid");
const wss = new ws.Server( 
	{
		port : settings.server.port
	} 
);
var clients = new Object();
function commandLine(target,command,callback){
	var callback;
	if( callback == null || callback == undefined){
		callback=''
	};
	new Promise(((resolve, reject)=>{
		try{
			let requestId = uuid.v4;
			let state = new Object();
			let state.stateCode = 0;
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
			let state.requestId = requestId;
		}catch(err){
			let state.stateCode = -1;
			let state.error = err;
		};
		resolve(state);
	})).then(
		eventListener(
		if(typeof(callback)=="function"){
			try{
				callback(value);
			}catch(err){
				throw err;
			}
		}else{
			try{
				eval(callback);
			}catch(err){
				throw err;
			}
		}
	)
};
function addEventListener(target,event,callback){
	var callback;
	if( callback == null || callback == undefined ){
		callback=''
	};
	new Promise(((resolve, reject)=>{
		try{
			let requestId=uuid.v4;
			let state = new Object();
			let state.stateCode = 0;
			target.send(
				JSON.stringify(
					{
						"body": {
							"eventName": event 
						},
						"header": {
							"requestId": requestId,
							"messagePurpose": "unsubscribe",
							"version": 1,
							"messageType": "commandRequest"
						}
					}
				)
			);
			let state.requestId = requestId;
		}catch(err){
			let state.stateCode = -1;
			let state.error = err;
		};
		resolve(state);
	})).then(
		if(typeof(callback)=="function"){
			try{
				callback(value);
			}catch(err){
				throw err;
			}
		}else{
			try{
				eval(callback);
			}catch(err){
				throw err;
			}
		}
	)
};
function removeEventListener(target,event,callback){
	var callback;
	if( callback == null || callback == undefined ){
		callback=''
	};
	new Promise(((resolve, reject)=>{
		try{
			let requestId=uuid.v4;
			let state = new Object();
			let state.stateCode = 0;
			target.send(
				JSON.stringify(
					{
						"body": {
							"eventName": event 
						},
						"header": {
							"requestId": requestId,
							"messagePurpose": "subscribe",
							"version": 1,
							"messageType": "commandRequest"
						}
					}
				)
			);
		}catch(err){
			let state.stateCode = -1;
			let state.error = err;
		};
		resolve(state);
	})).then(
		if(typeof(callback)=="function"){
			try{
				callback(value);
			}catch(err){
				throw err;
			}
		}else{
			try{
				eval(callback);
			}catch(err){
				throw err;
			}
		}
	)
};
function eventListener(target,func,isDecodeJSON,callback){
	var callback;
	if( callback == null || callback == undefined){
		callback=''
	};
	new Promise(((resolve, reject)=>{
		try{
			let state = new Object();
			let state.stateCode = 0;
			target.on("message",function message(msg){
				if ( isDecodeJSON ){
					message = JSON.parse(msg);
					eval(func);
				}else{
					message = msg;
					eval(func);
				};
			});
			
		}catch(err){
			let state.stateCode = -1;
			let state.error = err;
	})).then(
		if(typeof(callback)=="function"){
			try{
				callback(value);
			}catch(err){
				throw err;
			}
		}else{
			try{
				eval(callback);
			}catch(err){
				throw err;
			}
		}
	);
};
function permissionCheck(permission,player){
	for(key in settings.server.permissions[permission]){
		 if(settings.server.permissions[permission][key]==player){
			 return true;
		 };
	};
};
wss.on("connection",function connection(currentClient){
	clientID=clientID+1;
	clients[clientID]=currentClient;
	currentConnection(currentClient);
	for (key in  settings.onconnect.commands){
		commandLine(currentClient,commands[key]);
	};
	for (key in settings.onconnect.console){
		eval(settings.onconnect.console[key].body);
	};
});


function currentConnection(currentClient){
	addEventListener(currentClient,'PlayerMessage');
	eventListener(currentClient,`function e(message){
		try{
			for (key in settings.onmessage.commands){
				commandLine(currentClients,settings.onmessage.commands[key].body);
		};
	}catch(err){};
		for (key in settings.onmessage.console){
			eval(settings.onmessage.console[key].body);
		};
		if ( message.body.eventName == "PlayerMessage" && message.body.properties.MessageType == "chat" ){
			try{
				rowmsg=message.body.properties.Message;
				imsg=' '+rowmsg+' ';
				msgArray=imsg.split(/\s+/);
				switch (msgArray[1]){
					case '>broadcast':
						server=message.body.properties.ServerId,
						for(key in clients){
							if(/[0-9]+/.test(key)){
								commandLine(clients[key],'tellraw @a {"rawtext":[{"text":"['+message.body.properties.Sender+']'+'['message.body.properties.Build+']'+':'+rowmsg.replace(/\s*>chat\s*/,'')+'"'+'}'+']'+'}');
								console.log('['+message.body.properties.Sender+']'+'['message.body.properties.Build+']'+':'+rowmsg.replace(/\s*>chat\s*/,''));
							};
						};
						break;
					case '>chat':
						break;
					case '>operate':
						if(permissionCheck('operator',message.body.properties.Sender)){
							try{
								eval(rowmsg.replace(/\s*>operate\s*/,''));
							 }catch(err){
								console.log(err);
							};
						};
							break;
		}catch(err){commandLine("say Error!")}}};
e(message)`
,true)
}
