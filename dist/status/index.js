parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"SL2S":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=t;const e="❯";function t({isSelected:t,el:r}){return` ${t?e:" "} ${r}`}
},{}],"d6PF":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.isGitRepo=exports.gitLog=exports.gitDiff=exports.gitCommitAmend=exports.gitCommitFixup=exports.gitCommit=exports.gitStatus=exports.runCmd=void 0;var t=o(require("child_process")),e=require("node-pty");function o(t){return t&&t.__esModule?t:{default:t}}const s=({params:t=[],options:o})=>(0,e.spawn)("git",t,o);exports.runCmd=s;const i=()=>s({params:["-c","color.ui=always","status","-s","-u"]});exports.gitStatus=i;const r=(e=[])=>t.default.spawn("git",["commit",...e],{stdio:"inherit"});exports.gitCommit=r;const n=t=>r(["--fixup",t]);exports.gitCommitFixup=n;const p=()=>r(["--amend"]);exports.gitCommitAmend=p;const u=()=>new Promise((e,o)=>t.default.exec("git diff --cached --name-only",{encoding:"utf8"},(t,s)=>t?o(t):e(s)));exports.gitDiff=u;const a=()=>new Promise((e,o)=>t.default.exec("git log --color=always --format='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'",{encoding:"utf8"},(t,s)=>t?o(t):e(s)));exports.gitLog=a;const c=()=>new Promise((e,o)=>t.default.exec("git rev-parse --is-inside-work-tree",{encoding:"utf8"},(t,s)=>t?o(t):e(s)));exports.isGitRepo=c;
},{}],"Z2gG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.statusStrToList=void 0;const t=t=>t.split("\n").slice(0,-1);exports.statusStrToList=t;
},{}],"CZQL":[function(require,module,exports) {
var t=null;function e(){return t||(t=n()),t}function n(){try{throw new Error}catch(e){var t=(""+e.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);if(t)return r(t[0])}return"/"}function r(t){return(""+t).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/,"$1")+"/"}exports.getBundleURL=e,exports.getBaseURL=r;
},{}],"laX2":[function(require,module,exports) {
var r=require("./bundle-url").getBundleURL;function e(r){Array.isArray(r)||(r=[r]);var e=r[r.length-1];try{return Promise.resolve(require(e))}catch(n){if("MODULE_NOT_FOUND"===n.code)return new s(function(n,i){t(r.slice(0,-1)).then(function(){return require(e)}).then(n,i)});throw n}}function t(r){return Promise.all(r.map(u))}var n={};function i(r,e){n[r]=e}module.exports=exports=e,exports.load=t,exports.register=i;var o={};function u(e){var t;if(Array.isArray(e)&&(t=e[1],e=e[0]),o[e])return o[e];var i=(e.substring(e.lastIndexOf(".")+1,e.length)||e).toLowerCase(),u=n[i];return u?o[e]=u(r()+e).then(function(r){return r&&module.bundle.register(t,r),r}).catch(function(r){throw delete o[e],r}):void 0}function s(r){this.executor=r,this.promise=null}s.prototype.then=function(r,e){return null===this.promise&&(this.promise=new Promise(this.executor)),this.promise.then(r,e)},s.prototype.catch=function(r){return null===this.promise&&(this.promise=new Promise(this.executor)),this.promise.catch(r)};
},{"./bundle-url":"CZQL"}],"Focm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.preRender=void 0;var e=n(require("process")),r=n(require("readline")),t=n(require("react")),i=n(require("cli-cursor")),u=n(require("chalk")),o=n(require("../../components/Selector")),s=require("../../git-utils"),l=require("../../utils");function n(e){return e&&e.__esModule?e:{default:e}}i.default.hide();const a=r=>{const{underline:t,bold:i,green:s,red:l,blue:n,yellow:a}=u.default,d=[` ${t(i(s("s")))}tage | `,`${t(i(l("r")))}eset | `,`check${t(i(l("o")))}ut | `,`${t(i(n("c")))}ommit | `,`${t(i(n("a")))}mend | `,`${t(i(n("f")))}ixup | `,`${t(i(a("q")))}uit`].join(""),c=r.map((e,r)=>(0,o.default)({isSelected:0===r,el:e}));e.default.stdout.write(["",d,"",...c,"",""].join("\n"))};exports.preRender=a;const d=async()=>{try{await(0,s.isGitRepo)(),(0,s.gitStatus)().on("data",async i=>{const u=(0,l.statusStrToList)(i);a(u),r.default.moveCursor(e.default.stdout,-u[0].length,-u.length-1);const[{render:o},s]=await Promise.all([require("_bundle_loader")(require.resolve("ink")),require("_bundle_loader")(require.resolve("./View.js")).then(e=>e.default)]);o(t.default.createElement(s,{initialLines:u}))})}catch(i){console.error(i.message)}};d();
},{"../../components/Selector":"SL2S","../../git-utils":"d6PF","../../utils":"Z2gG","_bundle_loader":"laX2","./View.js":[["View.3e3bd5f5.js","dWZ4"],"View.3e3bd5f5.js.map","dWZ4"]}],"EoIL":[function(require,module,exports) {
var n=require("fs");module.exports=function(e){return new Promise(function(t,i){n.readFile(__dirname+e,"utf8",function(n,e){n?i(n):setImmediate(function(){t(e)})})}).then(function(n){new Function("",n)()})};
},{}],0:[function(require,module,exports) {
var b=require("laX2");b.register("js",require("EoIL"));
},{}]},{},[0,"Focm"], null)
//# sourceMappingURL=/index.js.map