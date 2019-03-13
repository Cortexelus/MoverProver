const { promisify } = require("util");
const cmd = require("node-cmd")

const cmdPromisified = promisify(cmd.get)

const formatFuncArgs = (funcArgs) => {
  if (funcArgs.every(funcArg => (["string", "object"].indexOf(typeof(funcArg)) !== -1))) {
    const cliArgs = []
    funcArgs.forEach(funcArg => {
      if (typeof(funcArg) === "string") {
        cliArgs.push(`'${funcArg}'`)
        return
      }
      Object.entries(funcArg).forEach(argPair => {
        const [option, value] = argPair
        cliArgs.push(`--${option}`)
        cliArgs.push(value)
      })
    })
    return cliArgs
  }
  throw Error("Invalid argument types.")
}

class Cleos {
  constructor(eosiocPath = "eosioc", cliArgs = []) {
    return new Proxy(() => {}, {
      get: (target, name) => {
        return new Cleos(eosiocPath, cliArgs.concat([name]))
      },
      apply: (target, thisArg, funcArgs) => {
        const argString = cliArgs.concat(formatFuncArgs(funcArgs)).join(" ")
        console.log(`> ${eosiocPath} ${argString}`)
        return cmdPromisified(`${eosiocPath} ${argString}`)
      },
    })
  }
}



module.exports = {
  Cleos,
  cmdPromisified,
}
