import { ExpressActionWatcher } from 'demux'
import { NodeosActionReader } from 'demux-eos'
import { MassiveActionHandler } from 'demux-postgres'
import massive from 'massive'
import { migrationSequences } from './migrationSequences'
import * as dbConfig from './config/dbConfig.json'
import * as demuxConfig from './config/demuxConfig.json'
import { handlerVersions } from './handlerVersions'

const init = async () => {
  const actionReader = new NodeosActionReader({
    nodeosEndpoint: demuxConfig.nodeosEndpoint,
    startAtBlock: demuxConfig.startAtBlock,
    onlyIrreversible: demuxConfig.onlyIrreversible,
  })

  const massiveInstance = await massive(dbConfig)
  const actionHandler = new MassiveActionHandler(
    handlerVersions,
    massiveInstance,
    dbConfig.schema,
    migrationSequences,
  )

  const actionWatcher = new ExpressActionWatcher(
    actionReader,
    actionHandler,
    demuxConfig.pollInterval,
    demuxConfig.endpointPort,
  )

  await actionWatcher.listen()
  console.info(`Demux listening on port ${demuxConfig.endpointPort}...`)
}

init()
