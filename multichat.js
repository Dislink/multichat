const fs = require("fs");
const commands=new Array();
var datas = new Array();
fs.readFile("/storage/emulated/0/websocket/settings.ini","utf8",function read(err,data){
	if ( err ){
		console.log(err) 
	}else{
		for (var i=0;i<data.split("\n").length;i++){
			datas.push(data.split("\n")[i]);eval(data.split("\n")[i]);
			}
		}
	}
);

const ws = require("ws");
const wss = new ws.Server( 
	{
		port : websocketPort
	} 
);
var clients = new Array();
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
	)
};
function addEventListener(target,event){
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
	)
};
function eventListener(target,func,isDecodeJSON){
	target.on("message",function message(msg){
		if ( isDecodeJSON ){
			var message = JSON.parse(msg);
			eval(func);
		}else{
			var message = msg;
			eval(func);
		};
	});
};
wss.on("connection",function connection(currentClient){
	clients.push(currentClient);
	console.log("Client connected!\n");
	for (var i=0;i<commands.length;i++){
		commandLine(clients[0],commands[i]);currentConnection(currentClient);
		};
	}
)


function currentConnection(currentClient){
	addEventListener(currentClient,'PlayerMessage')
	eventListener(currentClient,`function e(message){
	if ( message.body.eventName == "PlayerMessage" && message.body.properties.MessageType == "chat" ){
		try{
			var rowmsg=message.body.properties.Message;
			if (/\s*secret\s*.*/.test(rowmsg)){
				for(var i=0;i<clients.length;i++){
						commandLine(clients[i],"tellraw @s "+"["+message.body.properties.Sender+"]"+"["+message.body.properties.Build+"]"+":"+rowmsg.replace(/\s*secret\s*/,"").replace(/^broadcast\s*/,""))
					}
				}else{
					if (/\s*broadcast.*/.test(rowmsg)){
						for(var i=0;i<clients.length;i++){
							commandLine(clients[i],"tellraw @a "+"["+message.body.properties.Sender+"]"+"["+message.body.properties.Build+"]"+":"+rowmsg.replace(/\s*broadcast\s*/,""))
					};
				}
			}
		}catch(err){commandLine("say Error!")}}};
e(message)`
,true)
}
