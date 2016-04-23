var util = require('util');
var fs = require('fs-extra');
var config = require('./config.json');
for (var i = 0; i < config.sets.length; i++) {
    var rootPathPosts = './data/posts_%d_%d/';
    var rootPathCmnts = './data/cmnts_%d_%d/';
    var rootPathTags = './data/tags_%d_%d/';
    var rootPathFull = './data/%d_%d/';
    var outPath = util.format(rootPathFull, config.sets[i][0], config.sets[i][1]);
    fs.ensureDirSync(outPath);
    for (var i2 = config.sets[i][0]; i2 < config.sets[i][1] + 1; i2++) {
        var postPath = util.format(rootPathPosts, config.sets[i][0], config.sets[i][1]) + i2 + '.post.json';
        var tagPath = util.format(rootPathTags, config.sets[i][0], config.sets[i][1]) + i2 + '.tag.json';
        var cmntPath = util.format(rootPathCmnts, config.sets[i][0], config.sets[i][1]) + i2 + '.cmnt.json';
        var data = require(postPath);
        
        if (typeof data.ERROR !== 'undefined') {
            data.id = i2;
            data.deleted = true;
        } else data = data.post;
        
        data.tags = require(tagPath).tags;
        data.comments = require(cmntPath).comments;
        delete data.ip;
        delete data.reviewed_by;
        delete data.deleted_by;
        delete data.undeletable;
        for (var i3 = 0; i3 < data.comments.length; i3++) {
            delete data.comments[i3].ip;
            delete data.comments[i3].deleted_by;
            delete data.comments[i3].undeletable;
        }
        fs.writeFileSync(outPath + i2 + '.json', JSON.stringify(data), 'utf8');
        console.log('Re-wrote ' + i2 + '.json');
    }
}