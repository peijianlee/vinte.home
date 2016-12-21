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
})