console.log('find', stockName, data);
MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
	"codeID": String
}), stockName);
console.log('find', stockName, data);
//var newList = new Mylist(data.data);
MyList[stockName].find(data, function(err, docs) {
	if(err) {
		console.log(err);
		return res.send(err);
	}
	return res.send(JSON.stringify(docs));
});