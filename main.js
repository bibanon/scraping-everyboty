var util = require('util');
var fs = require('fs-extra');
var queue = require('qv2');
var request = require('request');
var extend = require('xtend');
var requestQueue = new queue();
var maxId; // this is just for testing, the max on the site: 10061, 19 is the first dead post
var minId; // start at 1
var parsedMin = parseInt(process.argv[2]);
var parsedMax = parseInt(process.argv[3]);
    
if (isNaN(parsedMin) || isNaN(parsedMax)) {
    console.log('No min and max IDs specified. You can choose between 1 and 10061 for each value by inputting it as: node main.js minId maxId');
    process.exit(1);
}

else {    
    minId = Math.min(Math.max(1, parsedMin), 10061);
    maxId = Math.min(Math.max(1, parsedMax), 10061);
    console.log('Downloading posts between %d and %d. If this isn\'t what you wanted, turn back now.\n', minId, maxId);
}
var baseUrl = 'http://everyboty.net';
var imgUrl = baseUrl + '/shared/post_media/images/full_sized/%d.%s';
var permUrl = baseUrl + '/?perm=%d';
var postUrl = baseUrl + '/ajax/index.php?script=get_post&post_id=%d';
var tagsUrl = baseUrl + '/ajax/index.php?script=get_post_tags&post_id=%d';
var commentsUrl = baseUrl + '/ajax/index.php?script=get_post_comments&post_id=%d';
var rootPath = './everyboty';
var output = {};
var requestsPerSecond = 3;
var apiRequestOpts = {
    gzip: true,
    headers: {
        'Referer': 'http://everyboty.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
    }
};
var imgRequestOpts = {
    gzip: true,
    headers: {
        'Referer': 'http://everyboty.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
    }
};

fs.ensureDirSync(rootPath);
fs.copySync('./style.css', rootPath + '/style.css');

function saveIfReady(id) {
    if (output[id].__checkedPostApi == true && output[id].__checkedTagApi == true && output[id].__checkedCommentApi == true)
        savePost(id);
}

function savePost(id) {
    var path = rootPath + '/' + id;
    var data = output[id];
    delete data.__checkedPostApi;
    delete data.__checkedTagApi;
    delete data.__checkedCommentApi;
    fs.ensureDir(path, function (dirErr) {
        if (dirErr) {
            console.log(dirErr);
            process.exit(1);
        }
        
        fs.writeFile(path + '/post.json', JSON.stringify(data), function(writeErr) {
            if (writeErr)
                return console.log(writeErr);
            console.log('JSON data for post #' + id + ' saved.');
        });
        
        var htmlOut = '';
        if (data.deleted) {
            htmlOut = util.format('<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"><title>Post #%d - Everyboty.net Scraper</title><link rel="stylesheet" href="../style.css" ></head><body><h2>Post #%d</h2><h3 class="deleted">DELETED</h3><div id="comments"></div><div id="signature">Everyboty.net Scraper - Written for use by Bibliotheca Anonoma</div></body></html>', id, id);
        }
        else {
            htmlOut = util.format('<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"><title>Post #%d - Everyboty.net Scraper</title><link rel="stylesheet" href="../style.css" ></head><body><h2>Post #%d</h2>', id, id);
            for (var i = 0; i < data.items.length; i++) {
                if (data.items[i].type == 'file') {
                    htmlOut += util.format('<img class="content img" src="%d.%s"/>', data.items[i].img, data.items[i].ext);
                }
                else { // must be text
                    htmlOut += util.format('<div class="content text">%s</div>', data.items[i].content);
                }
            }
        
            htmlOut += '<div id="comments">';
        
            for (var i = 0; i < data.comments.length; i++) {
                htmlOut += util.format('<div class="comment"><div class="timestamp">%s</div><div class="content">%s</div></div>', new Date(data.comments[i].timestamp*1000).toGMTString(), data.comments[i].content);
            }
        
            htmlOut += util.format('</div><a href="%s">Permalink (on their site)</a><div id="signature">Everyboty.net Scraper - Written for use by Bibliotheca Anonoma</div></body></html>', data.permalink);
        }
        fs.writeFile(path + '/index.html', htmlOut, function(writeErr) {
            if (writeErr)
                return console.log(writeErr);
            console.log('HTML data for post #' + id + ' saved.');
        });
    });
}

function postParser(err, res, body) {
    var post = JSON.parse(body);
    if (typeof post['ERROR'] !== 'undefined') {
        var id = parseInt(/&post_id=(\d+)/g.exec(res.request.path)[1]);
        output[id].__checkedPostApi = true;
        saveIfReady(id);
        console.log('Parsed post info for post #' + id + '.');
        return;
    }
    post = post.post;
    var id = post.id;
    output[post.id].deleted = false;
    output[post.id].timestamp = post.date_created;
    output[post.id].permalink = util.format(permUrl, post.id);
        
    for (var i = 0; i < post.items.length; i++) {
        var item = post.items[i];
        if (typeof item.ext !== 'undefined') {
            var url = util.format(imgUrl, item.id, item.ext);
            output[post.id].items.push({ img: item.id, ext: item.ext, url: url, type: 'file' });
            requestQueue.enqueue([extend(imgRequestOpts, { uri: url }), item.id + '.' + item.ext, id]);
        }
        else
            output[post.id].items.push({ content: item.text, type: 'text' });
    }
    console.log('Parsed post info for post #' + post.id + '.');
    output[id].__checkedPostApi = true;
    saveIfReady(id);
}

function tagsParser(err, res, body) {
    var id;
    var tags = JSON.parse(body).tags;
    if (tags.length == 0) {
        var id = parseInt(/&post_id=(\d+)/g.exec(res.request.path)[1]);
        output[id].__checkedTagApi = true;
        saveIfReady(id);
        console.log('Parsed tags for post #' + id + '.');
        return;
    }
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        id = tag.post_id;
        output[tag.post_id].tags.push({ tag: tag.tag, timestamp: tag.date });
    }
    console.log('Parsed tags for post #' + id + '.');
    if (id !== undefined)
        output[id].__checkedTagApi = true;
    saveIfReady(id);
}

function commentsParser(err, res, body) {
    var comments = JSON.parse(body).comments;
    var id;
    if (comments.length == 0) {
        var id = parseInt(/&post_id=(\d+)/g.exec(res.request.path)[1]);
        output[id].__checkedCommentApi = true;
        saveIfReady(id);
        console.log('Parsed comments for post #' + id + '.');
        return;
    }
    for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];
        id = comment.post_id;
        output[comment.post_id].comments.push({ content: comment.body, timestamp: comment.date });
    }
    console.log('Parsed comments for post #' + id + '.');
    if (id !== undefined)
        output[id].__checkedCommentApi = true;
    saveIfReady(id);
}

for (var i = minId; i < maxId+1; i++) {
    output[i] = { __checkedPostApi: false, __checkedCommentApi: false, __checkedTagApi: false, deleted: true, items: [], comments: [], tags: [], timestamp: -1 };
    requestQueue.enqueue([extend(apiRequestOpts, { uri: util.format(postUrl, i) }), postParser]);
    requestQueue.enqueue([extend(apiRequestOpts, { uri: util.format(tagsUrl, i) }), tagsParser]);
    requestQueue.enqueue([extend(apiRequestOpts, { uri: util.format(commentsUrl, i) }), commentsParser]);
}

var interval = setInterval(function() { // setup a function which will be called at a set interval
    var dq = requestQueue.dequeue(); // will be undefined if queue is empty
    if (typeof dq !== 'undefined') {// if not undefined, this is a legit request
        if (typeof dq[1] === 'function') // api call
            request(dq[0], dq[1]); 
        else {// img call
            request(dq[0]).pipe(fs.createWriteStream(rootPath + '/' + dq[2] + '/' + dq[1]));
            console.log('Downloading image ' + dq[1]);
        }
    }
    else {
        clearInterval(interval); // if undefined, the queue is empty, we can end the program
    }
}, 1000/requestsPerSecond); 