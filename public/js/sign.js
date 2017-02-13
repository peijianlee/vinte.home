// 去除错误样式
$('.sign_form_content input').click(function(){
	var obj = $(this);
	// document.onkeydown=function(event){
	// 	if(obj.hasClass('input_error')){
	// 		obj.removeClass('input_error');
	// 		var signTip = obj.parent().find('.sign_tip');
	// 		if(signTip.length>0){
	// 			signTip.remove();
	// 		}
	// 	}
	// }
		if(obj.hasClass('input_error')){
			obj.removeClass('input_error');
		}
		var signTip = obj.parent().find('.sign_tip');
		if(signTip.length>0){
			signTip.remove();
		}
});

// 登录
var $name = $('#signName'),
	$password = $('#signPassword'),
	$captcha = $('#captcha');

$('.sign-success').click(function(){
	var Na = $name.val(),
		Ps = $password.val(),
		Captcha = $captcha.val()

	if(Na==''||Na==null){
		addErrorTip($name,'请输入用户名！')
		return false;
	}else if(Ps==''||Ps==null){
		addErrorTip($password,'请输入密码！')
		return false;
	}else if(Captcha=='' || Captcha==null){
		addErrorTip($captcha,'请输入验证码！')
		return false;
	}
	$.ajax({
		type: 'POST',
		url: '/user/signin?name='+Na+'&password='+Ps+'&captcha='+Captcha
	})
	.done(function(results){
		if(results.success===1){
			artalert('登录成功','success','/');
		}else if(results.success===2){
			addErrorTip($name,'该用户不存在！')
		}else if(results.success===3){
			addErrorTip($captcha,'验证码错误，请重新输入。')
		}else{
			addErrorTip($password,'密码错误!')
		}
	})
});

// 注册
$('.signup-success').click(function(){
	// var 
});

function addErrorTip(obj,text){
	var signTip = obj.parent().find('.sign_tip');
	if(signTip.length>0) signTip.remove();
	obj
		.addClass('input_error')
		.after('<div class="sign_tip error inlineBlock">'+
			'<i class="icon-exclamation-sign"> '+
			text+'</div>');

}

// 更换验证码
$('.changeCaptcha').click(function(){
	$.ajax({
		type: 'get',
		url: '/captcha?changecaptcha=true'
	})
	.done(function(results){
		if(results.success===1){
			$('.changeCaptcha').html(results.captcha.data)
		}else{
			artalert('更新验证码失败！','error')
		}
	})
})

