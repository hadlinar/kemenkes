const axios = require('axios')
const qs = require('qs')
const reader = require('xlsx') 

class GetKFA {

    async getKFA(token, noReg) {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api-satusehat-dev.dto.kemkes.go.id/kfa-v2/products',
            params: {
                'identifier': 'nie',
                'code': noReg
            },
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          };
        
        let client = axios.request(config)
        return client
    }

}

module.exports = GetKFA;