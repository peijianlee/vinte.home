(function($){
	$.extend({
		publicStyle: {
			bgStyle: {
				backgroundColor: 'rgba(0,0,0,0.5)',
				position: 'fixed',
				top: '0',
				left: '0',
				display: 'none',
				width: '100%',
				height: '100%',
				zIndex: '2010'
			}
		},
		artconmit: function (value, bgstyle, frameClass, lang, fn) {
			var eleBg = $('<div></div>').css(this.publicStyle.bgStyle).addClass('artconmit_bg artconmit_close')
			if (bgstyle) {
				alert($alertBg.css({bgstyle}))
			} else {
				$('body').append(eleBg)
			}
			var re = /[\u4E00-\u9FA5]/g
			var num = value.match(re).length
			alert(num)

			$('.artconmit_bg').fadeIn(300)
			var langArr = lang === 'zh_cn' ? ['提示框', '确定', '取消'] : ['tip frame', 'sure', 'cancel']
			var eleFrame = $('<div><h6><i class="icon-info-sign mr10"></i>' 
				+ langArr[0] 
				+ '</h6><p>' 
				+ value 
				+ '</p><div class="frameFooter"><span>' 
				+ langArr[1] 
				+ '</span><span class="artconmit_close">' 
				+ langArr[2] 
				+ '</span></div></div>').addClass(frameClass)
			$('body').append(eleFrame)
			$('.frameFooter span').click(function(){
				$('.'+frameClass + ', .artconmit_bg').fadeOut( function(event){
					$(this).remove()
				})
				fn($(this).index())
			})
		},
		artTip: function (value, time) {
			var $body = $('body')
			$body.append('<div class="arttipbg"></div><div class="arttip">'+
				value+'</div>')
			$('.arttipbg').fadeIn('200')
			$('.arttip').animate({'opacity':1,'bottom':'40%'},500)
			if (time) {
				var autoTimeOut = setTimeout(function () {
					$.closeArtTip(null, 10)
				}, time)
			}
		},
		closeArtTip: function (value, closetime, fn) {
			if(value) $('.arttip').html(value)
			var closetime = closetime || 2000
			var timeOut = setTimeout(function(){
				$('.arttipbg').fadeIn('200',function(){
					$(this).remove()
				})
				$('.arttip').animate({'opacity':0,'bottom':'30%'},400,function(){
					$(this).remove()
				})
			}, closetime)
		},
		artAlert: function ( value, frameClass, lang, url, fn ) {
			var artalert_close_enter = true
			var artalertBg = $('<div></div>').css( this.publicStyle.bgStyle ).addClass('artalert_bg artalert_close')
			$('body').append(artalertBg)
			$('.artalert_bg').fadeIn()
			var langArr = lang === 'zh_cn' ? ['信息提示框', '确定'] : ['tip frame', 'sure']
			var eleFrame = $('<div><h6><i class="icon-info-sign mr10"></i>' 
				+ langArr[0] 
				+ '</h6><p>' 
				+ value 
				+ '</p><div class="frameFooter"><span class="artalert_close">' 
				+ langArr[1] 
				+ '</span></div></div>').addClass(frameClass)
			$('body').append(eleFrame)
			$( '.' + frameClass ).animate({'opacity':1,'top':50},300)
			document.onkeydown = function (event) {
				var e = event || window.event || arguments.callee.caller.arguments[0];
				if (e && e.keyCode === 13) {
					if (artalert_close_enter) {
						$('.artalert_close:first').click();
						artalert_close_enter = false;
						return false;
					}
				}
			}
			$('.artalert_close').click(function(){
				$('.artalert_bg').fadeOut(300,function(){
					$(this).remove()
				})
				$('.' + frameClass).animate({'opacity':0,'top':'-10%'},300,function(){
					$(this).remove();
					location.href= url ? url : '/'
					// if(url){
					// 	location.href= url ? url : '/'
					// }else{
					// 	// location.href=document.referrer;
					// }
				});
			});
		}
	})
}(jQuery));