#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import yargs from 'yargs'
import childProc from 'child_process'
import {log, error, findBin, pwd, getPkgJson} from '@inst-cli/template-utils'

yargs.scriptName('build-react-app')

yargs.command(
  'now [-p|--prod] [-t|--teardown]',
  'Deploys the app to Now',
  y => {
    y.option('prod', {
      alias: 'p',
      describe: `Deploys in the production environment.`,
      type: 'boolean',
    })

    y.option('teardown', {
      alias: 't',
      describe: `Deletes your deployment in the current environment`,
      type: 'boolean',
    })
  }
)

yargs.command(
  'aws  [-s|--stage stage] [-t|--teardown]',
  'Deploys the app to AWS',
  y => {
    y.option('stage', {
      alias: 's',
      type: 'string',
      describe: `The stage to deploy to. Defaults to 'staging'.`,
    })

    y.option('teardown', {
      alias: 't',
      describe: `Deletes your deployment in the current stage and environment`,
      type: 'boolean',
    })
  }
)

yargs.command(
  'github [-t|--teardown]',
  'Deploys the app to GitHub Pages. GitHub Pages builds only have a production option.',
  y => {
    y.option('teardown', {
      alias: 't',
      describe: `Deletes your deployment`,
      type: 'boolean',
    })
  }
)

const args = yargs.argv
const pkg = getPkgJson(pwd())
const crossEnv = findBin('cross-env')
let cmd

switch (args._[0]) {
  case 'now':
    if (args.teardown)
      log(`Tearing down ${chalk.bold(pkg.name)} from ${chalk.bold('Now')}`)
    else log(`Deploying ${chalk.bold(pkg.name)} to ${chalk.bold('Now')}`)
    let nowJson = JSON.parse(
      fs.readFileSync(path.join(path.dirname(pkg.__path), 'now.json'), {
        encoding: 'utf8',
      })
    )
    cmd = `
      now \
        ${args.teardown ? `rm ${nowJson.name}` : ''} \
        ${args.prod ? '--prod' : ''}
    `
    break

  case 'github':
    if (args.teardown)
      log(
        `Tearing down ${chalk.bold(pkg.name)} from ${chalk.bold(
          'GitHub Pages'
        )}`
      )
    else
      log(`Deploying ${chalk.bold(pkg.name)} to ${chalk.bold('GitHub Pages')}`)

    cmd = `${crossEnv} NODE_ENV=production`
    break

  case 'aws':
    if (args.teardown)
      log(`Tearing down ${chalk.bold(pkg.name)} from ${chalk.bold('AWS')}`)
    else log(`Deploying ${chalk.bold(pkg.name)} to ${chalk.bold('AWS')}`)

    cmd = `
      ${crossEnv} \
        NODE_ENV=production \
        STAGE=${args.stage || 'staging'} \
      npx serverless \
        deploy \
        --stage ${args.stage || 'staging'} 
    `
    break

  default:
    error(`Unrecognized deployment strategy: "${args._[0]}"`)
    process.exit(1)
}

const main = cmd => {
  const proc = childProc.spawn(`${cmd.trim()}`, [], {
    stdio: 'inherit',
    shell: true,
  })
  return new Promise(resolve => proc.on('close', resolve))
}

main(cmd).then(() => process.exit(0))
