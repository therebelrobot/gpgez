# gpgez

A wrapper for common GPG commands, cuz typing sux

## Installation

```
npm install gpgez -g
```

## Usage

### help

```
$ gpgez --help

gpgez   v0.0.1
  A wrapper for common GPG commands, cuz typing sux

  License:  ISC
  Author:   Trent Oswald (@therebelrobot) <trentoswald@therebelrobot.com>
  Homepage: https://github.com/therebelrobot/gpgez

Usage:
  gpgez [options] <command>

Options:
  -h,  --help     Show this help dialog
  -v,  --verbose   Enable verbose mode
  -#,  --debug   Enable Developer Debug mode
      --version   Print version number

Methods:
  All Methods have their own help dialog. Simply use:
    gpgez [command] --help or gpgez [command] -h

  gen         Generate keypair
  gen-revoke  Generate revocation certificate from email or Key ID
  list        list PGP keys, public and private
  fingerprint View fingerprint for key
  send        Send PGP key to keyserver
  get         Get PGP key from keyserver
  sign        Sign either a public key or a file/message
  edit        Edit public key, set trust
  trust       Edit public key, set trust (alias of edit)
  export      Export public key
  import      Import a signed public key
  encrypt     Encrypt file/message
  decrypt     Decrypt file/message
  verify      Verify the public key of a signed file/message
```

### version

```
$ gpgez --version

gpgez  v1.0.0
  A wrapper for common GPG commands, cuz typing sux

  License:  ISC
  Author:   Trent Oswald (@therebelrobot) <trentoswald@therebelrobot.com>
  Homepage: https://github.com/therebelrobot/gpgez
```

### gen

```
$ gpgez gen --help

Usage:
	gpgez gen
	Generate keypair
	Starts generating private/public keypair.
```

### gen-revoke

```
$ gpgez gen-revoke --help

Usage:
	gpgez gen-revoke <privatekey_email_keyID>
	Generate revocation certificate from email or Key ID
	<privatekey_email_keyID> is the email address or keyID of the keypair.
```

### list

```
$ gpgez list --help

Usage:
	gpgez list [--private] [--public]
	list PGP keys, public and private
	Lists all GPG keys on the system, filtered by flag (defaults to both)
```

### fingerprint

```
$ gpgez fingerprint --help

Usage:
	gpgez fingerprint <email_keyID>
	View fingerprint for key
	<email_keyID> is the email address or keyID of a keypair, public or private.
```

### send

```
$ gpgez send --help

Usage:
	gpgez send <privatekey_email_keyID> to <server>
	Send PGP key to keyserver
	<privatekey_email_keyID> is the email address or keyID of the keypair,
	and <server> is a working keyserver.
```

### get

```
$ gpgez get --help

Usage:
	gpgez get <email_keyID> from <server>
	Get PGP key from keyserver
	<email_keyID> is the email address or keyID of the keypair, public or private,
	and <server> is a working keyserver.
```

### sign

```
$ gpgez sign --help

Usage:
	gpgez sign <publickey_email_keyID> [with <privatekey_email_keyID>]
	gpgez sign <filename> [to <outputFilename>]
	Sign either a public key or a file
	<publickey_email_keyID>(optional, defaults to message signing) is the email address or keyID of the keypair to sign, <filename> is the name of the output file,
	<privatekey_email_keyID>(optional, defaults to default private key) is the email address or keyID of the keypair to encrypt with, <outputFilename>(optional, defaults to stdout) is the filename to save the output to.
```

### edit

```
$ gpgez edit --help

Usage:
	gpgez edit <publickey_email_keyID>
	Edit public key, set trust
	<publickey_email_keyID> is the email address or keyID of the keypair.
```

### trust

```
$ gpgez trust --help

Usage:
	gpgez trust <publickey_email_keyID>
	Edit public key, set trust (alias of edit)
	<publickey_email_keyID> is the email address or keyID of the keypair.
```

### export

```
$ gpgez export --help

Usage:
	gpgez export <publickey_email_keyID> to <filename>
	Export public key
	<publickey_email_keyID> is the email address or keyID of the keypair,
	and <filename> is the name of the output file.
```

### import

```
$ gpgez import --help

Usage:
	gpgez import <filename>
	Import a signed public key
	<filename> is the name of the file to import.
```

### encrypt

```
$ gpgez encrypt --help

Usage:
	gpgez encrypt <filename> for <publickey_email_keyID> [to <outputFilename>]
	Encrypt file
	<filename> is the name of the output file,
	<privatekey_email_keyID>(optional, defaults to default private key) is the email address or keyID of the keypair to encrypt with,
	<outputFilename>(optional, defaults to stdout) is the filename to save the output to.
```

### decrypt

```
$ gpgez decrypt --help

Usage:
	gpgez decrypt <filename> [to <outputFilename>]
	Decrypt file
	<filename> is the name of the file to decrypt,
	<privatekey_email_keyID>(optional, defaults to default private key) is the email address or keyID of the keypair to decrypt with,
	<outputFilename>(optional, defaults to stdout) is the filename to save the output to.
```

### verify

```
$ gpgez verify --help

Usage:
	gpgez verify <filename>
	Verify the public key of a signed file
	<filename> is the name of the file to verify.
```

## License
[ISC](https://tldrlegal.com/license/-isc-license)

Copyright (c) 2015, Trent Oswald (@therebelrobot) <trentoswald@therebelrobot.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
