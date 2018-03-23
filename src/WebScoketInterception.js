// wsHook - WebSocket Interception
// Global variables
var WSAllContacts = {
    allContact:{},
    groupInfo:{}
};

(function(){
    // debug mode
    var WAdebugMode = false; 
    // Global variables
    var wsEGlobalVar = {};

    var WsExport = WsExport || {};
    WsExport.Tools = (function(){
        var handleReceivedNode = function(e){
            var t = [], childrenData = nodeReader.children(e);
            if(nodeReader.attr("type", e) === "contacts"){
                WsExport.WsContacts.getAllContacts(childrenData);
            }
        }

        var handleMessage = function (e, t){
            switch (nodeReader.tag(e)) {
                case "message":
                    return messageTypes.WebMessageInfo.parse(nodeReader.children(e));
                case "groups_v2":
                case "broadcast":
                case "notification":
                case "call_log":
                case "security":
                    return e;
                default:
                    return null;
            }
        }
    
        var nodeReader = {
            tag: function(e) { return e && e[0] },
            attr: function(e, t) { return t && t[1] ? t[1][e] : void 0},
            attrs: function(e) { return e[1]},
            child: function s(e, t) {
                var r = t[2];
                if (Array.isArray(r))
                    for (var n = r.length, o = 0; o < n; o++) {
                        var s = r[o];
                        if (Array.isArray(s) && s[0] === e)
                            return s
                    }
            },
            children: function(e){
                return e && e[2]
            },
            dataStr: function(e){
                if (!e) return "";
                var t = e[2];
                return "string" == typeof t ? t : t instanceof ArrayBuffer ? new BinaryReader(t).readString(t.byteLength) : void 0
            }
        }

        // 通过 jid 判断是 group 还是 个人
        var isGroupByJid = function(jid){
            if(! ~jid.indexOf("@") && ! ~jid.indexOf(".")){
                return "wrong jig format"
            }
            return jid.split("@")[1].split(".")[0] === 'g';
        }

        var getPhoneByJid = function(jid){
            if(! ~jid.indexOf("@")){
                return "wrong jig format"
            }
            var firstPart = jid.split("@")[0];
            var phone = firstPart;
            if(isGroupByJid(jid)){
                phone = firstPart.split("-")[0];
            }
            return phone;
        }

        var downloadJsonFile = function(type,jid){
            var currName;
            var content = JSON.stringify(WSAllContacts[type]);
            if(jid){
                currName = WSAllContacts[type][jid].name;
                content = JSON.stringify(WSAllContacts[type][jid]);
            }
            
            var eleLink = document.createElement('a');
            eleLink.download = currName?type+"_"+currName+".json":type+".json"
            eleLink.style.display = 'none';

            // 字符内容转变成blob地址
            var blob = new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
            console.log("-------------["+type+"]wow,finished----------");
        }

        return {
            handleReceivedNode: handleReceivedNode,
            handleMessage: handleMessage,
            isGroupByJid: isGroupByJid,
            getPhoneByJid: getPhoneByJid,
            downloadJsonFile: downloadJsonFile,
        }
    })();


    WsExport.WsContacts = (function(){
        var addAllProfilePic = function(receiveTag,data){
            // 8618513559982@c.us:"https://pps.whatsapp.net/v/t61.11540-24/27545797_192023491546259_7257788959739084800_n.jpg?oe=5AB7711D&oh=dfb4d1b5bf0c983498c65c708a67f6ce"
            var profilePic = {};
            var jid = wsEGlobalVar.profilePicQuery[receiveTag][2];
            profilePic[jid] = data.eurl;
            var isGroupByJid =  WsExport.Tools.isGroupByJid(jid);
            var loopTar = isGroupByJid?"group":"user";

            if(wsEGlobalVar.allContactsArr[loopTar].length){
                $.each(wsEGlobalVar.allContactsArr[loopTar],function(index,item){
                    item.jid === jid && (item.profilePic = profilePic[jid])
                })
            }

            WSAllContacts.allContact = wsEGlobalVar.allContactsArr;
            

            if(WAdebugMode){
                console.log(wsEGlobalVar.allContactsArr)
            }
        }

        var getAllContacts = function(data){
            wsEGlobalVar.allContactsArr = {
                user:[],
                group:[]
            };
            if(Array.isArray(data) && data.length){
                $.each(data,function(index,item){
                    if(item[0] === "user" && (item[1].name||item[1].short)){
                        //群组 "8618301504371-1519924238@g.us"
                        //个人 "8613337023824@c.us"
                        var contactsObj = {};
                        var jid = item[1].jid;
                        contactsObj.name = item[1].name?item[1].name:item[1].short;
                        contactsObj.jid = jid;
                        contactsObj.phoneNum = WsExport.Tools.getPhoneByJid(jid);
                        var isGroupByJid = WsExport.Tools.isGroupByJid(jid);

                        //群组
                        if(isGroupByJid){
                            wsEGlobalVar.allContactsArr.group.push(contactsObj);
                        // 个人
                        }else {
                            wsEGlobalVar.allContactsArr.user.push(contactsObj);
                        }
                    }
                })
            }
        }

        var getGroupInf = function(receiveTag,data){
            var allUser = WSAllContacts.allContact.user;
            var allGroup = WSAllContacts.allContact.group;
            var currJid = wsEGlobalVar.groupMetadataQuery[receiveTag][2]
            
            var groupInfo = {};
            if(currJid === data.id){
                groupInfo.members = [];
                $.each(allGroup,function(index,item){
                    if(data.id === item.jid){
                        groupInfo.name = item.name;
                        groupInfo.profilePic = item.profilePic?item.profilePic:null;
                    }
                })
                $.each(allUser,function(index,item){
                    if(data.owner === item.jid){
                        groupInfo.owner = item.name;
                    }
                    $.each(data.participants,function(idx,mem){
                        if(mem.id === item.jid){
                            var membersObj = {
                                name: item.name,
                                phoneNum: item.phoneNum,
                                profilePic: item.profilePic?item.profilePic:null,
                                isadmin: mem.isAdmin,
                                jid:mem.id
                            };
                            groupInfo.members.push(membersObj);
                        }
                    })
                })
                groupInfo.creationTime = new Date(data.creation);
                groupInfo.jid = data.id;

                if(WAdebugMode){
                    console.log(wsEGlobalVar.groupMetadataQuery);
                    console.log(receiveTag,"-----------------------------------")
                    console.log(data)
                    console.log(WSAllContacts.allContact,"++++++++++++++++++++++")
                }

                WSAllContacts.groupInfo = {};
                WSAllContacts.groupInfo[currJid] = groupInfo;

                var event_ws_addgroupbtn = new CustomEvent('event_ws_addgroupbtn', {detail:currJid});
                document.dispatchEvent(event_ws_addgroupbtn);
            }
        }

        return {
            addAllProfilePic: addAllProfilePic,
            getAllContacts: getAllContacts,
            getGroupInf: getGroupInf

        }
    })();

    WsExport.WsHook = (function(){
        var wsHook = {};
        wsEGlobalVar.profilePicQuery = {};
        wsEGlobalVar.groupMetadataQuery = {};
        wsHook.before = function(originalData, url){
            var payload = WACrypto.parseWebSocketPayload(originalData);
            var tag = payload.tag;
            var data = payload.data;
            return new Promise(function(resolve, reject){
                if (!(data instanceof ArrayBuffer)){
                    if (WAdebugMode){
                        console.log("[Out] Sent message with tag '" + tag +"':");
                        console.log(data);
                    }
                    // 获取头像
                    if(data[1] === "ProfilePicThumb"){
                        wsEGlobalVar.profilePicQuery[tag] = data;
                    }

                    // 获取群组信息
                    if(data[1] === 'GroupMetadata'){
                        wsEGlobalVar.groupMetadataQuery[tag] = data;
                    }
                    resolve(originalData);
                }else{
                    WACrypto.decryptWithWebCrypto(data).then(function(decrypted){
                        if (decrypted == null){
                            resolve(originalData);
                        }
                        var nodeParser = new NodeParser();
                        var node = nodeParser.readNode(new NodeBinaryReader(decrypted));
                        if (WAdebugMode){
                            console.log("[Out] Sent binary with tag '" + tag + "' (" + decrypted.byteLength + " bytes, decrypted): ");
                            console.log(node);
                        } 
                        resolve(originalData);
                    });
                }
            });
        }
        
        
        wsHook.after = function(messageEvent, url){
            
            var payload = WACrypto.parseWebSocketPayload(messageEvent.data);
            var tag = payload.tag;
            var data = payload.data;
    
            if (!(data instanceof ArrayBuffer)){
                if (data != "" && WAdebugMode){
                    console.log("[In] Received message with tag '" + tag +"':");
                    console.log("+++++++receive not ArrBu+++++++")
                    console.log(data);
                    console.log("+++++++receive not ArrBu+++++++")
                }
    
                // 获取头像
                if(Object.keys(wsEGlobalVar.profilePicQuery).length && $.inArray(tag,Object.keys(wsEGlobalVar.profilePicQuery))>-1){
                    if(data){
                        WsExport.WsContacts.addAllProfilePic(tag,data);
                    }
                }

                // 获取群组信息
                if(Object.keys(wsEGlobalVar.groupMetadataQuery).length && $.inArray(tag,Object.keys(wsEGlobalVar.groupMetadataQuery))>-1){
                    if(data){
                        console.log(messageEvent)
                        WsExport.WsContacts.getGroupInf(tag,data);
                    }
                }


            }else{
                WACrypto.decryptWithWebCrypto(data).then(function(decrypted){		 
                    if (WAdebugMode) {
                        console.log("[In] Received binary with tag '" + tag + "' (" +  decrypted.byteLength + " bytes, decrypted)): ");
                    }
                    var nodeParser = new NodeParser();
                    var node = nodeParser.readNode(new NodeBinaryReader(decrypted));
                    
                    if (WAdebugMode){
                        console.log("+++++++receive AB+++++++")
                        console.log(node);
                        console.log("+++++++receive AB+++++++")
                    } 
                    WsExport.Tools.handleReceivedNode(node);
                });
            }
        }

        var _WS = WebSocket;
        WebSocket = function(url, protocols){
            var WSObject;
            this.url = url;
            this.protocols = protocols;
            if (!this.protocols){
                WSObject = new _WS(url);
            }else{
                WSObject = new _WS(url, protocols);
            }
            
            var _send = WSObject.send;
            var _wsobject = this;
            wsHook._send = WSObject.send = function(data){
            new wsHook.before(data, WSObject.url).then(function (newData){
                if (newData != null)
                    _send.apply(WSObject, [newData]);
            }).catch(function(e){
                    _send.apply(WSObject, [newData]);  
            });
            }
            // Events needs to be proxied and bubbled down.
            var onmessageFunction;
            // 重新赋值 websocket 的 onmessage 方法，这里只是将 原websocket 的 onmeesage 方法提出 赋值给 wshook
            WSObject.__defineSetter__('onmessage', function(func){
            onmessageFunction = wsHook.onMessage = func;
            });
            WSObject.addEventListener('message', function(e){
                if (!onmessageFunction){
                    console.log("warning: no onmessageFunction");
                    return;
                }
                wsHook.after(e, this.url) || e;
                onmessageFunction.apply(this, [e]);
            });
            return WSObject;
        }
    })();

    WsExport.Listener  = (function(){
        document.addEventListener('event_allBtnClick', function (e) { 
            console.log("[+event+]oops,export all contacts")
            WsExport.Tools.downloadJsonFile("allContact");
        }, false);
        document.addEventListener('event_groupBtnClick', function (e) { 
            var currJid = e.detail;
            console.log("[+event+]oops,export group contacts"+currJid)
            WsExport.Tools.downloadJsonFile("groupInfo",currJid);
        }, false);
        
    })();
})();
