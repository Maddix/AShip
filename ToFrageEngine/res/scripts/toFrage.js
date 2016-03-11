// Maddix - Started 2/1/2014 (MM/DD/YYYY)

// /////////////////////////////////////////////
// General Notes for understanding this micro-framework(?)
// - Rotations are in radians.
// - ratio = [width, height]
// - pos = [x, y]
// - inputContext is just a function that checks a input object for keys to react to
// - context is a Canvas.context("2d") object

 /*ldp
	Wraps everything into a nice namespace.
 */
function ToFrage() {
	'use strict'; // Try putting 'var private = {};' somewhere. It should throw an error.

	var frage = {};
	frage.author = "Maddix";
	frage.Base = Base();
	frage.Graphics = Graphics(frage.Base);
	frage.WindowLib = WindowLib(frage);
	frage.Events = Events(frage);
	frage.Input = Input(frage);
	frage.Particles = Particles(frage);
	frage.Math = GameMath() // Add math into this and update all the code to use it :S

	return frage;

};
