import cluster from 'cluster'
import { startServer } from '../server'
const numCPUs = require('os').cpus().length
console.log('numCPUs', numCPUs)

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  let length = 2
  if (process.env.SERVER) {
    length = 4
  }
  for (let i = 0; i < length; i++) {
    cluster.fork()
  }

  cluster.on('listening', function(worker, address) {
    console.log('listening: worker ' + worker.process.pid + ', Address: ' + address.address + ':' + address.port)
  })

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  startServer(9000)
}
