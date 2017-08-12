var config = {
	dburl: "mongodb://vinte:LPJ5548744948jd@localhost:27017/lpj_db",
	port: "3000",
	global_title_cn: "梵特家具网",
	global_title_en: "vintehome",
	global_keyword_cn: "梵特家具网,中山梵特家具网,乡村风格家具,中山乡村风格家具,仿古家具,中山仿古家具",
	global_keyword_en: "vintehome,country style furniture,antique furniture",
	global_description_cn: "梵特家具是一家专业的家具制造厂商，其制造范围有批量家具生产、家具定制、家具重设计，家具风格主要是以乡村风格、工业风格、宫廷风格及其他手工艺绘制风格为主，多年销往欧美及其周边多个国家。",
	global_description_en: "vintehome is a professional furniture manufacturer, its manufacturing range of mass production of furniture, furniture custom, furniture re-design, furniture style is mainly rural style, industrial style, court style and other hand-painted style, Europe and the United States and its surrounding countries."
}

module.exports = config

// db.createUser({user:"vinte",pwd:"5548744948",roles:[{role:"readWrite",db:"vinte_db"}]})


// /usr/local/mongodb/bin/mongod --port 10860 --dbpath=/var/mongodb/data --logpath /var/mongodb/logs/log.log -fork


// Read：允许用户读取指定数据库
// readWrite：允许用户读写指定数据库
// dbAdmin：允许用户在指定数据库中执行管理函数，如索引创建、删除，查看统计或访问system.profile
// userAdmin：允许用户向system.users集合写入，可以找指定数据库里创建、删除和管理用户
// clusterAdmin：只在admin数据库中可用，赋予用户所有分片和复制集相关函数的管理权限。
// readAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的读权限
// readWriteAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的读写权限
// userAdminAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的userAdmin权限
// dbAdminAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限。
// root：只在admin数据库中可用。超级账号，超级权限