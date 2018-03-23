var addExportBtn = {
    init:function(){
        this.onMainUIReady();
    },
    onMainUIReady:function(){
        var self= this;
        var mainUIReadyTimer = setInterval(function(){
            console.log("Checking if the loading finished")
            if($(".rAUz7").length){
                clearInterval(mainUIReadyTimer);
                console.log("loading finished (o^^o)")
                // 判断导出button是不是已经存在
                if(! self.isExportAllExist()){
                    self.addAllButtonIcon();
                }
                self.addEvent(); // 绑定事件
            }
        },500)
    },
    isExportAllExist:function(){
        return $(".export_allcontact_btn").length;
    },
    addAllButtonIcon:function(){
        // 添加下载全部按钮
        var $fistLeftMenuBtn = $("#side .rAUz7").eq(0);
        if($fistLeftMenuBtn){
            var exportAllTem = 
            '<div class="rAUz7 export_allcontact_btn">' +
	            '<div role="button" title="Status">' +
                    '<span data-icon="status-v3" class="">' +
                        '<img src="https://gw.alicdn.com/tfs/TB165obe1uSBuNjy1XcXXcYjFXa-32-32.png" width="24px" title="export all contacts">'
		            '</span>' +
	            '</div>' +
            '</div>' ;
            $fistLeftMenuBtn.parent().prepend(exportAllTem);
            console.log("added AllButtonIcon (｡ì _ í｡)")
        }
    },
    addGroupButtonIcon:function(currJid){
        if($(".export_groupInfo_btn").length){
            return;
        }
        var $fistLeftMenuBtn = $("#main .rAUz7").eq(0);  
        if($fistLeftMenuBtn){
            var exportGroupTem = 
            '<div class="rAUz7 export_groupInfo_btn" data-jid='+currJid+'>' +
	            '<div role="button" title="Status">' +
                    '<span data-icon="status-v3" class="">' +
                        '<img src="https://gw.alicdn.com/tfs/TB165obe1uSBuNjy1XcXXcYjFXa-32-32.png" width="24px" title="export all contacts">'
		            '</span>' +
	            '</div>' +
            '</div>' ;
            $fistLeftMenuBtn.parent().prepend(exportGroupTem);
        }
    },
    exportAll:function(){
        var event_allBtnClick = new Event('event_allBtnClick');
        document.dispatchEvent(event_allBtnClick);
    },
    exportGroupInfo:function(){
        var currJid = $(".export_groupInfo_btn").data("jid");
        var event_groupBtnClick = new CustomEvent('event_groupBtnClick', {detail:currJid});
        document.dispatchEvent(event_groupBtnClick);
    },  
    addEvent:function(){
        var self = this;
        // $("#pane-side").on("click","div._2wP_Y",this.addGroupButtonIcon);
        $(".export_allcontact_btn").on("click",this.exportAll);
        $("body").on("click","div.export_groupInfo_btn",this.exportGroupInfo);

        document.addEventListener('event_ws_addgroupbtn', function (e) { 
            var currJid = e.detail;
            self.addGroupButtonIcon(currJid)
        }, false);
    }

};

addExportBtn.init();
