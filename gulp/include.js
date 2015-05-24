var fs      = require('fs'),
    gulp    = require('gulp'),
    path    = require('path'),
    through = require('through2'),
    handlers;

function getCmdRe(cmd) {
  return [
    new RegExp('(?:\\/\\*|<!--)\\s+'+cmd+'\\s*\\(?(.+?)\\)?\\s+(?:-->|\\*\\/)', 'g'),
    new RegExp('\\b'+cmd+'\\s*\\((.+?)\\)', 'g')
  ];
}

function getFiles(str, relPath, opts) {
  return str.trim().split(/\s+/g).map(function(str) {
    return str.trim().replace(/[^\w\.\/\*]+/g, '');
  }).map(function(str) {
    if ( str.indexOf('/') === 0 ) {
      return path.join(opts.rootPath, str);
    } else {
      return path.join(relPath, str);
    }
  });
}

function getFileContents(files, opts, callback) {
  var contents = [],
      isGlob = false,
      src;
  src = gulp.src(files);
  if ( opts.pipes ) {
    opts.pipes.forEach(function(pipe) {
      src = src.pipe(pipe);
    });
  }
  src = src.pipe(through.obj(function(file, enc, cb) {
    process(file, opts, function(str) {
      if ( opts.item ) {
        if ( typeof opts.item === 'function' ) {
          str = opts.item(str, file);
        } else {
          if ( opts.item.pre ) {
            str = opts.item.pre + str;
          }
          if ( opts.item.post ) {
            str = str + opts.item.post;
          }
        }
      }
      contents.push(str);
      cb();
    });
  }, function() {
    if ( contents.length ) {
      if ( contents.length > 1 ) {
        contents = contents.join(opts.glob.sep || '\n')
        if ( opts.glob.pre ) {
          contents = opts.glob.pre + contents;
        }
        if ( opts.glob.post ) {
         contents = contents + opts.glob.post;
       }
      } else {
        contents = contents[0];
      }
    } else {
      console.warn('Did not find a file for ', files);
      contents = '';
    }
    callback(contents);
  }));
};

function processMatches(matches, contents, opts, cb) {
  var match = matches.shift();
  if ( match ) {
    getFileContents(match.filenames, opts, function(matchContents) {
      contents = contents.substring(0, match.position)
        + matchContents
        + contents.substring(match.position + match.length);
      processMatches(matches, contents, opts, cb);
    });
  } else {
    cb(contents);
  }
}

function process(file, opts, cb) {
  var contents = String(file.contents),
      dirname  = path.dirname(file.path);

  var matches = [];
  getCmdRe(opts.cmd).forEach(function(re) {
    contents.replace(re, function(match, filenames, position) {
      matches.push({
        position: position,
        length: match.length,
        filenames: getFiles(filenames, dirname, opts)
      });
    });
  });

  matches.sort(function(a,b) {
    return b.position - a.position;
  });

  processMatches(matches, contents, opts, cb);
}

module.exports = function(opts) {
  return through.obj(function(file, enc, cb) {
    var self = this;
    if ( !file.isBuffer() ) {
      if ( file.isStream() ) {
        this.emit('error', new Error('Streaming not supported'));
      }
      return cb();
    }
    if ( !opts ) {
      opts = {};
    }
    if ( !opts.cmd ) {
      opts.cmd = 'include';
    }
    if ( !opts.item ) {
      opts.item = {};
    }
    if ( !opts.glob ) {
      opts.glob = {};
    }
    opts.cache = {};
    process(file, opts, function(contents) {
      file.contents = new Buffer(contents);
      self.push(file);
      cb();
    });
  });
};
