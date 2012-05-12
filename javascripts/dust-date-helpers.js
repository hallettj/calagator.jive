/*globals dust */
/*jshint laxcomma:true */

(function() {
    dust.helpers.dayOfWeek = function(chunk, context) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          , n = toDate(context.stack.head).getDay()
          , day = days[n];

        chunk.write(day);
        return chunk;
    };

    dust.helpers.shortDate = function(chunk, context) {
        var date = toDate(context.stack.head);

        dust.helpers.monthShort(chunk, context);
        chunk.write(' ');
        dust.helpers.date(chunk, context);

        if (date.getFullYear() !== (new Date()).getFullYear()) {
            chunk.write(', '+ date.getFullYear());
        }

        return chunk;
    };

    dust.helpers.monthShort = function(chunk, context) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          , n = toDate(context.stack.head).getMonth()
          , month = months[n];

        chunk.write(month);
        return chunk;
    };

    dust.helpers.date = function(chunk, context) {
        var date = toDate(context.stack.head).getDate();
        chunk.write(date);
        return chunk;
    };

    dust.helpers.hour = function(chunk, context) {
        var h = parseInt(toDate(context.stack.head).getHours(), 10);
        chunk.write(h === 0 ? 12 : h % 12);
        return chunk;
    };

    dust.helpers.meridian = function(chunk, context) {
        var h = parseInt(toDate(context.stack.head).getHours(), 10);
        chunk.write(h < 12 ? 'am' : 'pm');
        return chunk;
    };

    dust.helpers.toLowerCase = function(chunk, context, bodies) {
        return chunk.capture(bodies.block, context, function(out, c) {
            c.write(out.toLowerCase());
            c.end();
        });
    };

    dust.helpers.paragraph = function(chunk, context, bodies) {
        return chunk.capture(bodies.block, context, function(out, c) {
            var pars = out.replace(/\n\s*\n/, '</p><p>');

            c.write('<p>'+ pars +'</p>');
            c.end();
        });
    };

    function toDate(v) {
        return v instanceof Date ? v : new Date(Date.parse(v));
    }
})();
