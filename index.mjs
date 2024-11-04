import Scenarist from './scenarist.mjs';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Writable } from 'node:stream';
import { Console } from 'node:console';

try {

await Scenarist ( new class Rollsh {

usage = 'Usage: rollsh FILENAME [ ... argv ]';

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

line: this .#line,
cursor: this .#cursor

} ) }

await $ ( Symbol .for ( 'processor' ) );

}; // Rollsh .prototype .$_processor

[ '$```rollsh' ] ( setting, ... argv ) {

if ( this .$_ )
throw Object .assign ( setting, { message: "Can't start a new rollsh page before finishing the current one" } );

this .$_ = new Rollsh .#Page ( ... argv );

}; // Rollsh .prototype [ '$```rollsh' ]

$_finish ( { $ }, code ) {

if ( code !== 0 )
throw Object .assign ( setting, { message: "Current rollsh page didn't finish successfully" } );

delete this .$_;

}; // Rollsh .prototype .$_finish

static #Page = class Page {

#process;
#input;
#exit;
#code;

constructor ( ... argv ) {

this .$_setup = new Rollsh .#Setup ( ... argv );
this .#exit = new Promise ( code => ( this .#code = code ) );

}; // Rollsh .#Page .prototype .constructor

$_ ( { player: { $ } }, ... argv ) {

if ( ! this .#process )
return $ ( Symbol .for ( 'process' ), ... argv );

if ( this .#input )
this .#input .log ( ... argv );

}; // Rollsh .#Page .prototype .$_

async $_process ( setting, ... argv ) {

if ( ! argv .length )
throw Object .assign ( setting, { message: "Can't create a new rollsh page without providing a command" } );

const { $ } = setting;

this .#process = spawn ( 'bash', [ '-c', argv .join ( ' ' ), 'rollsh' ], await $ ( Symbol .for ( 'setup' ) ) );

if ( this .#process .stdin instanceof Writable )
this .#input = new Console ( this .#process .stdin );

this .#process .on ( 'exit', code => setting .player .$ ( Symbol .for ( 'finish' ), code )
.then ( () => this .#code ( code ) ) );

}; // Rollsh .#Page .prototype .$_process

[ '$```' ] ( { player: { $ } } ) {

if ( this .#process .stdin instanceof Writable && ! this .#process .stdin .writableEnded )
this .#process .stdin .end ();

return this .#exit;

}; // Rollsh .#Page .prototype [ '$```' ]

}; // Rollsh .#Page

static #Setup = class Setup {

#argv;
#options = {

stdio: [ 'pipe', 'pipe', 'pipe' ]

}; // Rollsh .#Setup .prototype .#options

constructor ( ... argv ) { this .#argv = argv };

$__ ( { $ } ) { return $ ( ... this .#argv ) };

$_ ( { $ }, ... argv ) {

if ( ! argv .length )
return this .#options;

}; // Rollsh .#Setup .prototype .$_

}; // Rollsh .#Setup

} ( ... process .argv .slice ( 2 ) ) ); // Scenarist ( Rollsh )

} catch ( error ) {

console .error ( '#rollsh', error );

}
