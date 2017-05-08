var http = require('http')
var cheerio = require('cheerio')
var baseUrl = 'http://www.imooc.com/learn/'
var videoIds = [637, 348, 259, 197, 134, 75]
function filterChapters(html) {
	var $ = cheerio.load(html)
	var pageData = {}
	var chapters = $('.chapter')
	pageData.title = $('.hd h2').text()
	pageData.num = $('.statics .static-item').eq(2).find('strong').text() - 0
	// {
	// 	title: '',
	// 	num: '',
	// 	chapter:
	// 		[{
	// 			chapterTitle: '',
	// 			videos: [{
	// 				title: '',
	// 				id: ''
	// 			}]
	// 		}]
	// }

	pageData.chapter = []
	chapters.each(function (item) {
		var chapter = $(this)
		var chapterTitle = chapter.find('strong').text()
		var title = null
		var id = null
		var chapterData = {
			'chapterTitle' : chapterTitle,
			'videos' : [] 
		}
		chapter.find('a.J-media-item').each(function (item) {
			var video = $(this)
			title = video.text()
			id = video.attr('href').split('video/')[1]
			chapterData.videos.push({
				'title' : title,
				'id' : id
			})
		})
		pageData.chapter.push(chapterData)
	})
	return pageData
}

function printData(pagesData) {
	pagesData.forEach(function (pageData) {
		console.log(pageData.num + '   人学习了   ' + pageData.title)
	})
	pagesData.forEach(function (pageData) {
		pageData.chapter.forEach(function (course) {
			console.log(course.chapterTitle)
			course.videos.forEach(function (video) {
				console.log('[' + video.id + ']' + video.title)
			})		
		})
	})
}

var fetchCourseArray = []
videoIds
	.sort(function (a, b) {
		return a > b
	})
	.forEach(function (id) {
		fetchCourseArray.push(getPageAsync(baseUrl + id))
	})

Promise
	.all(fetchCourseArray)
	.then(function (pages) {
		var pagesData = []
		pages.forEach(function (html) {
			pagesData.push(filterChapters(html))
		})
		printData(pagesData)
	})

function getPageAsync (url) {
	return new Promise(function (resolve, reject) {
		console.log('正在爬取' + url)
		http.get(url, function(res) {
			var html = ''
			res.on('data', function(data) {
				html += data
			})
			res.on('end', function() {
				resolve(html)
			})
		}).on('error', function(e) {
			reject(e)
			console.log('get方法出错！')
		})
	})
}