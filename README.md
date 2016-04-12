
## scraping-everyboty
A Node.js tool to scrape Everyboty.net

#### How do I install it?

Clone the repo, then run ``npm install``.

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

Miscellaneous options:
  -g, --makehtml      If enabled, it will generate HTML from previously
                      downloaded JSON                 [boolean] [default: false]
  -d, --downloadurls  If enabled, it will download images from previously
                      downloaded JSON                 [boolean] [default: false]

Options:
  --help  Show help                                                    [boolean]

Everyboty.net Scraper - Written by the Bibliotheca Anonoma
Repository - https://github.com/bibanon/scraping-everyboty
```

I probably should mention this in the help screen, but to set a set a boolean value to true or false, you must append an equals sign '=' followed by a 'true' or false' i.e. ``node main.js -a 1 -z 5 -h=false``

### Example 1: Scrape a Range of Posts

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

### Example 2: Grab the JSON and Generate HTML Only

You might want to grab all the JSON only, and generate some HTML as well, without downloading all the images. You can accomplish this by using the following command:

```
node main.js -a 1 -z 5 -i=false
```

### Example 3: Regenerate HTML from archived JSON

You may have opted to grab the JSON only, and need to generate the HTML for it. Just use the following command:

```
node main.js -a 1 -z 5 -g
```

### Example 4: Grab images after grabbing json

You may have opted to grab the JSON only, to archive the images in one burst later. Use the following command to download the images:

> **Note:** The `-r` argument is used to recover "deleted" images, which are just unreferenced and not actually deleted.

```
node main.js -a 1 -z 5 -d -r
```

### How do I use the JSON data?

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

## Notes

1. This will get all the post data:

$ node main.js -a $startpost -z $endpost -r=true -h=false -i=false

2. This will get the images based on the JSON:

$ node main.js -a $startpost -z $endpost -d=true

This completely ignores the start and end post #s! Be aware of this when using -h or -d. It will download the images for every post that has a directory.

3. This will generate the HTML:

$ node main.js -a $startpost -z $endpost -g=true

See above note about -h and -d ignoring post start and end #s.
