import { Updater, BlockInfo } from 'demux'

// CREATE TABLE ${schema~}.move (
//   id serial PRIMARY KEY,
//   moveid bigint NOT NULL,
//   owner text NOT NULL,
//   movename text NOT NULL,
//   islisted bool DEFAULT false,
//   buyprice int DEFAULT 0
// );
//
// CREATE TABLE ${schema~}.account (
//   id serial PRIMARY KEY,
//   accname text NOT NULL
//   fullname text NOT NULL,
//   email text NOT NULL,
//   mvp int DEFAULT 10000
// )

const reg: Updater = {
  apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
    const { user, movename, fullname, email } = payload.data
    const { moveid } = payload.data

    console.log("> REGISTER MOVE")
    console.log("id:", moveid)
    console.log("owner:", user)
    console.log("move name:", movename)
    console.log("full name:", fullname)
    console.log("email:", email)
    console.log()

    await state.move.save({
      moveid,
      owner: user,
      movename,
    })
    await state.account.save({
      accname: user,
      fullname,
      email,
    })
  },
  actionType: 'mvpregister::reg',
}

const list: Updater = {
  apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
    const { buyprice } = payload.data
    const { moveid } = payload.data

    const move = await state.move.findOne({ moveid })

    console.log("> LIST DANCE MOVE FOR SALE")
    console.log("id:", moveid)
    console.log("move name:", move.movename)
    console.log("price:", buyprice)
    console.log("current owner:", move.owner)
    console.log()

    await state.move.save({
      id: move.id,
      buyprice,
      islisted: true,
    })
  },
  actionType: 'mvpregister::list',
}

const buy: Updater = {
  apply: async (state: any, payload: any, blockInfo: BlockInfo, context: any) => {
    const { user } = payload.data

    const { moveid } = payload.data

    const move = await state.move.findOne({ moveid })
    const sellerDbUser = await state.account.findOne({ accname: move.owner })
    const buyerDbUser = await state.account.findOne({ accname: user })
    const buyprice = move.buyprice

    const buyerBalance = parseInt(buyerDbUser.mvp) - parseInt(buyprice)
    const sellerBalance = parseInt(sellerDbUser.mvp) + parseInt(buyprice)

    console.log("> DANCE MOVE SOLD")
    console.log("id:", moveid)
    console.log("move name:", move.movename)
    console.log("purchase price:", `${buyprice} MVP`)
    console.log("old owner:", sellerDbUser.fullname)
    console.log("new owner:", buyerDbUser.fullname)
    console.log()

    await state.account.save({
      id: buyerDbUser.id,
      mvp: buyerBalance,
    })
    await state.account.save({
      id: sellerDbUser.id,
      mvp: sellerBalance,
    })

    await state.move.save({
      id: move.id,
      buyprice: 0,
      islisted: false,
    })
  },
  actionType: 'mvpregister::buy',
}

export const updaters = [
  reg,
  list,
  buy,
]
