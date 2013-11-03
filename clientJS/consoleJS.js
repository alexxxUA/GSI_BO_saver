var siteSettings = {
	host: 'spxna-secdevapp02.us.gspt.net',
  	port: 1444
};

var counter = 0,
	pathTree = [];
$('.table_detail_link:not')[0];

$(document).delegate('[name="FileDeletionForm"]', 'submit', function() {            
    $.ajax({
        url     : $(this).attr('action'),
        type    : $(this).attr('method'),
        data    : $(this).serialize(),
        success : function( data ) {
                     console.log(data);
        },
        error   : function( xhr, err ) {
                     alert('Error');     
        }
    });    
    return false;
});
$('[name="FileDeletionForm"]')




function getFilesData(){
	var filesData = [];

	$('.table_detail_link.wordwrap').each(function(){
		var fileData = {},
			fileName = '';
		fileData.path = $(this).attr('href');
		fileName = fileData.path.split('/');
		fileData.name = fileName[fileName.length-1];

		filesData.push(fileData);
	});
	return filesData;
}

function sendDataForSave(curFilePath, filesData){
	$.ajax({
		type: 'GET',
		url: 'http:/localhost:911/saveFile',
		data:{	
			host: siteSettings.host,
		  	port: siteSettings.port,
		  	filesPath: curFilePath,
		  	files: filesData
		},
		error: function(){
			console.log('error');
		},
		success: function(){
			console.log('success');
		}
	});
};

sendDataForSave('/CMS SPOTS', getFilesData());

var testData = {
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

//sendDataForSave(testData);

