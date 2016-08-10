(function () {
  'use strict';
  // Provides utilities to deal with website/app urls. Provides functionality
  // for deep-linking Ajax calls, and a url mapper to generate dynamic urls.
  function crossing(nameMatcher, ignoreTrailingSlash) {
    if (!(this instanceof crossing)) {
      throw new Error('Crossing can not be called without instatiation. Please use "new Crossing()" instead');
    }
    this._urls = {};
    this._compiled = {};
    this._lastHash = '';
    this._ignoreTrailingSlash = !!ignoreTrailingSlash;
    if (nameMatcher) {
      this._nameMatcher = nameMatcher;
    } else {
      this._nameMatcher = new RegExp('<([a-zA-Z0-9-_%]{1,})>', 'g');
    }

    this._getArgs = function(urlName, path) {
      var args = {};
      var valueMatches = path.match(this._compiled[urlName]);
      var i=0;
      var match = this._nameMatcher.exec(this._urls[urlName]);
      while(match && match.length === 2 && valueMatches.length + 1 > i) {
        var arg = match[1];
        args[arg] = valueMatches[++i];
        match = this._nameMatcher.exec(this._urls[urlName]);
      }
      return args;
    };

    this._getName = function(path) {
      if (!path) {
        return;
      }
      for (var url in this._compiled) {
        if (path.match(this._compiled[url])) {
          return url;
        }
      }
      return;
    };
  }

  // Loads a set of urls names and paths
  // @method load
  // @static
  // @param {Object} urls an Object literal with names and paths like
  // {'taskEdit': '/task/edit/<taskId>/', 'taskCreate': '/task/create/'}
  // @return {Object} this for method chaining
  crossing.prototype.load = function(urls) {
    var endMatcher = this._ignoreTrailingSlash ? '/?$' : '$';

    for (var url in urls) {
      if (urls.hasOwnProperty(url)) {
        this._compiled[url] = new RegExp('^' + urls[url].replace(this._nameMatcher, "([a-zA-Z0-9-_%]{0,})") + endMatcher);
      }
    }
    this._urls = urls;
    return this;
  };

  crossing.prototype._getPathByKwargs = function(name, kwargs) {
    var path = this._urls[name];
    var matcher = this._nameMatcher;

    if (kwargs) {
      var args = path.match(matcher);
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var match = args[i];
          var arg = match.replace(matcher, '$1');
  
          if (typeof kwargs[arg] === 'undefined') {
            throw new Error('Missing parameter (' + arg + ') for ' + name);
          }
  
          path = path.replace(match, kwargs[arg]);
        }
      }
    }

    return path;
  };

  crossing.prototype._getPathByArgs = function(name, args) {
    var path = this._urls[name];
    var keys = path.match(this._nameMatcher);
    for (var $x = 1; $x < args.length; $x+=1) {
      path = path.replace(keys[$x-1], args[$x]);
    }
    return path;
  };

  // Returns a url from the list that matches the specified parameters.
  // A non-existant url will raise an exception.
  // @method get
  // @static
  // @param {string} name: url name to call
  // @param {string} kwargs: an option object literal with key/value
  //  that can be used to get urls that require parameters
  // @return {String} url path
  crossing.prototype.get = function(name, kwargs) {
    var path = this._urls[name];
    if (!this._urls[name]) {
      throw new Error('URL not found: ' + name);
    }
    var _path = path;

    if (!kwargs || Object.prototype.toString.call(kwargs) === '[object Object]') {
      path = this._getPathByKwargs(name, kwargs);
    } else {
      path = this._getPathByArgs(name, arguments);
    }

    var missingArgs = path.match(this._nameMatcher);
    if (missingArgs) {
      throw new Error('Missing arguments (' + missingArgs.join(", ") + ') for url ' + _path);
    }

    return path;
  };

  // Recieves a url path, and returns a url object with the name and
  // variables if there is match in the url list
  // @method resolve
  // @static
  // @param {String} path the url path
  // @return {Object/undefined} url object or undefined
  crossing.prototype.resolve = function(path) {
    var url = {};
    var urlName;
    var kwargs;
    urlName = this._getName(path);
    if (urlName) {
      kwargs = this._getArgs(urlName, path);
      url['name'] = urlName;
      url['kwargs'] = kwargs;
      return url;
    }
    return;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = crossing;
  } else {
    window.crossing = crossing;
  }
})();
