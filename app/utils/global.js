// 分类初始对象
var baseCategory = {
    style: {
        name: {zh_cn: '风格', en_us: 'style'}
    },
    scene: {
        name: {zh_cn: '场景', en_us: 'scene'}
    },
    sort: {
        name: {zh_cn: '类型', en_us: 'sort'}
    },
    material: {
        name: {zh_cn: '材质', en_us: 'material'}
    },
    color: {
        name: {zh_cn: '颜色', en_us: 'color'}
    }
}
function GetCategoryArray(category){
    // 获取所有的分类类型分组，并将 baseCategory 赋值
    category.forEach(function(item){
        baseCategory[item._id].cid = item.cid
    })
    // baseCategory 对象转为数组
    var allCategoryType = []
    Object.keys(baseCategory).forEach(function(key, index){
        allCategoryType[index] = baseCategory[key]
    })
    return allCategoryType
}
module.exports = {
	GetCategoryArray
}