/*--- 
	插件名称：禁止按键事件
	使用过的页面：
		--	登录页面 siginin
		--	注册页面 siginup
		--	用户设置 :user/setting
		--	网站脚部 :footed.jade
---*/
(function($){
	$.fn.enterKeyPress = function(option){
		for(index in option){
			// option[index].element
			// 	.attr('element_index',index)
			// 	.focus(function(){
			// 		var i = $(this).attr('element_index')

			// 		$(this).unbind('keydown').keydown(function(event){

			// 			if($(this).hasClass('input_error')){
			// 				removeErrorTip($(this))
			// 			}else if($(this).hasClass('input_sucess')){
			// 				removeSucessTip($(this))
			// 			}
						
			// 			var e = event || window.event || arguments.callee.caller.arguments[0]
			// 			var kc = e && e.keyCode
			// 			var kn = option[i].unkeynumber
			// 			if(kn.indexOf(kc) !== -1) return false
						
						
			// 		})

			// 	})
			var checkTime
			var $element = option[index].element
			$element
			.after('<i></i>')
			.bind({
				"keydown": function(event){
					if($(this).hasClass('input_error')){
						removeErrorTip($(this))
					}else if($(this).hasClass('input_sucess')){
						removeSucessTip($(this))
					}
					
					var e = event || window.event || arguments.callee.caller.arguments[0]
					var kc = e && e.keyCode
					var kn = option[index].unkeynumber
					if(kn.indexOf(kc) !== -1) return false


				},
				"keyup": function(event){
					var $icon = $(this).parent().find('i')
					console.log(event.currentTarget.name)
					cheackValue(event,$icon)
				},
				"focus": function(){
					var $icon = $(this).parent().find('i')
					$icon.removeClass()
				},
				"blur": function(event){
					var $icon = $(this).parent().find('i')
					cheackValue(event,$icon)
				}
			})
		}
		// 验证邮箱
		function cheackValue(e,icon){
			// console.log(val)
			var val = e.target.value
			if(e.currentTarget.name.toString() === 'email'){
				var reg =  /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
				var condition = reg.test(val)
			}else{
				var reg = /^\s*$/g
				var condition = !reg.test(val)
			}
			if(condition){
				console.log(true)
				if(!icon.hasClass('icon-ok-circle')){
					icon.removeClass().addClass('icon-ok-circle')
				}
			}else{
				console.log(false)
				if(!icon.hasClass('icon-remove-circle')){
					icon.removeClass().addClass('icon-remove-circle')
				}
			}
		}
		// 验证内容
		// function checkValEmpty(element){
		// 	if(val.toString() === ""){
		// 		return true
		// 	}else{
		// 		return false
		// 	}
		// }

	}
}(jQuery));