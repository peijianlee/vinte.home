var config = {
	dburl: "mongodb://vinte:LPJ5548744948jd@localhost:27017/lpj_db",
	port: "3000"
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