(function () {
  'use strict';
  // Provides utilities to deal with website/app urls. Provides functionality
  // for deep-linking Ajax calls, and a url mapper to generate dynamic urls.
  function crossing() {
    this._urls = {};
    this._compiled = {};
    this._lastHash = '';
    this._nameMatcher = new RegExp('<([a-zA-Z0-9-_%]{1,})>', 'g');

    this._getArgs = function(urlName, path) {
      var args = {};
      var nameMatches = this._urls[urlName].match(this._nameMatcher);
      var valueMatches = path.match(this._compiled[urlName]);
      if (nameMatches) {
        var i, len, arg;
        for (i=0, len=nameMatches.length; i<len; i+=1) {
          arg = nameMatches[i].substring(1, nameMatches[i].length-1);
          args[arg] = valueMatches[i+1];;
        }
      }
      return args;
    };

    this._getName = function(path) {
      if (!path) {
        return;
      }
      for (url in this._compiled) {
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
    for (url in urls) {
      if (urls.hasOwnProperty(url)) {
        this._compiled[url] = new RegExp('^' + urls[url].replace(this._nameMatcher, "([a-zA-Z0-9-_%]{0,})") + '$');
      }
    }
    this._urls = urls;
    return this;
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
    if (!path) {
      throw('URL not found: ' + name);
    }
    var _path = path;
    var key;
    for (key in kwargs) {
      if (kwargs.hasOwnProperty(key)) {
      if (!path.match('<' + key +'>')) {
        throw('Invalid parameter ('+ key +') for '+ name);
      }
      path = path.replace('<' + key +'>', kwargs[key]);
      }
    }

    var missingArgs = path.match(this._nameMatcher);
    if (missingArgs) {
      throw('Missing arguments (' + missingArgs.join(", ") + ') for url ' + _path);
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
    //console.log(url + ' => ' + urlName);
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

