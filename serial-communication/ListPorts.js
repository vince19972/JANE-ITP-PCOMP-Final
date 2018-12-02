var serialport = require('serialport')

// list serial ports
serialport.list((err, ports) => {
  ports.forEach(port => console.log(port.comName))
})