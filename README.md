
## scraping-everyboty
A Node.js tool to scrape Everyboty.net

#### What does it do?

It will download all the posts and images (at a rate of 3 requests per second) from http://everyboty.net and put them in directories based on their ID. It outputs the data in JSON and HTML for both machines and humans to consume.

#### How do I use it?
Clone it into the directory where you want it to work, then:
```
$ npm install
$ node main.js minId maxId
```
where `minId` and `maxId` are the post IDs to download between (inclusive). It will create a directory called 'everyboty' and throw everything into there.
Here's an example:
```
$ node main.js 1 5
```
This will create the 'everyboty' directory and folders for each ID inside of it, and will create an 'index.html' file and 'post.json' file in each for HTML and JSON output, as well as downloading the images required by the posts. Your directory structure in the end will look something like:
```
main.js
package.json
style.css
everyboty
|--style.css
|--1
|  |--1.jpg
|  |--index.html
|  |--post.json
|--2
|  |--2.jpg
|  |--index.html
|  |--post.json
|--3
|  |--3.gif
|  |--index.html
|  |--post.json
|--4
|  |--4.jpg
|  |--index.html
|  |--post.json
---5
   |--5.jpg
   |--index.html
   |--post.json
```

#### How do I use the JSON data?

The structure of the JSON data goes something like this (using post 5 as an example):
```javascript
{
    "deleted": false,
    "items": [{
        "img": 5,
        "ext": "jpg",
        "url": "http://everyboty.net/shared/post_media/images/full_sized/5.jpg",
        "type": "file"
    }, ...],
    "comments": [{
        "content": "LOL OUT THE CHAIR<br />\r\n",
        "timestamp": 1304723975
    }, ...],
    "tags": [{
        "tag": "bruce",
        "timestamp": 1285652204
    }, ...],
    "timestamp": 1229792841,
    "permalink": "http://everyboty.net/?perm=5"
}
```
