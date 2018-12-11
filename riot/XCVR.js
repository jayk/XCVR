/* XCVR Riot Mixin
 *
 * Links XCVR into the given tag.  
 *
 * Allows access to XCVR via this.XCVR in the tag
 * Also allows bridging XCVR messages -> tag events as well
 * as tag events -> XCVR messages;
 *
 * To trigger a tag event when an XCVR message is received:
 *
 * this.receive_as_event('xcvr_message_type', 'local_event_name');
 *
 * To send an XCVR message when a local event is triggered:
 *
 * this.send_on_event('local_event_name', 'xcvr_message_type');
 *
 * For general XCVR access, you can simply use this.XCVR
 *
 */
riot.mixin('XCVR', {
    init: function() {
        if (typeof this.XCVR == 'undefined') {
            this.XCVR = XCVR;
        }
    },
    send_on_event: function(event_type, message_type) {
        this.on(event_type, function(notification) {
            this.XCVR.send(message_type, notification)
        }.bind(this));
    },
    receive_as_event: function(message_type, event_type) {
        this.XCVR.receive(message_type, function(notification, type) {
            this.trigger(event_type, notification, type);
        }.bind(this));
    }
});
