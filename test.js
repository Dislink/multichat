const fs = require("fs");
const ws = require("ws");
const uuid = require("uuid");
const nbt = require('nbt');
const readline = require('readline');
var clients = {};
var ClientIP = {};
var clientId=0;
var onLineClients=0;
var operatorId=0;
var visitorId=0;
var evtList = {};
var operatorsUUID = {};
var visitorsUUID = {};
var functionData = {};
var rowstr = fs.readFileSync("settings.json","utf8");
var settings = JSON.parse(rowstr);
var groups = {};
var globleMultiPlayerCorrelationId=[];
normalFeedbackEnabled=true;
showFeedback=true;
const wss = new ws.Server(
	{
		port : settings.server.port
	} 
);
blocks=["air", "stone", "grass", "dirt", "cobblestone", "planks", "sapling", "bedrock", "flowing_water", "water", "flowing_lava", "lava", "sand", "gravel", "gold_ore", "iron_ore", "coal_ore", "log", "leaves", "sponge", "glass", "lapis_ore", "lapis_block", "dispenser", "sandstone", "noteblock", "bed", "golden_rail", "detector_rail", "sticky_piston", "cobweb", "tallgrass", "deadbush", "piston", "piston_head", "wool", "piston_extension", "dandelion", "poppy", "brown_mushroom", "red_mushroom", "gold_block", "iron_block", "double_stone_slab", "stone_slab", "brick_block", "tnt", "bookshelf", "mossy_cobblestone", "obsidian", "torch", "fire", "monster_spawner", "oak_stairs", "chest", "redstone_wire", "diamond_ore", "diamond_block", "crafting_table", "wheat", "farmland", "furnace", "lit_furnace", "standing_sign", "wooden_door", "ladder", "rail", "stone_stairs", "wall_sign", "lever", "stone_pressure_plate", "iron_door", "wooden_pressure_plate", "redstone_ore", "lit_redstone_ore", "unlit_redstone_torch", "redstone_torch", "stone_button", "snow_layer", "ice", "snow", "cactus", "clay", "reeds", "jukebox", "fence", "pumpkin", "netherrack", "soul_sand", "glowstone", "portal", "lit_pumpkin", "cake", "unpowered_repeater", "powered_repeater", "stained_glass", "trapdoor", "monster_egg", "stonebrick", "brown_mushroom_block", "red_mushroom_block", "iron_bars", "glass_pane", "melon_block", "pumpkin_stem", "melon_stem", "vine", "fence_gate", "brick_stairs", "stone_brick_stairs", "mycelium", "waterlily", "nether_brick", "nether_brick_fence", "nether_brick_stairs", "nether_wart", "enchanting_table", "brewing_stand", "cauldron", "end_portal", "end_portal_frame", "end_stone", "dragon_egg", "redstone_lamp", "lit_redstone_lamp", "double_wooden_slab", "wooden_slab", "cocoa", "sandstone_stairs", "emerald_ore", "ender_chest", "tripwire_hook", "tripwire", "emerald_block", "spruce_stairs", "birch_stairs", "jungle_stairs", "command_block", "beacon", "cobblestone_wall", "flower_pot", "carrots", "potatoes", "wooden_button", "skull", "anvil", "trapped_chest", "light_weighted_pressure_plate", "heavy_weighted_pressure_plate", "unpowered_comparator", "powered_comparator", "daylight_detector", "redstone_block", "quartz_ore", "hopper", "quartz_block", "quartz_stairs", "activator_rail", "dropper", "stained_hardened_clay", "stained_glass_pane", "leaves2", "log2", "acacia_stairs", "dark_oak_stairs", "slime", "barrier", "iron_trapdoor", "prismarine", "sealantern", "hay_block", "carpet", "hardened_clay", "coal_block", "packed_ice", "double_plant", "standing_banner", "wall_banner", "daylight_detector_inverted", "red_sandstone", "red_sandstone_stairs", "double_stone_slab2", "stone_slab2", "spruce_fence_gate", "birch_fence_gate", "jungle_fence_gate", "dark_oak_fence_gate", "acacia_fence_gate", "spruce_fence", "birch_fence", "jungle_fence", "dark_oak_fence", "acacia_fence_gate", "spruce_door", "birch_door", "jungle_door", "acacia_door", "dark_oak_door", "end_rod", "chorus_plant", "chorus_flower", "purpur_block", "purpur_pillar", "purpur_stairs", "purpur_double_slab", "purpur_slab", "end_bricks", "beetroots", "grass_path", "end_gateway", "repeating_command_block", "chain_command_block", "frosted_ice", "magma", "nether_wart_block", "red_nether_brick", "bone_block", "structure_void", "observer", "white_shulker_box", "orange_shulker_box", "magenta_shulker_box", "light_blue_shulker_box", "yellow_shulker_box", "lime_shulker_box", "pink_shulker_box", "gray_shulker_box", "light_gray_shulker_box", "cyan_shulker_box", "purple_shulker_box", "blue_shulker_box", "brown_shulker_box", "green_shulker_box", "red_shulker_box", "black_shulker_box", "white_glazed_terracotta", "orange_glazed_terracotta", "magenta_glazed_terracotta", "light_blue_glazed_terracotta", "yellow_glazed_terracotta", "lime_glazed_terracotta", "pink_glazed_terracotta", "gray_glazed_terracotta", "light_gray_glazed_terracotta", "cyan_glazed_terracotta", "purple_glazed_terracotta", "blue_glazed_terracotta", "brown_glazed_terracotta", "green_glazed_terracotta", "red_glazed_terracotta", "black_glazed_terracotta", "concrete", "concrete_powder", "null", "null", "structure_block"];
emblocks=["sapling","flowing_water","water","flowing_lava","lava","sand","gravel","golden_rail", "detector_rail","tallgrass", "deadbush","brown_mushroom", "red_mushroom","torch", "fire"]
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
		try{
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
		}catch(commandLineError){
			commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[COMMANDLINEERROR]§r:§a'+commandLineError+'§r"}]}');
		};
	};
	function subscribe(target,event){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		try{
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
		}catch(subscribeError){
			commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[SUBSCRIBEERROR]§r:§a'+subscribeError+'§r"}]}');
		};
	};
	function unsubscribe(target,event){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		try{
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
		}catch(unsubscribeError){
			commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[UNSUBSCRIBEERROR]§r:§a'+unsubscribeError+'§r"}]}');
		};
	};
	function eventListener(target,func=(()=>{}),name,ignoreError=false){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		if( typeof(func) != 'function' ){
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+func);
		};
		let clientId=getClientId(target);
		if(isEmpty(name)){
			if(!(typeof(evtList[clientId]) == "object")){
				evtList[clientId]={};
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
				evtList[clientId][name]={};
			};
			evtList[clientId][name].body=func;
			evtList[clientId][name].enable=true;
			evtList[clientId][name].ignoreError=ignoreError;
			evtList[clientId][name].destroy=function (){
				delete evtList[clientId][name];
			};
		}else{
			if(!(typeof(evtList[clientId]) == "object")){
				evtList[clientId]={};
				evtList[clientId].initialized=true;
				evtList[clientId].evtId=0;
			};
			if(!(isUsed(evtList[clientId],name))){
				if(!(typeof(evtList[clientId][name]) == "object")){
					evtList[clientId][name]={};
				};
				evtList[clientId][name].body=func;
				evtList[clientId][name].enable=true;
				evtList[clientId][name].ignoreError=ignoreError;
				evtList[clientId][name].destroy=function (){
					delete evtList[clientId][name];
				};
			}else{
//				throw ReferenceError("'"+name+"'"+" is already used!");
				console.log("'"+name+"'"+" is already used!");
				return false;
			};
		};
		return name;
	};
	function runEvent(target,data){
		clientId=getClientId(target);
		for(let key in evtList[clientId]){
			if(evtList[clientId][key].enable){
				try{
					evtList[clientId][key].body(data);
				}catch(eventListenerError){
					if(!(evtList[clientId][key].ignoreError)){
						evtList[clientId][key].enable=false;
						commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[EVENTLISTENERERROR]§r:§a'+eventListenerError+'§r"}]}');
					};
				};
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
		if( typeof(callback) != 'function' ){
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+callback);
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
					let responseId=callback;
					responseId(data);
				};
			});
			return evtId;
		};
		
	};
	wss.on("connection",function connection(currentClient,currentRequest){
/*		var filled=false
		for(let i=1;i<clientId+1;i++){
			if(isEmpty(clients[i])){
				clients[i]=currentClient;
				var filled=true;
				break;
			};
		};
		if(!(filled)){*/
//		};
		clientId++;
		clients[clientId]=currentClient;
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
//			delete evtList[clientId];
//			delete clients[clientId];
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
					globleMultiPlayerCorrelationId[getClientId(currentClient)]=message.body.properties.GlobalMultiplayerCorrelationId;
					clients[getClientId(currentClient)].joinedGroup='Main';
					if(permissionCheck(message.body.properties.Sender,4)){
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
					if(permissionCheck(message.body.properties.Sender,2)){
						try{
							var feedback=commandLine(currentClient,replaceAll(message.body.properties.Message.replace(/^#*/,'')));
						}catch(catchedError2){
//							commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+catchedError2+'§r"}]}');
						}finally{
							let catchedError2;
							if(normalFeedbackEnabled && showFeedback){
//								commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§a[Feedback]§r:§7'+feedback+'§r"}]}');
							};
						};
					}else{
						commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c你需要成员权限以执行游戏内指令！"}]}');
					};
				}else if( /^\..*/.test(message.body.properties.Message) &&  message.body.properties.MessageType == "chat"){
					if(permissionCheck(message.body.properties.Sender,1)){
						if( /^\.\s*join.*/.test(message.body.properties.Message)){
							let groupName=message.body.properties.Message.replace(/^\.\s*join\s*/,'');
							if(isUsed(groups,groupName)){
								groups[groupName].broadcastTargetIds[getClientId(currentClient)]=true;
								if(!isEmpty(clients[getClientId(currentClient)].joinedGroup)) delete groups[clients[getClientId(currentClient)].joinedGroup].broadcastTargetIds[getClientId(currentClient)];
								clients[getClientId(currentClient)].joinedGroup=groupName;
							}else{
								commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c加入失败！\n原因：请求的群组不存在。"}]}');
							};
						};
					};
					if(permissionCheck(message.body.properties.Sender,3)){
						if( /^\.\s*groups?.*/.test(message.body.properties.Message)){
							if( /^\.\s*groups\s*create.*/.test(message.body.properties.Message)){
								let groupName=message.body.properties.Message.replace(/^\.\s*groups\s*create\s*/,'');
								if(!isUsed(groups,groupName)){
									groups[groupName]={};
									groups[groupName].owner=message.body.properties.Sender;
									groups[groupName].broadcastTargetIds={};
									groups[groupName].boardcastSelector='@a';
//									groups[groupName].boardcastedTargetMultiplayerCorrelationIds={};
									groups[groupName].broadcastOnceAtAWorld=true;
									groups[groupName].permissions={"mute":[],"administrator":[],"whiteList":[],"blackList":[]};
									groups[groupName].requests={};
									commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§a创建成功！\n群组名：'+groupName+'"}]}');
								}else{
									commandLine(currentClient,'tellraw @a {"rawtext":[{"text":"§c创建失败！\n原因：群组已存在。\n§r输入 .join '+groupName+'来加入群组"}]}');
								};
							};
						};
					};
				}else{
					if(!(isEmpty(globleMultiPlayerCorrelationId[getClientId(currentClient)]))&&message.body.properties.MessageType == "chat"){
//						if(globleMultiPlayerCorrelationId[key]!=message.body.properties.GlobalMultiplayerCorrelationId&&!isEmpty(globleMultiPlayerCorrelationId[key])){
//							commandLine(clients[key],'tellraw @s {"rawtext":[{"text":"<'+message.body.properties.Sender+'> '+message.body.properties.Message+'"}]}');
							if(!isEmpty(clients[getClientId(currentClient)].joinedGroup)){
								if(!isUsed(groups[clients[getClientId(currentClient)].joinedGroup].permissions.mute,message.body.properties.Sender)){
									let boardcastedTargetMultiplayerCorrelationIds=[];
									boardcastedTargetMultiplayerCorrelationIds.push(globleMultiPlayerCorrelationId[getClientId(currentClient)]);
									for(let key in groups[clients[getClientId(currentClient)].joinedGroup].broadcastTargetIds){
										if(groups[clients[getClientId(currentClient)].joinedGroup].broadcastOnceAtAWorld){
											if(!check(boardcastedTargetMultiplayerCorrelationIds,globleMultiPlayerCorrelationId[key])){
												commandLine(clients[key],'tellraw '+groups[clients[getClientId(currentClient)].joinedGroup].boardcastSelector+' {"rawtext":[{"text":"<'+replace(message.body.properties.Sender,'"','\\"')+'> '+replace(message.body.properties.Message,'"','\\"')+'"}]}');
												boardcastedTargetMultiplayerCorrelationIds.push(globleMultiPlayerCorrelationId[groups[clients[getClientId(currentClient)].joinedGroup].broadcastTargetIds[key]]);
											};
										}else{
											commandLine(clients[key],'tellraw '+groups[clients[getClientId(currentClient)].joinedGroup].boardcastSelector+' {"rawtext":[{"text":"<'+replace(message.body.properties.Sender,'"','\\"')+'> '+replace(message.body.properties.Message,'"','\\"')+'"}]}')
										};
									};
								}else{
									//禁言
								};
							};
//						};
					};
				};
			};
		},'system');
		evtList[getClientId(currentClient)].system.ignoreError=true;
	};
	function getClientId(client){
		for(let key in clients){
			if(clients[key]==client){
				return key;
			};
		};
	};
	function sendResquest(target,message=null,data={},callback=(()=>{})){
		commandLine(target,'tellraw @s {"rawtext":[{"text":"'+replace(message,'"','\\"')+'"}]}');
		eventListener(target,function (dat){
			let msg=JSON.parse(dat);
			if(msg.body.properties.Sender==data.target||isEmpty(data.target)){
				if(isEmpty(data.options)){
					
				}else{
					
				};
			};
		});
	};
	function reloadSettings(){
		let rowstr = fs.readFileSync("settings.json","utf8");
		settings = JSON.parse(rowstr);
	};
	function replace(string,rstring,replacement){
		let ret='';
		for(let key in string){
			if(string[key]==rstring){
				ret=ret+replacement;
			}else{
				ret=ret+string[key];
			};
		};
		return ret;
	};
	function setPermission(name,permission){
		settings.server.permissions[name]=permission;
	};
/*	function addOperator(name){
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
	};*/
	function permissionCheck(name,permission){
		if(settings.server.permissions[name]==7){
			return true;
		}else if(settings.server.permissions[name]==6){
			if(permission==4||permission==2) return true;
		}else if(settings.server.permissions[name]==5){
			if(permission==4||permission==1) return true;
		}else if(settings.server.permissions[name]==4){
			if(permission==4) return true;
		}else if(settings.server.permissions[name]==3){
			if(permission==2||permission==1) return true;
		}else if(settings.server.permissions[name]==2){
			if(permission==2) return true;
		}else if(settings.server.permissions[name]==1){
			if(permission==1) return true;
		}else{
			return false;
		};
	};
	function replaceAll(string,pattern=/\$r/,replacement=''){
		while(pattern.test(string)){
			var string = string.replace(pattern,replacement);
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
	function parseNBT(nbt,skipBlocks=[],progressFunction=(()=>{})){
		let ret=[];
		let palette=[];
		for(let key in nbt.value.palette.value.value){
			palette.push(nbt.value.palette.value.value[key].Name.value.replace('minecraft:',''));
		};
		for (let i in nbt.value.blocks.value.value){
			if(!check(skipBlocks,palette[nbt.value.blocks.value.value[i].state.value])){
				ret.push("setblock "+"~"+nbt.value.blocks.value.value[i].pos.value.value[0] + " " + "~"+nbt.value.blocks.value.value[i].pos.value.value[1] + " " + "~"+nbt.value.blocks.value.value[i].pos.value.value[2]+" "+ palette[nbt.value.blocks.value.value[i].state.value]);
			}else{
				
			};
			progressFunction((((i/nbt.value.blocks.value.value.length)*100).toString()+'.00').slice(0,5));
		};
		return ret;
	};
	function parseFunction(data,redirectPosition){
		for (let key in data){
//			if(!(redirectPosition)){
				if(!isEmpty(redirectPosition)){
					try{
					if(/^\s*setblock.*/.test(data[key])){
						let positionData=data[key].replace(/^\s*setblock\s*/,'').split(/[a-zA-Z]+/)[0].trim();
						let tileData=data[key].replace(/^\s*setblock\s*/,'').replace(positionData,'');
						if(/^~/.test(positionData)) positionData=positionData.replace(/~/,redirectPosition.x+'+');
						if(/^\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.y+'+');
						if(/^\d+\+?-?\d*\s+\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.z+'+');
						let positions = [];
						let positionArray = positionData.split(/\s+/);
						console.log(positionArray);
						delete positionData;
						for(let key in positionArray){
							positions.push(eval(positionArray[key]+'-0'));
						};
						if(positions.length != 3){
							//Error while changing position(s)
						}else{
							data[key]='setblock '+positions[0]+' '+positions[1]+' '+positions[2]+' '+tileData;
						};
					}else if(/^\s*fill.*/.test(data[key])){
						let positionData=data[key].replace(/\s*fill\s*/,'').split(/[a-zA-Z]+/)[0].trim();
						console.log(positionData)
						let tileData=data[key].replace(/^\s*fill\s*/,'').replace(positionData,'');
						if(/^~/.test(positionData)) positionData=positionData.replace(/~/,redirectPosition.x+'+');
						if(/^\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.y+'+');
						if(/^\d+\+?-?\d*\s+\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.z+'+');
						if(/^\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.x+'+');
						if(/^\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.y+'+');
						if(/^\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s+\d+\+?-?\d*\s*~/.test(positionData)) positionData=positionData.replace(/~/,' '+redirectPosition.z+'+');
						let positions = [];
						let positionArray = positionData.split(/\s+/);
						console.log(positionArray)
						delete positionData;
						for(let key in positionArray){
							positions.push(eval(positionArray[key]+'-0'));
						};
						if(positions.length != 6){
							//Error while changing position(s)
						}else{
							data[key]='fill '+positions[0]+' '+positions[1]+' '+positions[2]+' '+positions[3]+' '+positions[4]+' '+positions[5]+' '+tileData;
						};
					};
					}catch(e){console.log(e)};
				};
//			};
		};
		return data;
	};
	function runFunction(target,commands,time=50,progressEvent=(()=>{}),callback=(()=>{}),_progress=0){
		if(isEmpty(target)){
			throw ReferenceError('target is not defined.');
		};
		if( typeof(callback) != 'function' ){
			throw TypeError("[ERR_INVALID_CALLBACK]:Callback must be a function,received "+callback);
		};
		let functionId=Math.round(commands.length*_progress);
		let data={};
		let progressData;
		let progress;
		let timesLeft;
/*		if(time<=0){
			let i=0;
			for (let key in commands){
				i++;
				try{
					commandLine(target,commands[key].replace('\r',''),callback);
					console.log(commands[functionId]);
				}catch(error){
					commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+error+'§r"}]}');
				};
				if(i>50){
					i=0;
				}else{
					continue;
				};
				progressData=(key+1)/commands.length;
				commandLine(clients[1],'title @a title '+key);
				progress=((progressData*100).toString()+'.00').slice(0,5);
				progressEvent(progress,commands[functionId],commands.length,progressData);
			};
		}else{*/
			setInterval(function (){
				try{
					commandLine(target,commands[functionId].replace('\r',''),callback);
				}catch(error){
					commandLine(target,'tellraw @a {"rawtext":[{"text":"§c[ERROR]§r:§a'+error+'§r"}]}');
				};
				functionId+=1;
				progressData=functionId/commands.length;
				progress=((progressData*100).toString()+'.00').slice(0,5);
				timesLeft=(time*(commands.length-functionId))/1000;
				progressEvent(progress,commands[functionId],commands.length,timesLeft);
				if(functionId>=commands.length) clearInterval(this);
			},time);
//		};
	};
	function isUsed(object,name){
		for(let key in object){
			if(key == name){
				return true;
			};
		};
	};
	function check(object,body){
		for(let key in object){
			if(object[key] == body){
				return true;
			};
		};
	};
	function clearScreen(target,selector){
		commandLine(target,'tellraw '+selector+' {"rawtext":[{"text":"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"}]}');
	};
	function getPos(target,isIntPos=true){
		let rowPosData;
		commandLine(target,'tp @s',function (a,b){commandResponse(a,b,function(dat){rowPosData=JSON.parse(dat).body.destination})});
		if(isIntPos){
			rowPosData.x=Math.round(rowPosData.x);
			rowPosData.y=Math.round(rowPosData.y);
			rowPosData.z=Math.round(rowPosData.z);
			return rowPosData;
		}else{
			return rowPosData;
		};
	};
	function writeFunction(commands,path){
		let data;
		for(let key in commands){
			data+=commands[key]+'\n';
		};
		fs.writeFileSync(path,data);
	};
	function nbtx(target,name,skipBlocks,time,pos,progress){
		nbt.parse(fs.readFileSync('nbt/'+name),function (l,cmdarr){runFunction(target,parseFunction(parseNBT(cmdarr,skipBlocks),pos),time,((a,b,c,d)=>{commandLine(target,'titleraw @a actionbar {"rawtext":[{"text":"进度：'+a+'%\n命令总长度：'+c+'\n预计剩余时间:'+d+'秒"}]}');}),(()=>{}),progress)});
	};
	
	
groups.Main={};
groups.Main.broadcastTargetIds={};
groups.Main.boardcastSelector='@a';
groups.Main.boardcastedTargetMultiplayerCorrelationIds={};
groups.Main.broadcastOnceAtAWorld=true;
function input(target, input, action){
	return eventListener(target,function (d){let msg=JSON.parse(d);if(msg.body.eventName=="PlayerMessage"){if(msg.body.properties.Message==input&&msg.body.properties.MessageType=="chat"){action(msg)}}})
		}