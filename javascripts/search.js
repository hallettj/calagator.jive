/*globals gadgets osapi jive dust */
/*jshint laxcomma:true */

gadgets.util.registerOnLoadHandler(function() {
    var $ = jQuery
      , $form = $('#search')
      , $searchInput = $form.find('input[type="search"]')
      , $results = $('#display')
      , $spinner = $('#loading-container *');

    (function setupForm() {
        $searchInput.focus();

        $form.submit(function(event) {
            event.preventDefault();
            console.log('submit');

            /*
            var query = $searchInput.val();

            osapi.jive.core.container.closeApp({
                data:{
                    display: {
                        type:"text",
                        icon: "/images/crunchbase-16x16.png",
                        label: query
                    },
                    target: {
                        type: "embed",
                        view: "embedded.view",
                        context: {
                            company: query
                        }
                    }
                }
            });
            */
        });
    })();

    (function searchSetup() {
        var typeahead = new jive.TypeaheadInput($searchInput);

        typeahead.addListener('change', function(query) {
            showSpinner();

            search(query).then(function(results) {
                var events = results.map(Event)
                  , now = new Date()
                  , currentEvents = events.filter(function(e) { return e.end_time >= now; })
                  , pastEvents = events.filter(function(e) { return e.end_time < now; });

                dust.render("search-result/list", {
                    currentEvents: currentEvents,
                    pastEvents: pastEvents
                }, function(err, out) {
                    if (err) {
                        throw err;
                    }

                    $results.html(out);
                    gadgets.window.adjustHeight();
                });

                console.log('results', results);

            }).always(function() {
                hideSpinner();
            });
        });

        typeahead.addListener('clear', function() {
            dust.render("search-result/list", {
                currentEvents: [], pastEvents: []
            }, function(err, out) {
                if (err) {
                    throw err;
                }
                $results.html(out);
                gadgets.window.adjustHeight();
            });
        });
    })();

    (function searchResultsSetup() {
        var suggestions = new jive.Filters.Suggestions({
            suggestion: '.event_table .vevent',
            keyTargets: document
        });

        suggestions.addListener('selection', function(elem) {
            console.log('selected!', elem);
            suggestions.reset();

            var summary = $(elem).find('.summary')
              , title = summary.text()
              , url = summary.attr('href');

            osapi.jive.core.container.closeApp({
                data:{
                    display: {
                        type:"text",
                        icon: "/images/calagator-16x16.png",
                        label: title
                    },
                    target: {
                        type: "embed",
                        view: "embedded.view",
                        context: {
                            title: title,
                            self: url
                        }
                    }
                }
            });
        });
    })();

    function search(query) {
        return $.getJSON('http://calagator.org/events/search.json?utf8=%E2%9C%93&callback=?', {
            query: query
        });
    }

    function Event(data) {
        var event = Object.create(data);

        event.type = 'event';
        event.self = 'http://calagator.org/events/'+ encodeURIComponent(event.id);

        event.start_time = new Date(Date.parse(data.start_time));
        event.end_time = new Date(Date.parse(data.end_time));
        event.start_time.toString = function() { return data.start_time; };
        event.end_time.toString = function() { return data.end_time; };

        if (data.venue) {
            event.venue = new Venue(data.venue);
        }

        return event;
    }

    function Venue(data) {
        var venue = Object.create(data);
        venue.self = 'http://calagator.org/venues'+ encodeURIComponent(venue.id);
        return venue;
    }

    function showSpinner() {
        $spinner.show();
    }

    function hideSpinner() {
        $spinner.hide();
    }

    function sortBy(field, array) {
        var f = typeof field === 'function' ? field : function(a, b) {
            var aF = a[field], bF = b[field];
            return aF < bF ? -1 : (bF < aF ? 1 : 0);
        };
        return array.sort(f);
    }
});
