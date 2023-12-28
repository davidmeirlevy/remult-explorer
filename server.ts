import express from 'express';
import moduleAlias from 'module-alias'
import { join } from 'node:path';


moduleAlias.addAlias('remult', join(__dirname, 'node_modules/remult'))

const entitiesPaths = process.env.ENTITIES_PATHS ? JSON.parse(process.env.ENTITIES_PATHS) : [];

(async () => {
  const app = express();

  const {remult} = await import('remult')

  const { remultExpress } = await import('remult/remult-express')
  const remultAdmin = (await import('remult-admin')).default

  const entitiesHolders = await Promise.all(entitiesPaths.map(async p => await import(p)));

  const entities = entitiesHolders.map(holder => {
    let entities = []
    for (const proposalEntityKey in holder) {
      const proposalEntity = holder[proposalEntityKey]
      if (proposalEntity?.constructor && proposalEntity?.name && proposalEntity.name[0] === proposalEntity.name[0].toUpperCase()) {
        const getRepo = remult.repo(proposalEntity)

        try {
          getRepo.getEntityRef({})
          entities.push(proposalEntity)
        } catch {
          // console.log('not an entity', proposalEntityKey)
        }

      }
    }
    return entities
  }).flat()

  const api = remultExpress({
    entities,
  });
  app.use(api);
  app.get('*', api.withRemult, (req, res) => res.send((remultAdmin.default || remultAdmin)({ entities })));
  app.listen(3002, () => {
    console.log('remult-explorer listening on http://localhost:3002');
  });

})()