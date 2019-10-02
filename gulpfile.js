var gulp = require("gulp");
var append = require("gulp-append-prepend").appendText;
var prepend = require("gulp-append-prepend").prependText;
var babel = require("gulp-babel");
var clone = require("gulp-clone");
var concat = require("gulp-concat");
var nop = require("gulp-nop");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify-es").default;
var es = require("event-stream");

var { version } = require("./version");

var nos = Object("");
var debugExp = /\/\* debug: ([\s\S]*?)\*\//g;

function makeImpl(filename, className, declare, debug, sources) {

	let header = `var toString=function(){return Object.toString().replace(/Object/,"${className}").replace(/native/,"sactory")};` +
		`${className}.toString=toString.toString=toString;Object.defineProperty(${className},"VERSION",{value:"${version}"});` +
		`Object.defineProperty(${className},"BUILT",{value:"${new Date().toISOString()}"});`;
	let reserved = [className, "Widget", "Builder", "Bind", "Subscription", "Observable", "ComputedObservable", "Array", "Color", "RGBColor", "HSLColor", "Parser", "ParserError"];

	if(declare) {
		header += `function ${className}(){}`;
	}

	var stream = gulp.src(sources.map(s => "src/" + s + ".js"))
		.pipe(sourcemaps.init())
		.pipe(concat(filename + ".js"))
		.pipe(replace(/var Sactory = {};?/gm, ""))
		.pipe(replace(/(var {?[a-zA-Z0-9_,:\s]+}? = )?require\(\"[a-zA-Z0-9_\-\.\/]*\"\)[a-zA-Z0-9_\.]*;/gm, ""))
		.pipe(replace(/(module\.exports = {?[a-zA-Z0-9_,\s\.]*}?;)/gm, ""))
		.pipe(replace(/(Sactory[A-Za-z]+)/gm, className));

	if(debug) {
		// uncomment debug expressions
		stream = stream.pipe(replace(debugExp, "/* debug: */$1"));
	}

	var module = stream.pipe(clone())
		.pipe(prepend(header, nos));

	var modulePretty = module.pipe(clone())
		.pipe(append(`export default ${className};`, nos))
		.pipe(rename(filename + ".module.js"))
		.pipe(sourcemaps.write("./maps"))
		.pipe(gulp.dest("dist"));

	var moduleUgly = module.pipe(clone())
		.pipe(uglify({mangle: {toplevel: true, reserved}}))
		.pipe(append(`export default ${className};`, nos))
		.pipe(rename(filename + ".module.min.js"))
		.pipe(sourcemaps.write("./maps"))
		.pipe(gulp.dest("dist"));

	var amd = stream.pipe(clone())
		.pipe(prepend(`!function(a){if(typeof define=='function'&&define.amd){define(a);}else{window.${className}=a();}}(function(){${header}`, nos))
		.pipe(append(`return ${className};});`, nos));

	var amdPretty = amd.pipe(clone())
		.pipe(sourcemaps.write("./maps"))
		.pipe(gulp.dest("dist"));

	var amdUgly = amd.pipe(clone())
		.pipe(babel({
			presets: ["babel-preset-env", ["babel-preset-minify", {
				builtIns: false,
				mangle: {exclude: reserved}
			}]],
			minified: true,
			comments: false
		}))
		.pipe(rename(filename + ".min.js"))
		.pipe(sourcemaps.write("./maps"))
		.pipe(gulp.dest("dist"));

	return es.merge(modulePretty, moduleUgly, amdPretty, amdUgly).pipe(nop());

}

/*function make(filename, className, declare, debug, sources) {
	return es.merge(
		makeImpl(filename, className, declare, false, sources),
		makeImpl(filename + ".debug", className, declare, true, sources.concat(debug))
	).pipe(nop());
}*/

gulp.task("dist:sactory", () => makeImpl("sactory", "Sactory", false, false, [
	"polyfill",
	"attr",
	"util",
	"runtime/config", // must be first
	"runtime/bind",
	"runtime/core",
	"runtime/counter",
	"runtime/chain",
	"runtime/const",
	"runtime/context",
	"runtime/client",
	"runtime/misc",
	"runtime/observable",
	"runtime/style",
	"runtime/twoway",
	"runtime/widget",
	"runtime/widgets"
]));

gulp.task("dist:sactory-observable", () => makeImpl("sactory-observable", "Sactory", true, false, [
	"runtime/context",
	"runtime/observable"
]));

gulp.task("dist:transpiler", () => makeImpl("transpiler", "Transpiler", false, false, [
	"polyfill",
	"attr",
	"transpiler/util",
	"transpiler/parser",
	"transpiler/generated",
	"transpiler/mode",
	"transpiler/transpiler",
	"transpiler/eval"
]));

gulp.task("dist", gulp.parallel("dist:sactory", "dist:sactory-observable", "dist:transpiler"));
