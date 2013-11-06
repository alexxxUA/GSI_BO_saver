//Extend class
var Class = {
	ext: function(targetClass, sourse){
		if(Object.prototype.toString.call(sourse) === '[object Array]')
			this.arraySourse(targetClass, sourse);
		else
			this.objSourse(targetClass, sourse);
	},
	arraySourse: function(targetClass, sourse){
		for(var i=0; i<sourse.length; i++)
			this.objSourse(targetClass, sourse[i]);
	},
	objSourse: function(targetClass, sourse){
		for(var key in sourse) if(sourse.hasOwnProperty(key))
			targetClass[key] = sourse[key];			
	}
};
//Main class for *Content Parser*
function ContentParser(){
	this.host = document.location.hostname;
	this.port = document.location.port.length > 0 ? document.location.port : false;
	this.counter = -1;
	this.getDomFromLinkCounter = 1;
	this.filesLength = 0;
	this.parentFolder = '/'+ $('.table_detail_link:not(.wordwrap):first').text();
	
	this.init();
};

Class.ext(ContentParser.prototype, {
	init: function(){
		//Store DOM to local variable
        var domString = $('body').html();
        this.$dom = $(domString);
        
        this.startParse();
	},
	startParse: function(isLast){
		this.counter += 1;
		var curFolder = this.getDirParam(this.counter);

		if( curFolder.isExist )
			this.getDomFromLink(curFolder.href, this.getDomFromLinkCallback, curFolder.isExecuted);
		else if(isLast)
			this.sendReadyState();
	},
	getDirParam: function(index){
		var $curFolder = $( this.$dom.find('.table_detail_link:not(.wordwrap)')[index] );

		return {
			$item: $curFolder,
			href: $curFolder.attr('href'),
			isExist: $curFolder.length > 0 ? true : false,
			isExecuted: this.isExecuted($curFolder)
		};
	},
	sendReadyState: function(){
		console.log('All files were successfully sended to server for downloading!');
	},
	isExecuted: function($el){
		var $treeImg = $el.closest('.treeIconTable').find('.treeIcon img'),
			imgSrc = $treeImg.attr('src');
		return /minus/.test(imgSrc) ? true : false;
	},
	checkForAllItems: function(){
		if(this.$dom.find('.pagecursorbtn[value="Next"]'))
			this.storeDomShowAll( this.$dom.find('[name="FileDeletionForm"]'), this.getVariablesFromDomAndRunAjax );
		else
			this.getVariablesFromDomAndRunAjax();
	},
	getVariablesFromDomAndRunAjax: function(){
		var $selectedDirectoryInput = this.$dom.find('[name="SelectedDirectoryPath"]'),
			path = this.parentFolder,
			files = this.getFilesData();

		if($selectedDirectoryInput.length > 0)
			path = this.parentFolder +'/'+ $selectedDirectoryInput.val();
		
		if(files.length > 0){
			console.log('%c'+ files.length +' files from Path: "'+ path +'" - in progress...', 'color: #40BFF0; font-size: 13px;');
			this.sendDataForSave(path, files, this.startParse )
		}
		else
			this.startParse();
	},
	getDomFromLink: function(url, callBack, isExecuted){
		var obj = this;

		$.ajax({
			type : 'GET',
			url : url,
			success: function(data){
				obj.$dom = $(data);
				if(callBack)
					callBack.call(obj, url, isExecuted);
			},
			error: function(){
				console.log('%cFiled to load DOM from "Link"', 'color: #F04063; font-size: 13px;');
			}
		});
	},
	getDomFromLinkCallback: function(url, isExecuted){
		if(isExecuted){
			var curFolder = this.getDirParam(this.counter);
			this.getDomFromLink(curFolder.href, this.getDomFromLinkCallback, curFolder.isExecuted);					
		}
		else
			this.checkForAllItems();
	},
	storeDomShowAll: function($form, callBack){
		var obj = this;

		$.ajax({
	        url : $form.attr('action'),
	        type : $form.attr('method'),
	        data : $form.serialize() +'&PageSize_-1=Show%20All' ,
	        success : function(data) {
	        	obj.$dom = $(data);
	        	if(callBack)
	        		callBack.call(obj);
	        },
	        error   : function(xhr, err) {
	            console.log('Filed to load "Show all" DOM: '+ err);     
	        }
	    });
	},
	getFilesData: function(){
		var filesData = [];

		this.$dom.find('.table_detail_link.wordwrap').each(function(){
			var fileData = {},
				fileName = '';
			fileData.path = $(this).attr('href');
			fileName = fileData.path.split('/');
			fileData.name = fileName[fileName.length-1];

			filesData.push(fileData);
		});
		return filesData;
	},
	sendDataForSave: function(curFilePath, filesData, callBack){
		this.filesLength += filesData.length;
		var obj = this,
			nextDir = this.getDirParam(this.counter + 1),
			data = {	
					host: obj.host,
					port: obj.port,
				  	filesPath: curFilePath,
				  	files: filesData,
				  	filesLength: this.filesLength,
				  	isLastChunk: nextDir.isExist ? false : true
			};
		$.ajax({
			type: 'GET',
			url: 'https://localhost:911/saveFile',
			data: data,
			success: function(){				
				console.log('%cFiles from path: "'+ curFilePath +'" were sended to server for downloading!\n-----------------------------------------------------------------------------------', 'color: #93EC9D; font-size: 13px');
				if(callBack)
					callBack.call(obj, data.isLastChunk)
			},
			error: function(){
				//console.log('%cNodejs server was crashed. Restart the server and try again.', 'color: #F04063; font-size: 13px;');
			}
		});
	}
});

var contentParser = new ContentParser();