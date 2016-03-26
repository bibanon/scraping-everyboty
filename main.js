var util = require('util');
var queue = require('qv2');
var request = require('request');
var extend = require('xtend');
var requestQueue = new queue();
var maxId = 1; // this is just for testing, the max on the site: 10061
var baseUrl = 'http://everyboty.net';
var imgUrl = baseUrl + '/shared/post_media/images/full_sized/%d.%s';
var permUrl = baseUrl + '/?perm=%d';
var postUrl = baseUrl + '/ajax/index.php?script=get_post&post_id=%d';
var tagsUrl = baseUrl + '/ajax/index.php?script=get_post_tags&post_id=%d';
var commentsUrl = baseUrl + '/ajax/index.php?script=get_post_comments&post_id=%d';
var requestOpts = {
    uri: util.format(),
    gzip: true,
    headers: {
        'Referer': 'http://everyboty.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
    }
};
var output = {};

function postParser(err, res, body) {
    var post = JSON.parse(body).post;
    output[post.id].timestamp = post.date_created;
    output[post.id].permalink = util.format(permUrl, post.id);
    for (var i = 0; i < post.items.length; i++) {
        var item = post.items[i];
        if (typeof item.ext !== undefined)
            output[post.id].items.push({ img: item.id, ext: item.ext, url: util.format(imgUrl, item.id, item.ext), type: 'file' });
        else
            output[post.id].items.push({ content: item.text, type: 'text' });
    }
    console.log('Parsed post info for post #' + post.id);
}

function tagsParser(err, res, body) {
    var id;
    var tags = JSON.parse(body).tags;
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        id = tag.post_id;
        output[tag.post_id].tags.push({ tag: tag.tag, timestamp: tag.date });
    }
    console.log('Parsed tags for post #' + id);
}

function commentsParser(err, res, body) {
    var comments = JSON.parse(body).comments;
    var id;
    for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];
        id = comment.post_id;
        output[comment.post_id].comments.push({ content: comment.body, timestamp: comment.date });
    }
    console.log('Parsed comments for post #' + id);
}

for (var i = 1; i < maxId+1; i++) {
    output[i] = { items: [], comments: [], tags: [], timestamp: -1 };
    requestQueue.enqueue([extend(requestOpts, { uri: util.format(postUrl, i) }), postParser]);
    requestQueue.enqueue([extend(requestOpts, { uri: util.format(tagsUrl, i) }), tagsParser]);
    requestQueue.enqueue([extend(requestOpts, { uri: util.format(commentsUrl, i) }), commentsParser]);
}

var interval = setInterval(function() { // setup a function which will be called at a set interval
    var dq = requestQueue.dequeue(); // will be undefined if queue is empty
    if (typeof dq !== 'undefined')// if not undefined, this is a legit request
        request(dq[0], dq[1]); 
    else {
        clearInterval(interval); // if undefined, the queue is empty, we can end the program
        console.log(JSON.stringify(output)); // and we should probably also write out our results
    }
}, 1000); // and lets do that every 0.5 seconds