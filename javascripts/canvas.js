/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

gadgets.util.registerOnLoadHandler(function() {

    $(document).ready(function() {
        // focus on load
        window.setTimeout( function() {
            window.focus();
            $('#searchinput').focus();
            gadgets.window.adjustHeight();
        }, 1000);

        var showPreview = function() {
            $("#preview-image").show();
            $("#display").hide();
        };

        var showCompany = function() {
            $("#preview-image").hide();
            $("#display").show();
        };

        var searchSetupObj = new searchSetup( {
            onSelectCallback: function(company) {

                $("#loading").show();

                var displayerObj = new displayer({
                    onShow: gadgets.window.adjustHeight,
                    onHide: gadgets.window.adjustHeight,
                    loadedCallback: function(success) {
                        if ( success ) {
                            $("#loading").hide();

                            $(".display-container").html("");

                            // if successfully loaded, then hide the preview image
                            showCompany();
                        } else {
                            $("#loading").hide();

                            $("#searchinput").val("");

                           // restore preview image on error
                            showPreview();
                            gadgets.window.adjustHeight();
                        }
                    },
                    renderedCallback: gadgets.window.adjustHeight
                });
                displayerObj.display(company, true);
            },
            onBlankSearchInput: function() {
                $(".display-container").html("");

                showPreview();
                gadgets.window.adjustHeight();
            },
            onStartSearch: function() {
                $("#loading").show();
            },
            onCompleteSearch: function() {
                $("#loading").hide();
            },
            onDropDownBuilt: function(result) {
                $("#loading").hide();
            }
        });


    });

});
