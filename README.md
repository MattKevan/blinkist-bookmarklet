# Blinkist-to-Markdown bookmarklets

Simple bookmarklets to export a Blinkist book summary to Markdown.

* bookmarklet.js - Opens a modal with the converted text
* obsidian.js - Saves a new note in Obsidian.

![Screenshot of the bookmarklet in action](screenshot.png)

## How to use

1. Copy the code from the bookmarklet you want to use. Use the min.js version.
2. Create a new bookmark and paste the code into the address field.
3. Log into your Blinkist account and find the book you want to read.
4. Click the bookmarklet.
   
The Obsidian bookmarklet will automatically open the app and create a new note in a 'Summaries' folder. You can change the location, category and tags by editing the variables at the top of the script. After making changes, I recommend minifiying and encoding the script with  [Bookmarklet Maker](https://caiorss.github.io/bookmarklet-maker/).

NOTE: If you're using Safari you'll need to enable 'Allow JavaScript from Smart Search field' in the developer settings.

The Obsidian script is based on Kepano's [Obsidian web clipper](https://gist.github.com/kepano/90c05f162c37cf730abb8ff027987ca3).

