"use strict";

var config = require('../config'),
	http = require('http'),
	util = require('util'),
	url = require('url');

var executeCypher = function(query, callback){
	var http = require('http');

	var queryString = util.format('{"statements" : [ {"statement" : "%s"} ]}',query);

	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': queryString.length,
		'Accept': 'application/json; charset=UTF-8'
	};

	var options = url.parse(config.neo4j_url);
	options.path = '/db/data/transaction/commit';
	options.method = 'POST';
	options.headers = headers;

	// Setup the request.  The options parameter is
	// the object we defined above.
	var req = http.request(options, function(res) {
		res.setEncoding('utf-8');
		var responseString = '';

		res.on('data', function(data) {
			responseString += data;
		});

		res.on('end', function() {
			var resultObject = JSON.parse(responseString);
			callback(null, resultObject);
		});
	});

	req.on('error', function(e) {
		callback(e);
	});

	req.write(queryString);
	req.end();
};

var buildGraph = function(data, graph){
	if (!data || !data.results || !data.results.length || !data.results[0].data) return;

	for(var i = 0, l = data.results[0].data.length; i<l; i++){
		var row = data.results[0].data[i].row,
			source = row[0].text,
			score = row[1].score,
			target = row[2].text;
		graph.nodes[source] = true;
		graph.nodes[target] = true;
		graph.links.push({
			source:{id:source},
			target:{id:target},
			data:{
				score:score
			}
		});
	}
	return graph;
};

var wordGraphQuery =
"MATCH " +
"(root:Word { text:'%s' }), " +
"(related:Word)-[relate:Association]-(root) " +
"WHERE ((startNode(relate)=root and relate.score > %d) or (endNode(relate)=root and relate.score > %d)) " +
"WITH root, collect(related.text) AS relatedWords " +
"MATCH (n1:Word)-[r:Association]-(n2:Word) " +
"WHERE (n1.text IN relatedWords OR n1.text = root.text) AND (n2.text IN relatedWords OR n2.text = root.text) " +
"WITH DISTINCT r " +
"RETURN startNode(r) AS n1, r, endNode(r) AS n2 ";


module.exports = {
	getWordGraph: function(word, callback){
		var sourceScore = 0.018,
			targetScore = 0.25;

		return executeCypher(util.format(wordGraphQuery,word,sourceScore,targetScore), function(err, data){
			if (err) return callback(err);
			if (data.errors.length) return callback(data.errors);

			var graph = {
				nodes:{},
				links:[]
			};
			buildGraph(data,graph);
			return callback(null,graph);
		});
	}
};
