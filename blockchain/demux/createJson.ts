import massive from 'massive'
import fs from 'fs'
import * as dbConfig from './config/dbConfig.json'

async function init() {
  const massiveInstance: any = await massive(dbConfig)
  await innerLoop(massiveInstance)
}

async function innerLoop(massiveInstance: any) {
  const registryData = await massiveInstance.moverprover.move.find()
  const combinedData = []
  for (const rowData of registryData) {
    const account = await massiveInstance.moverprover.account.find({ accname: rowData.owner })
    combinedData.push({
      ...rowData,
      username: account[0].fullname,
    })
    // console.log(account)
  }
  fs.writeFileSync("../frontend/src/registryData.json", JSON.stringify(combinedData), 'utf-8')

  const userData = await massiveInstance.moverprover.account.find({}, {
    order: [{
      field: 'mvp',
      direction: 'desc',
    }],
  })

  fs.writeFileSync("../frontend/src/userData.json", JSON.stringify(userData), 'utf-8')

  setTimeout(async () => await innerLoop(massiveInstance), 250)
}

init()
