import axios from 'axios'

export default class Axios {
  constructor (baseURL) {
    this.service = axios.create({
      baseURL,
      responseType: 'json',
    })
  }

  _makeRequest (method, url, queryParams = null, body = null) {
    let request
    switch (method) {
      case 'GET':
        request = this.service.get(url, queryParams)
        break
      case 'POST':
        request = this.service.post(url, body, queryParams)
        break
      case 'PUT':
        request = this.service.put(url, body, queryParams)
        break
      case 'PATCH':
        request = this.service.patch(url, body, queryParams)
        break
      case 'DELETE':
        request = this.service.delete(url, queryParams)
        break
      default:
        throw new Error('Method not supported')
    }

    return new Promise((resolve, reject) => {
      request
        .then(response => {
          if (response.data['status'] in response.data) {
            if (response.data['status'] === 'error') {
              console.error(new Error(response.data['error'], response.data['message']))
            } else {
              resolve(response.data)
            }
          } else {
            resolve(response.data)
          }
        })
        .catch(err => {
          if (err.response) {
            if (err.response.data) {
              if (err.response.status) {
                reject(err.response.data)
              } else {
                reject(err)
              }
            } else {
              reject(err)
            }
          } else {
            reject(err)
          }
        })
    })
  }

  get (url, queryParams = null) {
    return this._makeRequest('GET', url, { params: queryParams }, null)
  }

  post (url, body, queryParams = null) {
    return this._makeRequest('POST', url, { params: queryParams }, body)
  }

  put (url, body, queryParams = null) {
    return this._makeRequest('PUT', url, { params: queryParams }, body)
  }

  patch (url, body, queryParams = null) {
    return this._makeRequest('PATCH', url, { params: queryParams }, body)
  }

  delete (url, queryParams = null) {
    return this._makeRequest('DELETE', url, queryParams, null)
  }
}
