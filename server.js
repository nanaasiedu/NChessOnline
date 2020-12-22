import nodeStatic from "node-static";
import http from "http";

const fileServer = new nodeStatic.Server('.');

http.createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 8080);
