// 去除错误样式
$('.sign_form_content input').click(function(){
	var obj = $(this);
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

$('.sign-success').unbind('click').click(function(){
	var Na = $name.val(),
		Ps = $password.val(),
		Captcha = $captcha.val()
		signtype = $(this).attr('signtype')

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
			if(signtype.toString() === 'inquirylist'){
				artalert('登录成功','success','/inquirylist');
			}else{
				artalert('登录成功','success','/store');
			}
		}else if(results.success===2){
			addErrorTip($name,'该用户不存在！')
		}else if(results.success===3){
			addErrorTip($captcha,'验证码错误，请重新输入。')
		}else{
			addErrorTip($password,'密码错误!')
		}
	})
	return false
});

function addErrorTip(obj,text){
	var signTip = obj.parent().find('.sign_tip');
	if(signTip.length>0) signTip.remove();
	obj
		.addClass('input_error')
		.parent('li').append('<div class="sign_tip error inlineBlock">'+
			'<i class="icon-exclamation-sign"></i>'+
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

// 注册
var signUpName = document.getElementsByName('signup[name]')[0]
var singUpPs = document.getElementsByName('signup[password]')[0]
var singUpRps = document.getElementsByName('signup[repassword]')[0]
if(signUpName) signUpName.focus()
function enterKeyPress(element,type){
	element.onkeydown = function(event){
		var e = event || window.event || arguments.callee.caller.arguments[0]
		var kc = e && e.keyCode
		var $element = $('input[name="'+element.name+'"]')
		if($element.hasClass('input_error')){
			$element.removeClass('input_error').parent().children('.sign_tip').remove()
		}
		if(type == 'name'){
			var kn = [32,59,188,190,191,219,220,221,222]
		}else if(type == 'password'){
			var kn = [32]
		}else{
			var kn = [32]
		}
		if(kc == 13) checkPassword()
		
		if(kn.indexOf(kc) !== -1) return false
	}
}

function checkPassword(){
	var inputType = ['name','password','repassword']

	for(var i=0; i<inputType.length; i++){
		var $i_obj = $('input[name="signup['+inputType[i]+']"')
		var i_obj = document.getElementsByName('signup['+inputType[i]+']')[0]
		if(!i_obj.value){
			if($i_obj.attr('name').indexOf('signup[name]') > -1){
				var tipText = '请输用户名！'
			}else if($i_obj.attr('name').indexOf('signup[password]') > -1){
				var tipText = '请输入密码！'
			}else if($i_obj.attr('name').indexOf('signup[repassword]') > -1){
				var tipText = '请再次输入密码，确保与上面输入密码一致！'
			}
			addErrorTip($i_obj, tipText)
			$i_obj.addClass('input_error').focus()
			return false
			break
		}
	}
	//- alert(singUpPs.value.toString()+', '+singUpRps.value.toString())
	if(singUpPs.value.toString() !== singUpRps.value.toString()){
		singUpRps.focus()
		addErrorTip($('input[name="signup[repassword]"]'),'请确保与上面输入密码一致！')
		return false
	}
	return true
}
var signupBtn = document.getElementById('signupBtn')
if(signupBtn){
	signupBtn.onclick = function(){
		if(!checkPassword()) return false
	}
}