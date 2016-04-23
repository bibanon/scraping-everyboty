'use strict';
var config = require('./config.json');
var request = require('request');
var fs = require('fs-extra');
var postNum = -1;
let setNum = 0;
fs.ensureDirSync('./data');
var name = '';

switch (config.type.toLowerCase()) {
    case 'posts':
        baseUrl += '/ajax/index.php?script=get_post&post_id=';
        name = 'post';
    break;
    case 'tags':
        baseUrl += '/ajax/index.php?script=get_post_tags&post_id=';
        name = 'tag';
    break;
    case 'cmnts':
        baseUrl += '/ajax/index.php?script=get_post_comments&post_id=';
        name = 'cmnt';
    break;
    default:
        console.log('Unknown value for "type" in "config.json". Allowed values: "posts", "tags", "cmnts"');
        process.exit(1);
    break;
}

for (var i = 0; i < config.sets.length; i++)
    fs.ensureDirSync('./data/'  + config.type.toLowerCase() + '_' + config.sets[i][0] + '_' + config.sets[i][1]);

function runSet() {
    var interval = setInterval(function() {
        let min = config.sets[setNum][0];
        let max = config.sets[setNum][1];
        if (postNum == -1)
            postNum = min;
        let post = postNum;
        let path = './data/' + config.type.toLowerCase() + '_' + min + '_' + max;
        request({
            gzip: true,
            headers: {
                'Referer': 'http://everyboty.net/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'contact-us-at': '#bibanon @ rizon.net (irc)'
            },
            uri: baseUrl + post
        }).on('response', function() { console.log('Downloaded %d.' + name + '.json', post); }).pipe(fs.createWriteStream(path + '/' + post + '.' + name + '.json'));
        if (post != max)
            postNum++;
        else {
            clearInterval(interval);
            if (typeof config.sets[setNum + 1] !== 'undefined') {
                setNum++;
                postNum = -1;
                runSet();
            }
        }
    }, 1000/config.rate);
} runSet();