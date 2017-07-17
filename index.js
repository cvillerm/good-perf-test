const Hapi = require('hapi');
const Path = require('path');

var server = new Hapi.Server();

// Set the connection settings
server.connection({
    port: 8080,
});

var numReq = 0;

server.route({
    method: 'get',
    path: '/ping',
    handler: function(request, reply) {
        let memUsage = {
            numReq: numReq,
            rss: Math.round(process.memoryUsage().rss / 1024 / 102.4)/10,
			heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 102.4)/10,
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 102.4)/10
        };
        if (numReq%100 == 0) {
            console.log(JSON.stringify(memUsage));
        }
        numReq++;
        reply(memUsage);
    }
})

// Register plugins and start server
server.register({
    register: require('good'),
    options: { 
        includes: {
            request: ["headers", "payload"],
            response: ["payload"]
        },
    reporters: {
            myConsoleReporter: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{ response: '*' }]
            },{
                module: 'good-squeeze',
                name: 'SafeJson'
            },{
                module: 'good-file',
                args: [ 'log.json' ]
            } ]
        }
    }
}, (err) => {
    if (err) {
        throw err;
    }
    server.start(function () {
        console.info('Server started at ' + new Date() + ' listening on ' + server.info.uri);
    });
});
