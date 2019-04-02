var fs = require('fs')
var path = require('path')

// 删除文件夹及文件夹下的所有文件
var rmdirSync = (function(){
	function iterator(url, dirs){
		var stat = fs.statSync(url)
		if(stat.isDirectory()){
			// 收集目录
			dirs.unshift(url)
			inner(url, dirs)
		}else if(stat.isFile()){
			// 直接删除文件
			fs.unlinkSync(url)
		}
	}
	function inner(path, dirs){
		var arr = fs.readdirSync(path)
		for(var i=0, el; el = arr[i++];){
			iterator(path+"/"+el, dirs)
		}
	}
	return function(dir, cb){
		cb = cb || function(){}
		var dirs = []
		try{
			iterator(dir, dirs)
			for(var i=0, el; el = dirs[i++];){
				fs.rmdirSync(el)
			}
			cb()
		}catch(e){
			e.code === "ENOENT" ? cb() : cb(e)
		}
	}
})()
function RmdirSync(dirname){
	rmdirSync(__dirname + dirname, function(err){
		if(err) console.log(err)
		console.log("删除目录以及子目录成功")
	})
}

// 读取文件夹并创建
// __dirname 为当前文件目录
function ReadDirAndMkdir(dirname, cb){
	var dirName = __dirname + '/../../' + dirname
	fs.readdir( dirName, function(err, files){
		if(err) console.log(err)
		if(!files){
			fs.mkdir( dirName, function(err){
				if(err) console.log(err)
				console.log('创建目录成功')
				cb && cb()
			})
		} else {
			console.log('目录已存在')
			cb && cb()
		}
	})
}
// 创建目录
function Mkdir(fileUrl, cb){
	fs.mkdir(__dirname + fileUrl, function(err){
		if(err){
			console.log(err)
		} else {
			console.log('创建目录成功')
			cb && cb()
		}
	})
}

// 图片上传
function WiteFile(file, fileUrl, cb) {
	var filePath = file.path
	fs.readFile(filePath, function(err,data){
		var timestamp = Date.now() + (Math.random()+'').substr(2,7),
			type = file.type.split('/')[1],
			imageName = timestamp + '.' +type,
			newPath = path.join(__dirname, '../../', fileUrl + imageName)

		fs.writeFile(newPath, data, function(err){
			if(err) {
				cb && cb(err)
			}else{
				cb && cb(imageName)
			}
		})
	})

}

// 删除图片
function DeletelFile(fileUrl, cb){
	// fs.unlink(__dirname + '/../../public/db_data/images/banners/'+file, function(err){
	fs.unlink(__dirname + '/../..' + fileUrl, function(err){
		console.log(__dirname + '/../..' + fileUrl)
		if(err) {
			cb && cb(err)
		}else{
			console.log("删除图片成功")
			cb && cb(1)
		}
	})
}


module.exports = {
	ReadDirAndMkdir,
	Mkdir,
	RmdirSync,
	WiteFile,
	DeletelFile
}