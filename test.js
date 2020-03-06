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
const wss = new ws.Server( 
	{
		port : settings.server.port
	} 
);
var clients = new Object();
function commandLine(target,command){
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
					"requestId": "00000000-0000-0000-000000000001",
					"messagePurpose": "commandRequest",
					"version": 1,
					"messageType": "commandRequest"
				}
			}
		)
	);
	
};
function addEventListener(target,event,callback){
	var addEvtPromise = new Promise(function(resolve, reject) {
		target.send(
			JSON.stringify(
				{
					"body": {
						"eventName": event 
					},
					"header": {
						"requestId": "00000000-0000-0000-0000-000000000002",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}
			)
		);
	}).then(eval(callback));
};
function eventListener(target,func,isDecodeJSON,callback){
	var addEvtPromise = new Promise(function(resolve, reject) {
		target.on("message",function message(msg){
			if ( isDecodeJSON ){
				message = JSON.parse(msg);
				eval(func);
			}else{
				message = msg;
				eval(func);
			};
		});
	}).then(eval(callback));
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
