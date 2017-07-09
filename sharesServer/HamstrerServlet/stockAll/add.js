MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
	"name" : String,
	"daima" : String,
	"dangqianjiage" : Number,
	"timeRQ" : String,
	"timeSJ" : String
}), stockName)
MyList[stockName].find({'timeRQ': data.timeRQ, 'timeSJ': data.timeSJ}, function(err, docs) { // 查询是否有同一时间同样的数据
	if(err) {
		console.log(err);
		return res.send(err);
	}
	if (docs && !docs.length > 0) {
		add()
	}else{
		console.log(data.name + '[' + data.timeRQ + ' ' + data.timeSJ + ']:' + '已有数据！！');
		return res.send(data.name + '[' + data.timeRQ + ' ' + data.timeSJ + ']:' + '已有数据！！');
	}

});
function add () {
	var newList = new MyList[stockName](data);
	newList.save(function(err) {
		if(err) {
			console.log(err);
			return res.send(err);
		}
		console.log('ok');
		return res.send('ok');
	});
}
