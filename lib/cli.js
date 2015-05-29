#! /usr/bin/env node

// External Modules
var debug = require('debug-log2')
var _ = require('lodash')
var colors = require('colors')
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var prompt = require('prompt');
var Table = require('cli-table');
var request = require('unirest')
var htmlparser = require("htmlparser2");
var fs = require('fs')
var path = require('path')




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
program._tableSettings = {
  chars: {
    'top': '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    'bottom': '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    'left': '',
    'left-mid': '',
    'mid': '',
    'mid-mid': '',
    'right': '',
    'right-mid': '',
    'middle': ' '
  },
  style: {
    'padding-left': 0,
    'padding-right': 0
  }
}

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
  desc: 'Get PGP key from keyserver',
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
  usage: 'export <publickey_email_keyID> to <filename>',
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

function _v() {
  if (showVerbose) {
    debug('Verbose Message')
    console.log.apply(console, args)
  }
}

function _displayHelp() {
  console.log('')

  console.log(program._name.bold, '\tv'.bold + program._version.bold)
  console.log('\t' + program._description)
  console.log('')
  var table = new Table(program._tableSettings)
  table.push(['\tLicense:', program._license.gray.italic])
  table.push(['\tAuthor:', program._author.gray.italic])
  table.push(['\tHomepage:', program._homepage.gray.italic])
  console.log(table.toString())
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
  process.exit()
}

function _displayMethods() {
  console.log('Methods:'.underline.bold)
  console.log('\tAll Methods have their own help dialog. Simply use:'.gray)
  console.log('\t\t' + program._name.gray.bold, '[command] --help'.gray.bold, 'or'.gray, program._name.gray.bold, '[command] -h'.gray.bold)
  console.log('')

  var table = new Table(program._tableSettings)
  _.forEach(program._commands, function (command) {
    table.push(['\t', command.cmd, command.desc.gray])
  })
  console.log(table.toString())
}

function _cleanArgs() {
  args.shift()
}

function _taskGen() {
  debug('Gen function entered')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--gen-key'], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Private Key Generation complete!'.bold.underline)
    console.log('')
  })
}

function _taskGenRevoke() {
  debug('GenRevoke function entered')
  var id = args[0]
  var keys = _utilGetKeys()
  if (id.indexOf('@') > -1) {
    return _utilEmailToKey(id, keys, _generateRevocation)
  }
  _generateRevocation(_.where(keys, {
    id: id
  })[0])
}

function _generateRevocation(results) {
  if (!results) {
    return console.log('No key found by that email address.'.bold.red)
  }
  var revokeFilename = results.email + '.' + results.key + '.asc.revoke'
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--armor', '--output', revokeFilename, '--gen-revoke', results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Generated Revokation Certificate successfully!'.bold)
    console.log(revokeFilename)
    console.log('')
  })
}

function _taskList(highlightID) {
  debug('List function entered')
  var keys = _utilGetKeys()
  console.log('')
  var table = new Table(program._tableSettings)
  _.forEach(keys, function (key, index) {
    if (key.type) {
      var emailMatch = _.where(key.uids, {
        email: highlightID
      }).length > 0
      if (key.key === highlightID || emailMatch) {
        table.push(['\t', key.type.magenta.bold, key.date.magenta.bold, key.uids[0].name.magenta.bold, key.uids[0].comment.magenta.bold, key.uids[0].email.magenta.bold, key.key.bold.magenta.bold])
      } else if (key.type === 'secret') {
        table.push(['\t', key.type.green.bold, key.date.green.bold, key.uids[0].name.green.bold, key.uids[0].comment.green.bold, key.uids[0].email.green.bold, key.key.bold.green.bold])
      } else {
        table.push(['\t', key.type, key.date.gray.bold, key.uids[0].name.gray, key.uids[0].comment.gray, key.uids[0].email, key.key.bold])
      }
      if (key.uids.length > 0) {
        _.forEach(key.uids, function (uid, index) {
          if (index > 0) {
            table.push(['\t', '', '', uid.name.gray, uid.comment.gray, uid.email.gray, '\t'])
          }
        })
      }
    }
  })
  console.log(table.toString())
  console.log('')
}

function _taskFingerprint() {
  debug('Fingerprint function entered')
  var id = args[0]
  var keys = _utilGetKeys()
  if (id.indexOf('@') > -1) {
    return _utilEmailToKey(id, keys, _printFingerprint)
  }
  _printFingerprint(_.where(keys, {
    key: id
  })[0])
}

function _printFingerprint(results) {
  if (!results) {
    return console.log('No key found by that email address.'.bold.red)
  }
  console.log('')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--fingerprint', results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
  })

}

function _taskSend() {
  debug('Send function entered')
  if (args[1] === 'to') {
    args = _.without(args, 'to')
  }
  var id = args[0]
  var keys = _utilGetKeys()
  if (id.indexOf('@') > -1) {
    return _utilEmailToKey(id, keys, _sendKeyToServer)
  }
  _sendKeyToServer(_.where(keys, {
    id: id
  })[0])
}

function _sendKeyToServer(results) {
  if (!results) {
    return console.log('No key found by that email address.'.bold.red)
  }
  console.log('')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--send-keys', '--keyserver', args[1], results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Sent key to '.bold + args[1].green.bold + ' successfully!'.bold)
    console.log('')
  })
}

function _taskGet() {
  debug('Get function entered')
  if (args[1] === 'from') {
    args = _.without(args, 'from')
  }
  var id = args[0]
  var server = args[1]
  if (id.indexOf('@') > -1) {
    return _utilRemoteEmailToKey(id, server, _importKeyFromServer)
  }
  console.log('NOT EMAIL')
  _importKeyFromServer({
    key: args[0]
  })
}

function _importKeyFromServer(results) {
  if (!results) {
    return console.log('No key found by that email address.'.bold.red)
  }
  console.log('')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--recv-keys', '--keyserver', args[1], results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Got '.bold + args[0].bold + ' from '.bold + args[1].green.bold + ' successfully!'.bold)
    console.log('')
    _taskList(results.key)
  })
}

function _taskSign() {
  debug('Sign function entered')

  var keys = _utilGetKeys()
  var isFile, isID
  try {
    var fullPath = path.resolve(process.cwd(), './' + args[0])
    var isFile = fs.statSync(fullPath).isFile()
    if (isFile) {
      _signFile(fullPath)
    } else {
      throw new Error('File doesn\'t exist')
    }
  } catch (e) {
    var isID = _.where(keys, function (key) {
      return _.where(key.uids, {
        email: args[0]
      }).length > 0
    }).length > 0 || _.where(keys, {
      key: args[0]
    }).length > 0
    var id = args[0]
    var keys = _utilGetKeys()
    if (id.indexOf('@') > -1) {
      return _utilEmailToKey(id, keys, _signKey)
    }
    _signKey(_.where(keys, {
      id: id
    })[0])
  }
}

function _signKey(results) {
  debug('_signKey function entered for', args[0])
  console.log('')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--sign-key', results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Signed '.bold + results.key.bold + ' successfully!'.bold)
    console.log('')
  })
}

function _signFile(fullPath) {
  debug('_signFile function entered for', fullPath)
  // TODO _signFile: sign <filename> [to <outputFilename>] [<message>]

   //check if args[0] is a filename or to
     // if to, remove and check args[1] if file
       // if not, sign message to args[0]
       // if so, sign file to args[0]
     // if file, check args[1] if to
       // if to, remove and sign file to args[1]
       // if not, sign file to predetermined name
   // if not to or file, sign to stdout
}

function _taskEdit() {
  debug('Edit function entered')
  var id = args[0]
  var keys = _utilGetKeys()
  if (id.indexOf('@') > -1) {
    return _utilEmailToKey(id, keys, _editKey)
  }
  console.log('NOT EMAIL')
  _editKey({
    key: args[0]
  })
}
function _editKey(results){
  console.log('')
  console.log('Edit Key is an interactive GPG tool.')
  console.log('')
  console.log('To set trust, type in "trust", then set the trust level')
  console.log('on a scale from 1 to 5.')
  console.log('')
  console.log('To exit the interactive prompt, type "quit"')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--edit-key', results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Edited '.bold + results.key.bold + ' successfully!'.bold)
    console.log('')
  })
}

function _taskTrust() {
  debug('Trust function entered')
  _taskEdit()
}

function _taskExport() {
  debug('Export function entered')
  if (args[1] === 'to') {
    args = _.without(args, 'to')
  }
  var id = args[0]
  var keys = _utilGetKeys()
  if (id.indexOf('@') > -1) {
    return _utilEmailToKey(id, keys, _exportKey)
  }
  console.log('NOT EMAIL')
  _exportKey({
    key: args[0]
  })
}
function _exportKey(results){
  var filename = args[1] || results.uids[0].email+'.'+results.key+'.signed.asc'
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--armor', '--output', filename, '--export', results.key], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Exported '.bold + results.key.bold + ' to '+filename+' successfully!'.bold)
    console.log('')
  })
}

function _taskImport() {
  debug('Import function entered')
  process.stdin.setRawMode(false); // Releasing stdin
  var proc = spawn('gpg', ['--import', args[0]], {
    stdio: [0, 1, 2]
  });
  proc.on("exit", function (code, signal) {
    process.stdin.setRawMode(true);
    console.log('')
    console.log('Imported '.bold + args[0].bold + ' successfully!'.bold)
    console.log('')
  })
}

function _taskEncrypt() {
  debug('Encrypt function entered')
 // TODO _taskEncrypt: encrypt [<filename>] [to <outputFilename>] [<message>]


 //check if args[0] is a filename or to
   // if to, remove and check args[1] if file
     // if not, convert message to args[0]
     // if so, convert file to args[0]
   // if file, check args[1] if to
     // if to, remove and convert file to args[1]
     // if not, convert file to predetermined name
 // if not to or file, convert to stdout
}

function _taskDecrypt() {
  debug('Decrypt function entered')
  // TODO _taskDecrypt: decrypt [<filename>] [to <outputFilename>] [<message>]

 //check if args[0] is a filename or to
   // if to, remove and check args[1] if file
     // if not, convert message to args[0]
     // if so, convert file to args[0]
   // if file, check args[1] if to
     // if to, remove and convert file to args[1]
     // if not, convert file to predetermined name
 // if not to or file, convert to stdout
}

function _taskVerify() {
  debug('Verify function entered')
  // TODO _taskVerify: verify [<filename>] [<message>]

  // check if args[0] is file
    // if not, verify message
    // if so, verify file
}

function _utilEmailToKey(email, keys, cb) {
  var matching = _.where(keys, function (obj) {
    return _.where(obj.uids, {
      email: email
    }).length > 0
  })
  if (matching.length > 1) {
    console.log('Multiple keys found'.bold)
    _.forEach(matching, function (key, index) {
      if (key.type === 'secret') {
        console.log('\t(' + index + ')', key.type.green.bold, key.date.green.bold, key.key.green.bold)
        _.forEach(key.uids, function (uid) {
          console.log('\t\t' + uid.email.green.bold, '<'.green.bold + uid.name.green.bold + '>'.green.bold, '('.green.bold + uid.comment.green.bold + ')'.green.bold, uid.type.green.bold)
        })
      } else {
        console.log('\t(' + index + ')', key.type, key.date.gray, key.key.bold)
        _.forEach(key.uids, function (uid) {
          console.log('\t\t' + uid.email.green, '<'.gray + uid.name.gray + '>'.gray, '('.gray + uid.comment.gray + ')'.gray, uid.type.gray)
        })
      }
    })
    prompt.start();
    prompt.get([{
      name: 'selection',
      description: 'Enter the number of the desired key',
      default: 0,
      type: 'number'
    }], function (err, result) {
      cb(matching[result.selection])
    });
  } else if (matching.length === 0) {
    cb()
  } else {
    cb(matching[0])
  }
}


function _utilRemoteEmailToKey(email, server, cb) {
  var urlEncodedEmail = encodeURIComponent(email)
  var lookupURL = 'http://' + server + '/pks/lookup?search=' + urlEncodedEmail + '&op=vindex&fingerprint=on'
  console.log('Searching'.bold, server.bold, 'for public key with email of'.bold, email.bold)
  console.log('')
  console.log('Requesting keys from', lookupURL.bold)
  console.log('Note: Relies on pgp.mit.edu page formatting.'.gray)
  console.log('')
  console.log('WARNING'.bold.magenta.inverse, 'Search by email functionality relies on scraping the website for results.'.magenta)
  console.log('This is a possible attack vector.'.red.bold, 'The safest way to recieve public keys'.magenta)
  console.log('is directly from the individual IRL.'.magenta, program._name.magenta, 'will present you with possibilities'.magenta)
  console.log('and the option to inspect prior to public key retrieval.'.magenta)
  console.log('')
  request.get(lookupURL).end(function _afterServerScrape(results) {
    if (results.error) {
      return cb(false, results.error)
    }
    var parsed = []
    var parser = new htmlparser.Parser({
      ontext: function (text) {
        parsed.push(text);
      }
    }, {
      decodeEntities: true
    });
    parser.write(results.body);
    parser.end();
    parsed = parsed.join('').split('Search results for')[2].split('\n')
    parsed.shift()
    parsed = parsed.join('\n').split('pub')
    parsed = _.map(parsed, function (line, index) {
      if (line.length > 0) {
        return 'pub' + line
      }
      return ''
    })
    var keys = _parseKey(parsed)
    if (keys.length > 1) {
      console.log('Multiple keys found!'.bold)
      _.forEach(keys, function (key, index) {
        console.log('\t(' + index + ')', key.key.bold)
        console.log('\t    Fingerprint:', key.fingerprint)
        console.log('\t    Date Created:'.gray, key.date.gray.bold)
        console.log('\t    ' + 'UIDs'.underline.bold)
        _.forEach(key.uids, function (uid) {
          uid.comment = uid.comment ? '(' + uid.comment + ')' : ''
          uid.email = uid.email ? '<' + uid.email.bold + '>' : ''
          console.log('\t\t' + uid.name, uid.comment.gray, uid.email)
        })
        if (key.sigs.length) {
          console.log('\t    ' + 'Signed by'.underline.bold)
          _.forEach(key.sigs, function (sig) {
            sig.comment = sig.comment ? '(' + sig.comment + ')' : ''
            sig.email = sig.email ? '<' + sig.email.bold + '>' : ''
            console.log('\t\t' + sig.name, sig.comment.gray, sig.email, sig.id.bold, 'on', sig.date)
          })
        }
      })
      prompt.start();
      prompt.get([{
        name: 'selection',
        description: 'Enter the number of the desired key',
        default: 0,
        type: 'number'
      }], function (err, result) {
        console.log('')
        console.log('You have selected', result.selection)
        console.log('\t', keys[result.selection].key.bold)
        console.log('\t    Fingerprint:', keys[result.selection].fingerprint)
        console.log('\t    Date Created:'.gray, keys[result.selection].date.gray.bold)
        console.log('\t    ' + 'UIDs'.underline.bold)
        _.forEach(keys[result.selection].uids, function (uid) {
          uid.comment = uid.comment ? uid.comment : ''
          uid.email = uid.email ? uid.email.bold : ''
          console.log('\t\t' + uid.name, uid.comment.gray, uid.email)
        })
        if (keys[result.selection].sigs.length) {
          console.log('\t    ' + 'Signed by'.underline.bold)
          _.forEach(keys[result.selection].sigs, function (sig) {
            sig.comment = sig.comment ? sig.comment : ''
            sig.email = sig.email ? sig.email.bold : ''
            console.log('\t\t' + sig.name, sig.comment.gray, sig.email, sig.id.bold, 'on', sig.date)
          })
        }
        console.log('')
        prompt.start();
        prompt.get([{
          name: 'verify',
          description: 'Please verify the fingerprint and identify of the key owner. Is this correct?',
          default: 't',
          type: 'string'
        }], function (err, result2) {
          if (result2.verify.toLowerCase() === 't' || result2.verify.toLowerCase() === 'true') {
            cb(keys[result.selection])
          } else {
            _utilRemoteEmailToKey(email, server, cb)
          }
        })
      });
    } else if (keys.length === 0) {
      // cb()
    } else {
      // cb(keys[0])
    }
  })
}

function _utilGetKeys() {
  debug('_utilGetKeys entered')
  var listKeys = spawnSync('gpg', ['--fingerprint'])
  var output = listKeys.stdout.toString()
  output = output.split('\n\n')
  var secrets = spawnSync('gpg', ['--list-secret-keys']).stdout.toString()
  return _.sortBy(_parseKey(output, secrets), 'date')
}

function _parseKey(keyArray, secrets) {
  debug('_parseKey entered')
  var allKeys = _.map(keyArray, function _parseKeyMap(key, index) {
    key = key.split('\n')
    if (index === 0) {
      key.shift()
      key.shift()
    }
    if (key.length > 1) {
      var keydate = key[0]
      var keyprint = keydate.match(/\/([A-Z|0-9]*)/)
      keyprint = keyprint ? keyprint[1].trim() : ''
      var date = keydate.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
      date = date ? date[0].trim() : ''
      var fingerprint = key[1].match(/\=([\w|\s]*)/)
      fingerprint = fingerprint ? fingerprint[1].trim() : ''
      var type = 'public'
      if (secrets && secrets.indexOf(keyprint) > -1) {
        type = 'secret'
      }
      var uids = _.map(key, function _parseKeyMapUidMap(line) {
        if (line.match(/^uid*.*/)) {
          line = line.split('uid ')
          line.shift()
          if (line.length == 1) {
            line = line[0]
          } else {
            line = line.join('uid ')
          }
          line = line.trim()
          if (line.indexOf(']') > -1) {
            line = line.split(']')[1]
          }
          var uid = {}
          uid.type = line.match(/\[(.*)\]/)
          uid.type = uid.type ? uid.type[1] : ''
          uid.comment = line.match(/\((.*)\)/)
          uid.comment = uid.comment ? uid.comment[1] : ''
          uid.name = line.split(' <')[0]
          if (uid.name.indexOf(' (') > -1) {
            uid.name = uid.name.split(' (')[0]
          }
          uid.email = line.match(/\<(.*)\>/)
          uid.email = uid.email ? uid.email[1].trim() : ''
          return uid
        }
      })
      var uids = _.without(uids, undefined)
      sigs = _.map(key, function _parseKeyMapSigMap(line) {
        if (line.match(/^sig*.*/)) {
          var sig = {}
          sig.id = line.match(/sig[3|2]?\s*([A-Z|0-9]{8})/)
          sig.id = sig.id ? sig.id[1] : false
          sig.date = line.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
          sig.date = sig.date ? sig.date[0].trim() : ''
          sig.name = line.split('__________ ')
          sig.name = sig.name[sig.name.length - 1].split('\r')[0]
          sig.email = sig.name ? sig.name.match(/\<(.*)\>/) : false
          sig.email = sig.email ? sig.email[1].trim() : ''
          sig.comment = sig.name ? sig.name.match(/\((.*)\)/) : false
          sig.comment = sig.comment ? sig.comment[1] : ''
          sig.name = sig.name.split(' <')[0]
          if (sig.name.indexOf(' (') > -1) {
            sig.name = sig.name.split(' (')[0]
          }
          if (sig.id && sig.name.indexOf('[selfsig]') < 0) {
            return sig
          }
        }
      })
      var sigs = _.without(sigs, undefined)
      var subs = _.map(key, function _parseKeyMapSubMap(line) {
        if (line.match(/^sub*.*/)) {
          var sub = {}
          sub.keyprint = line.match(/\/([A-Z|0-9]*)/)
          sub.keyprint = sub.keyprint ? sub.keyprint[1] : false
          sub.date = line.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
          sub.date = sub.date ? sub.date[0].trim() : ''
          sub.expires = line.match(/\[(.*)\]/)
          sub.expires = sub.expires ? sub.expires[0].match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/) : ''
          sub.expires = sub.expires ? sub.expires[0].trim() : ''
          return sub
        }
      })
      subs = _.without(subs, undefined)
      var returnKey = {
        key: keyprint,
        fingerprint: fingerprint,
        date: date,
        uids: uids,
        subs: subs,
        sigs: sigs,
        type: type
      }
      return returnKey
    }
    return false
  })
  allKeys = _.without(allKeys, false)
  return allKeys
}
