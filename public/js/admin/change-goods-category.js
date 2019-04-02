// 新建商品 -- 修改属性


// var sort_id = $('.changeCategory[type="radio"]:checked').val()

$('.changeCategory').click(function(){
	var pid = document.getElementsByName('goods[_id]')[0].value,
		cid = $(this).val(),
		dataCategory = $(this).parent().parent().attr('data-category'),
		check = $(this).is(':checked'),
		inputtype = $(this).attr('type')


	if(inputtype.toString() === "radio"){
		
		$.artTip('<i class="icon-spinner icon-spin mr5"></i>loading...')
		var data = {
			'pid': pid,
			'type': dataCategory,
			'cid': cid,
			'check': check,
			'e_sort_id': $(this).val()
		}
	}else{
		// 复选项
		$.artTip({title: '<i class="icon-spinner icon-spin mr5"></i>loading...'})
		var data = {
			'pid': pid,
			'type': dataCategory,
			'cid': cid,
			'check': check
		}
	}
	$.ajax({
		type:"POST",
		url:"/admin/goods/category/change",
		data:data,
		dataType:"json",
		async:false,
		cache:false,
		success: function(data){
			if(data.success === 1){
				$.closeArtTip({
					title: '<i class="icon-ok-cicle mr5"></i>更改成功！',
					time: 800
				})
				// if(data.newid) sort_id = data.newid
			}else if(data.success === 2){
				$.closeArtTip({
					title: '<i class="icon-ok-cicle mr5"></i>无需修改！',
					time: 800
				})
			}
		}
	})
});	