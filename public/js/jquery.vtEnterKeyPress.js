/*--- 
	插件名称：禁止按键事件
	使用过的页面：
		--	登录页面 siginin
		--	注册页面 siginup
		--	用户设置 :user/setting
---*/
(function($){
	$.fn.enterKeyPress = function(option){
		for(index in option){
			option[index].element
				.attr('element_index',index)
				.focus(function(){
					var i = $(this).attr('element_index')

					$(this).unbind('keydown').keydown(function(event){

						if($(this).hasClass('input_error')){
							removeErrorTip($(this))
						}else if($(this).hasClass('input_sucess')){
							removeSucessTip($(this))
						}
						
						var e = event || window.event || arguments.callee.caller.arguments[0]
						var kc = e && e.keyCode
						var kn = option[i].unkeynumber
						if(kn.indexOf(kc) !== -1) return false
						
						
					})

				})
		}

	}
}(jQuery));