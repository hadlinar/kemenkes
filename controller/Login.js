const axios = require('axios')
const qs = require('qs')

class Login {
    
    async login() {
        var bodyForm = qs.stringify({
            'client_id': 'KVreGtIGBbiFA8FBLIwgG8idoVS6PGfPugyT5WEGFfT2b9vp',
            'client_secret': 'traXadSQFskna9tAAOIrRg09wFuFAYOa1gTzlDFiCxoxavuOMqDyIFq6ZH40R9Gi' 
          })
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken',
            params: {
                'grant_type': 'client_credentials'
            },
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : bodyForm,
            timeout: 20000
          };


        let client = axios.request(config)
        return client
        
    }

    async loginAPIDIN() {
      var bodyForm = qs.stringify({
        "grant_type": "password",
        "username": "demo@kemkes.go.id",
        "password": "demo"
      })

      var config = {
        method: "post",
        url: "http://apidin.jalak.id/v1/token",
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : bodyForm
      }

      let client = axios.request(config)
      return client
    }
};

module.exports = Login;