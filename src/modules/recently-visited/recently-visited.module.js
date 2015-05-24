exports = {
  id: 'recentlyVisited',
  name: 'Recently Visited',
  description: 'Provides enhanced functionality for the list of Recently Visited members, including the ability to store and maintain more than just the past 8 visitors.',
  //needs: [ 'forgetMeNot' ],
  required: false,
  defaults: {
    maxCount: 50,
    visibleCount: 20
  }
};
