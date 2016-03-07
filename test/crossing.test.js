var expect = require('chai').expect;
var Crossing = require('../crossing');

describe("Crossing Tests", function() {

  var urlList = {};

  beforeEach(function() {
    urlList = {
      'discussion:detail': '<team_slug>/<discussion_id>/<slug>/',
      'search': 'search/',
      'team:detail': '<slug>/',
      'api:lastread': '/api/v2/discussion/<discussion_id>/read/'
    };
  });

  afterEach(function() {
    urlList = {};
  });

  describe("#new Crossing()", function() {
    it('can be instantiated', function() {
      var urls = new Crossing();
      expect(urls).to.be.ok;
    });
    it('cannot be used without instantiation', function() {
      expect(Crossing).to.throw('Crossing can not be called without instatiation. Please use "new Crossing()" instead');
    });
  });

  describe("#load()", function() {
    var urls = new Crossing();

    it("loads a set of urls", function(){
      urls.load(urlList);
      expect(urls).to.be.ok;
    });
    it("has the right number of compiled urls", function() {
      expect(Object.keys(urls._compiled)).to.have.length(4);
    });
    it("has the urls properly matching the regular expressions", function() {
      expect('test/test2/test-3/'.match(urls._compiled['discussion:detail'])).to.have.length(4);
    });
  });

  describe("#get() with kwargs", function() {
    var urls = new Crossing();

    it("can get urls without parameters", function () {
      urls.load(urlList);
      expect(urls.get('search')).to.equal('search/');
    });
    it("can get urls with one parameter", function () {
      expect(urls.get('team:detail', {'slug': 'loop'})).to.equal('loop/');
    });
    it("can get urls with multiple parameters", function () {
      expect(urls.get('discussion:detail', {'team_slug': 'loop', 'discussion_id': '3', 'slug': 'discussion'})).to.equal('loop/3/discussion/');
    });
    it("can not get urls with missing parameters", function () {
      try {
        var url = urls.get('discussion:detail');
        expect(url).to.not.be.ok;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal("Missing arguments (<team_slug>, <discussion_id>, <slug>) for url <team_slug>/<discussion_id>/<slug>/");
      }
    });
  });


  describe("#get() with args", function() {
    var urls = new Crossing();

    it("can get urls with one parameter at the start", function () {
      urls.load(urlList);
      expect(urls.get('team:detail', 'loop')).to.equal('loop/');
    });
    it("can get urls with one numeric parameter at the middle", function () {
      urls.load(urlList);
      expect(urls.get('api:lastread', 16468)).to.equal('/api/v2/discussion/16468/read/');
    });
    it("can get urls with multiple parameters", function () {
      expect(urls.get('discussion:detail', 'loop', '3', 'discussion')).to.equal('loop/3/discussion/');
    });
    it("can not get urls with missing parameters", function () {
      try {
        var url = urls.get('discussion:detail', 'loop');
        expect(url).to.not.be.ok;
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.equal("Missing arguments (<discussion_id>, <slug>) for url <team_slug>/<discussion_id>/<slug>/");
      }
    });
  });

  describe("#resolve()", function() {
    var urls = new Crossing();

    it("can resolve urls with parameters", function () {
      urls.load(urlList);
      var resolved = urls.resolve('loop/23/discussion-name/');
      expect(resolved.name).to.equal('discussion:detail');
      expect(Object.keys(resolved.kwargs).length).to.equal(3);
      expect(resolved.kwargs.team_slug).to.equal('loop');
      expect(resolved.kwargs.discussion_id).to.equal('23');
      expect(resolved.kwargs.slug).to.equal('discussion-name');
    });
    it("can resolve urls without parameters", function () {
      urls.load(urlList);
      expect(urls.resolve('search/').name).to.equal('search');
      expect(Object.keys(urls.resolve('search/').kwargs).length).to.equal(0);
    });

  });

  describe("#override matched param format", function () {
    var urls = new Crossing(new RegExp(':([a-zA-Z0-9-_%]{1,})', 'g'));
    var reactRouterPaths = {
      'discussion:detail': ':team_slug/:discussion_id/:slug/',
      'search': 'search/',
      'team:detail': ':slug/',
    };

    it("can resolve urls with parameters", function () {
      urls.load(reactRouterPaths);
      var resolved = urls.resolve('loop/23/discussion-name/');
      expect(resolved.name).to.equal('discussion:detail');
      expect(Object.keys(resolved.kwargs).length).to.equal(3);
      expect(resolved.kwargs.team_slug).to.equal('loop');
      expect(resolved.kwargs.discussion_id).to.equal('23');
      expect(resolved.kwargs.slug).to.equal('discussion-name');
    });
    it("can resolve urls without parameters", function () {
      urls.load(reactRouterPaths);
      expect(urls.resolve('search/').name).to.equal('search');
      expect(Object.keys(urls.resolve('search/').kwargs).length).to.equal(0);
    });

    it("can get urls with one parameter", function () {
      expect(urls.get('team:detail', {'slug': 'loop'})).to.equal('loop/');
    });

    it("can get urls with multiple parameters", function () {
      expect(urls.get('discussion:detail', {'team_slug': 'loop', 'discussion_id': '3', 'slug': 'discussion'})).to.equal('loop/3/discussion/');
    });
  });

});
