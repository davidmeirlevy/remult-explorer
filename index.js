#!/usr/bin/env node
const { existsSync, readdirSync } = require('node:fs')
const { join } = require("path");
// run the explorer
const currentDirectory = process.cwd();
const customPath = process.argv[2];

const entitiesLibs = customPath ? [customPath] : ['entities', 'models', 'shared/entities'].filter(dir => existsSync(join(currentDirectory, dir)))

console.log('checking libs', entitiesLibs)

const entities = entitiesLibs
  .map((dir) => readdirSync(join(currentDirectory, dir))
    .map(filename => join(currentDirectory, dir, filename)))
  .flat();


(async () => {
  const { $ } = await import('zx');

  $.cwd = currentDirectory
  $.env = {
    ...process.env,
    ENTITIES_PATHS: JSON.stringify(entities),
    TARGET_DIR: currentDirectory
  }

  try {
    await $`npx tsx ${join(__dirname, 'server.ts')}`
  } catch {
    console.log('something went wrong')
  }
})()