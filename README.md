
## scraping-everyboty
A Node.js tool to scrape Everyboty.net

#### How do I install it?

Clone the repo, then run ``npm install``.

#### What does it do?

It will download all the posts and images (at a rate of 3 requests per second by default) from http://everyboty.net and put them in directories based on their ID. It outputs the data in JSON and HTML for both machines and humans to consume.

#### How do I use it?
Refer to the built-in documentation included in ```config.json```. I'll include it below for your convenience:
```
'type' can either be 'posts', 'tags', or 'cmnts', and represents which type of data you want to download. 'sets' is an array of starting and end post values. These dictate how many and which posts are in a folder. 'rate' is the amount of requests to second per second.
```
