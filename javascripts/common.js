/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

var _MAX_STR_LENGTH = 30;

function truncate(string, max){
    max = max || _MAX_STR_LENGTH;
    if (string.length > max)
        return string.substring(0, max )+'...';
    else
        return string;
}

function strip(html)
{
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var displayer = function( options ) {

    options = options || {};

    this.display = function(name, detail) {
        var results = [];

        var fetcherObj = new fetcher( { activeChecker: function() {
            return name;
        }} );

        var extractImage = function( company ) {
            var imageObj = company.image;
            if ( !imageObj ) {
                return;
            }

            var imageArray = imageObj.available_sizes[0];
            if ( !imageArray || imageArray.length < 1 ) {
                return;
            }

            var imageSrc = imageArray[1];
            return "http://www.crunchbase.com/" + imageSrc;
        };

        var preparePeople = function( company ) {
            var people = company.relationships;
            if ( people && people.length > 0 ) {
                var personTemplate = $(".crunchbase-person-template");
                var peopleTemplate = $(".crunchbase-people-template");
                var peopleContainer = peopleTemplate.clone().removeClass("template").show();

                var count = 0;
                $.each( people, function() {
                    var personData = this;
                    if ( count > 4 ) {
                        return;
                    }

                    if ( !personData.is_past ) {
                        count++;
                        var personDom = personTemplate.clone().removeClass("crunchbase-person-template").removeClass("template").show();

                        personDom.find(".person-name").text( personData.person.first_name + " " + personData.person.last_name )
                            .attr("href", "http://www.crunchbase.com/person/" + personData.person.permalink );
                        personDom.find(".person-title").text( personData.title );

                        peopleContainer.find("#people-container").append( personDom );
                    }
                });
                if ( count > 0 ) {
                    return peopleContainer;
                }
            }
        };

        var prepareCommunityConnections = function( company, callback ) {
            var companyName = company.name;

            var usersHandler = function(response) {
                var count = 0;

                if ( response && response.data) {
                    var data = gadgets.views.getParams();

                    var communityMemberTemplate = $(".crunchbase-communitymember-template");
                    var communityMembersTemplate = $(".crunchbase-communitymembers-template");
                    var communityMembersContainer = communityMembersTemplate.find("#communitymember-container").clone();

                    $.each( response.data, function() {
                        var user = this;
                        if ( count < 20 ) {  // show no more than 20
                            var jiveUrl = gadgets.config.get()['jive-opensocial-ext-v1']['jiveUrl'];
                            var profileUrl = jiveUrl + "/people/" + user.username;

                            var communityMemberDom = communityMemberTemplate.find("a").clone();
                            communityMemberDom.attr("href", profileUrl)
                                .click( function(e) {
                                    window.parent.location = profileUrl;
                                    e.preventDefault();
                                }
                            );
                            communityMemberDom.find(".communitymember-avatar")
                                .attr("src", user.avatarURL )
                                .attr("alt", user.name )
                                .attr("title", user.name );

                            communityMembersContainer.append( communityMemberDom );
                            count++;
                        }
                    });
                    callback( count > 0 ? communityMembersContainer : null );
                } else {
                    callback(null);
                }
            };

            // make the query
            osapi.jive.core.users.get({query:companyName}).execute( usersHandler );
        };

        var prepareOffices = function( company ) {
            var offices = company.offices;
            if ( offices && offices.length > 0 ) {

                var officeTemplate = $(".crunchbase-detail-office");
                var officesContainerTemplate = $(".crunchbase-detail-offices");

                var officesContainer = officesContainerTemplate.clone().removeClass("template").show();

                var overflow = offices.length > 3;

                var count = 0;
                $.each( offices, function() {
                    if ( count > 3 ) {
                        return;
                    }
                    count++;
                    var officeData = this;
                    var officeDom = officeTemplate.clone().removeClass("crunchbase-detail-office").removeClass("template").show();
                    officeDom.find("li").hide().find("a").hide();

                    if ( officeData.description ) {
                        if ( overflow ) {
                            var officeDescription = officeDom.find(".office-description-toggle");
                            officeDescription.text( officeData.description );
                            officeDescription.show();
                            officeDescription.click ( function() {
                                var officeDetail = $(this).parent().find("ul");
                                if ( officeDetail.is(":visible") ) {
                                    officeDetail.hide();
                                    gadgets.window.adjustHeight();
                                } else {
                                    officeDetail.show();
                                    gadgets.window.adjustHeight();
                                }
                            });
                        }  else {
                            officeDom.find(".office-description-label").text( officeData.description ).show();
                        }
                    }

                    if ( overflow ) {
                        // no detail if too many offices to show
                        officeDom.find("ul").hide();
                        officeDom.find("#offices-more").show();
                    } else {
                        officeDom.find("#offices-more").hide();
                    }

                    if ( officeData.address1 ) {
                        officeDom.find("li[data-id=address1]").text( officeData.address1 ).show();
                    }
                    if ( officeData.address2 ) {
                        officeDom.find("li[data-id=address2]").text( officeData.address2 ).show();
                    }
                    if ( officeData.city || officeData.state || officeData.state_code || officeData.country_code ) {
                        officeDom.find("li[data-id=city-state-country-zip]").show();
                        if ( officeData.city ) {
                            officeDom.find("span[data-id=city]").text( officeData.city );
                        }
                        if ( officeData.state ) {
                            officeDom.find("span[data-id=state]").text( officeData.state );
                        }
                        if ( officeData.state_code ) {
                            officeDom.find("span[data-id=state_code]").text( officeData.state_code );
                        }
                        if ( officeData.country_code ) {
                            officeDom.find("span[data-id=country_code]").text( officeData.country_code );
                        }
                    }

                    officesContainer.find("#offices-container").append( officeDom );
                });
                return officesContainer;
            }

        };

        var prepareSummary = function( company ) {

            var summaryDom = $(".crunchbase-summary-template").clone();
            summaryDom.removeClass("crunchbase-summary-template").removeClass("template");
            summaryDom.find("li").hide();

            var imageUrl = extractImage(company);
            if ( detail && imageUrl ) {
                summaryDom.find(".company_image").attr("src", imageUrl).show().load( function() {
                    gadgets.window.adjustHeight();
                });
            }

            if ( company.crunchbase_url ) {
                summaryDom.find("li[data-id=crunchbase] a.fld_value").text(truncate(company.crunchbase_url)).attr("href", company.crunchbase_url).parent().show();
            }

            if ( company.homepage_url ) {
                summaryDom.find("li[data-id=website] a.fld_value").text(truncate(company.homepage_url)).attr("href", company.homepage_url).parent().show();
            }

            if ( company.blog_url) {
                summaryDom.find("li[data-id=blog] a.fld_value").text(truncate(company.blog_url)).attr("href", company.blog_url).parent().show();
            }

            if ( company.twitter_username ) {
                summaryDom.find("li[data-id=twitter] span.fld_value").text(company.twitter_username).parent().show();
            }

            if ( company.category_code ) {
                summaryDom.find("li[data-id=category] span.fld_value").text(company.category_code).parent().show();
            }

            if ( company.number_of_employees ) {
                summaryDom.find("li[data-id=employees] span.fld_value").text(company.number_of_employees).parent().show();
            }

            if ( company.founded_year ) {
                summaryDom.find("li[data-id=founded] span.fld_value").text(company.founded_year).parent().show();
            }

            if ( company.description ) {
                summaryDom.find("li[data-id=description] span.fld_value").html(company.description).parent().show();
            }

            // stock
            var stock = company.ipo;
            if ( stock ) {
                var symbol = stock.stock_symbol;
                symbol = symbol.replace("NASDAQ:", "");
                var stockDom = summaryDom.find("li[data-id=stock]").show();
                stockDom.find("#stock-symbol").attr("href", "http://www.google.com/finance?q=" + symbol ).text(symbol);
                var query = "http://www.google.com/finance/info?infotype=infoquoteall&q=" + symbol;
                $.ajax({
                    url: query,
                    dataType: 'jsonp',
                    success: function( response ) {
                        if ( response ) {
                            var stockValue = response[0].l;
                            if ( stockValue ) {
                                stockDom.find("#stock-value").text(response[0].l);
                            }
                        }
                    }
                });
            }

            return summaryDom;
        };

        var showImage = function( company, target, callback ) {
            var imageUrl = extractImage(company);
            if ( imageUrl ) {
                var imageDom = target.find(".company_image").attr("src", imageUrl);
                if ( callback ) {
                    imageDom.load( callback );
                }
            } else {
                target.find(".company_image").hide();
            }
        };

        var showDetail = function( company ) {
            // overview
            var overviewData = company.overview;
            if ( overviewData ) {
                var overviewTemplate = $(".crunchbase-detail-template");
                var overviewDom = overviewTemplate.clone().removeClass("template").removeClass("crunchbase-detail-template").show();
                overviewDom.find("#overview-container").html( overviewData ).truncate({
                    max_length: 1100,
                    onHide: options.onHide,
                    onShow: options.onShow
                });
                overviewDom.find("a").attr("target", "_blank");

                showImage( company, overviewDom );

                $("#detail-container").append(overviewDom);
            }

            // offices
            var officesContainer = prepareOffices( company );
            // people
            var peopleContainer = preparePeople( company );

            if ( officesContainer || peopleContainer ) {
                if ( (officesContainer && peopleContainer) || peopleContainer ) {
                    $("#sidebar-container").append(peopleContainer);
                } else {
                    $("#sidebar-container").append(officesContainer);
                }
            }

            //
            prepareCommunityConnections( company, function( communityMemberContainer ) {
                if ( communityMemberContainer ) {
                    var container = communityMemberContainer.find("#communitymember-container");
                    container.show();
                    $("#communitymembers-placeholder").append( communityMemberContainer );
                    if ( options.onShow ) {
                        options.onShow();
                    }
                }
            } );
      };

    fetcherObj.directFetch( results, name,
        function(result) {
            // success
            var company = result[0];
            fetcherObj.fetchDetails( company.permalink, function(company) {

                if ( options.loadedCallback ) {
                    options.loadedCallback(true);
                }

                var summaryDom = prepareSummary( company ).show();
                if ( detail ) {
                    $("#sidebar-container").html('').append( summaryDom );
                    showDetail( company );
                } else {
                    showImage( company, summaryDom, function() {
                        gadgets.window.adjustHeight();
                    } );
                    $("#display").html('').append( summaryDom );
                }

                if ( options.renderedCallback ) {
                    options.renderedCallback();
                }

                $("#ok").removeClass("disabled").focus();
            },
            function() {
                if ( options.loadedCallback ) {
                    options.loadedCallback(false);
                }
            });
        },
        function() {
            // fail
            if ( options.loadedCallback ) {
                options.loadedCallback(false);
            }
        });
    };

};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var fetcher = function( options ) {

    // initialization
    var maxResults = options.maxResults || 20;
    var activeChecker = options.activeChecker;

    ////////////////////////////////////////
    // public

    this.directFetch = function( result, query, successCallback, failureCallback ) {
        var active = activeChecker();

        if ( !active || active !== query || ( $('#searchinput').length > 0 &&  $('#searchinput').val().length < 1 ) ) {
            return;
        }

        var request = "/companies/permalink?name=" + query;
        osapi.jive.connects.get({
            alias : 'crunchbase',
            headers : { 'Accept' : [ 'application/json' ] },
            href : request
        }).execute(function(response) {
            if (response.error) {
                // Deal with an error scenario ...
                failureCallback();
            } else {
                if ( response.content.length < 1 ) {
                    failureCallback();
                } else {
                    var companyMetadata = response.content;

                    var fetcherObj = new fetcher({});
                    fetcherObj.fetchDetails(companyMetadata.permalink, function(company) {
                        // if there isn't at least the description or URL... its not a real hit, just a placeholder
                        if ( company.homepage_url || company.description ) {
                            successCallback( [companyMetadata] );
                        } else {
                            failureCallback();
                        }
                    },
                    failureCallback );
                }
            }
        });
    };

    this.fetch = function( result, query, page, callback ) {
        var active = activeChecker();
        if ( !active || active !== query || $('#searchinput').val().length < 1 ) {
            return;
        }

        var self = this;

        // try direct search
        self.directFetch( result, query, function(data) {
            // success
            callback( data );
        }, function() {
            // fail - try query search
            var forwardingCallback = function ( result ) {
                callback( result );
            };
            queryFetch( result, query, page, forwardingCallback, function() {
                $("#loading").hide();
                $("#display").html('No results found.');
            });
        } );

    };

    ////////////////////////////////////////
    // private

    var extractHits = function(query, results, hits ) {
        var isMatch = function( target, query ) {
            target = target.toLowerCase();
            query = query.toLowerCase();

            return target.indexOf( query ) > -1;
        };

        $.each( results, function() {
            var r = this;
            if ( r.namespace === "company" ) {
                var name = r.name;
                if ( isMatch( name, query) ) {
                    hits.push( r );
                }
            }
        });
    };

    var queryFetch = function( result, query, page, successCallback, failureCallback  ) {
        var active = activeChecker();

        if ( !active || active !== query || $('#searchinput').val().length < 1 ) {
            return;
        }

        var request = "/search.js?query=" + query + ( page ? ("&page=" + page) : "" );

        osapi.jive.connects.get({
            alias : 'crunchbase',
            headers : { 'Accept' : [ 'application/json' ] },
            href : request
        }).execute( function(response) {
            if (response.error) {
                // Deal with an error scenario ...
                failureCallback();
            } else {
                var results = response.content.results;
                var totalPages = response.content.total;

                if ( results.length > 0 && totalPages > 0 ) {

                    extractHits( query, results, result );

                    if ( result.length < maxResults && page <= Math.min( totalPages, maxResults ) ) {
//                        console.log(
//                            result.length + " : "
//                                + maxResults + " : "
//                                + page + " : "
//                                + totalPages +  " : "
//                                + " fetching <"+ query + ">... " + request );
                        // only fetch more if we're not over the maximum number
                        // of returnable results
                        queryFetch( result, query, page + 1, successCallback, failureCallback );
                    } else {
                        // we're done
                        successCallback( result );
                    }
                } else {
                    successCallback( result );
                }
            }
        });
    };

    this.fetchDetails = function( permalink, success, failure ) {

        var request = "/company/" + permalink + ".js";

        osapi.jive.connects.get({
            alias : 'crunchbase',
            headers : { 'Accept' : [ 'application/json' ] },
            href : request
        }).execute(function(response) {
            if (response.error) {
                // Deal with an error scenario ...
                // xxx todo error?
                failure();
            } else {
                success( response.content );
            }
        });
    };


};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var searchSetup = function( options ) {

    var active = '';

    var buildSourceArray = function( results ) {
        var sourceArray = [];
        $.each( results, function() {
            var result = this;
            sourceArray.push( result.name );
        });
        return sourceArray;
    };

    var typeAhead = $('#searchinput').typeahead({
        onselect: function(obj) {
            $('#searchinput').val(obj);
            active = obj;

            if ( options.onSelectCallback ) {
                options.onSelectCallback(obj);
            }
        }
    });

    typeAhead.on('keyup',
        function(ev) {
            if ($('#searchinput').val() === '') {
                if ( options.onBlankSearchInput ) {
                    options.onBlankSearchInput();
                }
            }

            ev.stopPropagation();
            ev.preventDefault();

            //filter out up/down, tab, enter, and escape keys
            if ($.inArray(ev.keyCode, [40, 38, 9, 13, 27]) === -1) {

                var self = $(this);

                //set typeahead source to empty
                self.data('typeahead').source = [];

                //active used so we aren't triggering duplicate keyup events
                if (!self.data('active') && self.val().length > 0) {
                    var query = $(this).val();

                    if ( query === active ) {
                        return;
                    }

                    active = query;

                    var fetcherObj = new fetcher( { activeChecker: function() {
                        return active;
                    }} );

                    if ( options.onStartSearch ) {
                        options.onStartSearch();
                    }

                    fetcherObj.fetch( [], query, 1, function(result) {
                        if ( options.onCompleteSearch ) {
                            options.onCompleteSearch();
                        }

                        //set this to true when your callback executes
                        self.data('active', true);

                        //set your results into the typehead's source
                        var typeAhead = self.data('typeahead');
                        typeAhead.source =  buildSourceArray( result );

                        //trigger keyup on the typeahead to make it search
                        self.trigger('keyup');

                        //All done, set to false to prepare for the next remote query.
                        self.data('active', false);

                        if ( options.onDropDownBuilt ) {
                            options.onDropDownBuilt(result);
                        }

                    } );
                }

            } else if (ev.keyCode == 13) {
                active = $('#searchinput').val();
            }

            if ( $('#searchinput').val().length < 1 ) {
                $("#loading").hide();
            }
        }
    );


};
