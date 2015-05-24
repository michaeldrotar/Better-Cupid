exports = {
  id: 'recentlyVisited',
  name: 'Recently Visited',
  description: 'Provides enhanced functionality for the list of Recently Visited members, including the ability to store and maintain more than just the past 8 visitors.',
  //needs: [ 'forgetMeNot' ],
  required: false,
  defaults: {
    maxCount: 50,
    visibleCount: 20,
    log: []
  },
  properties: {
    containerHeight: function() {
      var visible = this.visibleCount(),
          itemHeight = $('#recently_visited .visited-list-item').outerHeight();
      if ( !itemHeight || itemHeight < 10 ) {
        itemHeight = 71;
      }
      return itemHeight * visible;
    }
  },
  init: function() {
  },
  runScript: function() {
    var section = $('#recently_visited');
    if ( section.length ) {
      this.updateLog(section);
      this.injectTemplate(section);
    }
  },
  updateLog: function(section) {
    // Iterate all the ones that okcupid shows, starting at the bottom,
    // and moving them to the top of the list so that it ends up
    // in the same order without any dupes
    var log = this.log(),
        max = this.maxCount();

    util.each(section.find('.visited-list-item'), -1, function(element) {
      var item = $(element),
          visit = {
            url: item.find('.username a').attr('href').replace(/\?.+$/, ''),
            image: item.find('.user_image img').attr('src'),
            username: item.find('.username').text(),
            age: item.find('.age').text(),
            location: item.find('.location').text()
          };

      // Remove any dupes already existing the log
      log = util.remove(log, function(old_visit) {
        return visit.url === old_visit.url;
      });

      // Add the visit to the beginning of the log
      log.unshift(visit);
    });

    // Pop excess items off the end
    while ( log.length > max ) {
      log.pop();
    }

    // Update log
    this.log(log);
  },
  injectTemplate: function(section) {
    if ( this.visibleCount() === 0 ) {
      section.hide();
    } else {
      section.find('.visited-list').hide();
      bc.template.inject(section, 'bc-recently-visited-log-template', this);
    }
  }
};
