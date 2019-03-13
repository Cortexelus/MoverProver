import * as fs from "fs"
import massive from 'massive'

// @ts-ignore
import { Cleos, cmdPromisified } from "./cleos.js"

const CLEOS_PATH = 'docker exec -i eosio_notechain_container /usr/bin/cleos'
const PASS_CMD = 'docker exec -i eosio_notechain_container /bin/cat /opt/eosio/bin/eosiomain_wallet_password.txt'
const dir = '/Users/julienheller/Downloads/mover-prover17';

const chars = 'abcdefghijklnopqrstuvwxyz12345'

function createAccountName() {
  let stringToFill = ""
  while (stringToFill.length < 12) {
    stringToFill += chars[Math.floor(Math.random() * chars.length)];
  }
  return stringToFill
}

function wait(ms: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function sendToChain(cleos: any, data: any) {
  const accountName = createAccountName()
  cleos.create.account('eosio', accountName, 'EOS6PUh9rs7eddJNzqgqDx1QrspSHLRxLMcRdwHZZRL4tpbtvia5B', 'EOS8BCgapgYA2L4LJfCzekzeSr3rzgSTUXRXwNi8bNRoz31D14en9')

  const {
    move_id,
    username,
    email,
    movename,
  } = data

  const args = [
    accountName,
    movename,
    move_id,
    username,
    email,
  ]

  await wait(100)

  await cleos.push.action.mvpregister.reg(
    JSON.stringify(args),
    { permission: `${accountName}@active` }
  )
}

(async () => {
  const cleos = new Cleos(CLEOS_PATH)
  const password = await cmdPromisified(PASS_CMD)
  try {
    await cleos.wallet.unlock({ name: 'eosiomain', password })
  } catch (err) {
    console.log("Wallet already unlocked")
  }

  const files = fs.readdirSync(dir)
  for (const filename of files) {
    if (filename.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(`${dir}/${filename}`, 'utf-8'))
      await sendToChain(cleos, data)
    }
  }
})()
