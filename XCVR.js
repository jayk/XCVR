/*
 *
 * XCVR - Simple JS message transciever
 *
 * Simple message relay system for JS events.
 *
 * Basic functionality:
 *
 * Add a message handler 
 * Send a message
 * Remove a message handler
 * Execute a message handler once
 * 
 *
 */
function __xcvr() {

    var handlers = {};
    var once_handlers = {};
    var sync = false;

    function add_handler(msg_type, func, once) {
        var handler_group = handlers;
        if (once === true) {
            handler_group = once_handlers;
        }
        if (!Array.isArray(handler_group[msg_type])) {
            handler_group[msg_type] = [];
        }
        handler_group[msg_type].push(func);
    }

    function remove_handler(handler_list, func) {
        if (Array.isArray(handler_list)) {
            while(current_handler_index  < handler_list.length) {
                if (handler_list[current_handler_index] === func) {
                    handler_list.splice(current_handler_index, 1);
                } else {
                    count++;
                }
            }
        }
    }

    function fault_tolerant_handler_call(func, message, message_type) {
       try {
            func(message, message_type);
       } catch(error) {
            console.warn("XCVR error when processing '" + message_type + "'", error);
       }
    }

    function send_message(message_type, message, func, synchronous) {
        if (synchronous) {
            fault_tolerant_handler_call(func, message, message_type);
        } else {
            setTimeout(function() {
                fault_tolerant_handler_call(func, message, message_type);
           }, 0);
        }
    }

    function handle_message(msg_type, message, synchronous) {
        // get to a real true/false value
        synchronous = !!synchronous
        if (Array.isArray(handlers[msg_type])) {
            handlers[msg_type].forEach(function(func) {
                try {
                    send_message(msg_type, message, func, synchronous)
                } catch(error) {
                    console.warn("error when processing message: " + msg_type, error);
                }
            });
        }

        // Once callbacks only happen one time, so we handle them slightly differently
        if (Array.isArray(once_handlers[msg_type])) {
            while(once_handlers[msg_type].length) {
                handler = once_handlers[msg_type].shift();
                try {
                    send_message(msg_type, message, handler, synchronous)
                } catch(error) {
                    console.warn("error when processing message: " + msg_type, error);
                }
            }

        }
    }

    this.send = function(message_type, message) {
        handle_message(message_type, message, sync);
    }

    this.receive = function(message_type, func) {
        add_handler(message_type, func, false);
    }

    this.receive_once = function(message_type, func) {
        add_handler(message_type, func, true);
    }

    this.remove_receiver = function(message_type, func) {
        if (Array.isArray(handlers[message_type])) {
            remove_handler(handlers[message_type], func);
        }
        if (Array.isArray(once_handlers[message_type])) {
            remove_handler(once_handlers[message_type], func);
        }

    }
    this.set_synchronous_delivery = function(synchronous_delivery) {
        sync = !!synchronous_delivery;
    }
    this.get_new_xcvr = function() {
        return new __xcvr();
    }
}

if (typeof(module) !== 'undefined') {
    module.exports = __xcvr;
} else {
    var XCVR = new __xcvr();
}
