基于NodeJs+MongoDB搭建的家具网站
=================
简介
---------------
主要是以家具展示为主的官方网站


项目结构:
---------------
```
├── app.js            项目入口文件
│
├── app               MVC文件目录
│   ├── controllers   控制器目录
│   │   ├── category.js 
│   │   ├── comment.js 
│   │   ├── index.js
│   │   ├── movie.js
│   │   └── user.js
│   │
│   ├── models      模型目录
│   │   ├── category.js 
│   │   ├── comment.js 
│   │   ├── movie.js 
│   │   └── user
│   │
│   ├── schemas       模式目录
│   │   ├── category.js 
│   │   ├── comment.js 
│   │   ├── movie.js 
│   │   └── user.js
│   │
│   └── views         视图文件目录
│       ├── includes
│       └── pages
│
├── config               路由配置文件目录
│       └── routes.js
│
├── node_modules      node模块目录（需根据package重新安装）
│
├── public            静态公共文件目录
│   ├── js        JS脚本目录
│   ├── libs      （bower安装bootstrap&jQuery的目录，需安装）
│   └── upload        用户自定义上传图片存储目录
├── README.md
├── bower.js     静态资源版本
└── package.json
```
