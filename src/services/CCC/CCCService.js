import Logger from '../../Logger'
import Axios from '../../request/request'

export default class CCCService {
  constructor () {
    this.logger = new Logger()
  }

  sendMessage (host, path, parameters) {
    this.logger.info(parameters)
    return new Axios(host).post(path, parameters)
  }
}