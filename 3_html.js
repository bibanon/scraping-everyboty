var fs = require('fs-extra');
var config = require('./config.json');
fs.ensureDirSync('./data_html/');
fs.copySync('./style.css', './data_html/style.css');
function ascending(a, b) {
    return a.id - b.id;
}
for (var i = 0; i < config.sets.length; i++) {
    fs.ensureDirSync('./data_html/' + config.sets[i][0] + '_' + config.sets[i][1] + '/');
    for (var i2 = config.sets[i][0]; i2 < config.sets[i][1] + 1; i2++) {
        fs.ensureDirSync('./data_html/' + config.sets[i][0] + '_' + config.sets[i][1] + '/' + i2 + '/');
        var path = './data/' + config.sets[i][0] + '_' + config.sets[i][1] + '/' + i2 + '.json';
        var data = require(path);
        var id = i2;
        var htmlOut = '<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"><title>Post #' + id + ' - Everyboty.net Scraper</title><link rel="stylesheet" href="../../style.css" ></head><body><h2>Post #' + id + '</h2>';
        
        if (data.deleted) {
            htmlOut += '<h3 class="deleted">DELETED</h3>We attempted to recover the images from the post and included them in the directory.<br><div id="signature">Everyboty.net Scraper - Written for use by Bibliotheca Anonoma</div></body></html>';
        }
        else {
            data.tags.sort(ascending);
            data.comments.sort(ascending);
            data.items.sort(ascending);
            for (var i3 = 0; i3 < data.items.length; i3++) {
                if (typeof data.items[i3].ext !== undefined)
                    htmlOut += '<img class="content img" src="' + data.items[i3].id + '.' + data.items[i3].ext + '"/>';
                else // must be text
                    htmlOut += '<div class="content text">' + data.items[i3].text + '</div>';
            }
              
            htmlOut += '<div id="comments"><b>Comments: </b><br><br>';
      
            for (var i3 = 0; i3 < data.comments.length; i3++) {
                htmlOut += '<div class="comment"><div class="timestamp">' + new Date(data.comments[i3].date*1000).toGMTString() + '</div><div class="content">' + data.comments[i3].body + '</div></div>';
            }
               
            htmlOut += '</div><div class="tags"><b>Tags: </b><ul>';
                    
            for (var i3 = 0; i3 < data.tags.length; i3++) {
                htmlOut += '<li>' + data.tags[i3].tag + '</li>';
            }
       
            htmlOut += '<ul></div><a href="http://everyboty.net/?perm=' + id + '">Permalink (on their site)</a><div id="signature">Everyboty.net Scraper - Written for use by Bibliotheca Anonoma</div></body></html>';
        }
        var root = './data_html/' + config.sets[i][0] + '_' + config.sets[i][1] + '/' + id + '/';
        fs.writeFileSync(root + 'index.html', htmlOut, 'utf8');
        console.log('HTML data for post #' + id + ' saved.');
        fs.copySync(path, root + 'post.json');
    }
}