$(function(){
    var sid = [], stitle = []
    $.checkBoxSelect(['.select-goods', '#select-all', 'tbody tr', '#select-num', '#remove-all'], function (info) {
        sid = info.sid
        stitle = info.stitle
    })
    //- 删除询价单列表里商品
    $('.shopcart_goods_remove, #remove-all').click(function(){
        //- 单项删除
        var pid = $(this).attr('data-id'),
            goodsTitle = $(this).parents('tr').attr('stitle')
        //- 多项删除
        if(!pid){
            if(!sid.length) {
                return $.artTip({title: '请选择商品 !', time: 1200})
            }
            pid = sid
            goodsTitle = stitle.length > 4 ? stitle.slice(0, 3) + '等' + stitle.length + '件' : stitle
        }


        var	artConfimTip = '是否将询价单中的 “<b class="cBlue">' + goodsTitle + '</b>” 商品移除？'
        $.artConfim(artConfimTip, 'confimFrame', 'zh_cn', function(sure){
            if (!sure) {
                $.artTip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')
                $.ajax({
                    type: 'DELETE',
                    url: '/shopcart/del',
                    data: {'pid': pid},
                    dataType:"json",
                    async:false,
                    cache:false,
                    success: function(results){
                        if(results.success===1){
                            $.closeArtTip({title: '删除成功！', time: 800})
                            //- $('#'+id).remove();
                            var lessNum = 1
                            if(typeof pid === 'string') {
                                $('#'+pid).remove()
                            } else {
                                lessNum = pid.length
                                for(var i = 0; i < pid.length; i++) {
                                    $('#' + pid[i]).remove()
                                }
                            }
                            ListIsEmpty(results.cart_goods_num, lessNum)
                        }else{
                            $.closeArtTip({title: '删除失败！', time: 800})
                        }
                    }
                })
            }
        })
    })
    function ListIsEmpty(num, lessNum) {
        var less_num = $('#select-num').text() - lessNum
        $('#select-num').html(less_num < 0 ? 0 : less_num)
        $('.head_shopcart_num').html(num)
        if(num === 0){
            var emptyList = '<div class="shopcart_head">'+
                            '<i class="icon-list mr10" ></i>询价单列表</div>'+
                            '<div class="shopcart_list pt30 pb50 mb50 tc bg-white" >'+
                            '<i class="icon-star-empty icon-4x base-color-light"></i>'+
                            '<p class="fb pt10 pb20 base-color" style="letter-spacing: 2px;">'+
                            '询价单列表里没有任何商品，<br/>请前往商品首页添加。</p>'+
                            '<a class="button button-royal button-primary" href="/store">商品首页</a>'+
                            '</div>'
            $('.table.shopcart_list').remove()
            $('#inquiry-form').html(emptyList)
        }
    }
})