# Next

> Fast creation of projects, files and domains our [NXCD Architecture](https://github.com/nxcd/developer-handbook/blob/master/Arquitetura/Arquitetura-de-C%C3%B3digo.md)

[![Build Status](https://travis-ci.org/nxcd/next.svg?branch=master)](https://travis-ci.org/nxcd/next)

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
npm i -g @nxcd/next
```

Or

```
yarn global add @nxcd/next
```

Or

```
pnpm i -g @nxcd/next
```

## Global options

Some options can be used through all commands (except `help`):

- `--folder <path>`: By default, **next** runs on `process.cwd()`. If this option is provided, then the current working directory will be changed to `path` and all operations will be performed under this location

## Usage

**Next** is aliased to two commands in your shell: *next* and *nxcd*. You can use both of them interchangeably.

```sh
$ nxcd <command> [options]
```

Or

```sh
$ next <command> [options]
```

## Commands

### `init`

Creates a new project from scratch in a new folder with `project-name` as name.

```sh
$ next init <project-name>
```

**Options**

For now, this command accepts no options other than the [Global options](#global-options).

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
