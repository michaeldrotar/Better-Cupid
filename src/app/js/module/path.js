exports = function(path) {
  path = path || '';
  if ( path.substring(0,1) === '/' ) {
    return loc.getResourcePath(path);
  }
  return loc.getResourcePath('/modules/'+this.id) + '/' + path;
};
