import{_ as L,U as P,V as b,W as _,X as y,Y as R,Z as j,$ as M,a0 as S,a1 as U,a2 as F,j as d}from"./firebase-CLBmttlh.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $="type.googleapis.com/google.protobuf.Int64Value",H="type.googleapis.com/google.protobuf.UInt64Value";function O(e,t){const r={};for(const n in e)e.hasOwnProperty(n)&&(r[n]=t(e[n]));return r}function T(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>T(t));if(typeof e=="function"||typeof e=="object")return O(e,t=>T(t));throw new Error("Data cannot be encoded in JSON: "+e)}function N(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case $:case H:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>N(t)):typeof e=="function"||typeof e=="object"?O(e,t=>N(t)):e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const E="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class h extends F{constructor(t,r,n){super(`${E}/${t}`,r||""),this.details=n,Object.setPrototypeOf(this,h.prototype)}}function Z(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function A(e,t){let r=Z(e),n=r,s;try{const a=t&&t.error;if(a){const o=a.status;if(typeof o=="string"){if(!v[o])return new h("internal","internal");r=v[o],n=o}const i=a.message;typeof i=="string"&&(n=i),s=a.details,s!==void 0&&(s=N(s))}}catch{}return r==="ok"?null:new h(r,n,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(t,r,n,s){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,_(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=r.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||r.get().then(a=>this.auth=a,()=>{}),this.messaging||n.get().then(a=>this.messaging=a,()=>{}),this.appCheck||s==null||s.get().then(a=>this.appCheck=a,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t==null?void 0:t.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const r=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return r.error?null:r.token}return null}async getContext(t){const r=await this.getAuthToken(),n=await this.getMessagingToken(),s=await this.getAppCheckToken(t);return{authToken:r,messagingToken:n,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k="us-central1",J=/^data: (.*?)(?:\n|$)/;function q(e){let t=null;return{promise:new Promise((r,n)=>{t=setTimeout(()=>{n(new h("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class V{constructor(t,r,n,s,a=k,o=(...i)=>fetch(...i)){this.app=t,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new G(t,r,n,s),this.cancelAllRequests=new Promise(i=>{this.deleteService=()=>Promise.resolve(i())});try{const i=new URL(a);this.customDomain=i.origin+(i.pathname==="/"?"":i.pathname),this.region=k}catch{this.customDomain=null,this.region=a}}_delete(){return this.deleteService()}_url(t){const r=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${r}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${r}.cloudfunctions.net/${t}`}}function B(e,t,r){const n=S(t);e.emulatorOrigin=`http${n?"s":""}://${t}:${r}`,n&&U(e.emulatorOrigin+"/backends")}function X(e,t,r){const n=s=>W(e,t,s,r||{});return n.stream=(s,a)=>z(e,t,s,a),n}function D(e){return e.emulatorOrigin&&S(e.emulatorOrigin)?"include":void 0}async function Y(e,t,r,n,s){r["Content-Type"]="application/json";let a;try{a=await n(e,{method:"POST",body:JSON.stringify(t),headers:r,credentials:D(s)})}catch{return{status:0,json:null}}let o=null;try{o=await a.json()}catch{}return{status:a.status,json:o}}async function I(e,t){const r={},n=await e.contextProvider.getContext(t.limitedUseAppCheckTokens);return n.authToken&&(r.Authorization="Bearer "+n.authToken),n.messagingToken&&(r["Firebase-Instance-ID-Token"]=n.messagingToken),n.appCheckToken!==null&&(r["X-Firebase-AppCheck"]=n.appCheckToken),r}function W(e,t,r,n){const s=e._url(t);return K(e,s,r,n)}async function K(e,t,r,n){r=T(r);const s={data:r},a=await I(e,n),o=n.timeout||7e4,i=q(o),l=await Promise.race([Y(t,s,a,e.fetchImpl,e),i.promise,e.cancelAllRequests]);if(i.cancel(),!l)throw new h("cancelled","Firebase Functions instance was deleted.");const u=A(l.status,l.json);if(u)throw u;if(!l.json)throw new h("internal","Response is not valid JSON object.");let c=l.json.data;if(typeof c>"u"&&(c=l.json.result),typeof c>"u")throw new h("internal","Response is missing data field.");return{data:N(c)}}function z(e,t,r,n){const s=e._url(t);return Q(e,s,r,n||{})}async function Q(e,t,r,n){var p;r=T(r);const s={data:r},a=await I(e,n);a["Content-Type"]="application/json",a.Accept="text/event-stream";let o;try{o=await e.fetchImpl(t,{method:"POST",body:JSON.stringify(s),headers:a,signal:n==null?void 0:n.signal,credentials:D(e)})}catch(f){if(f instanceof Error&&f.name==="AbortError"){const w=new h("cancelled","Request was cancelled.");return{data:Promise.reject(w),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(w)}}}}}}const g=A(0,null);return{data:Promise.reject(g),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(g)}}}}}}let i,l;const u=new Promise((f,g)=>{i=f,l=g});(p=n==null?void 0:n.signal)==null||p.addEventListener("abort",()=>{const f=new h("cancelled","Request was cancelled.");l(f)});const c=o.body.getReader(),m=ee(c,i,l,n==null?void 0:n.signal);return{stream:{[Symbol.asyncIterator](){const f=m.getReader();return{async next(){const{value:g,done:w}=await f.read();return{value:g,done:w}},async return(){return await f.cancel(),{done:!0,value:void 0}}}}},data:u}}function ee(e,t,r,n){const s=(o,i)=>{const l=o.match(J);if(!l)return;const u=l[1];try{const c=JSON.parse(u);if("result"in c){t(N(c.result));return}if("message"in c){i.enqueue(N(c.message));return}if("error"in c){const m=A(0,c);i.error(m),r(m);return}}catch(c){if(c instanceof h){i.error(c),r(c);return}}},a=new TextDecoder;return new ReadableStream({start(o){let i="";return l();async function l(){if(n!=null&&n.aborted){const u=new h("cancelled","Request was cancelled");return o.error(u),r(u),Promise.resolve()}try{const{value:u,done:c}=await e.read();if(c){i.trim()&&s(i.trim(),o),o.close();return}if(n!=null&&n.aborted){const p=new h("cancelled","Request was cancelled");o.error(p),r(p),await e.cancel();return}i+=a.decode(u,{stream:!0});const m=i.split(`
`);i=m.pop()||"";for(const p of m)p.trim()&&s(p.trim(),o);return l()}catch(u){const c=u instanceof h?u:A(0,null);o.error(c),r(c)}}},cancel(){return e.cancel()}})}const x="@firebase/functions",C="0.13.6";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const te="auth-internal",ne="app-check-internal",re="messaging-internal";function se(e){const t=(r,{instanceIdentifier:n})=>{const s=r.getProvider("app").getImmediate(),a=r.getProvider(te),o=r.getProvider(re),i=r.getProvider(ne);return new V(s,a,o,i,n)};L(new P(E,t,"PUBLIC").setMultipleInstances(!0)),b(x,C,e),b(x,C,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ue(e=M(),t=k){const n=R(y(e),E).getImmediate({identifier:t}),s=j("functions");return s&&ie(n,...s),n}function ie(e,t,r){B(y(e),t,r)}function le(e,t,r){return X(y(e),t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */se();function ae({size:e=28}){return d.jsx("svg",{className:"sc-h-mark",width:e,height:Math.round(e*.966),viewBox:"222 243 581 561","aria-hidden":"true",focusable:"false",children:d.jsx("path",{fill:"currentColor",fillRule:"evenodd",d:"M459 533L422 536 375 542 364 544 345 549 324 558 310 565 298 573 286 582 276 591 266 601 258 612 252 622 247 632 244 643 242 650 242 661 243 672 246 680 250 686 264 704 274 715 290 728 304 740 315 747 326 752 344 760 356 764 369 766 381 768 399 767 412 765 428 761 441 756 453 751 482 736 496 727 510 717 520 709 532 697 539 690 546 679 554 666 558 656 562 643 565 630 567 610 567 589 566 578 563 570 560 562 556 556 548 549 540 543 530 539 522 537 511 535 490 532ZM416 552L434 552 472 555 494 559 516 565 533 572 539 576 545 582 550 588 552 594 554 600 554 607 553 616 549 630 544 643 536 658 526 676 518 686 508 697 490 712 476 720 466 726 444 735 424 741 406 746 384 750 374 751 362 751 349 749 337 745 326 740 319 735 310 727 303 720 297 712 288 698 282 685 276 672 270 652 269 643 270 637 272 628 275 622 280 613 292 600 302 591 312 584 326 576 335 571 360 561 372 558 389 554 401 553ZM700 479L690 480 682 481 673 484 666 487 656 492 649 498 633 512 621 528 614 538 607 550 602 560 596 577 591 598 587 636 584 670 584 715 586 736 591 756 594 764 598 774 604 782 611 790 620 795 628 797 634 798 647 798 659 797 670 795 682 791 690 787 700 782 712 773 720 765 730 754 740 741 748 729 759 711 770 688 782 663 788 648 792 633 795 621 796 597 795 584 794 576 791 567 786 555 775 537 766 525 756 514 730 490 724 486 716 482 706 480ZM690 500L696 500 704 500 712 503 718 505 732 515 736 520 743 530 757 557 765 575 769 587 772 598 774 614 775 624 774 640 772 653 770 662 766 672 761 683 750 701 730 728 713 748 703 757 696 763 686 769 679 773 670 776 661 778 655 778 646 776 637 773 628 769 618 763 613 760 605 751 600 740 596 724 594 708 594 697 596 679 599 658 607 618 620 572 624 560 630 548 640 530 648 522 656 515 663 509 672 504 682 501ZM637 269L625 270 610 273 596 278 582 284 568 290 550 301 518 323 498 340 486 352 476 364 470 375 463 388 460 396 456 408 454 423 452 438 452 447 454 468 457 477 460 483 464 489 470 496 476 500 487 504 499 507 516 508 547 506 580 501 622 492 658 482 685 472 710 458 721 451 734 441 745 432 759 416 766 408 774 394 779 384 782 373 783 364 783 354 782 344 777 334 771 326 766 321 742 302 718 287 706 282 690 276 678 273 660 270 650 269ZM652 283L663 283 674 284 681 285 692 289 700 293 710 299 716 303 726 314 734 324 741 334 746 345 754 363 756 369 756 378 756 382 753 392 748 400 742 410 734 418 727 426 716 434 704 443 691 451 678 458 654 468 636 474 620 477 602 480 565 482 553 483 530 482 508 480 499 478 487 474 480 470 475 466 470 460 467 454 466 448 466 441 468 428 477 402 482 392 491 376 504 358 512 350 522 340 537 328 552 319 566 312 596 299 627 288 642 284ZM358 249L342 252 333 254 322 257 314 261 303 268 296 274 286 282 279 292 270 305 260 322 248 350 234 390 230 406 228 422 228 434 228 444 232 461 239 478 249 492 258 503 266 510 286 527 304 540 310 543 326 548 334 548 345 548 354 545 362 542 370 538 380 532 387 525 394 518 402 507 408 498 413 489 417 480 425 458 429 434 429 396 425 348 421 320 418 306 413 292 408 280 402 270 397 264 390 257 382 253 374 250 368 249ZM340 271L349 270 356 271 372 275 386 282 392 287 396 291 404 303 410 321 413 340 414 362 413 396 409 426 401 466 395 484 386 501 381 507 374 514 366 520 358 524 351 527 345 528 338 529 330 529 321 527 315 525 309 522 302 517 296 512 287 503 270 479 263 467 255 450 248 431 246 413 246 395 247 386 251 372 258 354 274 328 282 316 294 300 308 286 314 281 323 276 332 272Z"})})}function oe(){return d.jsxs("span",{className:"sc-h-wordmark",children:["Share",d.jsx("i",{children:"Cam"})]})}function de({lang:e,langs:t,langLabel:r,onLang:n,languageName:s,homeHref:a,right:o,tag:i}){const l=d.jsxs(d.Fragment,{children:[d.jsx(ae,{}),d.jsx(oe,{})]});return d.jsx("header",{className:"sc-h",children:d.jsxs("div",{className:"sc-h-inner",children:[a?d.jsx("a",{className:"sc-h-brand",href:a,"aria-label":"ShareCam",children:l}):d.jsx("span",{className:"sc-h-brand",children:l}),i&&d.jsx("span",{className:"sc-h-tag",children:i}),d.jsx("span",{className:"sc-h-space"}),o,d.jsxs("label",{className:"sc-h-lang",children:[d.jsx("span",{className:"sc-h-sr",children:s}),d.jsx("select",{value:e,onChange:u=>n(u.target.value),children:t.map(u=>d.jsx("option",{value:u,children:r(u)},u))})]})]})})}export{de as H,ue as g,le as h};
