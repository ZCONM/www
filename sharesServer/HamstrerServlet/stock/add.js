
	MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
		"codeID": String,
		"minData": [],
		"maxData": [],
		"name": String,
		"max": String,
		"min": String,
		"mean": String,
		"timeRQ": String
	}), stockName)
	var newList = new MyList[stockName](data);
	console.log('addData', data)
	newList.save(function(err) {
		if(err) {
			console.log(err);
			return res.send(err);
		}
		console.log('ok');
		return res.send('ok');
	});