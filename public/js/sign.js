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

var $name = $('#signinName'),
	$password = $('#signinPassword');

$('.signin-success').click(function(){
	// alert('dd')
	var Na = $name.val(),
		Ps = $password.val()

	if(Na==''||Na==null){
		// artalert('请输入用户名！')
		addErrorTip($name,'请输入用户名！')
		return false;
	}else if(Ps==''||Ps==null){
		// artalert('请输入密码！')
		addErrorTip($password,'请输入密码！')
		return false;
	}
	$.ajax({
		type: 'POST',
		url: '/user/signin?name='+Na+'&password='+Ps
	})
	.done(function(results){
		if(results.success===1){
			artalert('登录成功','success','/');
			
		}
		else if(results.success===2){
			// artalert('用户不存在')
			addErrorTip($name,'该用户不存在！')
		}else{
			// artalert('密码错误','error')
			addErrorTip($password,'密码错误!')
		}
	})
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