
const { resepCollectionRef, admin } = require('./cloud-connections/cloud-firestore')
const { cariGambar } = require('./cloud-connections/search')

// handler untuk post text
const uploadText = (request, h) => {
    const inputText = request.payload; // Mengambil nilai langsung dari body permintaan

    // Memisahkan teks menjadi array berdasarkan koma
    const ingredients = inputText.split(',');

    // Membuat objek bahan dengan kunci "bahan-i" dan nilai sesuai dengan teks yang diberikan
    const response = {};
    for (let i = 0; i < ingredients.length; i++) {
        const key = `bahan-${i + 1}`;
        response[key] = ingredients[i].trim();
    }

    return response;
};

const resep = async (request, h) => {
    try {
        const snapshot = await resepCollectionRef.get();
        const resepData = [];

        snapshot.forEach((doc) => {
            const resep = doc.data();
            resepData.push(resep);
        });
        return h.response(resepData).header('Content-Type', 'application/json');
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        return h.response('Terjadi kesalahan').code(500);
    }
}

const resepId = async (request, h) => {
    try {
        const id = request.params.id;

        // Dapatkan referensi koleksi "resep"
        const resepCollectionRef = admin.firestore().collection('resep');

        // Dapatkan dokumen resep berdasarkan ID
        const resepDoc = await resepCollectionRef.doc(id).get();

        // Periksa apakah dokumen ada
        if (!resepDoc.exists) {
            return h.response('Dokumen tidak ditemukan').code(404);
        }

        // Ambil data resep dari dokumen
        const resepData = resepDoc.data();

        // Cari gambar berdasarkan judul resep
        const imageUrl = await cariGambar(resepData.title);

        // Tambahkan link gambar ke data resep
        resepData['link-Gambar'] = imageUrl;

        return h.response(resepData).header('Content-Type', 'application/json');
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        return h.response('Terjadi kesalahan').code(500);
    }
}



module.exports = { uploadText, resep, resepId };