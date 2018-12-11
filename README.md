# XCVR

XCVR (pronounced Tranz-see-ver) is a message channel for sending 
messages within an application.

It is designed to work in both node.js and in browser.  

It is intended to be used as a communications channel between 
various elements of an application. It provides a mechanism
for subscribing to and sending messages with a named type and 
an optional message payload (which can be a string, or a more
complex type such as an object)

Messages can be sent by one portion of a system without knowing
what might be listening for that message. Likewise, messages
can be received without advanced knowledge of what the origin
of the message is. 

This makes XCVR and ideal mechanism for providing loose coupling
between application components. 

## Usage


    // In browser the initial XCVR object is created for you.
    // In node.js, however, you have to create an XCVR object
    var xcvr = require('XCVR');
    var XCVR = new xcvr();

    // set up a receiver for a particular message 
    XCVR.receive('greeting_message', function greeting_handler(msg) {
        console.log('received message:' + msg);
    });

    // send a message
    XCVR.send('greeting_message', "Hi there");

    // listen for a particular message type only once:
    XCVR.receive_once('link_terminated', function(msg) {
        console.log('our link was terminated, shutting down');
        do_shutdowny_things();
    });

    // Remove a message receiver we added earlier
    XCVR.remove_receiver('greeting_message', greeting_handler)
    

The `XCVR` object acts as a transciever and is used to send and
receive messages across the application.  Sent messages are 
delivered automatically to anything that is listening for that 
type of message.  

The messages are delivered asyncronously, so the call to send 
the message returns immediately, prior to each message recipient
being called. Messages are also protected against receivers 
exceptions, that is to say that if there is an exception in a receiver
it will not stop or otherwise prevent delivery to other receivers 
of the same message type;

In the browser environment, a usable `XCVR` is created automatically.  
This XCVR object can then be used by whatever code needs to send
and receive messages.  

In the node.js environment, you can create multiple XCVR objects if 
you choose.  When you do this, each XCVR object creates an 
independent communication channel, which is completely isolated 
from other XCVR objects.


