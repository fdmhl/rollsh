import Scenarist from './scenarist.mjs';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Writable } from 'node:stream';
import { Console } from 'node:console';
import { parse } from 'node:path';

try {

await Scenarist ( new class Rollsh {

#argv;
#filename;
#script;

constructor ( ... argv ) { this .#argv = argv };

async $__ ( setting ) {

if ( ! this .#argv .length )
throw Object .assign ( setting, { message: 'The FILENAME is missing' } );

this .#filename = this .#argv .shift ();

try {

this .#script = ( await readFile ( this .#filename, 'utf8' ) ) .split ( '\n' );

} catch ( { message } ) {

throw Object .assign ( setting, { message: `Couldn't read the rollsh script at ${ this .#filename }
${ message }` } );

}

await setting .$ ( Symbol .for ( 'processor' ) );

}; // Rollsh .prototype .$__

#line;
#cursor = 0;

async $_processor ( { $ } ) {

if ( ! this .#script .length )
return;

this .#line = this .#script .shift () .trim () .split ( /\s+/ );
this .#cursor++;

try { await Promise .resolve ( $ ( ... this .#line ) ) }
catch ( error ) { throw Object .assign ( error, {

filename: this .#filename,
line: this .#line .join ( ' ' ),
cursor: this .#cursor

} ) }

await $ ( Symbol .for ( 'processor' ) );

}; // Rollsh .prototype .$_processor

async [ '$```rollsh' ] ( setting, ... argv ) {

if ( this .$_ )
throw Object .assign ( setting, { message: "Can't start a new rollsh page before finishing the current one" } );

this .$_ = new Rollsh .#Page ( ... argv );

await setting .$ ( Symbol .for ( 'stdio' ) );

}; // Rollsh .prototype [ '$```rollsh' ]

$_argv () { return this .#argv .join ( ' ' ) };

async $_finish ( setting, code ) {

if ( code !== 0 )
throw Object .assign ( setting, { message: `Rollsh page process didn't finish successfully:
#commandLine ${ await setting .$ ( Symbol .for ( 'command' ) ) }
#exitCode ${ code }` } );

delete this .$_;

}; // Rollsh .prototype .$_finish

static #Page = class Page {

#process;
#input;
#exit;
#code;

constructor ( ... argv ) {

this .$_stdio = new Rollsh .#Stdio ( ... argv );
this .#exit = new Promise ( ( ... code ) => ( this .#code = code ) );

}; // Rollsh .#Page .prototype .constructor

$_ ( { player: { $ } }, ... argv ) {

if ( ! this .#process )
return $ ( Symbol .for ( 'process' ), ... argv );

this .#input .log ( ... argv );

}; // Rollsh .#Page .prototype .$_

async $_process ( setting, ... argv ) {

if ( ! argv .length )
throw Object .assign ( setting, { message: "Can't create a new rollsh page without providing a command" } );

this .$_command = argv .join ( ' ' );

this .#process = spawn ( 'bash', [ '-c', `ARGV=(${ ( await setting .player .$ ( Symbol .for ( 'argv' ) ) ) }) ; ${ this .$_command }`, 'rollsh' ], { stdio: await setting .$ ( Symbol .for ( 'stdio' ) ) } );

this .#input = new Console ( this .#process .stdin || process .stdin );

this .#process .on ( 'exit', code => setting .player .$ ( Symbol .for ( 'finish' ), code )
.then ( () => this .#code [ 0 ] ( code ) )
.catch ( error => this .#code [ 1 ] ( error ) ) );

}; // Rollsh .#Page .prototype .$_process

[ '$```' ] ( { player: { $ } } ) {

if ( this .#process .stdin instanceof Writable && ! this .#process .stdin .writableEnded )
this .#process .stdin .end ();

return this .#exit;

}; // Rollsh .#Page .prototype [ '$```' ]

}; // Rollsh .#Page

static #Stdio = class Stdio {

#argv;
#value = [ 'pipe', 'pipe', 'pipe' ];

constructor ( ... argv ) { this .#argv = argv };

async $__ ( { $ } ) { return await $ ( ... this .#argv ) };

$_ ( setting, ... argv ) {

if ( ! argv .length )
return this .#value;

const descriptor = parseFloat ( argv .shift () );

switch ( descriptor ) {

case 0: case 1: case 2:
this .#value [ descriptor ] = 'inherit';

return setting .$ ( ... argv );

default:
throw Object .assign ( setting, { message: 'Invalid stdio file descriptor number: ' + descriptor } );

}

}; // Rollsh .#Stdio .prototype .$_

}; // Rollsh .#Stdio

} ( ... process .argv .slice ( 2 ) ) ); // Scenarist ( Rollsh )

} catch ( error ) {

console .error ( '#rollsh', `${ parse ( import .meta .url ) .dir }/${ error .filename }:${ error .cursor }
${ error .line }

${ error .message }` );

}
