(function(){
    var addExportBtn = {
        init:function(){
            this.onMainUIReady();
            // this.isExportExist();
            // this.addButtonIcon();
        },
        onMainUIReady:function(){
            var self= this;
            var mainUIReadyTimer = setInterval(function(){
                console.log("Checking if the loading finished")
                if(document.getElementsByClassName("rAUz7").length){
                    clearInterval(mainUIReadyTimer);
                    console.log("loading finished (o^^o)")
                    self.isExportExist();
                    self.addButtonIcon();
                }
            },500)
        },
        isExportExist:function(){
            if(document.getElementsByClassName("export_contact_btn")){
                return;
            }
        },
        addButtonIcon:function(){
            // var chatMenuBtns = document.getElementsByClassName("_3q4NP _1Iexl")
            console.log(document.getElementById("pane-side"),"----")
            // console.log(wsHook)
            // var fistChatMenuBtn = document.getElementsByClassName("rAUz7")[0];

            var fistLeftMenuBtn = document.getElementsByClassName("rAUz7")[0];
            console.log(fistLeftMenuBtn)
            if(fistLeftMenuBtn){
                var exportBtnElem = document.createElement("div");
                exportBtnElem.setAttribute("class", "rAUz7 export_contact_btn");
                var iconElem = document.createElement("button");
                iconElem.setAttribute("class", "export_contact_btn");
                iconElem.setAttribute("title", "Exports Now");
                exportBtnElem.appendChild(iconElem);
                firstMenuItem.parentElement.insertBefore(exportBtnElem, firstMenuItem);
            }
        }

    };

    addExportBtn.init();

})();