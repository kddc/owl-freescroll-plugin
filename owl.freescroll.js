/**
 * Freescroll Plugin
 * @version 0.0.1
 * @author Julian Tiemann
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the navigation plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Freescroll = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Indicates whether the plugin is initialized or not.
		 * @protected
		 * @type {Boolean}
		 */
		this._initialized = false;

		/**
		 * The current paging indexes.
		 * @protected
		 * @type {Array}
		 */
		this._controls = {};

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this._core.$element;

    this._navigation = this._core._plugins.navigation;

		this.enabled = null;

		/**
		 * Overridden methods of the carousel.
		 * @protected
		 * @type {Object}
		 */
		this._overrides = {};

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && !this._initialized) {
					this._core.trigger('initialize', null, 'freescroll');
					this._core.trigger('initialized', null, 'freescroll');
				}
			}, this),
      'initialized.owl.carousel.navigation': $.proxy(function(e) {
				this._controls = this._core._plugins.navigation._controls;
        this._overrides["next"] = this._navigation.next;
        this._overrides["prev"] = this._navigation.prev;
        this._overrides["to"] = this._navigation.to;
        this.initialize();
				this.checkFreeScroll();
        this._initialized = true;
        this._core.trigger('initialized', null, 'freescroll');
      }, this),
			'resized.owl.carousel': $.proxy(function(e) {
				this.checkFreeScroll();
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Freescroll.Defaults, this._core.options);

		// register event handlers
		this.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 * @todo Rename `slideBy` to `navBy`
	 */
	Freescroll.Defaults = {
    freeScroll: 'false'
	};

	/**
	 * Initializes the layout of the plugin and extends the carousel.
	 * @protected
	 */
	Freescroll.prototype.initialize = function() {
		var override,
			settings = this._core.settings;
    // override public methods of the carousel
		// for (override in this._overrides) {
    //   this._core[override] = $.proxy(this[override], this);
		// }

    this._controls.$next.off('click').on("click", $.proxy(function(e) {
      this.next(this._core.settings.navSpeed);
    }, this));

    this._controls.$previous.off('click').on("click", $.proxy(function(e) {
      this.prev(this._core.settings.navSpeed);
    }, this));
	};

	Freescroll.prototype.checkFreeScroll = function() {
		if(this._core.settings.freeScroll && !this.enabled) {
      this.enableFreeScroll();
    } else if(!this._core.settings.freeScroll && this.enabled){
      this.disableFreeScroll();
    }
	}

	/**
	 * Destroys the plugin.
	 * @protected
	 */
	Freescroll.prototype.destroy = function() {
		var handler, override;

		for (handler in this._handlers) {
			this.$element.off(handler, this._handlers[handler]);
		}
		for (override in this.overides) {
			this._core[override] = this._overrides[override];
		}
	};

	/**
	 * Slides to the next item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Freescroll.prototype.next = function(speed) {
    $.proxy(this._overrides.next, this._navigation)(150);
	};

	/**
	 * Slides to the previous item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Freescroll.prototype.prev = function(speed) {
    $.proxy(this._overrides.prev, this._navigation)(150);
	};

  /**
	 * Slides to the previous item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Freescroll.prototype.to = function(position, speed, standard) {
    var coords = this._core.coordinates(position);
    this.$element.find(".owl-stage-outer").animate({scrollLeft: Math.abs(coords)}, this._core.settings.navSpeed);
    //$.proxy(this._overrides.to, this._navigation)(position, speed, standard);
	};

  Freescroll.prototype.enableFreeScroll = function(){
    this._core.$stage.off('touchstart');
    this._core.$stage.parent(".owl-stage-outer").addClass("freeScroll").attr("style", "overflow-x:scroll;-webkit-overflow-scrolling: touch;");
    this._core.$stage.css("transform", "translate3d(0,0,0)");
    this._core.$stage.find(".cloned").each(function(e) {
      var $stage = $(this).parent();
      $stage.width($stage.width() - $(this).outerWidth());
      $(this).remove();
    });
		this.enabled = true;
  }

  Freescroll.prototype.disableFreeScroll = function() {
    this._core.$stage.on('touchstart', $.proxy(function(event) { this.eventsRouter(event) }, this._core));
    this._core.$stage.parent(".owl-stage-outer").scrollLeft(0);
    this._core.$stage.parent(".owl-stage-outer").removeClass("freeScroll").attr("style", "overflow-x:hidden;");
		this.enabled = false;
  }

	$.fn.owlCarousel.Constructor.Plugins.Freescroll = Freescroll;

})(window.Zepto || window.jQuery, window, document);
