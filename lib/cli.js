#! /usr/bin/env node

// External Modules
var debug = require('debug-log2')
var _ = require('lodash')
var colors = require('colors')

// Internal Modules
var pkg = require('../package.json')

// Variables to be set later

var program = {}
var args = process.argv
args.shift()
args.shift()
var showVerbose

program._name = pkg.name
program._version = pkg.version
program._description = pkg.description
program._license = pkg.license
program._author = pkg.author
program._homepage = pkg.homepage
program._options = [{
  form: '-h,\t--help',
  desc: '\t\tShow this help dialog'
}, {
  form: '-v,\t--verbose',
  desc: '\tEnable verbose mode'
}, {
  form: '-#,\t--debug',
  desc: '\tEnable Developer Debug mode'
}, {
  form: '   \t--version',
  desc: '\tPrint version number'
}, ]

program._commands = [{
  cmd: 'gen',
  desc: 'Generate keypair',
  usage: 'gen',
  help: 'Starts generating private/public keypair.'
}, {
  cmd: 'gen-revoke',
  desc: 'Generate revocation certificate from email or Key ID',
  usage: 'gen-revoke <privatekey_email_keyID>',
  help: '<privatekey_email_keyID>'.bold + ' is the email address or keyID of the keypair.'
}, {
  cmd: 'list',
  desc: 'list PGP keys, public and private',
  usage: 'list [--private] [--public]',
  help: 'Lists all GPG keys on the system, filtered by flag (defaults to both)'
}, {
  cmd: 'fingerprint',
  desc: 'View fingerprint for key',
  usage: 'fingerprint <email_keyID>',
  help: '<email_keyID>'.bold + ' is the email address or keyID of a keypair, public or private.'
}, {
  cmd: 'send',
  desc: 'Send PGP key to keyserver',
  usage: 'send <privatekey_email_keyID> to <server>',
  help: '<privatekey_email_keyID>'.bold + ' is the email address or keyID of the keypair,\n\tand ' + '<server>'.bold + ' is a working keyserver.'
}, {
  cmd: 'get',
  desc: 'Get PGP key to keyserver',
  usage: 'get <email_keyID> from <server>',
  help: '<email_keyID>'.bold + ' is the email address or keyID of the keypair, public or private,\n\tand ' + '<server>'.bold + ' is a working keyserver.'
}, {
  cmd: 'sign',
  desc: 'Sign either a public key or a file/message',
  usage: 'sign <publickey_email_keyID> [with <privatekey_email_keyID>]\n\t' + program._name + ' sign <filename> [with <privatekey_email_keyID>] [to <outputFilename>] [<message>]',
  help: '<publickey_email_keyID>'.bold + '(optional, defaults to message signing) is the email address or keyID of the keypair to sign,\n\t' + '<filename>'.bold + '(optional, defaults to string message mode) is the name of the output file,\n\t' + '<privatekey_email_keyID>'.bold + '(optional, defaults to default private key) is the email address or keyID of the keypair to encrypt with,\n\t' + '<outputFilename>'.bold + '(optional, defaults to stdout) is the filename to save the output to,\n\tand ' + '<message>'.bold + '(optional, defaults to an empty string) is the message to sign.'
}, {
  cmd: 'edit',
  desc: 'Edit public key, set trust',
  usage: 'edit <publickey_email_keyID>',
  help: '<publickey_email_keyID>'.bold + ' is the email address or keyID of the keypair.'
}, {
  cmd: 'trust',
  desc: 'Edit public key, set trust (alias of edit)',
  usage: 'trust <publickey_email_keyID>',
  help: '<publickey_email_keyID>'.bold + ' is the email address or keyID of the keypair.'
}, {
  cmd: 'export',
  desc: 'Export public key',
  usage: 'export <publickey_email_keyID> <filename>',
  help: '<publickey_email_keyID>'.bold + ' is the email address or keyID of the keypair,\n\tand ' + '<filename>'.bold + ' is the name of the output file.'
}, {
  cmd: 'import',
  desc: 'Import a signed public key',
  usage: 'import <filename>',
  help: '<filename>'.bold + ' is the name of the file to import.'
}, {
  cmd: 'encrypt',
  desc: 'Encrypt file/message',
  usage: 'encrypt [<filename>] [with <privatekey_email_keyID>] [to <outputFilename>] [<message>]',
  help: '<filename>'.bold + '(optional, defaults to string message mode) is the name of the output file,\n\t' + '<privatekey_email_keyID>'.bold + '(optional, defaults to default private key) is the email address or keyID of the keypair to encrypt with,\n\t' + '<outputFilename>'.bold + '(optional, defaults to stdout) is the filename to save the output to,\n\tand ' + '<message>'.bold + '(optional, defaults to an empty string) is the message to encrypt.'
}, {
  cmd: 'decrypt',
  desc: 'Decrypt file/message',
  usage: 'decrypt [<filename>] [with <privatekey_email_keyID>] [to <outputFilename>] [<message>]',
  help: '<filename>'.bold + '(optional, defaults to string message mode) is the name of the file to decrypt,\n\t' + '<privatekey_email_keyID>'.bold + '(optional, defaults to default private key) is the email address or keyID of the keypair to decrypt with,\n\t' + '<outputFilename>'.bold + '(optional, defaults to stdout) is the filename to save the output to,\n\tand ' + '<message>'.bold + '(optional, defaults to an empty string) is the message to decrypt.'
}, {
  cmd: 'verify',
  desc: 'Verify the public key of a signed file/message',
  usage: 'verify [<filename>] [<message>]',
  help: '<filename>'.bold + '(optional, defaults to string message mode) is the name of the file to verify,\n\tand ' + '<message>'.bold + '(optional, defaults to an empty string) is the message to sign.'
}]

if (_.intersection(['--debug'], args).length === 1 || _.intersection(['-#'], args).length === 1) {
  args = _.without(args, '--debug')
  args = _.without(args, '-#')
  debug.enable()
  debug('Debug Mode enabled.')
}

if (_.intersection(['--verbose'], args).length === 1 || _.intersection(['-v'], args).length === 1) {
  args = _.without(args, '--debug')
  showVerbose = true
  debug('Verbose Mode enabled.')
  _v('Verbose Mode enabled.')
}

if (_.intersection(['--help'], args).length === 1 || _.intersection(['-h'], args).length === 1) {
  debug('Help Mode enabled')
  args = _.without(args, '--help')
  args = _.without(args, '-h')
  _displayHelp()
}

switch (args[0]) {
  case 'gen':
    _cleanArgs()
    _taskGen()
    break
  case 'gen-revoke':
    _cleanArgs()
    _taskGenRevoke()
    break
  case 'list':
    _cleanArgs()
    _taskList()
    break
  case 'fingerprint':
    _cleanArgs()
    _taskFingerprint()
    break
  case 'send':
    _cleanArgs()
    _taskSend()
    break
  case 'get':
    _cleanArgs()
    _taskGet()
    break
  case 'sign':
    _cleanArgs()
    _taskSign()
    break
  case 'edit':
    _cleanArgs()
    _taskEdit()
    break
  case 'trust':
    _cleanArgs()
    _taskTrust()
    break
  case 'export':
    _cleanArgs()
    _taskExport()
    break
  case 'import':
    _cleanArgs()
    _taskImport()
    break
  case 'encrypt':
    _cleanArgs()
    _taskEncrypt()
    break
  case 'decrypt':
    _cleanArgs()
    _taskDecrypt()
    break
  case 'verify':
    _cleanArgs()
    _taskVerify()
    break
  default:
    console.log('')
    console.log('Invalid method.'.bold.red)
    console.log('')
    _displayHelp()
    break
}

console.log('')
debug('Arguments:', args)

function _v() {
  if (showVerbose) {
    debug('Verbose Message')
    console.log.apply(console, args)
  }
}

function _displayHelp() {
  console.log('')
  console.log('\t', program._name.bold, '\tv'.bold + program._version.bold)
  console.log('')
  console.log('\t', program._description)
  console.log('\t License: ' + program._license.gray.italic)
  console.log('\t Author: ' + program._author.gray.italic)
  console.log('\t Homepage: ' + program._homepage.gray.italic)
  console.log('')
  console.log('Usage:'.underline.bold)
  if (args.length < 1) {
    console.log('\t' + program._name, '[options] <command>')
    console.log('')
    console.log('Options:'.underline.bold)
    _.forEach(program._options, function (option) {
      console.log('\t', option.form, option.desc.gray.italic)
    })
    console.log('')
    _displayMethods()
  } else {
    var command = _.where(program._commands, {
      cmd: args[0]
    })
    if (command.length > 0) {
      command = command[0]
      console.log('\t' + program._name, command.usage)
      console.log('\t' + command.help.gray)
    } else {
      console.log('')
      console.log('UNABLE TO FIND COMMAND '.red.bold + args[0].red.bold)
      console.log('Please choose another method to display:'.red.bold)
      console.log('')
      _displayMethods()
    }
  }
}

function _displayMethods() {
  console.log('Methods:'.underline.bold)
  console.log('\tAll Methods have their own help dialog. Simply use:'.gray)
  console.log('\t\t' + program._name.gray.bold, '[command] --help'.gray.bold, 'or'.gray, program._name.gray.bold, '[command] -h'.gray.bold)
  console.log('')
  _.forEach(program._commands, function (command) {
    if (command.cmd.length < 4) {
      command.desc = '\t\t\t\t' + command.desc
    } else if (command.cmd.length < 6) {
      command.desc = '\t\t\t\t' + command.desc
    } else if (command.cmd.length < 8) {
      command.desc = '\t\t\t' + command.desc
    } else if (command.cmd.length < 12) {
      command.desc = '\t\t\t' + command.desc
    } else if (command.cmd.length < 16) {
      command.desc = '\t\t' + command.desc
    } else if (command.cmd.length < 24) {
      command.desc = '\t\t' + command.desc
    } else {
      command.desc = '\t' + command.desc
    }
    console.log('\t', command.cmd, command.desc.gray.italic)
  })
}

function _cleanArgs() {
  args.shift()
}

function _taskGen() {
  debug('Gen function entered')

}

function _taskGenRevoke() {
  debug('GenRevoke function entered')

}

function _taskList() {
  debug('List function entered')

}

function _taskFingerprint() {
  debug('Fingerprint function entered')

}

function _taskSend() {
  debug('Send function entered')

}

function _taskGet() {
  debug('Get function entered')

}

function _taskSign() {
  debug('Sign function entered')

}

function _taskEdit() {
  debug('Edit function entered')

}

function _taskTrust() {
  debug('Trust function entered')

}

function _taskExport() {
  debug('Export function entered')

}

function _taskImport() {
  debug('Import function entered')

}

function _taskEncrypt() {
  debug('Encrypt function entered')

}

function _taskDecrypt() {
  debug('Decrypt function entered')

}

function _taskVerify() {
  debug('Verify function entered')

}
