class Scenarist {

#$ = Scenarist .#director .bind ( this );

#scenario;
#plot = new Map;
#ready;

constructor ( scenario ) {

this .#scenario = scenario;

if ( typeof this .#scenario [ '$__' ] === 'function' )
this .#ready = this .#$ ( Symbol .for ( '_' ) );

}; // Scenarist .prototype .constructor

async $ () { await this .#ready; return this .#$ };

static async #director ( ... argv ) {

const setting = argv [ 0 ] instanceof Scenarist .Setting ?
Object .create ( argv .shift () )
: new Scenarist .Setting ( ... argv [ 0 ] instanceof Array ? argv .shift () : [] );
let direction = typeof argv [ 0 ] === 'symbol' ? '$_' + Symbol .keyFor ( argv [ 0 ] ) : '$' + argv [ 0 ];
let conflict = this .#scenario [ direction ];
let resolution;

if ( conflict === undefined )
conflict = this .#scenario [ direction = '$_' ];

else
argv .shift ();

if ( direction [ 0 ] === '$' && direction [ 1 ] !== '_' )
setting .push ( direction .slice ( 1 ) );

setting .$ = this .#$;

switch ( typeof conflict ) {

case 'object':

if ( ! this .#plot .has ( conflict ) ) {

const scenarist = new this .constructor ( conflict );

await scenarist .#ready;

this .#plot .set ( conflict, scenarist );

}

resolution = this .#plot .get ( conflict ) .#$ ( setting, ... argv );

break;

case 'function':

resolution = this .#scenario [ direction ] ( setting, ... argv );

break;

default:

resolution = conflict;

}

setting .resolution = await resolution;

return typeof this .#scenario .$_$ === 'function' ? await this .#scenario .$_$ ( setting ) : setting .resolution;

}; // #director

static Setting = class Setting extends Array {

get player () { return Object .getPrototypeOf ( this ) };

}; // Scenarist .Setting

}; // Scenarist

export default scenario => new Scenarist ( scenario ) .$ ();
