

const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./key.json');
require('dotenv').config();

let hasilText = null;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// fungsi handler untuk mengirim data text
const uploadText = (request, h) => {
  const inputText = request.payload;

  const ingredients = inputText.split(',');

  if (ingredients != null) {
    const result = {};
    for (let i = 0; i < ingredients.length; i++) {
      const key = `bahan-${i + 1}`;
      result[key] = ingredients[i].trim();
    }
    const response = h.response({
      status: 'success',
      message: 'Data berhasil dikirim',
      data: result,
    });

    hasilText = result;
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Data kosong',
  });
};

// Handler untuk memanggil isi dari hasilText
const getText = (request, h) => {
  const response = h.response(hasilText);
  hasilText = null;
  return response;
};

// Handler untuk mencari data resep berdasarkan input baik dari hasi model ML maupun hasil input text
const searchResep = async (request, h) => {
  let dataIngredientsReturn = null;

  const returnModel = await axios.get(process.env.MODEL);
  console.log(returnModel);
  const returnText = await axios.get(process.env.TEXT);
  console.log(returnText);

  if (JSON.stringify(returnModel.data) === JSON.stringify({ 'message': 'No prediction result available' })) {
    dataIngredientsReturn = returnText.data;
  } else {
    dataIngredientsReturn = returnModel.data;
  }

  if (!dataIngredientsReturn) {
    return h.response({
      status: 'fail',
      message: 'Data input kosong',
    }).code(400);
  }

  try {
    const getDataCollection = db.collection('resep');
    const dataCollection = await getDataCollection.get();

    const matchingResep = [];

    dataCollection.forEach((sample) => {
      const dataIngredients = sample.data().ingredients;
      let persamaan = true;

      for (const index in dataIngredientsReturn) {
        const searchText = dataIngredientsReturn[index].toLowerCase();
        let persamaanIngredients = false;

        for (const ingredientsIndex in dataIngredients) {
          const ingredientsData = dataIngredients[ingredientsIndex].toLowerCase();

          if (ingredientsData.includes(searchText)) {
            persamaanIngredients = true;
            break;
          }
        }

        if (!persamaanIngredients) {
          persamaan = false;
          break;
        }
      }

      if (persamaan) {
        matchingResep.push(sample.id);
      }
    });

    const matchingResepDetails = [];

    for (const id of matchingResep) {
      const doc = await getDataCollection.doc(id).get();
      const resepDetails = {
        id: doc.id,
        ...doc.data(),
      };
      matchingResepDetails.push(resepDetails);
    }

    if (matchingResepDetails.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Tidak ada resep yang cocok dengan bahan yang diinput',
      }).code(404);
    }

    return h.response({
      status: 'success',
      matchingResep: { matchingResepDetails },
    }).code(200);
  } catch (error) {
    console.log(error);
    return h.response({
      status: 'error',
      message: 'kesalahan saat memproses data',
      error: error.message,
    }).code(500);
  }
};

const searchResepById = async (request, h) => {
  const { documentId } = request.params;

  const getDataCollection = db.collection('resep').doc(documentId);
  const dataCollection = await getDataCollection.get();

  if (!dataCollection.exists) {
    return h.response('Data resep tidak ditemukan').code(404);
  }

  const dataResep = dataCollection.data();
  return h.response({
    status: 'success',
    message: 'Data resep: ',
    data: { dataResep },
  });
};
module.exports = {
  uploadText, searchResep, getText, searchResepById,
};
