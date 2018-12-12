var xcvr = require('../XCVR.js');

var assert = require('assert');
describe('XCVR', function() {

    describe('Basics', function() {

        it('Creating a XCVR works', function() {
            var XCVR = new xcvr();
            assert.equal(typeof XCVR, 'object');
            assert.equal(typeof XCVR.send, 'function');
            assert.equal(typeof XCVR.receive, 'function');
            assert.equal(typeof XCVR.receive_once, 'function');
            assert.equal(typeof XCVR.remove_receiver, 'function');
            assert.equal(typeof XCVR.set_synchronous_delivery, 'function');
        });

        it('Add a reciever works', function() {
            var XCVR = new xcvr();
            var received_message = false;
            XCVR.receive('greeting', function(message) {
               receive_message = true;
            });
        });

        it('Add a one-time reciever works', function() {
            var XCVR = new xcvr();
            var received_message = false;
            XCVR.receive_once('greeting', function(message) {
               receive_message = true;
            });
        });

        it('Calling send works', function() {
            var XCVR = new xcvr();
            var received_messages = [];
            XCVR.send('hi_there', { count: 17 });
        });

    });

    describe('Normal Usage', function() {
        it('Sent messages are received', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];
            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
                assert.deepEqual(received_messages, ['hi there'])
                done(); 
            });
            XCVR.send('greeting', 'hi there');
        });

        it('Message sending is asynchronous', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];
            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
                assert.deepEqual(received_messages, ['bye','hi there'])
                done(); 
            });
            XCVR.send('greeting', 'hi there');
            received_messages.push('bye');
            assert.deepEqual(received_messages, ['bye']);
        });

        it('Message sending triggers multiple receivers', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];
            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
            });
            XCVR.receive('greeting', function(message) {
                received_messages.push("a " + message); 
            });
            XCVR.send('greeting', 'hi there');
            received_messages.push('bye');
            assert.deepEqual(received_messages, ['bye']);
            setTimeout(function() {
                assert.deepEqual(received_messages, ['bye','hi there', 'a hi there']);
                done();
            }, 100);
        });

        it('Message sending triggers only the appropriate receivers', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];

            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
            });

            XCVR.receive('salutations', function(message) {
                received_messages.push("a " + message); 
            });

            XCVR.send('greeting', 'hi there');
            received_messages.push('bye');
            assert.deepEqual(received_messages, ['bye']);

            setTimeout(function() {
                assert.deepEqual(received_messages, ['bye','hi there']);
                done();
            }, 100);
        });

        it('Receive_once triggers only once', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];

            XCVR.receive_once('greeting', function(message) {
                received_messages.push(message); 
            });

            XCVR.receive('salutations', function(message) {
                received_messages.push("a " + message); 
            });

            XCVR.send('greeting', 'hi there');
            XCVR.send('greeting', "What's up");

            received_messages.push('bye');

            assert.deepEqual(received_messages, ['bye']);

            setTimeout(function() {
                assert.deepEqual(received_messages, ['bye','hi there']);
                done();
            }, 100);
        });
    });

    describe('Synchronization and fault tolerance', function() {

        it('Message delivery is synchronous when sync is enabled', function(done) {
            var XCVR = new xcvr();
            XCVR.set_synchronous_delivery(true);
            var received_messages = [];
            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
                assert.deepEqual(received_messages, ['hi there'])
                done(); 
            });

            XCVR.send('greeting', 'hi there');
            received_messages.push('bye');

            assert.deepEqual(received_messages, ['hi there', 'bye']);
        });


        it('Message delivery is fault tolerant', function(done) {
            var XCVR = new xcvr();
            var received_messages = [];
            var console_messages = [];
            // surpresses messages that we are knowingly causing 
            var old_warn = console.warn;
            console.warn = function() {
                var args = Array.prototype.slice.call(arguments);
                console_messages.push(args);
            };

            // one of our handlers explodes, but it shouldn't 
            // prevent others from working.
            XCVR.receive('greeting', function(message) {
                throw new Error('NOBREAKY');
            });

            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
                assert.deepEqual(received_messages, ['hi there'])
            });

            XCVR.send('greeting', 'hi there');
            assert.deepEqual(received_messages, []);
            
            setTimeout(function() {
                //console.log(JSON.stringify(console_messages));
                console.warn = old_warn;
                done();
            }, 100);
        });

        it('Message delivery is fault tolerant when synchronous', function(done) {
            var XCVR = new xcvr();
            XCVR.set_synchronous_delivery(true);
            var received_messages = [];
            var console_messages = [];
            // surpresses messages that we are knowingly causing 
            var old_warn = console.warn;
            console.warn = function() {
                var args = Array.prototype.slice.call(arguments);
                console_messages.push(args);
            };

            // one of our handlers explodes, but it shouldn't 
            // prevent others from working.
            XCVR.receive('greeting', function(message) {
                throw new Error('NOBREAKY');
            });

            XCVR.receive('greeting', function(message) {
                received_messages.push(message); 
                assert.deepEqual(received_messages, ['hi there'])
            });

            XCVR.send('greeting', 'hi there');
            assert.deepEqual(received_messages, ['hi there']);

            console.warn = old_warn;
            done();
        });
    });
    
});



