#!/usr/bin/env node
const { existsSync, readdirSync } = require('node:fs');
const { parseArgs } = require('node:util');
const { join } = require("path");
// run the explorer
const currentDirectory = process.cwd();

const [,,...args] = process.argv

const { values } = parseArgs({
  args,
  options: {
    port: {
      type: 'string',
      short: 'p',
      default: '3002'
    },
    target: {
      type: 'string',
      short: 't'
    },
    'entities-dir': {
      type: 'string',
      short: 'e',
      multiple: true,
      default: ['entities', 'models', 'shared/entities']
    }
  }
})


const entitiesLibs = values["entities-dir"].filter(dir => existsSync(join(currentDirectory, dir)))

const entities = entitiesLibs
  .map((dir) => readdirSync(join(currentDirectory, dir))
    .map(filename => join(currentDirectory, dir, filename)))
  .flat();


;(async () => {
  const { $ } = await import('zx');

  $.cwd = currentDirectory
  $.env = {
    ...process.env,
    ENTITIES_PATHS: JSON.stringify(entities),
    TARGET_DIR: currentDirectory,
    PROXY_TARGET: values.target,
    PORT: values.port
  }

  try {
    await $`npx tsx ${join(__dirname, 'server.ts')}`
  } catch {
    console.log('something went wrong')
  }
})()