
const { uploadText, resep, resepId } = require('./handler')



const routes = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return h.file('./html/home.html')
        }
    },
    {
        method: 'GET',
        path: '/picture',
        handler: (request, h) => {
            return h.file('./html/upload.html')
        }
    },
    {
        method: 'POST',
        path: '/uploadtext',
        handler: uploadText,

    },
    {
        method: 'GET',
        path: '/resep',
        handler: resep,
    },
    {
        method: 'GET',
        path: '/resep/{id}',
        handler: resepId,
    }
];

module.exports = routes;