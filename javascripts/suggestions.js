/*globals jive */
/*jshint laxcomma:true */

jive.Filters = jive.Filters || {};

/**
 * Handles interacting with a list of selectable items.
 */
jive.Filters.Suggestions = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    jive.conc.observable(this);

    protect.init = function(options) {
        this.content = $(options.content || document);
        this.keyTargets = $(options.keyTargets || this.content);

        this.suggestionSelector = options.suggestionSelector || 'li, tr';
        this.selectedClass = options.selectedClass || 'selected';

        this.keyHandler = this.handleKeydown.bind(this);

        this.bindEvents();
        this.reset();
    };

    this.reset = function() {
        this.resetSelection();
    };

    this.hide = $.noop;

    protect.bindEvents = function() {
        var view = this;

        this.content.on('click', this.suggestionSelector, function(e) {
            view.emitSelection($(this));
            e.preventDefault();
        });

        this.keyTargets.keydown(this.keyHandler);
    };

    protect.handleKeydown = function(event) {
        switch(event.keyCode) {
            case 38:  // UP
                this.selectPrevious();
                event.preventDefault();
                break;
            case 40:  // DOWN
                this.selectNext();
                event.preventDefault();
                break;
            case 9:  // TAB
                this.hide(); //dismiss the dialog and go to the next control.  Don't preventDefault, for accessibility reasons.
                break;
            case 13:  // ENTER
                this.selectCurrent();
                event.preventDefault();
                break;
            case 27:  // ESCAPE
                this.hide();
                event.preventDefault();
                break;
        }
    };

    protect.incrementSelection = function(n) {
        var index = this.selectedIndex + n
          , next = this.content.find(this.suggestionSelector).filter(':visible:eq('+ (index - 1) + ')');

        if (next.length > 0 && index > 0) {
            this.content.find(this.suggestionSelector).removeClass(this.selectedClass);
            next.addClass(this.selectedClass);
            this.selectedIndex = index;
        }
    };

    protect.resetSelection = function() {
        this.selectedIndex = 0;
        this.content.find(this.suggestionSelector).removeClass(this.selectedClass);
    };

    protect.selectNext = function() {
        this.incrementSelection(1);
    };

    protect.selectPrevious = function() {
        this.incrementSelection(-1);
    };

    protect.selectCurrent = function() {
        var view = this;

        var current = this.content.find(this.suggestionSelector).filter(':visible').filter(function() {
            return $(this).hasClass(view.selectedClass);
        }).filter(':first');

        if (current.length > 0) {
            this.emitSelection(current);
        }
    };

    protect.emitSelection = function(elem) {
        var view = this;
        this.emit('selection', elem);
    };
});

