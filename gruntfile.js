module.exports=function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch:{
			pug: {
				files:['views/***'],
				options:{
					livereload:true
				}
			},
			js: {
				files:['public/js/**','models/**/*.js','schemas/**/*.js'],
				//tasks:['jshint'],
				options:{
					livereload:true
				}
			}
		},

		nodemon:{
			dev: {
				options:{
					file: 'app.js',
					arges: [],
					ignredFiles: ['README.md','node_modules/**','.DS_Store'],
					watchedExtensions: ['js'],
					watchedFolders: ['app', 'config'],
					debug: true,
					delayTime: 1,
					env: {
						PORT: 3000
					},
					cwd: __dirname
				}
			}
		},
		clean: {
			src: ['dest/js/*', 'dest/css/*']
		},
        //压缩css
        cssmin:{
            // options:{
            //     stripBanners:true, //合并时允许输出头部信息
            //     banner:'/*!<%= pkg.name %>-'+'<%=grunt.template.today("yyyy-mm-dd") %> */\n'
            // },
            build:{
				expand: true, //如果设为true，就表示下面文件名的占位符（即*号）都要扩展成具体的文件名。
				cwd: 'public/css/', //需要处理的文件（input）所在的目录。
                src: [
					'*.css',
					'admin/*.css',
					'goods/*.css'
				], // 需要处理的文件。如果采用数组形式，数组的每一项就是一个文件名，可以使用通配符。
                dest:'dest/css/', // 处理后的文件名或所在目录。
				ext: '.css' // 处理后的文件后缀名。 
			}
        },
		uglify: {
			files: {
				expand: true,
				cwd: 'public/js/',
				src: [
					'*.js',
					'jquery.*.js',
					'admin/*.js',
					'index/*.js'
				],
				dest: 'dest/js/',
				ext: '.js'
			}
		},
		concurrent:{
			tasks:['uglify', 'cssmin', 'nodemon','watch'],
			options:{
				logConcurrentOutput: true
			}
		}
	})

	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-nodemon')
	grunt.loadNpmTasks('grunt-concurrent')

	grunt.loadNpmTasks('grunt-contrib-clean')
	grunt.loadNpmTasks('grunt-contrib-uglify')
	grunt.loadNpmTasks('grunt-contrib-cssmin')

	grunt.option('force',true)
	grunt.registerTask('default',['concurrent'])

	grunt.registerTask('build', [
		'clean',
		'uglify',
		'cssmin'
	])
}