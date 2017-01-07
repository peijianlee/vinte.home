$(function(){
	// 电影删除
	del('del','movie');
	// 用户删除
	del('userdel','user');
	// 海报删除
	del('bannerdel','banner');

	function del(btn,url){
		$('.'+btn).click(function(e){
			$tbody = $(this).parents('tbody')
			var target = $(e.target)
			var id = target.data('id')
			var tr = $('.item-id-'+id)
			
			if(url=='banner'){
				var src = target.data('src')
				var delurl = '/admin/'+url+'/list?id='+id+'&src='+src
			}else{
				var delurl = '/admin/'+url+'/list?id='+id
			}
			$.ajax({
				type: 'DELETE',
				url: delurl
			})
			.done(function(results){
				if(results.success===1){
					if(tr.length>0){
						tr.fadeOut('fast',function(){
							tr.remove()
							list_empty($('.'+btn))
						})
					}
				}
			})
		})
		
	}

	//如果列表没有数据
	var emptyTip = '<tr><td class="lead bg-info text-info" colspan="10">'
		emptyTip += '<strong> <i class="glyphicon glyphicon-info-sign"'
		emptyTip += ' style="margin-left:10px;margin-right:5px"></i>没有任何电影数据！</strong></td></tr>'
	function list_empty(btn){
		var listNum = $tbody.find('tr').length
		listNum==0?$tbody.append(emptyTip):false;
	}

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

	// 自定义弹出框
	function artalert(txt,type,url){
		var $body = $('body');
		$body.append('<div class="artalert_bg artalert_close"'+
					' style="background-color:rgba(0,0,0,0.5);'+
					'position:fixed;top:0;left:0;display:none;'+
					'width:100%;height:100%;z-index:2010;">');
		$('.artalert_bg').fadeIn(300);
		var btnStyle =  'line-height:32px;height:32px;width:100px;display:inline-block;cursor:pointer;'+
						'background-color:#97c11f;color:white;font-weight:bold;border-radius:3px;';

		if(type==='error'){
			artalert_head_color='#ff6d60';
			var artalert_head_title = '<i class="glyphicon glyphicon-exclamation-sign" '+
									'style="margin-right:5px;"></i>错误信息</h6>';
		}else if(type==='success'){
			artalert_head_color='#00a8b3';
			var artalert_head_title = '<i class="glyphicon glyphicon-info-sign" '+
									'style="margin-right:5px;"></i>提示</h6>';
		}else{
			artalert_head_color='#feb322';
			var artalert_head_title = '<i class="glyphicon glyphicon-info-sign" '+
									'style="margin-right:5px;"></i>提示</h6>';
		}
		var artalert_head = '<h6 style="height:40px;line-height:40px;padding-left:15px;margin:0;border-radius:5px 5px 0 0;'+
			'background-color:'+artalert_head_color+';color:white;font-size:14px;'+
			'box-shadow:inset 1px 1px rgba(255,255,255,0.3);">'+
			'<i class="glyphicon glyphicon-remove artalert_close" style="float:right;cursor:pointer;'+
			'margin:12px 12px 0 0;color:rgba(0,0,0,0.5);text-shadow:1px 1px rgba(255,255,255,0.5);"></i>';
		var artalert_pop = '<div class="artalert" '+
			'style="position:fixed;z-index:2011;background-color:white;'+
			'border-radius:5px;opacity:0;top:-10%;left:50%;width:500px;margin-left:-250px;">'+
			artalert_head+artalert_head_title+
			'<div style="line-height:1.6em;padding:30px 10px;border-bottom:1px solid #ddd;'+
			'text-align:center;font-size:18px;font-weight:bold;">'+txt+'</div>'+
			'<div class="artalert_foot" style="border-top:1px solid white;text-align:center;padding:12px 0;'+
			'background-color:#f9f9f9;margin:0;border-radius:0 0 5px 5px;">'+
			'<span class="artalert_close" style="'+btnStyle+'">确 定</span></div></div>'
		$body.append(artalert_pop);

		$('.artalert').animate({'opacity':1,'top':50},300);

		$('.artalert_close').click(function(){
			$('.artalert_bg').fadeOut(300,function(){
				$(this).remove();
			});
			$('.artalert').animate({'opacity':0,'top':'-10%'},300,function(){
				$(this).remove();
				if(url!==undefined)window.location.href=url;
			});
		});

	}
})