const axios = require('axios')

class GetSarana {

    async getSarana(token, jenisSarana, kodeSatset) {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/mastersaranaindex/mastersarana',
            params: {
                'limit': '1',
                'page': '1',
                'jenis_sarana' : jenisSarana,
                'kode_satusehat': kodeSatset
            },
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
          };
        
        let client = axios.request(config)
        return client
    }

}

module.exports = GetSarana;