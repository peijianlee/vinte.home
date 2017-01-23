
	

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
				tr.fadeOut('fast',function(){
					tr.remove()
					list_is_empty()
					artalert('删除成功！')
				})
			}else{
				artalert('删除失败！')
			}
		})
	})
	
}

//如果列表没有数据
var emptyTip = '<tr><td class="lead bg-info text-info" colspan="10">'
	emptyTip += '<strong> <i class="icon-info-sign"'
	emptyTip += ' style="margin-left:10px;margin-right:5px"></i>没有任何电影数据！</strong></td></tr>'
function list_is_empty(){
	var listNum = $tbody.find('tr').length,
		page = $('.page').length;
	if(listNum==0){
		// 判读是否有分页
		if(page==0){
			$tbody.append(emptyTip);
		}else{
			var url = location.href;
			url = url.split('?')[0];
			location.replace(url);
		}
	}

}