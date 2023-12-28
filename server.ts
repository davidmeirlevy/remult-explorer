import express from 'express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import moduleAlias from 'module-alias'
import { createProxyMiddleware } from 'http-proxy-middleware';

const remultModule = 'node_modules/remult'

const remultPath = [
  join(__dirname, remultModule),
  join(__dirname, '..', remultModule),
  join(process.env._, '../../lib', remultModule)
].find(existsSync);

moduleAlias.addAlias('remult', remultPath)

const entitiesPaths = process.env.ENTITIES_PATHS ? JSON.parse(process.env.ENTITIES_PATHS) : [];

(async () => {
  const app = express();

  const { remult } = await import('remult')

  const { remultExpress } = await import('remult/remult-express');
  const remultAdmin = (await import('remult-admin')).default;

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

  if (process.env.PROXY_TARGET) {
    const target = process.env.PROXY_TARGET.startsWith('http') ? process.env.PROXY_TARGET : 'http://' + process.env.PROXY_TARGET;
    app.use('/api', createProxyMiddleware({ target, changeOrigin: true }));
  } else {
    app.use(api);
  }

  app.get('*', api.withRemult, (req, res) => res.send((remultAdmin.default || remultAdmin)({ entities })));

  const port = process.env.PORT || 3002
  app.listen(port, () => {
    console.log('remult-explorer listening on http://localhost:' + port);
  });

})()