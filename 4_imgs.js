'use strict';
var fs = require('fs-extra');
var config = require('./config.json');
var q = require('qv2');
var request = require('request');
var requestQueue = new q();
var imgUrl = 'http://everyboty.net/shared/post_media/images/full_sized/';
var fileExtensions = ['jpg', 'jpeg', 'png', 'gif'];
function getPost(id) {
    for (var i = 0; i < config.sets.length; i++) {
        for (var i2 = config.sets[i][0]; i2 < config.sets[i][1] + 1; i2++) {
            if (i2 == id)
                return require('./data_html/' + config.sets[i][0] + '_' + config.sets[i][1] + '/' + i2 + '/post.json');
        }
    }
    throw 'Unknown post #: ' + id;
}

function getPostFolder(id) {
    for (var i = 0; i < config.sets.length; i++) {
        for (var i2 = config.sets[i][0]; i2 < config.sets[i][1] + 1; i2++) {
            if (i2 == id)
                return config.sets[i][0] + '_' + config.sets[i][1];
        }
    }
    throw 'Unknown post #: ' + id;
}

function isImagePost(data) {
    if (data.deleted) 
        return false;
    for (var i = 0; i < data.items.length; i++)
        if (typeof data.items[i].ext === 'undefined')
            return false;
        
    return true;
}

function findLowerBoundary(id) {
    var post;
    var outnum;
    var lowestId = 103420;
    
    for (var i = 1; i < id; i++) {
        post = getPost(id - i);
        if (isImagePost(post)) {
            outnum = id - i;
            break;
        }
    }
        
    for (var i = 0; i < post.items.length; i++)
        if (post.items[i].id < lowestId)
            lowestId = post.items[i].id;
    
    return lowestId;
}

function findUpperBoundary(id) {
    var post;
    var outnum;
    var highestId = 0;
    
    for (var i = 1; i < 100042 - id; i++) {
        post = getPost(id + i);
        if (isImagePost(post)) {
            outnum = id + i;
            break;
        }
    }
        
    for (var i = 0; i < post.items.length; i++)
        if (post.items[i].id > highestId)
            highestId = post.items[i].id;
        
    return highestId;
}

var interval = setInterval(function() { // setup a function which will be called at a set interval
    let dq = requestQueue.dequeue(); // will be undefined if queue is empty
    if (typeof dq !== 'undefined') {// if not undefined, this is a legit request
        switch (dq.type) {
            case 'dl':
                request({
                    headers: {
                        'Referer': 'http://everyboty.net/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
                    },
                    gzip: true,
                    uri: dq.url,
                    method: 'GET',
                    'contact-us-at': '#bibanon @ rizon.net (irc)'
                }, function(err) { if (err) throw err; }).on('response', function() { console.log('Downloaded %s for post #%d.', dq.name, dq.id); }).pipe(fs.createWriteStream('./data_html/' + getPostFolder(dq.id) + '/' + dq.id + '/' + dq.name));
            break;
            case 'try':
                request({
                    headers: {
                        'Referer': 'http://everyboty.net/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
                    },
                    gzip: true,
                    uri: dq.url,
                    method: 'HEAD',
                    'contact-us-at': '#bibanon @ rizon.net (irc)'
                }, function(err, res) {
                    if (!err)
                        if (res.statusCode == 200) {
                            var clone = JSON.parse(JSON.stringify(dq));
                            clone.type = 'dl';
                            requestQueue.enqueue(clone);
                        }
                });
            break;
        }
    }
    else {  
        clearInterval(interval);
    }
}, 1000/config.rate); 

for (var i = 0; i < config.sets.length; i++) {
    for (var i2 = config.sets[i][0]; i2 < config.sets[i][1] + 1; i2++) {
        var data = getPost(i2);
        if (!data.deleted)
            for (var i3 = 0; i3 < data.items.length; i3++) {
                if (typeof data.items[i3].ext !== 'undefined') {
                    var filename = data.items[i3].id + '.' + data.items[i3].ext;
                    requestQueue.enqueue({
                        type: 'dl',
                        url: imgUrl + filename,
                        id: i2, 
                        name: filename,
                    });
                    console.log('Enqueuing ' + filename + ' for post #' + i2);
                }
            }
        else {
            for (var i3 = findLowerBoundary(i2) + 1; i3 < findUpperBoundary(i2); i3++) { // for each image id between the range
                for (var i4 = 0; i4 < fileExtensions.length; i4++) { // for each possible file ext this image id could have
                var filename = i3 + '.' + fileExtensions[i4];
                    requestQueue.enqueue({
                        type: 'try',
                        url: imgUrl + filename,
                        id: i2,
                        name: filename
                    });
                    console.log('Enqueuing ' + filename + ' for post #' + i2 + ' [deleted]');
                }
            }
        }
    }
}