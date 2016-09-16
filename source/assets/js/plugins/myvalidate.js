/**
 *  @name Validation
 *  @description plugin validate form
 *  @version 1.0
 */
;(function($, window, undefined) {
  var pluginName = 'validation';

  var getOptions = function(data) {
    var options = {};

    var parseOptions = function(optionKey, optionData) {
      var options = {};

      if(/^(messages)/gi.test(optionKey)) {
        var objMessage = {},
            messageOption = 'messages',
            messageRule = optionKey.split(messageOption)[1];
        objMessage[messageRule.toLowerCase()] = optionData;
        options[messageOption] = objMessage;
      }
      else if(optionKey === 'rules') {
        var objRules = {},
            ruleArray = optionData.split(','),
            ruleArrayLength = ruleArray.length,
            i;

        for(i = 0; i < ruleArrayLength; i++) {
          var ruleValue = ruleArray[i].trim();
          objRules[ruleValue] = ruleValue;
          options[optionKey] = objRules;
        }
      }

      return options;
    };

    for(var key in data) {
      options = $.extend(true, options, parseOptions(key, data[key]));
    }

    return options;
  };

  var getAttributeOptions = function(element) {
    var el = $(element),
        options = {}, rules = {},
        type = element.type;

    if(type === 'email') {
      rules[type] = type;
    }

    if(el.attr('required')) {
      rules['required'] = 'required';
    }

    options.rules = rules;

    return options;
  };

  var setTagRule = function(element, options) {
    $(element).off('change.validate').on('change.validate', function() {
      isCheckTagRule(element, options);
    });
  };

  var isCheckTagRule = function(element, options) {
    var elValue = element.value.replace(/\s+/g, '');

    for(var rule in options.rules) {
      var errorMessage;
      removeErrorMessage(element);

      if(!isCheckRules(rule, elValue)) {
        errorMessage = options.messages ? (options.messages[rule] || L10n.messages[rule]) : L10n.messages[rule];
        addErrorMessage(element, errorMessage);
        return false;
      }
    }

    return true;
  };

  var isCheckRules = function(rule, value) {
    if(value) {
      if(rule === "email" && !isValidEmail(value)) {
        return false;
      }
    } else if(rule === "required") {
      return false;
    }

    return true;
  };

  var getErrorPosition = function(el) {
    var currentPos = el.offset(),
        parentPos = el.parents('.row').offset(),
        elH = el.height();
    return {
      top: currentPos.top - parentPos.top + (elH / 2),
      left: currentPos.left - parentPos.left + 10
    };
  };

  var addErrorMessage = function(element, message, position) {
    var el = $(element),
        pos = getErrorPosition(el),
        errorEl;

    errorEl = $('<span class="message error" style="top:' + pos.top + 'px; left: ' + pos.left + 'px">' + message + '</span>');
    position = position || 'after';
    el.addClass('field-error');
    errorEl.off('mouseenter mouseleave').on('mouseenter mouseleave', function() {
      errorEl.off().remove();
    });
    el[position](errorEl);
  };

  var removeErrorMessage = function(element) {
    $(element).removeClass('field-error').next('.error').remove();
  };

  var isValidEmail = function(email) {
    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this,
          form = that.element;

      that.validate();
      form.off('submit.' + pluginName).on('submit.' + pluginName, function() {
        if(!that.validate('submit')) {
          return false;
        }
      });
    },
    validate: function(params) {
      var that = this,
          form = that.element,
          isValidate = true;

      form.find(':input').each(function() {
        if(!/^(submit|button)$/.test(this.type)) {
          var options = $.extend(
            true,
            getAttributeOptions(this),
            getOptions(this.dataset),
            getOptions(that.options[this.name])
          );

          if(params === "submit") {
            if(!isCheckTagRule(this, options)) {
              isValidate = false;
            }
          } else {
            setTagRule(this, options);
          }
        }
      });

      return isValidate;
    },
    destroy: function() {
      this.element.off('submit.' + pluginName);
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
        window.console && console.log(
          options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized'
        );
      }
    });
  };

  $.fn[pluginName].defaults = {};

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]();
  });

}(jQuery, window));
