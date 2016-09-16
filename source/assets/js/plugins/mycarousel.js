;(function($, window, undefined) {
  var pluginName = 'mycarousel';
  var timerTransition;

  var getMaxMeasureItems = function(items, type) {
    var max = 0;
    if(type) {
      items.each(function() {
        max = Math.max(max, this[type]);
      });
    }
    return max;
  };

  var setupCarousel = function(el, options) {
    var wrapCarousel = el.find('.wrap'),
        ulCarousel = el.find('.list-item'),
        items = ulCarousel.children(),
        totalItem = items.length,
        extraWidth, realWidth;

    options.width = options.width || getMaxMeasureItems(items, 'clientWidth');
    options.height = options.height || getMaxMeasureItems(items, 'clientHeight');
    options.extraWidth = items.first().outerWidth(true) - options.width;
    realWidth = options.width + options.extraWidth;

    wrapCarousel.width(realWidth * options.slides);
    wrapCarousel.height(options.height);
    items.width(options.width);
    ulCarousel.addClass('transition').width(totalItem * realWidth);
  };

  var getPosition = function(el, type, currentIndex, totalItem, isLoop, slides) {
    var pos;

    if(type === 'next') {
      if(currentIndex === totalItem - slides) {
        pos = isLoop ? 0 : currentIndex;
      } else {
        pos = currentIndex + 1;
      }
    } else if(type === 'prev') {
      if(currentIndex === 0) {
        pos = isLoop ? totalItem - slides : currentIndex;
      } else {
        pos = currentIndex - 1;
      }
    } else {
      var index = el.data('goTo');
      if(index === 'first') {
        pos = 0;
      } else if(index === 'last') {
        pos = totalItem - slides;
      } else {
        pos = index - 1;
      }
    }

    return pos;
  };

  var actionSlide = function(el, type, options) {
    var ulCarousel = el.find('.list-item'),
        items = ulCarousel.children(),
        totalItem = items.length,
        currentItem = ulCarousel.children('.active').length ? ulCarousel.children('.active') : items.first(),
        currentIndex = currentItem.index(),
        realWidth = options.width + options.extraWidth,
        newPos;

    newPos = getPosition(el, type, currentIndex, totalItem, options.isLoop, options.slides);
    if(newPos === currentIndex) { return; }

    options.onBeforeTransition.call(this, el, newPos);
    items.removeClass('active');
    items.eq(newPos).addClass('active');

    if(Site.isIE() && Site.isIE() <= 9) {
      ulCarousel.stop().animate({'marginLeft': - realWidth * newPos}, options.speed, options.onAfterTransition(el, newPos));
    } else {
      ulCarousel.css('marginLeft', - realWidth * newPos);
      clearTimeout(timerTransition);
      timerTransition = setTimeout(function() {
        options.onAfterTransition.call(this, el, newPos);
      }, Site.transitionTime);
    }

    if(options.pagination) {
      el.find('.pagination [data-paginate]').removeClass('active');
      el.find('.pagination [data-paginate="' + parseInt(newPos + 1) + '"]').addClass('active');
    }
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this,
          el = that.element,
          options = that.options;

      that.generate();

      if(options.control) {
        var controls = el.find('.controls li a');
        controls.off('click.controlCarousel').on('click.controlCarousel', function(e) {
          e.preventDefault();
          that[$(this).data('control')]();
        });
      }

      if(options.pagination) {
        var pagination = el.find('.pagination li a');
        pagination.off('click.pageCarousel').on('click.pageCarousel', function(e) {
          e.preventDefault();
          that.goTo($(this).data('paginate'));
        });
      }
    },
    generate: function() {
      if(this.isInit) { return; }
      setupCarousel(this.element, this.options);
      this.isInit = true;
    },
    next: function() {
      actionSlide(this.element, 'next', this.options);
    },
    prev: function() {
      actionSlide(this.element, 'prev', this.options);
    },
    goTo: function(index) {
      var el = this.element;
      el.data('goTo', index);
      actionSlide(el, 'goTo', this.options);
    },
    destroy: function() {
      var that = this,
          el = that.element,
          options = that.options;

      if(options.control) {
        el.find('.controls li a').off('click.controlCarousel');
      }
      if(options.pagination) {
        el.find('.pagination li a').off('click.pageCarousel');
      }

      el.find('.wrap').removeAttr('style');
      el.find('.list-item').removeClass('transition').removeAttr('style').children().removeAttr('style');

      $.removeData(this.element[0], pluginName);
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      } else {
        window.console && console.log(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
      }
    });
  };

  $.fn[pluginName].defaults = {
    slides: 1,
    speed: 600,
    width: 0,
    height: 0,
    isLoop: false,
    control: true,
    pagination: false,
    onBeforeTransition: function() {},
    onAfterTransition: function() {}
  };

}(jQuery, window));
