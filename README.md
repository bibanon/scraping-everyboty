
## scraping-everyboty
A Node.js tool to scrape Everyboty.net

#### What does it do?

It will download all the posts and images (at a rate of 2 requests per second) from http://everyboty.net and put them in directories based on their ID. It outputs the data in JSON and HTML for both machines and humans to consume.

#### How do I use it?
We have a built-in help screen to guide you in your archiving journey, which I will quote below:
```
$ node main.js --help
General options:
  -a, --min      The post # to start at (including this)     [number] [required]
  -z, --max      The post # to end at (including this)       [number] [required]
  -r, --recover  Whether or not to try and recover deleted posts (only tags &
                 images)                              [boolean] [default: false]

Output options:
  -j, --json  Whether or not to include JSON output    [boolean] [default: true]
  -h, --html  Whether or not to include HTML output    [boolean] [default: true]

Download options:
  -p, --posts  Whether or not to download posts        [boolean] [default: true]
  -i, --imgs   Whether or not to download images (requires posts)
                                                       [boolean] [default: true]
  -c, --cmnts  Whether or not to download comments     [boolean] [default: true]
  -t, --tags   Whether or not to download tags         [boolean] [default: true]

Options:
  --help  Show help                                                    [boolean]

Everyboty.net Scraper - Written by the Bibliotheca Anonoma
Repository - https://github.com/bibanon/scraping-everyboty
```

I probably should mention this in the help screen, but to set a set a boolean value to true or false, you must append an equals sign '=' followed by a 'true' or false' i.e. ``node main.js -a 1 -z 5 -h=false``

Here's an example of its usage:
```
$ node main.js -a 1 -z 5
```
This will create the 'everyboty' directory and folders for each ID inside of it. These folders will contain all the data that you chose to output for each post. While the directory structure may vary based on which options you chose, in the end it will look something like this:
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
