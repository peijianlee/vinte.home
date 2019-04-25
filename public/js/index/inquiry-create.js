var selectTypeName = 1
$('label.selectType').click(function(){
	var index = $(this).index()
	$('label.selectType').removeClass('On').eq(index).addClass('On')
	if(index !== 0){
		$('input[name="order.from[company]"]').val('').parents('dd').addClass('none')
		$('input[name="order.from[user]"]').focus()
		selectTypeName = 2
	}else{
		$('input[name="order.from[company]"]').parents('dd').removeClass('none')
		$('input[name="order.from[company]"]').focus()
		selectTypeName = 1
	}
})

function editBtn(obj, obj2){
	$('.'+obj).click(function(){
		$(this)
			.addClass(obj2)
			.removeAttr('readonly')
			.focus();
	}).blur(function(){
		$(this).removeClass(obj2).attr({'readonly':'false'})
	})
}
editBtn('orderPrice','editPrice')
editBtn('orderQuantity','editQuantity')

function blurFormatNumber(obj, trgetId, type){
	// obj.value = obj.innerHTML)
	// console.log(obj.innerHTML.indexOf(/[^\d\.]/g, ''))
	if(type==='quantity'){
		var Quantity = obj.value.replace(/[^\d\.]/g, '')
		Quantity = Quantity.replace(/^\./g, '')
		Quantity = Quantity.replace('.', '$#$').replace(/\./g, '').replace('$#$', '')
		Quantity = parseInt(Quantity)
		trgetId.value = Quantity
		obj.value = Quantity + ' PCS'
	}else{
		// var Price = obj.value.replace(/[^\d\.]/g, '')
		// Price = Price.replace(/^\./g, '')
		// Price = Price.replace(/\.{2,}/g, '.')
		// Price = '￥'+Price.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
		// obj.value = Price

		var Price = obj.value.replace(/[^\d\.]/g, '')
		Price = parseFloat(Price.replace(/^\./g, ''))
		trgetId.value = Price
		obj.value = '￥' + Price.toLocaleString('zh', {
			minimumFractionDigits: 2, 
			maximumFractionDigits: 2, 
			useGrouping: true 
		})
		// var Price = parseInt(obj.value)
		// trgetId.value = Price
	}
}

function enterKeyPress(element){
	element.onkeydown = function(event){
		var e = event || window.event || arguments.callee.caller.arguments[0]
		var kc = e && e.keyCode
		// console.log(kc)
		var kn = [8,37,39,46,49,50,51,52,53,54,55,56,57,48,96,97,98,99,100,101,102,103,104,105,110,190]
		if(kc == 13) element.blur()
		if(kn.indexOf(kc) == -1) return false
	}
}

var createBtn = document.getElementById('createBtn')
createBtn.onclick = function(){
	if(selectTypeName == 1){
		var inputType = ['company','user','phone','email']
	}else{
		var inputType = ['user','phone','email']
	}
	for(var i=0; i<inputType.length; i++){
		var i_obj = document.getElementsByName('inquiry.from['+inputType[i]+']')[0]
		if(!i_obj.value){
			i_obj.focus()
			return false
		}
	}
}
