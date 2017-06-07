// 禁止按键事件
(function($){
	$.fn.enterKeyPress = function(option){
		for(index in option){
			option[index].element
				.attr('element_index',index)
				.focus(function(){
					var i = $(this).attr('element_index')

					$(this).unbind('keydown').keydown(function(event){
						removeErrorTip($(this))
						var e = event || window.event || arguments.callee.caller.arguments[0]
						var kc = e && e.keyCode
						var kn = option[i].unkeynumber
						if(kn.indexOf(kc) !== -1) return false
					})

				})
		}

	}
}(jQuery));