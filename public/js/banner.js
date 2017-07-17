

var autoLb = false;          //autoLb=true为开启自动轮播
var autoLbtime = 1;         //autoLbtime为轮播间隔时间（单位秒）
var touch = true;           //touch=true为开启触摸滑动
var slideBt = true;         //slideBt=true为开启滚动按钮


var slideNub;               //轮播图片数量

//窗口大小改变时改变轮播图宽高


$(function(){
    slideNub = $(".slide-img").length;
    for(i=0;i<slideNub;i++){
        $(".slide-img").eq(i).attr("data-slide-img-id",i);
    }


    //根据轮播图片数量设定图片位置对应的class
    if(slideNub==1){
        for(i=0;i<slideNub;i++){
            $(".slide-img").eq(i).addClass("img3");
        }
    }
    if(slideNub==2){
        for(i=0;i<slideNub;i++){
            $(".slide-img").eq(i).addClass("img"+(i+3));
        }
    }
    if(slideNub==3){
        for(i=0;i<slideNub;i++){
            $(".slide-img").eq(i).addClass("img"+(i+2));
        }
    }
    if(slideNub>3&&slideNub<6){
        for(i=0;i<slideNub;i++){
            $(".slide-img").eq(i).addClass("img"+(i+1));
        }
    }
    if(slideNub>=6){
        for(i=0;i<slideNub;i++){
            if(i<5){
               $(".slide-img").eq(i).addClass("img"+(i+1)); 
            }
        }
    }


    //根据轮播图片数量设定轮播图按钮数量
    if(slideBt){
        for(i=1;i<=slideNub;i++){
            $(".slide-btn").append("<span data-slide-btn-index='"+i+"' onclick='tz("+i+")'></span>");
        }
        $(".slide-btn").width(slideNub*34);
        $(".slide-btn").css("margin-left","-"+slideNub*17+"px");
    }


    //自动轮播
    if(autoLb){
        setInterval(function(){
        right();
    }, autoLbtime*1000);
    }


    if(touch){
        k_touch();
    }
    slideLi();
    imgClickFy();
})


//右滑动
function right(){
    var fy = new Array();
    for(i=0;i<slideNub;i++){
        fy[i]=$(".slide-img[data-slide-img-id="+i+"]").attr("class");
    }
    for(i=0;i<slideNub;i++){
        if(i==0){
            $(".slide-img[data-slide-img-id="+i+"]").attr("class",fy[slideNub-1]);
        }else{
           $(".slide-img[data-slide-img-id="+i+"]").attr("class",fy[i-1]); 
        }
    }
    imgClickFy();
    slideLi();
}


//左滑动
function left(){
    var fy = new Array();
    for(i=0;i<slideNub;i++){
        fy[i]=$(".slide-img[data-slide-img-id="+i+"]").attr("class");
    }
    for(i=0;i<slideNub;i++){
        if(i==(slideNub-1)){
            $(".slide-img[data-slide-img-id="+i+"]").attr("class",fy[0]);
        }else{
           $(".slide-img[data-slide-img-id="+i+"]").attr("class",fy[i+1]); 
        }
    }
    imgClickFy();
    slideLi();
}


//轮播图片左右图片点击翻页
function imgClickFy(){
    $(".slide-img").removeAttr("onclick");
    $(".slide-img.img2").attr("onclick","left()");
    $(".slide-img.img4").attr("onclick","right()");
}


//修改当前最中间图片对应按钮选中状态
function slideLi(){
    var slideList = parseInt($(".slide-img.img3").attr("data-slide-img-id")) + 1;
    $(".slide-btn span").removeClass("on");
    $(".slide-btn span[data-slide-btn-index="+slideList+"]").addClass("on");
}


//轮播按钮点击翻页
function tz(index){
    var tzcs = index - (parseInt($(".slide-img.img3").attr("data-slide-img-id")) + 1);
    if(tzcs>0){
        for(i=0;i<tzcs;i++){
            setTimeout(function(){
              right();  
            },1);
        }
    }
    if(tzcs<0){
        tzcs=(-tzcs);
        for(i=0;i<tzcs;i++){
            setTimeout(function(){
              left();  
            },1);
        }
    }
    slideLi();
}


//触摸滑动模块
function k_touch() {
    var _start = 0, _end = 0, _content = document.getElementById("slide");
    _content.addEventListener("touchstart", touchStart, false);
    _content.addEventListener("touchmove", touchMove, false);
    _content.addEventListener("touchend", touchEnd, false);
    function touchStart(event) {
        var touch = event.targetTouches[0];
        _start = touch.pageX;
    }
    function touchMove(event) {
        var touch = event.targetTouches[0];
        _end = (_start - touch.pageX);
    }

    function touchEnd(event) {
        if (_end < -100) {
            left();
            _end=0;
        }else if(_end > 100){
            right();
            _end=0;
        }
    }
}

// 加载图片进度
var num = 0
var images = $('#slide').find('img')
images.each(function(i){
    var img = new Image()
    img.onload = function(){
        //- 当图片太大时，可能会重复触发onload，所以需要清空下之前的onload事件
        img.onload=null
        num++

        $("#loading b").html(parseInt(num/images.length*100)+'%')
        if(num>=i){
            $('#loading').fadeOut()
            $('#slide').removeClass('slide-banner-children-hide')
        }
    }
    //- 执行上下文，如果img已经存在缓存了，就无需重复加载了
    img.src = images[i].src
})