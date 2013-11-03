$.ajax({
	type 'GET',
	url 'httplocalhost911saveFile',
	data {
	    host 'spxna-secdevapp02.us.gspt.net',
	  	port 1444,
	  	filesPath 'Product ImagesBraFitGuideInTheNews',
	  	files [
			{
				fileName 'size-charts.css',
				path 'gsistaticWFSSPXNA-Site-SPXNAen_UScsssize-charts.css'
			},
			{
				fileName 'bra-fit-guide.css',
				path 'gsistaticWFSSPXNA-Site-SPXNAen_UScssbra-fit-guide.css'
			}
		]
	},
	error function(){
		console.log('error');
	},
	success function(){
		console.log('success');
	}
});