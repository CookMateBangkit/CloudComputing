/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Inisialisasi koneksi Firestore
const db = admin.firestore();

// Fungsi untuk memasukkan dataset CSV ke Firestore
const masukkanDatasetCSV = async () => {
  const filePath = './contoh-data.csv';
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const rows = fileData.split('\n');

  let batch = db.batch();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(';');
    const title = row[0];
    const ingredientsString = row[1] ? row[1].toLowerCase() : '';
    const stepsString = row[2] ? row[2].replace(/"""/g, '').toLowerCase() : '';

    if (ingredientsString && ingredientsString.trim() !== '') {
      const ingredients = {};
      const ingredientsArray = ingredientsString.split('. ');

      for (let j = 0; j < ingredientsArray.length; j++) {
        ingredients[`bahan-${j + 1}`] = ingredientsArray[j];
      }

      const steps = {};
      const stepsArray = stepsString.split('.');

      for (let k = 0; k < stepsArray.length; k++) {
        steps[`step-${k + 1}`] = stepsArray[k];
      }

      const lowercaseTitle = title.toLowerCase().replace(/\s+/g, '-');
      const docRef = db.collection('resep').doc(lowercaseTitle);
      const url = `https://storage.googleapis.com/foto-resep/${lowercaseTitle}.jpg`;
      batch.set(docRef, {
        title, ingredients, steps, url,
      });

      if (i % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
  }

  await batch.commit();

  console.log('Data telah berhasil dimasukkan ke Firestore.');
};

masukkanDatasetCSV().catch((error) => {
  console.error('Terjadi kesalahan:', error);
});
