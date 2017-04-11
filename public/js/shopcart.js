
//- 添加购物车商品
$('.iproduct_add_cart_btn').click(function(){
	var $that = $(this)
	var p_id = $that.find("[name='p[id]']").val()
	var p_quantity = $that.find("[name='p[quantity]']").val()

	arttip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
	//- if($that.hasClass('inCart')){
	//- 	arttipclose('已经存在购物车了',800)
	//- 	return false;
	//- }

	var pid = $(this).parents('.iproduct').attr('id');
	$.ajax({
		type:"POST",
		url:'/shopcart/add',
		data:{
			"pid":p_id,
			"quantity":p_quantity
		},
		dataType:"json",
		async:false,
		cache:false,
		success: function(data){
			if(data.success===1){
				//- $that.addClass('inCart')
				arttipclose('已经存在购物车了',800)
			}else if(data.success===2){
				arttipclose('成功放入购物车了',800)
				$('.head_shopcart_num').html(data.cart_goods_num)

			}
		}
	});
});
//- 删除购物车商品
$('.shopcart_goods_remove').click(function(){
	arttip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
	var id = $(this).attr('data-id');
	$.ajax({
		type: 'DELETE',
		url: '/shopcart/del?id='+id
	})
	.done(function(results){
		if(results.success===1){
			arttipclose('删除成功！',800)
			$('.head_shopcart_num').html(results.cart_goods_num)
			$('#'+id).remove();
			console.log(results.cart_goods_num===0)
			if(results.cart_goods_num===0){
				var emptyList = '<tr><td class="tc" colspan="4">'+
								'<div class="pb20">'+
								'<p class="fb pt20 pb10">购物车没有任何商品，请前往商品中心添加。</p>'+
								'<a class="button button-royal button-primary" href="/store">商品中心</a>'+
								'</div></td></tr>'
				$('.shopcart_list > tbody').html(emptyList)
			}
		}else{
			arttipclose('删除失败！',800)
		}
	})
});