
// 新闻页面-用户评论
var replynum = 0;
var commentObj;
var uname = document.getElementsByName('uname')[0].value;
$('.comment').delegate('.commentBtn','click',function(){
	var $t = $(this),
		toId = $t.data('tid'),
	commentId = $t.data('cid');
	commentObj = $t.parents('li.c_body');

	// 当前显示内容
	replynum = commentObj.attr('replynum');

	// 当前回复用户名称
	var toname = $t.next('div.c_comment').children('h5').children('span:first').html();
	document.getElementsByName('toname')[0].value = toname;

	// 显示回复状态
	if(toname==uname){
		var replyUserInfo = '<small>回复 <b>自己</b> ：</small>'+
			'<i class="icon-remove" title="取消对自己的回复"></i>'
	}else{
		var replyUserInfo = '<small>回复 </small><span>'+toname+
			'</span><small>：</small>'+
			'<i class="icon-remove" title="取消对'+toname+'的回复"></i>'
	}
	$('.replyUserInfo').html(replyUserInfo)


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
// 取消回复
$('.replyUserInfo').delegate('i','click',function(){
	$(this).parent().html('<small>发表评论：</small>');
	$('#toId').remove();
	$('#commentId').remove();
});

// 提交评论
$('.submitMsn').click(function(){
	var $this = $(this),
		msg = $this.prev('.form-grounp').find('textarea').val();

	if(msg==""){
		alert('评论不能为空')
		return false;
	}
});
		var $totalPage = document.getElementsByName("totalpage")[0]
		var $totalcomments = document.getElementsByName("totalcomments")[0]
		var newsId = document.getElementsByName("newsId")[0].value
		//- var newsId = $newsId.innerHTML

		//----------------------- 评论翻页
		$('.page').delegate('a','click',function(){

			var $this = $(this);
			if($this.hasClass('page_stand'))return false;

			var pagenum = parseInt($this.text())-1;
			addCommentHTML(pagenum)
		})
		//- 更新评论列表
		function addCommentHTML(pagenum){
			$.ajax({
				type:'get',
				url:'/news/comment?id='+newsId+'&pagenum='+pagenum
			})
			.done(function(results){
				if(results.success===0){
					artalert('获取数据失败，请重新操作。','error')
				}else{
					var totalPage = parseInt($totalPage.innerHTML)
					var totalcomments = parseInt($totalcomments.innerHTML)
					//- 判读当前总页和服务器总页是否相同
					//- console.log(results.totalPage+','+totalPage);
					if(results.totalPage==totalPage){
						$('.page a').removeClass('page_stand').eq(pagenum).addClass('page_stand');
					}else{
						$totalPage.innerHTML = results.totalPage
						addPageBtn(pagenum)
					}
					var coments_length = parseInt(results.comments.length)
					var commentHTML = ''
					for(i=0; i<coments_length; i++){
						//- 格式化时间
						var time = moment(results.comments[i].meta.createAt).format('YYYY-MM-DD HH:mm:ss')
						//- 是否有评论
						var c_reply = results.comments[i].reply
						var replyHTML = "";
						if(c_reply.length>0){
							for(j=0; j<c_reply.length; j++){
								// 判断是否回复自己
								if(c_reply[j].from.name==c_reply[j].to.name){
									var replyUser = c_reply[j].from.name
								}else{
									var replyUser = '<span>'+c_reply[j].from.name+'</span>'+
											'<small class="ml10">回复：</small>'+
											'<span>'+c_reply[j].to.name+'</span>'
								}
								var replytime = moment(c_reply[j].date).format('YYYY-MM-DD HH:mm:ss')
								replyHTML += '<div class="c_body">'+
									'<a class="c_avatar commentBtn" data-cid="'+results.comments[i]._id+'" '+
									'data-tid="'+c_reply[j].from._id+'" '+
									'href="#commentsForm">'+
									'<img src="http://www.easyicon.net/api/resizeApi.php?id=1132617&amp;size=32"></a>'+
									'<div class="c_comment"><h5> '+
									'<small class="fr">'+replytime+'</small>'+
									replyUser+
									'</h5><p>'+c_reply[j].content+'</p></div></div>'
							}
						}

						var commentLI = '<li class="c_body" replynum="'+c_reply.length+'">'
						//- 如果当前总数不等于服务器总数时，且点击的是第一页
						if(totalcomments!=results.totalcomments && pagenum == 0){
							var less=results.totalcomments-totalcomments
							if(i>less-1){
								//- console.log(i)
							}else{
								commentLI = '<li class="c_body c_bing">'
							}
							$totalcomments.innerHTML = results.totalcomments
						}
						
						commentHTML += commentLI+
							'<a class="c_avatar commentBtn" data-cid="'+results.comments[i]._id+
							'" data-tid="'+results.comments[i].from._id+
							'" href="#commentsForm">'+
							'<img src="http://www.easyicon.net/api/resizeApi.php?id=1132617&amp;size=32"></a><div class="c_comment"><h5> '+
							'<small class="fr">'+time+'</small>'+
							'<span>'+results.comments[i].from.name+'</span>'+
							'</h5><p>'+results.comments[i].content+'</p>'+replyHTML+'</div></li>'
					}
					$('#comment_list').html('').append(commentHTML);

				}

				
			})

		}

		//- 添加翻页按键
		function addPageBtn(pageNum){
			var totalPage = parseInt($totalPage.innerHTML)
			var page = document.getElementById('page')
			var btn = ''
			if(totalPage>1){
				for(var i=0;i<totalPage; i++){
					if(i==pageNum){
						btn += '<a class="page_stand" href="javascript:;" >'+(i+1)+'</a>'
					}else{
						btn += '<a href="javascript:;" >'+(i+1)+'</a>'
					}
				}
			}
			document.getElementById('page').innerHTML=btn

		}
		addPageBtn(0)

		//--------------------- 留言提交
		$('.msgSubmitMsn').click(function(){
			var news = document.getElementsByName('comment[news]')[0].value;
			var from = document.getElementsByName('comment[from]')[0].value;
			var toname = document.getElementsByName('toname')[0].value;
			var content = document.getElementsByName('comment[content]')[0].value;
			var tid = $('input[name="comment[tid]"]').val()
			var cid = $('input[name="comment[cid]"]').val()

			if(content==""){
				artalert('评论不能为空！')
				return false;
			}

			if(tid==undefined||tid==""){
				//- 评论
				var data = {"from":from,"news":news,"content":content}
			}else{
				//- 回复
				var data = {"from":from,"news":news,"content":content,"tid":tid,"cid":cid ,"replynum":replynum}
			}
			
			arttip('<i class="icon-spinner icon-spin"></i>&nbsp;&nbsp;uploading...')

			$.ajax({
				type:"POST",
				url:"/user/comment",
				data:data,
				dataType:"json",
				async:false,
				cache:false,
				success: function(data){
					arttipclose()
					//- var _data = eval("("+data+")");
					//- 用户评论
					if(data.success===0){
						artalert('评论发送失败，请重新操作。','error')
					}else if(data.success===1){
						addCommentHTML(0)
					}else if(data.success===2){
						artalert('回复发送失败，请重新操作。','error')
					}else{
						// artalert('回复操作成功','success')
						console.log(data.reply)
						console.log(data.replynum)
						
						replynum = data.replynum
						var replyHTML = "";
						for(j=0; j<data.reply.length; j++){
							// 判断是否回复自己
							if(uname==toname){
								var replyUser = uname
							}else{
								var replyUser = '<span>'+uname+'</span>'+
										'<small class="ml10">回复：</small>'+
										'<span>'+toname+'</span>'
							}
							var replytime = moment(data.reply[j].date).format('YYYY-MM-DD HH:mm:ss')
							replyHTML += '<div class="c_body c_bing">'+
								'<a class="c_avatar commentBtn" data-cid="'+data.reply[j]._id+'" '+
								'data-tid="'+data.reply[j].from+'" '+
								'href="#commentsForm">'+
								'<img src="http://www.easyicon.net/api/resizeApi.php?id=1132617&amp;size=32"></a>'+
								'<div class="c_comment"><h5> '+
								'<small class="fr">'+replytime+'</small>'+
								replyUser+
								'</h5><p>'+data.reply[j].content+'</p></div></div>'
						}
						// 删除所有激活状态
						$('li.c_body').removeClass('c_bing')
						commentObj
							.attr('replynum',data.replynum)
							.find('.c_comment:first')
							.append(replyHTML)
					}
				}

			})
			return false;
		});