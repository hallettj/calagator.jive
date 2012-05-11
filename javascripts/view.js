gadgets.util.registerOnLoadHandler(function() {
    opensocial.data.getDataContext().registerListener('org.opensocial.ee.context',
        function(key) {
            $("#loading").hide();
            var context = opensocial.data.getDataContext().getDataSet(key);
            if (context && context.target && context.target.context && context.target.context.company) {
                var company = context.target.context.company;
                var displayerObj = new displayer();
                displayerObj.display(company, true);
            }
        });
});

