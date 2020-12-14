const nodeStatic = require('node-static');

const fileServer = new nodeStatic.Server('.');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(process.env.PORT ||8080);
