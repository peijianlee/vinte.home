
// 商品收藏
$('#goods-wrap').delegate('.ip_favourite_btn', 'click', function(){
// $('.ip_favourite_btn').click(function(){
    $.artTip({title: '<i class="icon-spinner icon-spin mr5"></i> 收藏中...'})
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
            if (data.success === 1) {
                $.closeArtTip({
                    title: '网络超时, 收藏失败！',
                    time: 800
                })
            } else {
                $.closeArtTip({
                    title: data.info[1], 
                    time: 800
                })
                if (data.info[1].toString() === '收藏成功') {
                    $that.addClass('On').children('b').text(data.num)
                } else {
                    $that.removeClass('On').children('b').text(data.num)
                }
            }
        }
    })
})

//- 添加购物车商品
$('#goods-wrap').delegate('.igoods_add_cart_btn', 'click', function(){
// $('.igoods_add_cart_btn').click(function(){
    var $that = $(this)
    var p_id = $that.find("[name='p[id]']").val()
    var p_quantity = $that.find("[name='p[quantity]']").val()

    $.artTip({title: '<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...'})

    var pid = $(this).parents('.igoods').attr('id');
    $.ajax({
        type:'POST',
        url:'/api/goods/addcart',
        data:{
            'pid':p_id,
            'quantity':p_quantity
        },
        dataType:'json',
        async:false,
        cache:false,
        success: function(data){
            if(data.success===1){
                $.closeArtTip({
                    title: '已经存在购物车了',
                    time: 800
                })
            }else if(data.success===2){
                $.closeArtTip({
                    title: '成功放入购物车了',
                    time: 800
                })
                $('.head_shopcart_num').html(data.cart_goods_num)
                $that.addClass('Stand')

            }
        }
    })
})