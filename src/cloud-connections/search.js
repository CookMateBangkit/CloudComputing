const axios = require('axios');

async function cariGambar(query) {
    const apiKey = 'AIzaSyCwLIsXuuHCiwT4d9GnJ2xj6DVtx4V-z50'; // Ganti dengan API Key Anda
    const searchEngineId = '34a4a01c8e8654a38'; // Ganti dengan Search Engine ID Anda

    // Buat URL permintaan dengan menggunakan API Key, Search Engine ID, dan query pencarian
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image`;

    try {
        // Lakukan permintaan HTTP GET ke URL
        const response = await axios.get(url);
        const items = response.data.items;

        if (items && items.length > 0) {
            // Jika gambar ditemukan, ambil link gambar dari item pertama
            const firstItem = items[0];
            const imageUrl = firstItem.link;
            console.log('Link gambar:', imageUrl);
            return imageUrl;
        } else {
            console.log('Gambar tidak ditemukan.');
            return null;
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        return null;
    }
}

module.exports = { cariGambar };


//https://programmablesearchengine.google.com/controlpanel/overview?cx=34a4a01c8e8654a38
//apikey = AIzaSyCwLIsXuuHCiwT4d9GnJ2xj6DVtx4V-z50
//searchenginekey= 34a4a01c8e8654a38

