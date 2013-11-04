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
	this.counter = 0;
	this.getDomFromLinkCounter = 1;
	this.parentFolder = '/'+ $('.table_detail_link:not(.wordwrap):first').text();
	this.testData = {
				    host: 'spxna-secdevapp02.us.gspt.net',
				  	port: 1444,
				  	filesPath: '/Product Images/BraFitGuideInTheNews',
				  	files: [
						{
							name: 'size-charts.css',
							path: '/gsi/static/WFS/SPXNA-Site/-/SPXNA/en_US/css/size-charts.css'
						},
						{
							name: 'bra-fit-guide.css',
							path: '/gsi/static/WFS/SPXNA-Site/-/SPXNA/en_US/css/bra-fit-guide.css'
						}
					]
				};
	this.init();
};

Class.ext(ContentParser.prototype, {
	init: function(){
		//Store DOM to local variable
        var domString = $('body').html();
        this.$dom = $(domString);
        
        this.startParse();
	},
	startParse: function(){
		var $curFolder = $( this.$dom.find('.table_detail_link:not(.wordwrap)')[this.counter] ),
			curFolderHref = $curFolder.attr('href'),
			isExecuted = this.isExecuted($curFolder),
			domLinkAjaxCount = isExecuted ? 2 : 1;

		if(this.counter == 0 && isExecuted){
			console.log('FIRST');
			this.checkForAllItems();
		}
		if( $curFolder.length > 0 )
			this.getDomFromLink(curFolderHref, domLinkAjaxCount, this.getDomFromLinkCallback);
		else
			this.sendReadyState();		
	},
	sendReadyState: function(){
		//$.get('http:/localhost:911/completeLoad');
	},
	isExecuted: function($el){
		var $treeImg = $el.closest('.treeIconTable').find('.treeIcon img'),
			imgSrc = $treeImg.attr('src');

		return /minus/.test(imgSrc) && $treeImg.length > 0 ? true : false;
	},
	checkForAllItems: function(){
		if(this.$dom.find('.pagecursorbtn[value="Next"]'))
			this.storeDomShowAll( this.$dom.find('[name="FileDeletionForm"]') );
		else
			this.getVariablesFromDomAndRunAjax();
	},
	getVariablesFromDomAndRunAjax: function(){
		var $selectedDirectoryInput = this.$dom.find('[name="SelectedDirectoryPath"]'),
			path = this.parentFolder,
			files = this.getFilesData();

		if($selectedDirectoryInput.length > 0){
			path = this.parentFolder +'/'+ $selectedDirectoryInput.val();			
		}
		
		console.log('Folder'+ path +" In progress!");
		
		this.counter += 1; 

		files.length > 0 ? this.sendDataForSave(path, files) : this.startParse();
	},
	getDomFromLink: function(url, domLinkAjaxCount, callBack){
		var obj = this;

		$.ajax({
			type : 'GET',
			url : url,
			success: function(data){
				obj.$dom = $(data);
				if(callBack)
					callBack.call(obj, url, domLinkAjaxCount);
			},
			error: function(){
				console.log('Filed to load DOM from "Link"');
			}
		});
	},
	getDomFromLinkCallback: function(url, domLinkAjaxCount){
		if(domLinkAjaxCount && this.getDomFromLinkCounter < domLinkAjaxCount){
			console.log('TWICE');
			this.getDomFromLinkCounter += 1;
			this.getDomFromLink(url, domLinkAjaxCount, this.getDomFromLinkCallback);					
		}
		else{
			this.getDomFromLinkCounter = 1;
			this.checkForAllItems();
		}
	},
	storeDomShowAll: function($form){
		var obj = this;

		$.ajax({
	        url : $form.attr('action'),
	        type : $form.attr('method'),
	        data : $form.serialize() +'&PageSize_-1=Show%20All' ,
	        success : function(data) {
	        	obj.$dom = $(data);

	        	//console.log('"Show all" DOM loaded');
	        	obj.getVariablesFromDomAndRunAjax();
	        },
	        error   : function(xhr, err) {
	            console.log('"Show all" DOM loaded - ERROR:(\n'+ err);     
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
	sendDataForSave: function(curFilePath, filesData){
		var obj = this;
		console.log('SEND');
		$.ajax({
			type: 'GET',
			url: 'http:/localhost:911/saveFile',
			data:{	
				host: obj.host,
				port: obj.port,
			  	filesPath: curFilePath,
			  	files: filesData
			},
			success: function(){				
				console.log('Saved');
				obj.startParse();
			},
			error: function(){
				console.log('error');
			}
		});
	},

});

var contentParser = new ContentParser();