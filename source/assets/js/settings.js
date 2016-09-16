/**
 * @name Site
 * @description Define global variables and functions
 * @version 1.0
 */
var Site = (function($, window, undefined) {
  var that = {};
  that.transitionTime = 600;

  that.isIE = function() {
    var currentNav = navigator.userAgent.toLowerCase();
    return (currentNav.indexOf('msie') !== -1) ? parseInt(currentNav.split('msie')[1]) : false;
  };

  that.transitionPage = function() {
    var body = $('body'),
        menuEl = $('#footer .main-menu a'),
        moduleEl = $('.module'),
        currentHash = window.location.hash,
        currentPage;

    menuEl.off('click.transitionPage').on('click.transitionPage', function() {
      var self = $(this),
          contentEl = $(self.attr('href')),
          currentPage = self.attr('href').substring(1);

      menuEl.removeClass('active');
      self.addClass('active');

      if(contentEl.length) {
        moduleEl.not(contentEl).removeAttr('style');
        contentEl.css('marginLeft', 0);
        body.removeClass().addClass(currentPage);
      }
    });

    if(currentHash.length > 1) {
      currentPage = currentHash.substring(1);
      $('#link-to-' + currentPage).trigger('click.transitionPage');
      body.removeClass().addClass(currentPage);
    } else {
      $('#link-to-home').trigger('click.transitionPage');
    }
  };

  that.tabContent = function() {
    var tabEl = $('[data-tabcontent]');

    if(tabEl.length) {
      var contentTab = $('.tabs .tab');
      tabEl.off('click.changeTab').on('click.changeTab', function(e) {
        e.preventDefault();
        var self = $(this),
            activeTab = $(self.data('tabcontent'));

        tabEl.removeClass('active');
        self.addClass('active');
        contentTab.removeAttr('style');
        activeTab.css('marginLeft', 0);
      });

      tabEl.each(function() {
        var self = $(this);
        if(self.hasClass('active')) {
          self.trigger('click.changeTab');
        }
      });
    }
  };

  return that;
})(jQuery, window);

jQuery(function() {
  Site.transitionPage();
  Site.tabContent();
});

window.onload = function() {
  var urlContestJson = '../data/contest-data.json';
  var generateContestTpl = function(data) {
    var html = '<ul>';
    for(var i=0, length = data.length; i < length; i++) {
      html += '<li><a class="link-contest-detail" data-fancybox-type="ajax" href="' + data[i].href + '" title="' + data[i].title + '"><img src="' + data[i].image + '" alt="' + data[i].title + '"></a>' + data[i].captions + '</li>';
    }
    html += '</ul>';
    return html;
  };

  $('#submission [data-mycarousel]').mycarousel({
    isLoop: true,
    control: true,
    pagination: true,
    onBeforeTransition: function(el, index) {
      var currentItem = el.find('.list-item > li').eq(index);
      if(currentItem.hasClass('empty-content')) {
        $.getJSON(urlContestJson, function(data) {
          currentItem.removeClass('empty-content').html(generateContestTpl(data.contest));
        });
      }
    }
  });

  $('#carousel [data-mycarousel]').mycarousel({
    slides: 4,
    width: 155,
    height: 275
  });

  $(".link-contest-detail").fancybox({
    wrapCSS     : 'popup-contest-detail',
    padding     : 0,
    margin      : 0,
    maxWidth    : 830,
    maxHeight   : 374,
    fitToView   : false,
    width       : 830,
    height      : 374,
    autoSize    : false,
    closeClick  : false,
    helpers:  {
      title:  null
    },
    afterShow: function() {
      $(".wrap-comment").mCustomScrollbar({
        axis:"y",
        theme:"rounded-dots",
      });
    }
  });

  $(".link-to-register").fancybox({
    wrapCSS     : 'popup-register',
    padding     : 0,
    margin      : 0,
    maxWidth    : 363,
    maxHeight   : 490,
    fitToView   : false,
    width       : 363,
    height      : 490,
    autoSize    : false,
    closeClick  : false,
    closeBtn    : false,
    helpers:  {
      title:  null
    }
  });
};
