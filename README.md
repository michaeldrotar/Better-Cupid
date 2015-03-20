# BetterCupid

The BetterCupid extension attempts to build on the spectacular set of features already provided on okcupid.com to make things even better!

## How Things Got Started

I've been a fan of OkCupid since its very early inception as TheSpark. Back then, it was a bunch of random stuff along with fun quizzes to help you figure out anything from your personality type to which Simpsons character you were most like. SparkNotes and SparkMatch grew from the success, and SparkMatch went on to become OkCupid. It took all the fun tests along with their new match-making stuff and created a revolutionary service... compatability by math. It's fun, functional, and free!

I've been creating small greasemonkey scripts for years. Never anything major, small enhancements for my own use for some of my favorite sites. Recently, I turned my attention to OkCupid. I started finding little things that I wanted to enhance here and there, and as I poked around in the markup, I found that it was organized extremely well. It's a lot of fun to play with the DOM and manipulate things. It's easy to find the data that you need.

I had a half dozen or so different scripts sitting around so I thought it might be fun to create a real extension and dig deeper into the Chrome Extension API. And from there, it was only natural to see what publishing it would be all about, but that'd require a name and an icon and more concrete information. Thus: BetterCupid was born... OkCupid is great and all, but this made it better. :)

## Want To Use It?

Awesome! Best thing to do is just install it from the [Chrome web store](https://chrome.google.com/webstore/detail/bettercupid/egdnnbehcfaogopbgaanfnmpgdpkeloo). There you'll find more promotional materials and be able to leave a review, plus you'll always have the latest version.

## Want To Help?

I'd be happy to welcome some collaboration. I'm working on getting the API into a more consistent place and to get docs and tests written to help ease users into the process. Here's a brief rundown of steps to get started:
- Install [nodejs](http://nodejs.org)
- Install a git client of your choice.. there's [GitHub for Windows](https://windows.github.com/), [GitHub for Mac](https://mac.github.com/), [SourceTree](http://www.sourcetreeapp.com/), and many others.
- Clone the repo to your local computer
- Open a command prompt in the local folder and run `npm install` followed by `gulp build`

The `npm` command just installs all the node modules defined in the package.json -- there's quite a few of them. The `gulp` command tells [Gulp](http://gulpjs.com/) to run its build task -- which is a task I've created to do everything necessary to, well... build the project. This will give you a `docs` folder wherein you can open the `index.html` file to start viewing the docs. It also gives a `dist` folder that has the distributable material -- ie, the actual extension. Once you have that, you can go into your Chrome Extensions and load the unpacked version of BetterCupid -- just point to your `dist` folder and you're off. There's also a `gulp watch` command, which is what I always have running while I'm working. This will continually monitor my source files, rebuild the necessary files, re-run my tests if I have the page open, and generally automate anything that I need automated.

Once you've gotten your feet wet in the source and have made a contribution that you'd like to add to the main repo, you may submit a [Pull Request](https://help.github.com/articles/using-pull-requests/). That will give me the ability to review the changes and pull them into the repo or make adjustments. :)

## Licensing

I like to develop things that other people can use and, more importantly, learn from. For that reason, Better Cupid is licensed under the simple and permissive MIT license. For more information, see the LICENSE file.

## Changelog

### Version 0.10.0
03/13/2015

#### General

I wanted this version to be a really big milestone for BetterCupid. I know I have a habit of refactoring every other day and it gets me excited but nobody else likely cares. With this version, I have refactored yet again... mostly for the benefit of writing modules. The project now has proper API docs (and a proper API), proper unit testing, and a better development workflow. To showcase that, I've also developed more modules! I hope everyone enjoys them. :)

#### Module Authoring

It's been my ambition to develop a module system for a chrome extension pretty much since this project started, but I haven't had anything to support module authors. Now if you checkout the repo on git, the gulpfile will have all you need for writing tests and generating the API docs.

#### Pearly Whites

New module for users that don't have a photo yet. OkCupid puts a 'shade' up to cover the large photos of other users, but the photos are still there, so this just removes the shade so that they can be seen. You should still work on getting a good photo up. :)

#### Recently Visited

- Now ensures each user it grabs is unique -- sometimes the urls would be a little different but for the same person.

### Version 0.9.0
03/12/2015

#### Photo Browser

I believe this feature had been lost when BetterCupid was modularized.

The photo browser is the horizontal list of photos on the homepage. I never liked horizontal scrolling much, so I've reformatted the view to showcase all of the photos. Hovering over one will show it's full details.. clicking the details will open the user's profile like before. I've also added a hide link right to the details in case you're seeing people in there that you don't care to see anymore.

#### Bug Fixes

- The recently visited module would throw an error if the recently visited section wasn't on the page, such as in the Settings pages. This prevented the screen from ever showing.

### Version 0.8.0
03/11/2015

#### General

The past two and a half years have sure gone by quickly. I'm sorry to say there's nothing revolutionary in this version. I've disabled a couple things that weren't worth fixing just yet (reset settings button).. I've fixed everything else. I've completely revamped the project over the past 4 days. Same direction.. better process.

So what's new? Well, everything. When I left the project, I was in the middle of redoing the module system. That's done now. BetterCupid no longer uses weird hacks to get at the modules, it just requests them and waits til they're ready. There are no longer any weird script injections to load the modules. In fact, BetterCupid now has a whole build process that takes all the module files and puts them together into a manageable number of resources. Now that I know what resources I have, I just load them the way that Chrome intends for its extensions to load files. I must have deleted hundreds of lines of code that was doing all this for me before.

No more github permission too. The changelog is now stored in a json file in the source, and the options file uses nunjuck templating to grab the data from various json files. The downside? I have to manually maintain the changelog within the source and then periodically update the github wiki. The upside? There's no fear of the changelog breaking anymore. There's no ajax request that takes a second to grab it and could potentially fail. And, yes, there's no more need to request permission to access github. That was a weird one.

Here's a big one someone might appreciate.. BetterCupid now uses Chrome's sync storage. That means all your data will be available in any Chrome browser that's logged into your account (if you enable the syncing in Chrome). Your extended list of recently viewed users will be maintained.. all your settings.. and all future data as well. Also, with any luck, I have the data format good enough now that I won't need to keep changing it every other version.

JQuery UI is also gone. All that really means to you is that the package should be a good bit lighter. I did add the bluebird lib for handling promises, but it's not nearly as heavy. I've also upgraded jquery to the 2.x line, which doesn't have all the old ie support, so it should also be much lighter. All in all, the package is half the size it used to be so there's plenty of room for new features. :)

### Version 0.7.4
08/15/2012

#### General

- Updated the manifest to v2 and made other necessary adjustments since Chrome won't be supporting v1 much longer. Overall, this new manifest seems buggy. During development, sometimes the extension was unable to retrieve its own ID.. which is necessary in accessing its files. So modules and things couldn't load properly. Reloading the extension a few times would eventually get it working again. I hope this doesn't happen in production.

#### People Summary

- Fixed to work with the new OkCupid markup changes.

#### Options

- Fixed the Changelog and About tabs. Github also had markup changes that broke me.

### Version 0.7.3
12/10/2011

#### Bug Fixes

- The Options Page wasn't properly resetting the slider control on the Recently Visited module's settings when the user reset settings.

#### People Summary

- Modularized - I know some people really liked this one so I got it updated as quickly as I could. There's nothing new for it just yet.

### Version 0.7.2
12/10/2011

#### Bug Fixes

- There was a typo in the module loader that would cause it to never load the modules and thus never display the page if the DOM wasn't fully loaded at the same time that the document.body element was ready to go. This could theoretically happen on slower connections and on more load-intensive pages.

### Version 0.7.1
12/10/2011

#### General

- If a module should fail (for instance, because the markup was changed and an object no longer exists), BetterCupid should now be able to recover and keep loading the other modules. What was happening was that the whole extension would come crashing down and so the website would never load (blue screen of death!) .. sorry, everyone.

#### Recently Visited

- Fixed to work with OkCupid's new markup and styling

#### You Might Like

- Fixed to work with OkCupid's new markup

### Version 0.7.0
12/6/2011

#### Special Note

I want to apologize to all my users for BetterCupid having been so utterly broken these past few months. The good people at OkCupid decided to start making changes to their markup at a time when I was starting a new job and feeling generally lethargic about working outside of my job.

I had set out to make some major changes to BetterCupid (yet again).. so when their changes hit, I just wasn't in a position where I could react quickly and keep things running. Many (mostly all) of BetterCupid's features are now in a state where they can no longer be used and must be fixed up, but I've been working hard this past week to get things running again.

Please bear with me as I do my best to get things back together.

#### General

- Implemented "modules" -- modules are independant pieces of HTML, CSS, and Javascript that combine to add some new feature-set to BetterCupid. For the user this won't seem like much of a difference.. there will still be the "Recently Viewed" stuff and the "Photobrowser" stuff and the "You Might Like" stuff, except that 'stuff' is now.. modules.. and modules will be much easier to develop and maintain then 'stuff' was. Maybe.. just maybe.. someone other than myself might want to write a module for BetterCupid someday.
- BetterCupid can now handle upgrading versions without loss of data. By tracking the last installed version and the current version, upgrades can be detected, and scripts can be written to convert old data into new data.. ready and raring to go!
- The Options page has a now Settings tab as its first, initial tab. This tab will house all of the settings for BetterCupid itself and for each module. I've been meaning to do this for so long.. it's pretty exciting to finally get it going.
- When a page loads, it's not all made visible at once. It's common to see the background first and then maybe the heading. menus.. then the major content might appear in different pieces and images are loading during this time and might continue to be loading after the DOM is finished. In the past, BetterCupid has worked by monitoring the page as it loads.. and if there was an element that it needed to modify (like the photobrowser on the homepage), it would wait for that element to finish and then immediately make modifications. This worked pretty well most of the time, but occasionally things would get goofed up.. and sometimes you would see the old version briefly before the new version took its place. As of this version, BetterCupid takes a different approach... it waits for the entire page to load before it does any modifications. As a result, in order to prevent the jarring experience of seeing the old and then the new, the page is hidden until it's done loading... the modifications are made... and then the page is shown all at once. For most users on a broadband connection, this change should barely be noticeable, but users on slow connections may need to wait awhile longer than they're used to before the page comes up. Please feel free to provide feedback on this and I may be able to provide alternate load methods via settings.

#### Recently Visited

- Modularized
- New settings allow you to set how many rows should be visible without having to scroll and how many max rows should be shown. For instance, if you set visible rows to 5 and max rows to 25, you'll be able to see your first 5 rows right on the page. To see the other 20 rows, use your mouse wheel to scroll over them. If you set the visible rows to 0, the panel will be effectively hidden and not show up at all.

#### You Might Like

- Modularized

### Version 0.6.1
6/24/2011

#### Recently Viewed

- Rewritten to use OkCupid's Recently Viewed list rather than tracking who you view. This means it won't lose who you viewed prior to installing the extension, it won't show yourself, and it won't take you to pages of the profile other than the main one. It all works exactly like OkCupid's list now except it shows 0 to 10 rows of people and the list is scrollable.
- Added the Clear Recently Viewed button back in.
- Note: BetterCupid will not retain your previous list of Recently Viewed so you'll be reset back to the last 8 people that OkCupid has listed.

### Version 0.6.0
6/18/2011

#### General

Huge rewrites in the code as I prepare to start fleshing out options.html.

More importantly, you now have the option of hiding the random "You Might Like..." matches (I don't like you! Go away!) and your list of Recently Viewed users can now display up to 10 rows of users (scrollable via the mousewheel and oh so pretty). Since I'm tracking this data myself now, you'll lose your current list of Recently Viewed users. I'm sorry about that.. laziness overwhelmed me.

You might also be interested to know that the Changelog and About sections are now pulled in dynamically off the new wiki. Yes, there's the beginnings of a wiki, and there's a new source control repository. Visit https://github.com/michaeldrotar/Better-Cupid/ for all this and more (or so they tell me).

### Version 0.5.0
6/5/2011

#### General

This version sports a major overhaul to the back-end. It is not 100% complete, but I won't be able to work on it for a few days and I wanted to get it released now rather than delay it for the sake of the couple of things that aren't updated.

I'll spare you the boring details since they were mostly for my benefit, but one big change you can expect to see is that there's no more delay in modifying the page layout. Previously, BetterCupid would wait until the page was finished loading before working its magic, so you would briefly see the standard page, and then things would change. Now, BetterCupid modifies the page as its being built by the browser so that it almost appears as if it was already designed that way. Personally, I think the effect is really slick and well worth the extra effort.

Continue on for a list of the other things to expect in this new version...

#### Move Right With You

- Panels are now less jumpy when moved and they better respect their boundaries. There shouldn't be any more issues where it doesn't move all the way up or moves down too far and lengthens the screen.
- More right-hand panels have been added to the list of moveable panels.

#### Photobrowser

- Thumbnails are bigger and even more visible than before.
- The "Improve matches" and "See more matches" links have been moved up under the thumbnails so that the whole thing takes up that much less space.

#### Bug Fixes

- The photobrowser only affects the home screen now. It was breaking the one on Quick Match. I'll have to handle that one differently.
- The thumbnails on the match search page will no longer get really big and run together when addons are changed. This was happening due to a bug in Chrome (66806). Until it's fixed, I'll have to do all my styling through javascript instead of css.
- The page numbers are back at the bottom of the Match Search page as well as at the top. I never intended to remove them from the bottom, but I accidentally did when I got rid of the options from v0.1.0.

### Version 0.4.0
6/1/2011

#### Bug Fixes

- A search filter will not start running until all the pages have been loaded. This way, everything gets filtered instead of just what's available at the time.
- On the questions page, the loading message will now visibly count all the way up to the last page. Before, it would show like 17/18 and then freeze as it sorted all the questions.

#### Questions

- During the initial load, once it's loaded all the pages, it will now show a message stating that it's sorting all the questions. If there are more than 500 questions to sort, it will also display a message to let you know that it may take awhile and that Chrome may say the page has become unresponsive. Unfortunately, I don't have a better way of searching this much data without freezing the page, but I'll have to work on it.
- A progress bar has been added that'll appear beneath the search box while a search is running. It will disappear when the search has finished.
- When a search is started, any pre-existing results will be faded out to show that they may not be a real result. For instance, take the instance of having 1500 questions to search through. You run search A and questions 1000 and 1200 are visible at the end of it. You then run search B and questions 1000 and 1200 are still on the page because the search algorithm hasn't checked them yet. In order to indicate that they haven't been checked yet, they'll now be faded out and then they'll either be removed or faded back in once the search algorithm reaches them.

### Version 0.3.3
5/26/2011

#### Bug Fixes

- Should no longer crash on the match search page or any other page that has a lengthy page navigation list on it.

### Version 0.3.2
5/25/2011

#### Bug Fixes

- When clicking on the detail pane for the random person on the home page, all clicks were going to the last person instead of the visible person. They should now go to the visible person.

### Version 0.3.1
5/25/2011

#### Bug Fixes

- The homepage now shows the first random person by default instead of the last.
- The last random person on the homepage is no longer shifted 6 pixels to the right.

### Version 0.3.0
5/24/2011

#### Homepage

- The appearance of the random matches at the top has changed significantly. The thumbnail images have been enlarged and move up into two rows, and only one person's details is shown. This area has always bugged me.. the point, I imagine, is to show a bunch of pseudo-random people and perhaps one will catch your eye.. perhaps someone that you don't technically match well with so you wouldn't otherwise normally notice. However, having to scroll the pane defeats the purpose because you only see a handful of them and for the usually short amount of time you spend on the homepage, you may not want to stop and scroll.

#### Questions

- The search box will start executing your search as you type. No more need to hit enter or click that button.

#### Bug Fixes

- The bars in the profile's Personality tab should no longer move when the screen scrolls.
- Hiding people with underscores in thier name on the home screen should now function properly.
- The search feature on the Questions page should work even if there's only one page of questions.
- Features that the user chose to disable in the original version will no longer be disabled. Since the option to enable/disable the features was removed, all features should be on.

### Version 0.2.0
5/12/2011

#### General

I've expanded the Options page to include a Changelog and About section.

A BetterCupid icon has been added. For now, it simply opens up the OkCupid website in a new tab.

Most menus that appear on the right side of the screen will now scroll with the screen. This is handy when answering questions on a person's profile, so that you can see how your numbers are changing without scrolling all the way up and back down.

#### Questions

When answering questions under the "Improve Matches" section, I've noticed that sometimes you can't skip them. Well what's the point of that? Some of those questions are horrible! You can skip any question you want to now.

When you answer a question on someone's profile, your match, friend, and enemy percentages as well as a few other things will update.

Question searches should run faster now.

### Version 0.1.0
5/2/2011

#### Initial Release

I created a basic options page that allows you to enable or disable the various features that this initial release provides. I felt that it was important because I didn't want people's first impressions to be ruined by something being broken, but I'm not sure if I'm going to keep it around. The point of having the extension is to enjoy the experience that it provides, and I can release bug fixes pretty rapidly.

#### Homepage

Sometimes ugly guys show up on my homepage because they're marked as being female. I'm not a big fan of ugly guys. I need a button to hide them!

#### Favorites / Visitors

I was looking at my list of favorites and visitors and wondering how I could better organize all this information. What I ended up doing was making little tables atop each list that would summarize people: how many women and men; how many are straight, gay, or bi; how many in certain age ranges. Not only does it provide this summary, but by clicking on one of the items, you filter the list by it. This way, you can quickly see how many single bisexual women aged 25-29 are in your list.

#### Match Search

With ads, the search fields, and everything else on the screen, I can only see the picture of the first result in a search result. What good is that? I present to you.. the match minibar. Now you can see the picture of each match. Click a picture to scroll down to their details.

To go along with the minibar, I added a page list to the top of the search results. Don't see anyone you like? Click on to the next page without scrolling to the bottom.

#### Questions

One thing that's always frustrated me about the questions is the sort order. When I see someone that I'm interested in, I like to compare our answers to the questions. And when I'm on there answering new questions and flipping through the pages, I start seeing repeats, going back, and seeing questions that weren't there before. I've enhanced the question to load every page at once and show all questions in a consistent order.

Furthermore, the search function will now instantly search by looking for questions that contain the words you enter. Unfortunately, there's no good way to differentiate between an answer choice to a question and so search terms like "important" and "mandatory" will match on every question.
