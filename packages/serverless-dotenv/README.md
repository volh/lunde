[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://jaredlunde.mit-license.org/)

---

# @lunde/serverless-dotenv

A Serverless plugin that injects .env files into your serverless.yml based upon the --stage

By default, this plugin will assign all of the environment variables to each function
in your config. You can override this behavior with the `exclude` and `include` options
below.

## Installation

#### `npm i @lunde/serverless-dotenv`

#### `yarn add @lunde/serverless-dotenv`

## Usage

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

custom:
  dotenv:
    exclude:
      - 'SERVERLESS*'
```

## Options

**NOTE:** When both `include` and `exclude` options are defined `exclude` will take precedence over `include`.
That is, you cannot define both at the same time.

- `path {string}`
  - **default** `.env.[--stage] || .env`
  - The path to your `.env` file relative to your `serverless.yml` file
- `exclude {array|object}`
  - An array of glob patterns which only exclude environment variables whose name match
    the glob
- `include {array|object}`

  - An array of glob patterns which only include environment variables whose name match
    the glob

### Examples using `exclude`

Excludes all environment variables that start with `SERVERLESS` from all functions

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

custom:
  dotenv:
    exclude:
      - 'SERVERLESS*'
```

Excludes all environment variables that start with `SERVERLESS` from the `main` function

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

custom:
  dotenv:
    exclude:
      main:
        - 'SERVERLESS*'
```

### Examples using `include`

Includes all environment variables that start with `APP` in all functions

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

custom:
  dotenv:
    include:
      - 'APP*'
```

Includes all environment variables that start with `APP` in the `main` function

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

custom:
  dotenv:
    include:
      main:
        - 'APP*'
```

### Example without `include` or `exclude`

```yaml
# serverless.yml
plugins:
  - @stellar-apps/serverless-dotenv

functions:
  main:
    environment:
      FOO: ${env:FOO}

custom:
  dotenv:
    path: '.env' # NOTE: you don't actually have to define this as this is the default
```

## Credits

Inspiration and some code was derived from [serverless-dotenv-plugin](https://raw.githubusercontent.com/colynb/serverless-dotenv-plugin/master/index.js)

## LICENSE

MIT
