
	

function del(btn,url){
	$('.'+btn).click(function(e){
		$.artTip('<i class="icon-spinner icon-spin mr5"></i>loading...')
		$tbody = $(this).parents('tbody')
		var target = $(e.target)
		var id = target.data('id')
		var idObj = $('.item-id-'+id)
		// 删除类型
		if($(this).attr('data-type') === "productCategory"){
			var id = $(this).attr('data-id')
		}
		
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
				idObj.fadeOut('fast',function(){
					idObj.remove()
					if(!$(this).attr('data-type') === "productCategory"){
						list_is_empty()
					}
					$.closeArtTip('<i class="icon-ok-cicle mr5"></i>删除成功！','100')
				})
			}else{
				$.closeArtTip('<i class="icon-remove-circle mr5"></i>删除失败！','100')
			}
		})
	})
	
}

//如果列表没有数据
var emptyTip = '<tr><td class="lead bg-info text-info" colspan="10">'
	emptyTip += '<strong> <i class="icon-info-sign"'
	emptyTip += ' style="margin-left:10px;margin-right:5px"></i>没有任何数据！</strong></td></tr>'
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
