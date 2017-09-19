

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
	CheckInputValue(signinCofig, $('.sign-success'))
	return false
});


// 检查输入框是否为空
function CheckInputValue(elements, btn_element, type, submitUrl){
	for(index in elements){
		var $this = elements[index].element
		if(!$this.val()){
			AddErrorTip($this, elements[index].errorText)
			return false
		}else{
			RemoveErrorTip($this)
		}
	}
	PostSignInfo(elements, btn_element, type, submitUrl)
	
}
// 添加错误提示
function AddErrorTip(element,errorText){
	element.addClass('input_error').focus()
	if (!element.parent('li').children('.sign_tip').length > 0) {
		element.parent('li').append('<div class="sign_tip error inlineBlock">'+
				'<i class="icon-exclamation-sign"></i>'+errorText+'</div>')
	}
}
// 删除错误提示
function RemoveErrorTip(element){
	element.removeClass('input_error').parent().children('.sign_tip').remove()
}
// 验证用户名
function PostSignInfo(elements, btn_element, type, submitUrl){
	console.log(elements)
	if(type == 'signin'){
		// 登录
		var $name = elements[0].element,
			$password = elements[1].element,
			$captcha = elements[2].element,
			signtype = btn_element.attr('signtype'),
			data = {
				name: $name.val(),
				password: $password.val(),
				captcha: $captcha.val()
			}

		$.ajax({
			type:"POST",
			url:"/user/signin",
			data:data,
			dataType:"json",
			async:false,
			cache:false,
			success: function(data){
				if(data.success === 1){
					// if(signtype.toString() === 'inquirylist'){
					// 	$.artAlert('登录成功!', 'artAlertFrame', 'zh_cn', '/inquirylist' )
					// }else{
					// 	$.artAlert('登录成功!', 'artAlertFrame', 'zh_cn', document.referrer )
					// }
					$.artAlert('登录成功!', 'artAlertFrame', 'zh_cn', submitUrl, 10)
				}else if(data.success === 2){
					AddErrorTip($name,'该用户不存在！')
				}else if(data.success===3){
					AddErrorTip($captcha,'验证码错误，请重新输入。')
				}else{
					AddErrorTip($password,'密码错误!')
				}
			}
		})
		
	}else{
		// 注册
		var $name = elements[0].element,
			$password = elements[1].element,
			$repassword = elements[2].element
		// 判断密码是否相同
		if($password.val().toString() !== $repassword.val().toString()){
			AddErrorTip($repassword, elements[2].errorText)
			return false
		}else{
			
			var data = {
				name: $name.val(),
				password: $password.val(),
				repassword: $repassword.val()
			}

			$.ajax({
				type:"POST",
				url:"/user/signup",
				data:data,
				dataType:"json",
				async:false,
				cache:false,
				success: function(data){
					if(data.success === 1){
						$.artAlert('注册成功！', 'artAlertFrame', 'zh_cn', document.referrer, 10 )
						// if(data.newid) sort_id = data.newid
					}else if(data.success === 2){
						AddErrorTip($name, "用户名已经存在")
					}
				}
			})
		}
	}
}




// 更换验证码
$('.changeCaptcha').click(function(){
	$.ajax({
		type:"GET",
		url:"/captcha?changecaptcha=true",
		async:false,
		cache:false,
		success: function(data){
			if(data.success === 1){
				$('.changeCaptcha').html(data.captcha.data)
			}else if(data.success === 2){
				$.artAlert('更新验证码失败！', 'artAlertFrame', 'zh_cn', document.referrer, 10 )
			}
		}
	})
})

