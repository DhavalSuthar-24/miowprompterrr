import{c as x,o as _,r as b,j as o}from"./index-DZrsyykm.js";import{h as M}from"./CommunityLayout-DUMzyi2x.js";import{b as D,C as L}from"./copy-C4qXdm_H.js";/**
 * @license lucide-react v0.548.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],B=x("clock",A);/**
 * @license lucide-react v0.548.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],I=x("message-circle",U);/**
 * @license lucide-react v0.548.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],R=x("share-2",q);function z({promptId:$,score:f,userVote:k,size:l="md",layout:v="vertical",showScore:w=!0,onVoteSuccess:C}){const{isAuthenticated:e}=_(),u=M(),[c,d]=b.useState(k),[s,m]=b.useState(f),p={sm:"w-5 h-5",md:"w-6 h-6",lg:"w-7 h-7"},N={sm:"text-xs",md:"text-sm",lg:"text-base"},g=async t=>{if(!e)return;const V=c,j=s;let r,a;c===t?(r=null,a=-t):c===null?(r=t,a=t):(r=t,a=t*2),d(r),m(s+a);try{const n=await u.mutateAsync({promptId:$,value:t});n&&n.score!==void 0&&(m(n.score),d(n.userVote??null),C?.(n.score))}catch{d(V),m(j)}},y=c===1,h=c===-1,i=u.isPending,S=v==="vertical"?"flex flex-col items-center gap-0.5":"flex items-center gap-1";return o.jsxs("div",{className:S,children:[o.jsx("button",{onClick:()=>g(1),disabled:i||!e,className:`
          p-1 rounded-md transition-all duration-200
          ${y?"text-orange-500 bg-orange-500/10":"text-slate-400 hover:text-orange-400 hover:bg-orange-500/5"}
          ${e?"":"cursor-not-allowed opacity-50"}
          ${i?"animate-pulse":""}
        `,title:e?"Upvote":"Login to vote",children:o.jsx(D,{className:`${p[l]} ${y?"fill-current":""}`})}),w&&o.jsx("span",{className:`
          font-semibold ${N[l]} min-w-[2ch] text-center
          ${s>0?"text-orange-500":""}
          ${s<0?"text-blue-500":""}
          ${s===0?"text-slate-400":""}
        `,children:s}),o.jsx("button",{onClick:()=>g(-1),disabled:i||!e,className:`
          p-1 rounded-md transition-all duration-200
          ${h?"text-blue-500 bg-blue-500/10":"text-slate-400 hover:text-blue-400 hover:bg-blue-500/5"}
          ${e?"":"cursor-not-allowed opacity-50"}
          ${i?"animate-pulse":""}
        `,title:e?"Downvote":"Login to vote",children:o.jsx(L,{className:`${p[l]} ${h?"fill-current":""}`})})]})}export{B as C,I as M,R as S,z as V};
