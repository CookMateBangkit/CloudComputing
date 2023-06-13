
const {
  uploadText, searchResep, getText, searchResepById,
} = require('./handler');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: () => '<h1>Welcome to Cookmate API</h1>',
  },
  {
    method: 'POST',
    path: '/upload',
    handler: uploadText,
  },
  {
    method: 'GET',
    path: '/text',
    handler: getText,
  },
  {
    method: 'GET',
    path: '/resep',
    handler: searchResep,
  },
  {
    method: 'GET',
    path: '/getresep/{documentId}',
    handler: searchResepById,
  },
];

module.exports = { routes };
