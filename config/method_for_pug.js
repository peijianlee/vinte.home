module.exports = {
    baseInfo: {
        domain: 'vinte.xin',
        title: '梵特家具网',
        description: [
            '我们是一家专业的家具制造厂商，其制造范围有批量家具生产、家具定制、家具设计，家具风格主要是以乡村风格、工业风格、日式风格及其他手工艺绘制风格为主，多年销往欧美及其周边多个国家。',
            '如果你刚好有这方面的这方面的商务需求，或者是同行业者，都欢迎垂询，或通过右侧的留言栏发送消息给我们，我们收到信息后，将会以最短的时间内回复你。'
        ],
        email: 'business@vinte.xin',
        telephone: '0760 86697781',
        addr: '广东省，中山市，三乡镇，古鹤工业区',
        beianNum: '粤ICP备17070570号',
        beianUrl: 'https://beian.miit.gov.cn/',
        Copyright: function(subdomain){
            var DOMAIN = subdomain? subdomain + this.domain : this.domain
            return 'Copyright © 2017 - ' + new Date().getFullYear() +' '+ DOMAIN+' All Rights Reserved'
        }
    },
    // 格式化价格
    formatPrice: function(price) {
        // toLocaleString API 的调用方法
        // https://www.colabug.com/2626489.html
        var Price = '￥' + price.toLocaleString('zh', {
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2, 
            useGrouping: true 
        })
        return Price
    },
    // 格式化尺寸
    formatSize: function(size) {
        var Size = '宽' + size.w + ' * ' 
                + '深' + size.d + ' * ' 
                + '高' + size.h + ' cm'
        return Size
    }
}