var Banner = $('.banner').children('li');
var BW = Banner.eq(0).outerWidth();
var bannerNum = Banner.length;
var btn = "<div class='btnBg'>";
	for(var i=0; i < bannerNum; i++) {
		btn += "<span></span>";
	}
	btn +='</div>'
$('.bannerFrame').append(btn);

$('.btnBg span').click(function(){
	var i = $(this).index();
	index = i+1;
	showPicture(i)
}).eq(0).click();

var index = 1;
$('.bannerFrame').hover(function() {
	clearInterval(picTimer);
	Banner.eq(index-1).find('.JDT').removeClass('onLoad');
},function() {
	JDTloading(index-1)
	picTimer = setInterval(function() {
		if(index == bannerNum)index = 0;
		showPicture(index);
		JDTloading(index);
		index++;
	},6000); 
}).trigger("mouseleave");


function showPicture(num){
	$('.btnBg span').removeClass('On').eq(num).addClass('On');
	Banner.removeClass('Stand').eq(num).addClass('Stand');
	$('.banner').animate({'margin-left':-num*BW},500);
}
function JDTloading(num){
	var $JDT = Banner.eq(num).find('.JDT');
	addAnimation($JDT,'onLoad');
}

// 添加动画并删除动画
function addAnimation(moveObj,moveName){
	moveObj.addClass(moveName)
		.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$(this).removeClass(moveName)
		});
}
