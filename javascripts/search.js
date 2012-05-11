/*globals gadgets osapi */
/*jshint laxcomma:true */

gadgets.util.registerOnLoadHandler(function() {
    var $ = jQuery
      , $form = $('#search')
      , $searchInput = $form.find('input[type="search"]');

    (function setupForm() {
        $searchInput.focus();

        $form.submit(function(event) {
            event.preventDefault();

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
        });
    })();

    /*
    function searchSetup(options) {
        $searchInput.typeahead({
            onselect: function(obj) {
                $searchInput.val(obj);
            }
        });
    }
    */





    //////////////////////////////////////////////////////////////////

    /*
    $(document).ready(function() {
        // focus on load
        window.setTimeout( function() {
            window.focus();
            $('#searchinput').focus();
        }, 500);

        var searchSetupObj = new searchSetup( {
            onSelectCallback: function( company ) {
                $("#loading").show();

                var displayerObj = new displayer({
                    loadedCallback: function(success) {
                        $("#loading").hide();
                        if ( !success ) {
                            $("#display").html('');
                            $('#ok').addClass("disabled");
                            gadgets.window.adjustHeight();
                        }
                    }
                });
                displayerObj.display(company);
            },
            onBlankSearchInput: function() {
                $("#display").html('');
                $('#ok').addClass("disabled");
                gadgets.window.adjustHeight();
            },
            onStartSearch: function() {
                $("#loading").show();
                $("#display").hide();
                $("#display").html('');
            },
            onCompleteSearch: function() {
                $("#loading").hide();
                $("#display").show();
            },
            onDropDownBuilt: function(result ) {
                if( result.length > 0 ) {
                    window.setTimeout( function() {
                        if (result.length > 2 ) {
                            if ( result.length < 4 ) {
                                gadgets.window.adjustHeight( 210 );
                            } else {
                                gadgets.window.adjustHeight(result.length > 4 ? 295 : 250 );
                            }
                        }
                    }, 200);
                } else {
                    gadgets.window.adjustHeight();
                }
            }
        });

        $("#ok").click( function() {
            if (!$("#ok").hasClass("disabled")) {
                var company = $('#searchinput').val();

                osapi.jive.core.container.closeApp({
                    data:{
                        display: {
                            type:"text",
                            icon: "/images/crunchbase-16x16.png",
                            label: company
                        },
                        target: {
                            type: "embed",
                            view: "embedded.view",
                            context: {
                                company: company
                            }
                        }
                    }
                });
            }
        });


    });
    */



});
