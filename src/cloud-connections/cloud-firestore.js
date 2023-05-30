const admin = require('firebase-admin');
const serviceAccount = require('./capstone-cookmate-b9252a82648c.json');
const fs = require('fs');

// Inisialisasi aplikasi Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Inisialisasi koneksi Firestore
const db = admin.firestore();
const resepCollectionRef = db.collection('resep');

// Fungsi untuk memasukkan data resep ke Firestore
async function tambahkanResep(title, ingredients, steps) {
    const formattedTitle = title.replace(/ /g, "-"); // Mengganti spasi dengan tanda "-"
    const data = {
        title: formattedTitle || '',
        ingredients: ingredients || {},
        steps: steps || {}
    };

    await resepCollectionRef.doc(formattedTitle).set(data);
}

// Fungsi untuk memasukkan dataset CSV ke Firestore
async function masukkanDatasetCSV() {
    const filePath = './contohdatasettitik.csv';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const rows = fileData.split('\n');

    const batch = db.batch();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(';');
        const title = row[0];
        const ingredientsString = row[1];
        const stepsString = row[2] ? row[2].replace(/"""/g, '') : '';

        // Mengecek apakah nilai ingredients tidak kosong atau undefined
        if (ingredientsString && ingredientsString.trim() !== '') {
            const ingredients = {};
            const ingredientsArray = ingredientsString.split('. ');

            // Memasukkan bahan-bahan ke dalam objek ingredients
            for (let j = 0; j < ingredientsArray.length; j++) {
                ingredients[`bahan-${j + 1}`] = ingredientsArray[j];
            }

            const steps = {};
            const stepsArray = stepsString.split(', ');

            // Memasukkan langkah-langkah ke dalam objek steps
            for (let k = 0; k < stepsArray.length; k++) {
                steps[`step-${k + 1}`] = stepsArray[k];
            }

            await tambahkanResep(title, ingredients, steps);

            if (i % 500 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
    }

    // Menyimpan sisa dokumen yang tersisa dalam batch terakhir
    await batch.commit();

    console.log('Data telah berhasil dimasukkan ke Firestore.');
}

masukkanDatasetCSV().catch((error) => {
    console.error('Terjadi kesalahan:', error);
});

module.exports = { resepCollectionRef, admin }