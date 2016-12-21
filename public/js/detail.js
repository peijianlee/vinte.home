$('.comment').click(function(e){
	var $t = $(this),
		toId = $t.data('tid'),
		commentId = $t.data('cid');

	if($('#toId').length>0){
		$('#toId').val(toId)
	}else{
		$('<input>').attr({
			type:'hidden',
			id:'toId',
			name:'comment[tid]',
			value:toId,
		}).appendTo('#commentsForm');
	}

	if($('#commentId').length>0){
		$('#commentId').val(commentId)
	}else{
		$('<input>').attr({
			type:'hidden',
			id:'commentId',
			name:'comment[cid]',
			value:commentId,
		}).appendTo('#commentsForm');

	}
});

$('.submitMsn').click(function(){
	var $this = $(this),
		msg = $this.prev('.form-grounp').find('textarea').val();

	if(msg==""){
		alert('评论不能为空')
		return false;
	}
});