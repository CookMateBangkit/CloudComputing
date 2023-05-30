const Hapi = require('@hapi/hapi');
const inert = require('@hapi/inert')
const routes = require('./routes')


const init = async () => {

    const server = Hapi.server({
        port: 8000,
        host: 'localhost'
    });

    await server.register(inert)
    server.route(routes)

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();