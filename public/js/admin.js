$(function(){

	$('#douban').blur(function(){
		var douban = $(this)
		var id = douban.val()
		$.ajax({
			url:'https://api.douban.com/v2/movie/subject/'+id,
			cache:true,
			type:'get',
			dataType:'jsonp',
			crossDomain:true,
			jsonp:'callback',
			success:function(data){
				$('#inputTitle').val(data.title)
				$('#inputDoctor').val(data.directors[0].name)
				$('#inputCountry').val(data.countries[0])
				$('#inputPoster').val(data.images.large)
				$('#inputYear').val(data.year)
				$('#inputSummary').val(data.summary)
			}
		})
	})


	$('.signin-success,.dialog-signin-success').click(function(){
		// alert('dd')
		var par = $(this).parent('div').parent('div')
		var Na = par.find('.signinName').val()
		var Ps = par.find('.signinPassword').val()
		$.ajax({
			type: 'POST',
			url: '/user/signin?name='+Na+'&password='+Ps
		})
		.done(function(results){
			if(results.success===1){
				artalert('登录成功','success','/');
				
			}
			else if(results.success===2){
				artalert('用户不存在')
			}else{
				artalert('密码错误','error')
			}
		})
	});
})