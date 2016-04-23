
## scraping-everyboty
A Node.js tool to scrape Everyboty.net

#### How do I install it?

Clone the repo, then run ``npm install``.

#### What does it do?

It will download all the posts and images (at a rate of 3 requests per second by default) from http://everyboty.net and put them in directories based on their ID. It outputs the data in JSON and HTML for both machines and humans to consume.

#### How do I use it?

Allow me to start off by explaining the configuration file: This is the main way you control the scraper. It handles things like where to put what post #, and at what rate to call everyboty.net's API. You can refer to the built-in documentation included in ```config.json``` for a full explanation, which I'll include below for your convenience:
```
'type' can either be 'posts', 'tags', or 'cmnts', and represents which type of data you want to download. 'sets' is an array of starting and end post values. These dictate how many and which posts are in a folder. 'rate' is the amount of requests to second per second.
```

From there, the root directory has 4 scripts, accessible via the following commands:
- ```node 1_scrape.js``` - This  will download the specific type of data specified in ```config.json``` for all the post #s listed. The files are seperated by type and post #. i.e. the comment data for post 1337 would be in the path: ```data/cmnts_1_3000/1337.cmnt.json```. 
- ```node 2_fix.js``` - This will fill combine all the seperate data files into one file per post #. It will also remove various JSON fields that should probably not be public knowledge (IP and etc.). Like before, this data is still stored in the ```data``` folder, but is missing the prefix for its subfolder. i.e. ```data/1_3000/1337.json```
- ```node 3_html.js``` - This will generate the HTML for all the JSON files. It's similar to the previous style for sorting post data, but the main folder is different, as well as the fact that all posts get their own subfolder. For example: ```data_html/1_3000/1337/post.json```.
- ```node 4_imgs.js``` - This will go and download the image files associated with each post. It will also go and try and find images from deleted posts (no deduplication though) and put them in their appropriate folders. **I haven't gotten around to testing this part yet** 
