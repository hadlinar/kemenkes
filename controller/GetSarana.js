const axios = require('axios')

class GetSarana {
    async getSarana(token, jenisSarana, limit, page) {
      try {
          const response = await axios.get('https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/mastersaranaindex/mastersarana', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              params: {
                'limit': limit,
                'page': page,
                'jenis_sarana' : jenisSarana,
              },
              timeout: 60000
          });
          return response;
      } catch (err) {
          console.error("getSarana function failed.");
          throw err;
      }
    }

}

module.exports = GetSarana;