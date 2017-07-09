console.log(1)
MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
    "name" : String,
    "daima" : String,
    "dangqianjiage" : Number,
    "timeRQ" : String,
    "timeSJ" : String
}), stockName);
MyList[stockName].find(data, function(err, docs) {
	if(err) {
		console.log(err);
		return res.send(err);
	}
	return res.send(JSON.stringify(docs));
});