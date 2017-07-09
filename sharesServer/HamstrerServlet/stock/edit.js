MyList[stockName] = MyList[stockName] || mongoose.model(stockName, new Schema({
	"codeID": String,
	"minData": [],
	"maxData": [],
	"max": String,
	"min": String,
	"mean": String,
	"timeRQ": String
}), stockName);
console.log('EEE:', data.setter)
var conditions =data.where, update = {'$set':data.setter}, options ={ multi:true};
MyList[stockName].collection.update(conditions,update, options, function(err, docs){
    if(err) {
    	console.log(err)
		return res.send(err);
	}
	return res.send(docs);
})
