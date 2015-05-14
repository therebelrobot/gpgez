# gpgez
A wrapper for common GPG commands, until you get more comfortable with the lengthier versions

```
gpgez 	v0.0.1
	A wrapper for common GPG commands, until you get more comfortable with the lengthier versions

	License:  ISC
	Author:   Trent Oswald (@therebelrobot) <trentoswald@therebelrobot.com>
	Homepage: https://github.com/therebelrobot/gpgez

Usage:
	gpgez [options] <command>

Options:
	 -h,	--help 		Show this help dialog
	 -v,	--verbose 	Enable verbose mode
	 -#,	--debug 	Enable Developer Debug mode
	    	--version 	Print version number

Methods:
	All Methods have their own help dialog. Simply use:
		gpgez [command] --help or gpgez [command] -h

	 gen         Generate keypair
	 gen-revoke  Generate revocation certificate from email or Key ID
	 list        list PGP keys, public and private
	 fingerprint View fingerprint for key
	 send        Send PGP key to keyserver
	 get         Get PGP key to keyserver
	 sign        Sign either a public key or a file/message
	 edit        Edit public key, set trust
	 trust       Edit public key, set trust (alias of edit)
	 export      Export public key
	 import      Import a signed public key
	 encrypt     Encrypt file/message
	 decrypt     Decrypt file/message
	 verify      Verify the public key of a signed file/message
```
