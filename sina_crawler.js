var http = require('http')
var cheerio = require('cheerio')
var url = 'http://tech.sina.com.cn/internet/'

function filterFeed(html) {
	var $ = cheerio.load(html)
	var feedComment = $('#feedComment').find('.feed-card-item')
	var subComment = $('.blk .ct01').find('li')
	// [{
	// 	title: '',
	//  href: '',
	// 	keyWords: [
	// 		''
	// 	]
	// }]
	function cwl(cardItem) {
		var itemData = []
		cardItem.each(function (item) {
			var card = $(this)
			var title = card.find('h2.undefined a[target=_blank]').text()
			var href = card.find('h2.undefined a[target=_blank]').attr('href')
			var keyWords = []

			card.find('span.feed-card-tags-kw a[target=_blank]').each(function (item) {
				keyWords.push($(this).text())				
			})
			itemData.push({
				'title' : title,
				'href' : href,
				'keyWords' : keyWords 
			})
		})
		return itemData
	}
	var feedData = cwl(feedComment)
	// {
	// 	main: '',
	// 	sub: [{
	// 		title : '',
	// 		href : ''
	// 	}]
	// }
	function cwlSub(listItem) {
		var main = '排行榜'
		var sub = []
		listItem.each(function (item) {
			var list = $(this)
			var title = list.find('a[target=_blank]').text()
			var href = list.find('a[target=_blank]').attr('href')
			sub.push({
				'title' : title,
				'href' : href
			})
		})
		var itemData = {
			'main' : main,
			'sub' : sub
		}
		return itemData	
	}
	var subData = cwlSub(subComment)
	var finalData = {
		'feedData' : feedData,
		'subData' : subData
	}
	return finalData
}

function printData(finalData) {
	console.log('+++++++++++++++++头条拿下+++++++++++++++++')
	printCard(finalData.feedData)
	console.log('+++++++++++++++++' + finalData.subData.main + '+++++++++++++++++')
	printSub(finalData.subData)
	function printCard(itemData) {
		itemData.forEach(function (feed) {
			console.log('[' + feed.title + ']')
			console.log(feed.href)
			var kws = ''
			feed.keyWords.forEach(function (kw) {
				kws += '-' + kw + '-'
			})
			console.log(kws)		
		})
	}
	function printSub(subData) {
		var i = 1
		subData.sub.forEach(function (s) {
			console.log('------------' + i + '------------')
			console.log('[' + s.title + ']')
			console.log(s.href)
			i++
		})
	}
}

http.get(url, function(res) {
	var html = ''
	res.on('data', function(data) {
		html += data
	})
	res.on('end', function() {
		printData(filterFeed(html))
	})
}).on('error', function() {
	console.log('get方法出错！')
})