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
			source = row[0],
			sourceId = row[1],
			score = row[2],
			scoreId = row[3],
			target = row[4],
			targetId = row[5];
		graph.nodes[sourceId] = source;
		graph.nodes[targetId] = target;
		graph.links[scoreId] = {
			from: sourceId,
			to: targetId,
			value: score
		};
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
"WITH startNode(r) AS n1, r, endNode(r) AS n2 " +
"RETURN n1.text, id(n1), r.score, id(r), n2.text, id(n2)";

var wordPathQuery =
"MATCH (from:Word {text:'%s'}),(to:Word {text:'%s'}),paths = allShortestPaths((from)-[:Association*]->(to)) " +
"WITH REDUCE(dist = 0, rel in rels(paths) | dist + rel.score) AS distance, paths " +
"ORDER BY distance DESC LIMIT %s WITH nodes(paths) as nodes " +
"UNWIND nodes as relatedWords WITH " +
"DISTINCT relatedWords " +
"WITH collect(relatedWords.text) as relatedWords " +
"MATCH (n1:Word)-[r:Association]-(n2:Word) " +
"WHERE n1.text IN relatedWords AND n2.text IN relatedWords " +
"WITH DISTINCT r " +
"WITH startNode(r) AS n1, r, endNode(r) AS n2 " +
"RETURN n1.text, id(n1), r.score, id(r), n2.text, id(n2)";

var escapeQuotes = function(word){
	return word.replace(/'/g, "\\'");
};

module.exports = {
	getWordGraph: function(word, callback){
		var sourceScore = 0.018,
			targetScore = 0.25;

		return executeCypher(util.format(wordGraphQuery,escapeQuotes(word),sourceScore,targetScore), function(err, data){
			if (err) return callback(err);
			if (data.errors.length) return callback(new Error(data.errors[0].message));

			var graph = {
				nodes:{},
				links:{}
			};
			buildGraph(data,graph);
			return callback(null,graph);
		});
	},
	getWordPath: function(from,to,callback){
		var numberOfPaths = 3;
		return executeCypher(util.format(wordPathQuery,escapeQuotes(from), escapeQuotes(to), numberOfPaths), function(err, data){
			if (err) return callback(err);
			if (data.errors.length) return callback(new Error(data.errors[0].message));

			var graph = {
				nodes:{},
				links:{}
			};
			buildGraph(data,graph);
			return callback(null,graph);
		});
	}
};
