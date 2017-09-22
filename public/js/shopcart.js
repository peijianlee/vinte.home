
//- 添加购物车商品
$('.iproduct_add_cart_btn').click(function(){
	var $that = $(this)
	var p_id = $that.find("[name='p[id]']").val()
	var p_quantity = $that.find("[name='p[quantity]']").val()

	$.artTip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')

	if($that.hasClass('Stand')){
		return $.closeArtTip('已经存在购物车了',800)
	}

	var pid = $(this).parents('.iproduct').attr('id');
	$.ajax({
		type:'POST',
		url:'/shopcart/add',
		data:{
			'pid':p_id,
			'quantity':p_quantity
		},
		dataType:'json',
		async:false,
		cache:false,
		success: function(data){
			if(data.success===1){
				$.closeArtTip('已经存在购物车了',800)
			}else if(data.success===2){
				$.closeArtTip('成功放入购物车了',800)
				$('.head_shopcart_num').html(data.cart_goods_num)
				$that.addClass('Stand')

			}
		}
	})
})
$('.iproduct_add_cart_btn_stand').click(function(){
	$.artTip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
	$.closeArtTip('已经存在购物车了',800)
})
//- 删除购物车商品
$('.shopcart_goods_remove').click(function(){
	var id = $(this).attr('data-id'),
		goodsTitle = $(this).parent().prev().prev().text(),
		artConfimTip = '是否将询价单中的 “<b class="cBlue">' + goodsTitle + '</b>” 商品移除？'
	$.artConfim(artConfimTip, 'confirmFrame', 'zh_cn', function(i){
		if (!i) {
			$.artTip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
			// var id = $(this).attr('data-id');
			$.ajax({
				type: 'DELETE',
				url: '/shopcart/del?id='+id
			})
			.done(function(results){
				if(results.success===1){
					$.closeArtTip('删除成功！',800)
					$('.head_shopcart_num').html(results.cart_goods_num)
					$('#'+id).remove();
					console.log(results.cart_goods_num===0)
					if(results.cart_goods_num===0){
						var emptyList = '<tr><td class="tc" colspan="6">'+
										'<div class="pb20">'+
										'<p class="fb pt20 pb10">购物车没有任何商品，请前往商品中心添加。</p>'+
										'<a class="button button-royal button-primary" href="/store">商品中心</a>'+
										'</div></td></tr>'
						$('.shopcart_list > tbody').html(emptyList)
					}
				}else{
					$.closeArtTip('删除失败！',800)
				}
			})
		}
	})
	// $.artTip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
	// var id = $(this).attr('data-id');
	// $.ajax({
	// 	type: 'DELETE',
	// 	url: '/shopcart/del?id='+id
	// })
	// .done(function(results){
	// 	if(results.success===1){
	// 		$.closeArtTip('删除成功！',800)
	// 		$('.head_shopcart_num').html(results.cart_goods_num)
	// 		$('#'+id).remove();
	// 		console.log(results.cart_goods_num===0)
	// 		if(results.cart_goods_num===0){
	// 			var emptyList = '<tr><td class="tc" colspan="6">'+
	// 							'<div class="pb20">'+
	// 							'<p class="fb pt20 pb10">购物车没有任何商品，请前往商品中心添加。</p>'+
	// 							'<a class="button button-royal button-primary" href="/store">商品中心</a>'+
	// 							'</div></td></tr>'
	// 			$('.shopcart_list > tbody').html(emptyList)
	// 		}
	// 	}else{
	// 		$.closeArtTip('删除失败！',800)
	// 	}
	// })
})


// 商品选择
$('.selectProduct').click(function(){
	if($(this).is(':checked')){
		$(this).parent('td').parent('tr').css({
			'background-color':'#f7f7f7',
			'box-shadow':'inset 1px 1px white,inset -1px -1px white'
		})
	}else{
		$(this).parent('td').parent('tr').removeAttr('style')
	}
})

$('.ip_favourite_btn').click(function(){
	$.artTip('<i class="icon-spinner icon-spin mr5"></i> 收藏中...')
	var $that = $(this)
	var p_id = $that.parent('li').next('li').find('input[name="p[id]"]').val()
	$.ajax({
		type:"POST",
		url:'/goods/favourite',
		data:{'pid': p_id},
		dataType:"json",
		async:false,
		cache:false,
		success: function(data){
			if (data.success) {
				$.closeArtTip('收藏失败！', 800)
			} else {
				$.closeArtTip(data.info[1], 800)
				if (data.info[1].toString() === '收藏成功') {
					$that.addClass('On').children('b').text(data.num)
				} else {
					$that.removeClass('On').children('b').text(data.num)
				}
			}
		}
	})
})