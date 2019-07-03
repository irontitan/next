# Next

> Fast creation of projects, files and domains in our [Architecture](https://github.com/nxcd/developer-handbook/blob/master/Arquitetura/Arquitetura-de-C%C3%B3digo.md)

[![Build Status](https://travis-ci.org/irontitan/next.svg?branch=master)](https://travis-ci.org/irontitan/next)

## Summary

- [Next](#next)
  - [Summary](#summary)
  - [Installation](#installation)
  - [Global options](#global-options)
  - [Usage](#usage)
  - [Commands](#commands)
    - [`init`](#init)
    - [`new`](#new)
    - [`release`](#release)
- [TODO](#todo)

## Installation

Install it **globally** using your preferred package manager:

```
npm i -g @irontitan/next
```

Or

```
yarn global add @irontitan/next
```

Or

```
pnpm i -g @irontitan/next
```

## Global options

Some options can be used through all commands (except `help`):

- `--dir <path>`: By default, **next** runs on `process.cwd()`. If this option is provided, then the current working directory will be changed to `path` and all operations will be performed under this location

## Usage

**Next** is aliased in your shell as *next*.

```sh
$ next <command> [options]
```

## Commands

### `init`

Creates a new project from scratch in a new folder with `project-name` as name. This command will create the structure defined
[here](https://github.com/nxcd/developer-handbook/blob/master/Arquitetura/Arquitetura-de-C%C3%B3digo.md#estrutura-de-pastas) (to be translated) so all the docs about it is right there.

```sh
$ next init <project-name>
```

**Options**

This command accepts the [Global options](#global-options) and:

- `--domains`: A comma-separated list of domain names to be created along with the project. The names can be cased whatever you want, but they **cannot** contain spaces

**Example:** `$ next init my-project --domains production-order,tag,userReport,user,inventory_report,userbackups`

### `new`

*Work in progress*

### `release`

*Work in progress*

# TODO

- [ ] Create `new` command, it'll include the creation logic for several assets (events, domains, repositories, services, clients, errors, configs)
- [ ] Create `deploy` command so we can create tags and deploys
- [ ] Add `--type` option to the `init` command in order to create `libs` and other smaller projects
- [ ] Update this doc
- [ ] Improve code style and make things reusable
- [ ] Translate architecture document to english
