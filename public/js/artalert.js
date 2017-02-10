
// 自定义弹出框
var artalert_close_enter = false;
function artalert(txt,type,url){
	artalert_close_enter = true;
	var $body = $('body');
	$body.append('<div class="artalert_bg artalert_close"'+
				' style="background-color:rgba(0,0,0,0.5);'+
				'position:fixed;top:0;left:0;display:none;'+
				'width:100%;height:100%;z-index:2010;">');
	$('.artalert_bg').fadeIn(300);
	var btnStyle =  'line-height:32px;height:32px;width:100px;display:inline-block;cursor:pointer;'+
					'background-color:#97c11f;color:white;font-weight:bold;border-radius:3px;';

	if(type==='error'){
		artalert_head_color='#ff6d60';
		var artalert_head_title = '<i class="icon-exclamation-sign" '+
								'style="margin-right:5px;"></i>错误信息</h6>';
	}else if(type==='success'){
		artalert_head_color='#00a8b3';
		var artalert_head_title = '<i class="icon-info-sign" '+
								'style="margin-right:5px;"></i>提示</h6>';
	}else{
		artalert_head_color='#feb322';
		var artalert_head_title = '<i class="icon-info-sign" '+
								'style="margin-right:5px;"></i>提示</h6>';
	}
	var artalert_head = '<h6 style="height:40px;line-height:40px;padding-left:15px;margin:0;'+
		'border-radius:5px 5px 0 0;background-color:'+artalert_head_color+';color:white;font-size:14px;'+
		'box-shadow:inset 1px 1px rgba(255,255,255,0.3);">'+
		'<i class="icon-remove artalert_close" style="float:right;cursor:pointer;'+
		'margin:12px 12px 0 0;color:rgba(0,0,0,0.5);text-shadow:1px 1px rgba(255,255,255,0.5);"></i>';
	var artalert_pop = '<div class="artalert" '+
		'style="position:fixed;z-index:2011;background-color:white;'+
		'border-radius:5px;opacity:0;top:-10%;left:50%;width:500px;margin-left:-250px;">'+
		artalert_head+artalert_head_title+
		'<div style="line-height:1.6em;padding:30px 10px;border-bottom:1px solid #ddd;'+
		'text-align:center;font-size:18px;font-weight:bold;">'+txt+'</div>'+
		'<div class="artalert_foot" style="border-top:1px solid white;text-align:center;padding:12px 0;'+
		'background-color:#f9f9f9;margin:0;border-radius:0 0 5px 5px;">'+
		'<span class="artalert_close" style="'+btnStyle+'">确 定</span></div></div>'
	$body.append(artalert_pop);

	$('.artalert').animate({'opacity':1,'top':50},300);

	$('.artalert_close').click(function(){
		$('.artalert_bg').fadeOut(300,function(){
			$(this).remove();
		});
		$('.artalert').animate({'opacity':0,'top':'-10%'},300,function(){
			$(this).remove();
			if(url!==undefined)location.href=document.referrer;
		});
	});

}
document.onkeydown=function(event){
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e && e.keyCode==13){
		if(artalert_close_enter){
			$('.artalert_close:first').click();
			artalert_close_enter = false;
			return false;
		}
	}
}
// 弹出框
$('[data-toggle="modal"]').click(function(){
	var $body = $('body');
	$body.append('<div class="modal_bg modal_close"'+
				' style="background-color:rgba(0,0,0,0.5);'+
				'position:fixed;top:0;left:0;'+
				'width:100%;height:100%;z-index:100;">');
	var Target = $(this).attr('data-target');
	$(Target).fadeIn().find('input[type=text]:first').focus();
	$('.modal_close').click(function(){
		$('.modal_bg').fadeOut('fast',function(){
			$(this).remove();
		});
		$(Target).fadeOut('fast');
	})
});


// arttip 提示栏
function arttip(txt){
	var $body = $('body');
	$body.append('<div class="arttipbg"></div><div class="arttip">'+
		txt+'</div>')
	$('.arttipbg').fadeIn('200');
	$('.arttip').animate({'opacity':1,'top':'3%'},200);
}
function arttipclose(){
	$('.arttipbg').fadeIn('200',function(){
		$(this).remove();
	});
	$('.arttip').animate({'top':'-50%'},200,function(){
		$(this).remove();
	});
}
