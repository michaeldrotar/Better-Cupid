exports = {
  id: 'recentlyVisited',
  name: 'Recently Visited',
  description: 'Provides enhanced functionality for the list of Recently Visited members, including the ability to store and maintain more than just the past 8 visitors.',
  //needs: [ 'forgetMeNot' ],
  required: false,
  defaults: {
    max: 50,
    visible: 20,
    log: []
  },
  properties: {
    itemHeight: 50
  },
  init: function() {
    var section = $('#recently_visited'),
        visitedList = section.find('.visited-list');
    if ( section.length ) {
      this.itemHeight(section.find('.visited-list-item').outerHeight(true));
      this.updateLog(section);
      this.injectTemplate(section);
      this.enabled.subscribe(function(enabled) {
        if ( enabled ) {
          if ( this.visible() === 0 ) {
            section.hide();
          } else {
            visitedList.hide();
          }
          $('.bc-visited-list-container').show();
        } else {
          section.show();
          visitedList.show();
          $('.bc-visited-list-container').hide();
        }
      }.bind(this));
      this.visible.subscribe(function(visible) {
        if ( this.enabled() ) {
          if ( this.visible() === 0 ) {
            section.hide();
          } else {
            section.show();
          }
        }
      }.bind(this));
    }
  },
  updateLog: function(section) {
    // Iterate all the ones that okcupid shows, starting at the bottom,
    // and moving them to the top of the list so that it ends up
    // in the same order without any dupes
    var log = this.log(),
        max = this.max();

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
    if ( this.visible() === 0 ) {
      section.hide();
    } else {
      section.find('.visited-list').hide();
      bc.template.inject(section, 'bc-recently-visited-log-template', this);
    }
  }
};
