define(["jQuery","dom","loading","libraryMenu","listViewStyle"],function($,dom,loading,libraryMenu){"use strict";function populateLanguages(select){return ApiClient.getCultures().then(function(languages){var html="";html+="<option value=''></option>";for(var i=0,length=languages.length;i<length;i++){var culture=languages[i];html+="<option value='"+culture.TwoLetterISOLanguageName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html})}function populateCountries(select){return ApiClient.getCountries().then(function(allCountries){var html="";html+="<option value=''></option>";for(var i=0,length=allCountries.length;i<length;i++){var culture=allCountries[i];html+="<option value='"+culture.TwoLetterISORegionName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html})}function loadTabs(page,tabs){for(var html="",i=0,length=tabs.length;i<length;i++){var tab=tabs[i],isChecked=0==i?' selected="selected"':"";html+='<option value="'+tab.type+'"'+isChecked+">"+Globalize.translate(tab.name)+"</option>"}$("#selectItemType",page).html(html).trigger("change"),loading.hide()}function loadType(page,type){loading.show(),currentType=type;var promise1=ApiClient.getServerConfiguration(),promise2=ApiClient.getJSON(ApiClient.getUrl("System/Configuration/MetadataPlugins"));Promise.all([promise1,promise2]).then(function(responses){var config=responses[0],metadataPlugins=responses[1];config=config.MetadataOptions.filter(function(c){return c.ItemType==type})[0],config?(renderType(page,type,config,metadataPlugins),loading.hide()):ApiClient.getJSON(ApiClient.getUrl("System/Configuration/MetadataOptions/Default")).then(function(defaultConfig){config=defaultConfig,renderType(page,type,config,metadataPlugins),loading.hide()})})}function setVisibilityOfBackdrops(elem,visible){visible?(elem.show(),$("input",elem).attr("required","required")):(elem.hide(),$("input",elem).attr("required","").removeAttr("required"))}function renderType(page,type,config,metadataPlugins){var metadataInfo=metadataPlugins.filter(function(f){return type==f.ItemType})[0];setVisibilityOfBackdrops($(".backdropFields",page),metadataInfo.SupportedImageTypes.indexOf("Backdrop")!=-1),setVisibilityOfBackdrops($(".screenshotFields",page),metadataInfo.SupportedImageTypes.indexOf("Screenshot")!=-1),$(".imageType",page).each(function(){var imageType=this.getAttribute("data-imagetype"),container=dom.parentWithTag(this,"LABEL");metadataInfo.SupportedImageTypes.indexOf(imageType)==-1?container.classList.add("hide"):container.classList.remove("hide"),getImageConfig(config,imageType).Limit?this.checked=!0:this.checked=!1});var backdropConfig=getImageConfig(config,"Backdrop");$("#txtMaxBackdrops",page).val(backdropConfig.Limit),$("#txtMinBackdropDownloadWidth",page).val(backdropConfig.MinWidth);var screenshotConfig=getImageConfig(config,"Screenshot");$("#txtMaxScreenshots",page).val(screenshotConfig.Limit),$("#txtMinScreenshotDownloadWidth",page).val(screenshotConfig.MinWidth),renderMetadataFetchers(page,type,config,metadataInfo),renderImageFetchers(page,type,config,metadataInfo)}function getImageConfig(config,type){return config.ImageOptions.filter(function(i){return i.Type==type})[0]||{Type:type,MinWidth:"Backdrop"==type?1280:0,Limit:"Backdrop"==type?3:1}}function renderImageFetchers(page,type,config,metadataInfo){var plugins=metadataInfo.Plugins.filter(function(p){return"ImageFetcher"==p.Type}),html="";if(!plugins.length)return void $(".imageFetchers",page).html(html).hide();var i,length,plugin;for(html+='<h3 class="checkboxListLabel">'+Globalize.translate("LabelImageFetchers")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">',i=0,length=plugins.length;i<length;i++){plugin=plugins[i];var isChecked=config.DisabledImageFetchers.indexOf(plugin.Name)==-1?' checked="checked"':"";html+='<div class="listItem imageFetcherItem" data-pluginname="'+plugin.Name+'">',html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkImageFetcher" data-pluginname="'+plugin.Name+'" '+isChecked+"><span></span></label>",html+='<div class="listItemBody">',html+='<h3 class="listItemBodyText">',html+=plugin.Name,html+="</h3>",html+="</div>",html+='<button type="button" is="paper-icon-button-light" title="'+Globalize.translate("ButtonUp")+'" class="btnUp" style="padding:3px 8px;"><i class="md-icon">keyboard_arrow_up</i></button>',html+='<button type="button" is="paper-icon-button-light" title="'+Globalize.translate("ButtonDown")+'" class="btnDown" style="padding:3px 8px;"><i class="md-icon">keyboard_arrow_down</i></button>',html+="</div>"}html+="</div>",html+='<div class="fieldDescription">'+Globalize.translate("LabelImageFetchersHelp")+"</div>";var elem=$(".imageFetchers",page).html(html).show();$(".btnDown",elem).on("click",function(){var elemToMove=$(this).parents(".imageFetcherItem")[0],insertAfter=$(elemToMove).next(".imageFetcherItem")[0];insertAfter&&(elemToMove.parentNode.removeChild(elemToMove),$(elemToMove).insertAfter(insertAfter))}),$(".btnUp",elem).on("click",function(){var elemToMove=$(this).parents(".imageFetcherItem")[0],insertBefore=$(elemToMove).prev(".imageFetcherItem")[0];insertBefore&&(elemToMove.parentNode.removeChild(elemToMove),$(elemToMove).insertBefore(insertBefore))})}function renderMetadataFetchers(page,type,config,metadataInfo){var plugins=metadataInfo.Plugins.filter(function(p){return"MetadataFetcher"==p.Type}),html="";if(!plugins.length)return void $(".metadataFetchers",page).html(html).hide();var i,length,plugin;for(html+='<h3 class="checkboxListLabel">'+Globalize.translate("LabelMetadataDownloaders")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">',i=0,length=plugins.length;i<length;i++){plugin=plugins[i];var isChecked=config.DisabledMetadataFetchers.indexOf(plugin.Name)==-1?' checked="checked"':"";html+='<div class="listItem metadataFetcherItem" data-pluginname="'+plugin.Name+'">',html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkMetadataFetcher" data-pluginname="'+plugin.Name+'" '+isChecked+"><span></span></label>",html+='<div class="listItemBody">',html+='<h3 class="listItemBodyText">',html+=plugin.Name,html+="</h3>",html+="</div>",html+='<button type="button" is="paper-icon-button-light" title="'+Globalize.translate("ButtonUp")+'" class="btnUp" style="padding:3px 8px;"><i class="md-icon">keyboard_arrow_up</i></button>',html+='<button type="button" is="paper-icon-button-light" title="'+Globalize.translate("ButtonDown")+'" class="btnDown" style="padding:3px 8px;"><i class="md-icon">keyboard_arrow_down</i></button>',html+="</div>"}html+="</div>",html+='<div class="fieldDescription">'+Globalize.translate("LabelMetadataDownloadersHelp")+"</div>";var elem=$(".metadataFetchers",page).html(html).show();$(".btnDown",elem).on("click",function(){var elemToMove=$(this).parents(".metadataFetcherItem")[0],insertAfter=$(elemToMove).next(".metadataFetcherItem")[0];insertAfter&&(elemToMove.parentNode.removeChild(elemToMove),$(elemToMove).insertAfter(insertAfter))}),$(".btnUp",elem).on("click",function(){var elemToMove=$(this).parents(".metadataFetcherItem")[0],insertBefore=$(elemToMove).prev(".metadataFetcherItem")[0];insertBefore&&(elemToMove.parentNode.removeChild(elemToMove),$(elemToMove).insertBefore(insertBefore))})}function loadPage(page){var promises=[ApiClient.getServerConfiguration(),populateLanguages(page.querySelector("#selectLanguage")),populateCountries(page.querySelector("#selectCountry"))];Promise.all(promises).then(function(responses){var config=responses[0];page.querySelector("#selectLanguage").value=config.PreferredMetadataLanguage||"",page.querySelector("#selectCountry").value=config.MetadataCountryCode||""}),loadTabs(page,[{name:"OptionMovies",type:"Movie"},{name:"OptionCollections",type:"BoxSet"},{name:"OptionSeries",type:"Series"},{name:"OptionSeasons",type:"Season"},{name:"OptionEpisodes",type:"Episode"},{name:"OptionGames",type:"Game"},{name:"OptionGameSystems",type:"GameSystem"},{name:"OptionMusicArtists",type:"MusicArtist"},{name:"OptionMusicAlbums",type:"MusicAlbum"},{name:"OptionMusicVideos",type:"MusicVideo"},{name:"OptionSongs",type:"Audio"},{name:"OptionHomeVideos",type:"Video"},{name:"OptionBooks",type:"Book"},{name:"OptionPeople",type:"Person"}])}function saveSettingsIntoConfig(form,config){config.DisabledMetadataFetchers=$(".chkMetadataFetcher",form).get().filter(function(c){return!c.checked}).map(function(c){return c.getAttribute("data-pluginname")}),config.MetadataFetcherOrder=$(".chkMetadataFetcher",form).get().map(function(c){return c.getAttribute("data-pluginname")}),config.DisabledImageFetchers=$(".chkImageFetcher",form).get().filter(function(c){return!c.checked}).map(function(c){return c.getAttribute("data-pluginname")}),config.ImageFetcherOrder=$(".chkImageFetcher",form).get().map(function(c){return c.getAttribute("data-pluginname")}),config.ImageOptions=$(".imageType:not(.hide)",form).get().map(function(c){return{Type:c.getAttribute("data-imagetype"),Limit:c.checked?1:0,MinWidth:0}}),config.ImageOptions.push({Type:"Backdrop",Limit:$("#txtMaxBackdrops",form).val(),MinWidth:$("#txtMinBackdropDownloadWidth",form).val()}),config.ImageOptions.push({Type:"Screenshot",Limit:$("#txtMaxScreenshots",form).val(),MinWidth:$("#txtMinScreenshotDownloadWidth",form).val()})}function onSubmit(){var form=this;return loading.show(),ApiClient.getServerConfiguration().then(function(config){var type=currentType,metadataOptions=config.MetadataOptions.filter(function(c){return c.ItemType==type})[0];metadataOptions?(config.PreferredMetadataLanguage=form.querySelector("#selectLanguage").value,config.MetadataCountryCode=form.querySelector("#selectCountry").value,saveSettingsIntoConfig(form,metadataOptions),ApiClient.updateServerConfiguration(config).then(Dashboard.processServerConfigurationUpdateResult)):ApiClient.getJSON(ApiClient.getUrl("System/Configuration/MetadataOptions/Default")).then(function(defaultOptions){defaultOptions.ItemType=type,config.MetadataOptions.push(defaultOptions),saveSettingsIntoConfig(form,defaultOptions),ApiClient.updateServerConfiguration(config).then(Dashboard.processServerConfigurationUpdateResult)})}),!1}function getTabs(){return[{href:"library.html",name:Globalize.translate("HeaderLibraries")},{href:"librarydisplay.html",name:Globalize.translate("TabDisplay")},{href:"metadataimages.html",name:Globalize.translate("TabMetadata")},{href:"metadatanfo.html",name:Globalize.translate("TabNfoSettings")},{href:"librarysettings.html",name:Globalize.translate("TabAdvanced")}]}var currentType;$(document).on("pageinit","#metadataImagesConfigurationPage",function(){var page=this;$(".metadataReaders",page).on("click",".btnLocalReaderMove",function(){var li=$(this).parents(".localReaderOption"),list=li.parents(".paperList");if($(this).hasClass("btnLocalReaderDown")){var next=li.next();li.remove().insertAfter(next)}else{var prev=li.prev();li.remove().insertBefore(prev)}$(".localReaderOption",list).each(function(){$(this).prev(".localReaderOption").length?$(".btnLocalReaderMove",this).addClass("btnLocalReaderUp").removeClass("btnLocalReaderDown").attr("icon","keyboard-arrow-up"):$(".btnLocalReaderMove",this).addClass("btnLocalReaderDown").removeClass("btnLocalReaderUp").attr("icon","keyboard-arrow-down")})}),$("#selectItemType",page).on("change",function(){loadType(page,this.value)}),$(".metadataImagesConfigurationForm").off("submit",onSubmit).on("submit",onSubmit)}).on("pageshow","#metadataImagesConfigurationPage",function(){libraryMenu.setTabs("metadata",2,getTabs),loading.show();var page=this;loadPage(page)})});