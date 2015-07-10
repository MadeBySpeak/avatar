  let Avatar, chai, chaiAsPromised, expect, jsdom, md5, should, sinon, sinonChai;

  if (typeof require !== "undefined" && require !== null) {
    sinon = require('sinon');
    sinonChai = require('sinon-chai');
    chai = require('chai');
    chaiAsPromised = require('chai-as-promised');
    jsdom = require('mocha-jsdom');
    Avatar = require('../build/avatar').Avatar;
    md5 = require('MD5');
    should = chai.should();
    expect = chai.expect;
    chai.should();
    chai.use(sinonChai);
    chai.use(chaiAsPromised);
    jsdom();
  } else {
    Avatar = window.Avatar;
    sinon = window.sinon;
  }

  describe("Avatar", function() {
    var avatar, gravatar_timeout, image, old_md5;
    avatar = image = null;
    gravatar_timeout = 1600;
    before(function() {
      image = document.createElement('img');
      image.id = 'avatar-1';
      image.alt = '';
      image.name = 'avatar-1';
      image.width = 80;
      image.height = 80;
      document.body.appendChild(image);
      image = document.getElementById('avatar-1');
    });
    afterEach(function() {
      avatar = null;
    });
    describe('#constructor', function() {
      it('should throw an error without an element', function() {
        Avatar.should["throw"](Error);
        Avatar.should["throw"]('No image element provided.');
      });
      it('should render', function() {
        avatar = new Avatar(image);
        avatar.settings.useGravatar.should.be["true"];
      });
      it('should allow options', function() {
        avatar = new Avatar(image, {
          useGravatar: false
        });
        avatar.settings.useGravatar.should.not.be["true"];
      });
      it('should allow Gravatar fallbacks', function() {
        avatar = new Avatar(image, {
          useGravatar: true,
          allowGravatarFallback: true
        });
        avatar.settings.useGravatar.should.be["true"];
        avatar.settings.allowGravatarFallback.should.be["true"];
      });
      it('should render a canvas', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          initials: 'MC'
        });
        avatar.settings.useGravatar.should.not.be["true"];
        avatar.settings.useGravatar.should.not.equal('MC');
      });
    });
    describe('#setSource', function() {
      it('should set the src attribute', function() {
        avatar = new Avatar(image);
        avatar.setSource('data:image/png;');
        image.src.should.equal('data:image/png;');
        avatar.setSource('http://placekitten.com/200/300');
        image.src.should.equal('http://placekitten.com/200/300');
        avatar.setSource();
        image.src.should.equal('http://placekitten.com/200/300');
      });
    });
    describe('#initialAvatar', function() {
      beforeEach(function() {
        avatar = new Avatar(image);
      });
      if ((typeof window !== "undefined" && window !== null) && document.createElement('canvas').getContext && document.createElement('canvas').getContext('2d')) {
        it('should return a PNG', function() {
          let png = avatar.initialAvatar('MC', avatar.settings);
          png.should.match(/^data:image\/png;base64,iV/);
        });
      }
    });
    describe('#githubAvatar', function() {
      beforeEach(function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          github_id: 67945
        });
      });
      it('should return a GitHub Avatar URL', function() {
        let github_url = avatar.githubAvatar({
          github_id: 67945,
          size: 80
        });
        github_url.should.match(/https:\/\/avatars[0-3].githubusercontent.com\/u\/67945\?v=3&s=[0-9]{1,4}/i);
      });
    });
    describe('#avatarsioAvatar', function() {
      it('should return an Avatars.io Avatar URL', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          use_avatars_io: true,
          avatars_io: {
            user_id: 12345,
            identifier: 'custom-id',
            size: 'small'
          }
        });
        let github_url = avatar.avatarsioAvatar({
          avatars_io: {
            user_id: 12345,
            identifier: 'custom-id',
            size: 'small'
          }
        });
        github_url.should.equal('http://avatars.io/12345/custom-id?size=small');
      });
      it('should return an Avatars.io Avatar URL with a custom size', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          use_avatars_io: true,
          avatars_io: {
            user_id: 12345,
            identifier: 'custom-id',
            size: 'medium'
          }
        });
        let github_url = avatar.avatarsioAvatar({
          avatars_io: {
            user_id: 12345,
            identifier: 'custom-id',
            size: 'medium'
          }
        });
        github_url.should.equal('http://avatars.io/12345/custom-id?size=medium');
      });
      it('should return an Avatars.io Facebook Avatar URL', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          use_avatars_io: true,
          avatars_io: {
            facebook: 'matthew.callis',
            size: 'small'
          }
        });
        let github_url = avatar.avatarsioAvatar({
          avatars_io: {
            facebook: 'matthew.callis',
            size: 'small'
          }
        });
        github_url.should.equal('http://avatars.io/facebook/matthew.callis?size=small');
      });
      it('should return an Avatars.io Twitter Avatar URL', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          use_avatars_io: true,
          avatars_io: {
            twitter: 'superfamicom',
            size: 'small'
          }
        });
        let github_url = avatar.avatarsioAvatar({
          avatars_io: {
            twitter: 'superfamicom',
            size: 'small'
          }
        });
        github_url.should.equal('http://avatars.io/twitter/superfamicom?size=small');
      });
      it('should return an Avatars.io Instagram Avatar URL', function() {
        avatar = new Avatar(image, {
          useGravatar: false,
          use_avatars_io: true,
          avatars_io: {
            instagram: 'matthewcallis',
            size: 'small'
          }
        });
        let github_url = avatar.avatarsioAvatar({
          avatars_io: {
            instagram: 'matthewcallis',
            size: 'small'
          }
        });
        github_url.should.equal('http://avatars.io/instagram/matthewcallis?size=small');
      });
    });
    describe('#gravatarUrl', function() {
      it('should return a Gravatar URL with an email address', function() {
        avatar = new Avatar(image, {
          email: 'test@test.com'
        });
        if (!(window && window.md5)) {
          avatar.md5 = md5;
        }
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/b642b4217b34b1e8d3bd915fc65c4452?s=80&d=mm&r=x');
      });
      it('should return a Gravatar URL with an hash', function() {
        avatar = new Avatar(image, {
          hash: 'b642b4217b34b1e8d3bd915fc65c4452'
        });
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/b642b4217b34b1e8d3bd915fc65c4452?s=80&d=mm&r=x');
      });
      it('should return a Gravatar URL with nothing', function() {
        avatar = new Avatar(image);
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=mm&r=x');
      });
      it('should return a Gravatar URL with a custom size', function() {
        avatar = new Avatar(image, {
          size: 100
        });
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=100&d=mm&r=x');
        avatar = new Avatar(image, {
          size: '100'
        });
        url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=100&d=mm&r=x');
        avatar = new Avatar(image, {
          size: 0
        });
        url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=mm&r=x');
        avatar = new Avatar(image, {
          size: 4000
        });
        url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=mm&r=x');
      });
      it('should return a Gravatar URL with a custom fallback', function() {
        avatar = new Avatar(image, {
          fallback: 'test'
        });
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=test&r=x');
      });
      it('should return a Gravatar URL with a custom rating', function() {
        avatar = new Avatar(image, {
          rating: 'g'
        });
        let url = avatar.gravatarUrl(avatar.settings);
        url.should.equal('https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=mm&r=g');
      });
    });
    if ((typeof window !== "undefined" && window !== null) && (window.Image != null)) {
      describe('#gravatarValid', function() {
        var call_spy, error_spy, load_spy;
        this.timeout(16000);
        avatar = load_spy = error_spy = call_spy = null;
        describe('Invalid Gravatar Hash', function() {
          before(function(done) {
            avatar = new Avatar(image, {
              useGravatar: true,
              hash: '00000000000000000000000000000000'
            });
            call_spy = sinon.spy(avatar, 'gravatarValid');
            load_spy = sinon.spy(avatar, 'gravatarValidOnLoad');
            error_spy = sinon.spy(avatar, 'gravatarValidOnError');
            avatar.gravatarValid({
              hash: '00000000000000000000000000000000'
            });
            setTimeout(done, gravatar_timeout);
          });
          it('should return an error', function() {
            call_spy.callCount.should.equal(1);
            load_spy.callCount.should.equal(0);
            error_spy.callCount.should.equal(1);
          });
        });
        describe('Valid Gravatar Hash', function() {
          before(function(done) {
            avatar = new Avatar(image, {
              useGravatar: true,
              hash: '12929016fffb0b3af98bc440acf0bfe2'
            });
            call_spy = sinon.spy(avatar, 'gravatarValid');
            load_spy = sinon.spy(avatar, 'gravatarValidOnLoad');
            error_spy = sinon.spy(avatar, 'gravatarValidOnError');
            avatar.gravatarValid({
              hash: '12929016fffb0b3af98bc440acf0bfe2'
            });
            setTimeout(done, gravatar_timeout);
          });
          it('should not return an error', function() {
            call_spy.callCount.should.equal(1);
            load_spy.callCount.should.equal(1);
            error_spy.callCount.should.equal(0);
          });
        });
        describe('Invalid Gravatar Email', function() {
          before(function(done) {
            avatar = new Avatar(image, {
              useGravatar: true,
              email: 'test@test.com'
            });
            if (!(window && window.md5)) {
              avatar.md5 = md5;
            }
            call_spy = sinon.spy(avatar, 'gravatarValid');
            load_spy = sinon.spy(avatar, 'gravatarValidOnLoad');
            error_spy = sinon.spy(avatar, 'gravatarValidOnError');
            avatar.gravatarValid({
              email: 'test@test.com'
            });
            setTimeout(done, gravatar_timeout);
          });
          it('should return an error', function() {
            call_spy.callCount.should.equal(1);
            load_spy.callCount.should.equal(0);
            error_spy.callCount.should.equal(1);
          });
        });
        describe('Valid Gravatar Email', function() {
          before(function(done) {
            avatar = new Avatar(image, {
              useGravatar: true,
              email: 'matthew@apptentive.com'
            });
            if (!(window && window.md5)) {
              avatar.md5 = md5;
            }
            call_spy = sinon.spy(avatar, 'gravatarValid');
            load_spy = sinon.spy(avatar, 'gravatarValidOnLoad');
            error_spy = sinon.spy(avatar, 'gravatarValidOnError');
            avatar.gravatarValid({
              email: 'matthew@apptentive.com'
            });
            setTimeout(done, gravatar_timeout);
          });
          it('should not return an error', function() {
            call_spy.callCount.should.equal(1);
            load_spy.callCount.should.equal(1);
            error_spy.callCount.should.equal(0);
          });
        });
      });
    }
    describe('#gravatarValidOnLoad', function() {
      var call_spy, load_spy;
      this.timeout(16000);
      call_spy = load_spy = null;
      before(function(done) {
        avatar = new Avatar(image, {
          useGravatar: false
        });
        call_spy = sinon.spy(avatar, 'gravatarValidOnLoad');
        load_spy = sinon.spy(avatar, 'setSource');
        avatar.gravatarValidOnLoad();
        setTimeout(done, gravatar_timeout);
      });
      it('should call gravatarUrl with settings', function() {
        call_spy.callCount.should.equal(1);
        load_spy.callCount.should.equal(1);
      });
    });
    describe('#gravatarValidOnError', function() {
      var call_spy, init_spy, load_spy;
      beforeEach(function() {
        avatar = new Avatar(image, {
          useGravatar: false
        });
        call_spy = sinon.spy(avatar, 'gravatarValidOnError');
        load_spy = sinon.spy(avatar, 'setSource');
        init_spy = sinon.spy(avatar, 'initialAvatar');
      });
      it('should draw an avatar if we have initials', function() {
        avatar.settings.initials = 'MCFUCKYEAH';
        avatar.gravatarValidOnError();
        call_spy.callCount.should.equal(1);
        load_spy.callCount.should.equal(1);
        init_spy.callCount.should.equal(1);
      });
      it('should use the fallback image without initials', function() {
        avatar.settings.initials = '';
        avatar.gravatarValidOnError();
        call_spy.callCount.should.equal(1);
        load_spy.callCount.should.equal(1);
        init_spy.callCount.should.equal(0);
      });
    });
    describe('#merge', function() {
      it('should merge objects', function() {
        var defaults, options, output;
        avatar = new Avatar(image);
        defaults = {
          useGravatar: true,
          allowGravatarFallback: false,
          initials: '',
          initial_fg: '#888',
          initial_bg: '#f4f6f7',
          initial_size: null,
          initial_weight: 100,
          initial_font_family: "'Lato', 'Lato-Regular', 'Helvetica Neue'",
          hash: '00000000000000000000000000000000',
          email: null,
          size: 80,
          fallback: 'mm',
          rating: 'x',
          forcedefault: false,
          fallbackImage: '',
          debug: false,
          github_id: null,
          use_avatars_io: false,
          avatars_io: {
            user_id: null,
            identifier: null,
            twitter: null,
            facebook: null,
            instagram: null
          }
        };
        options = {
          useGravatar: false,
          allowGravatarFallback: true,
          initials: 'MDC',
          initial_fg: '#111',
          initial_bg: '#222',
          initial_size: 1,
          initial_weight: 2,
          initial_font_family: 'Comic Sans',
          hash: '00000000000000000000000000000000',
          email: 'matthew@apptentive.com',
          size: 120,
          fallback: 'mm',
          rating: 'pg',
          forcedefault: true,
          fallbackImage: 'nah',
          debug: false,
          github_id: 1,
          use_avatars_io: true,
          avatars_io: {
            user_id: 1,
            identifier: 2,
            twitter: 3,
            facebook: 4,
            instagram: 5
          }
        };
        output = avatar.merge(defaults, options);
        output.should.deep.equal(options);
      });
    });
    if ((typeof window !== "undefined" && window !== null) && (window.md5 != null)) {
      old_md5 = window.md5;
      after(function() {
        window.md5 = old_md5;
      });
      describe('#md5', function() {
        it('should have an md5 function', function() {
          var md5_sum;
          avatar = new Avatar(image);
          md5_sum = avatar.md5('test');
          md5_sum.should.equal('098f6bcd4621d373cade4e832627b4f6');
        });
        it('should fall back to a default when there is no global md5', function() {
          var md5_sum;
          window.md5 = null;
          avatar = new Avatar(image);
          md5_sum = avatar.md5('test');
          md5_sum.should.equal('00000000000000000000000000000000');
        });
      });
    }
    if (typeof jQuery === 'function' && typeof window === 'object') {
      describe('#jQueryHelper', function() {
        it('should create an avatar with options', function() {
          $('#avatar-1').avatar({
            useGravatar: false,
            initials: 'MC'
          });
          $('#avatar-1').attr('src').should.match(/^data:image\/png;base64,iV/);
        });
      });
    }
  });
