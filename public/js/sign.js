

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

$('.sign-success').click(function(){
	checkInputValue(signinCofig, $('.sign-success'))
	return false
});


// 检查输入框是否为空
function checkInputValue(elements, btn_element, type){
	for(index in elements){
		var $this = elements[index].element
		if(!$this.val()){
			addErrorTip($this, elements[index].errorText)
			return false
		}else{
			removeErrorTip($this)
		}
	}
	postSignInfo(elements, btn_element, type)
	
}
// 添加错误提示
function addErrorTip(element,errorText){
	element
		.addClass('input_error')
		.focus()
		.parent('li').append('<div class="sign_tip error inlineBlock">'+
			'<i class="icon-exclamation-sign"></i>'+errorText+'</div>')
}
// 删除错误提示
function removeErrorTip(element){
	element.removeClass('input_error').parent().children('.sign_tip').remove()
}
// 验证用户名
function postSignInfo(elements, btn_element, type){
	console.log(elements)
	if(type == 'signin'){
		// 登录
		var $name = elements[0].element,
			$password = elements[1].element,
			$captcha = elements[2].element,
			signtype = btn_element.attr('signtype')
		
		$.ajax({
			type: 'POST',
			url: '/user/signin?name='+ $name.val() +'&password='+ $password.val() +'&captcha='+ $captcha.val()
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
	}else{
		// 注册
		var $name = elements[0].element,
			$password = elements[1].element,
			$repassword = elements[2].element
		// 判断密码是否相同
		if($password.val().toString() !== $repassword.val().toString()){
			addErrorTip($repassword, elements[2].errorText)
			return false
		}else{
			$.ajax({
				type: 'POST',
				url: '/user/signup?name='+ $name.val() + '&password='+ $password.val() +'&repassword='+ $repassword.val() 
			})
			.done(function(results){
				if(results.success === 1){
					artalert('注册成功','success','/')
				}else if(results.success === 2){
					addErrorTip($name, "用户名已经存在")
				}
			})
		}
	}
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
// var signUpName = document.getElementsByName('signup[name]')[0]
// var singUpPs = document.getElementsByName('signup[password]')[0]
// var singUpRps = document.getElementsByName('signup[repassword]')[0]
// if(signUpName) signUpName.focus()

// alert(signUpName.value)

// function enterKeyPress(element,type){
// 	console.log(element.id)
// 	element.onkeydown = function(event){
// 		var e = event || window.event || arguments.callee.caller.arguments[0]
// 		var kc = e && e.keyCode
// 		// var $element = $('input[name="'+element.name+'"]')
// 		var $element = $('#'+element.id)
// 		if($element.hasClass('input_error')){
// 			$element.removeClass('input_error').parent().children('.sign_tip').remove()
// 		}
// 		if(type == 'name'){
// 			var kn = [32,59,188,190,191,219,220,221,222]
// 		}else if(type == 'password'){
// 			var kn = [32]
// 		}else{
// 			var kn = [32]
// 		}
// 		if(kc == 13) checkPassword()
		
// 		if(kn.indexOf(kc) !== -1) return false
// 	}
// }
// var signupBtn = document.getElementById('signupBtn')
// if(signupBtn){
// 	signupBtn.onclick = function(){
// 		if(!checkPassword()) return false
// 	}
// }

// $.pjPlugin = {
// 	alertClick:function(text){
// 		$('body').click(function(){
// 			alert(text)
// 		})
// 	}
// }

