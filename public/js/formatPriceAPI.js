
function formatPrice(price) {
    // toLocaleString API 的调用方法
    // https://www.colabug.com/2626489.html
    var Price = price.toLocaleString('zh', {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2, 
        useGrouping: true 
    })
    return Price
}