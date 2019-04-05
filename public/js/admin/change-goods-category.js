// 新建商品 -- 修改属性


// var sort_id = $('.changeCategory[type="radio"]:checked').val()

$('.changeCategory').click(function(){
	var self = $(this),
		pid = document.getElementsByName('goods[_id]')[0].value,
		cid = self.val(),
		dataCategory = self.parent().parent().attr('data-category'),
		check = self.is(':checked'),
		inputtype = self.attr('type')


	if(inputtype.toString() === "radio"){
		
		$.artTip({title: '<i class="icon-spinner icon-spin mr5"></i>loading...'})
		var data = {
			'pid': pid,
			'type': dataCategory,
			'cid': cid,
			'check': check,
			'e_sort_id': self.val()
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
			}else{
				self.prop('checked', !check)
				$.closeArtTip({
					title: '<i class="icon-ok-cicle mr5"></i>更改失败，请重试！',
					time: 800
				})
			}
		}
	})
});	