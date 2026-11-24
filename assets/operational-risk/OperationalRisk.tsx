import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * OperationalRisk
 *
 * Isometric illustration of a centralized server failing and disrupting a
 * connected service node, then recovering. Ported from
 * assets/operational-risk/operational-risk.svg.
 *
 * - animate=false renders the static failed-state illustration
 *   (operational-risk-static.svg) with no motion.
 * - animate=true (default): plays once when the component enters the
 *   viewport (triggerOnView) and holds on the failed state, unless
 *   loop=true, in which case it cycles continuously
 *   (normal -> fail -> disrupt -> recover -> ...).
 */

export interface OperationalRiskProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  /** Render the animated illustration. Default: true. */
  animate?: boolean;
  /** Cycle continuously instead of playing once and holding. Default: false. */
  loop?: boolean;
  /** Use an IntersectionObserver to start the one-shot animation when visible. Default: true. */
  triggerOnView?: boolean;
  /** Length of one full loop cycle, in seconds. The one-shot ("once") variant
   * runs for 75% of this duration (normal -> fail -> disrupt), then holds.
   * Default: 6. */
  duration?: number;
}

const LOOP_SVG_TEMPLATE = `<svg class="op-anim CLASS_PLACEHOLDER" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="opRiskTitle opRiskDesc">
  <title id="opRiskTitle">Operational risk animation</title>
  <desc id="opRiskDesc">An isometric central server operating normally, then failing and disrupting one of four connected service nodes, before recovering.</desc>
  <defs>
    <linearGradient id="gPlatformTop" x1="15%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#0d6b4c"/>
      <stop offset="100%" stop-color="#064631"/>
    </linearGradient>
    <linearGradient id="gPlatformSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#073c2d"/>
      <stop offset="100%" stop-color="#052920"/>
    </linearGradient>
    <linearGradient id="gPlatformSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#063527"/>
      <stop offset="100%" stop-color="#04241b"/>
    </linearGradient>
    <linearGradient id="gMintTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#a8f5d4"/>
      <stop offset="100%" stop-color="#73ddb2"/>
    </linearGradient>
    <linearGradient id="gMintSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5ccb9a"/>
      <stop offset="100%" stop-color="#3fa377"/>
    </linearGradient>
    <linearGradient id="gMintSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4bb389"/>
      <stop offset="100%" stop-color="#318f68"/>
    </linearGradient>
    <linearGradient id="gGreenTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#1f8a68"/>
      <stop offset="100%" stop-color="#176b50"/>
    </linearGradient>
    <linearGradient id="gGreenSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#145940"/>
      <stop offset="100%" stop-color="#0e3e2c"/>
    </linearGradient>
    <linearGradient id="gGreenSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#114731"/>
      <stop offset="100%" stop-color="#0a3122"/>
    </linearGradient>
    <linearGradient id="gCapTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop class="stop cap-a" offset="0%" stop-color="#1f8a68"/>
      <stop class="stop cap-b" offset="100%" stop-color="#176b50"/>
    </linearGradient>
    <linearGradient id="gCapSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="stop cap-c" offset="0%" stop-color="#145940"/>
      <stop class="stop cap-d" offset="100%" stop-color="#0e3e2c"/>
    </linearGradient>
    <linearGradient id="gCapSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="stop cap-e" offset="0%" stop-color="#114731"/>
      <stop class="stop cap-f" offset="100%" stop-color="#0a3122"/>
    </linearGradient>
    <linearGradient id="gNodeFrTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop class="stop node-a" offset="0%" stop-color="#a8f5d4"/>
      <stop class="stop node-b" offset="100%" stop-color="#73ddb2"/>
    </linearGradient>
    <linearGradient id="gNodeFrSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="stop node-c" offset="0%" stop-color="#5ccb9a"/>
      <stop class="stop node-d" offset="100%" stop-color="#3fa377"/>
    </linearGradient>
    <linearGradient id="gNodeFrSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="stop node-e" offset="0%" stop-color="#4bb389"/>
      <stop class="stop node-f" offset="100%" stop-color="#318f68"/>
    </linearGradient>
    <radialGradient id="gGlowRed" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f35d59" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#f35d59" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#021008" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#021008" stop-opacity="0"/>
    </radialGradient>
    <filter id="opRiskBlur1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="opRiskBlur2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>

  <style>
    @media (prefers-reduced-motion: reduce) {
      .op-anim .stop, .op-anim .x-icon, .op-anim .node-glow, .op-anim .cap-glow, .op-anim .cable, .op-anim .pulse { animation: none !important; }
      .op-anim .cap-a, .op-anim .node-a { stop-color: #fa8f8b !important; }
      .op-anim .cap-b, .op-anim .node-b { stop-color: #f2615c !important; }
      .op-anim .cap-c, .op-anim .node-c { stop-color: #d6473f !important; }
      .op-anim .cap-d, .op-anim .node-d { stop-color: #b23730 !important; }
      .op-anim .cap-e, .op-anim .node-e { stop-color: #c13c35 !important; }
      .op-anim .cap-f, .op-anim .node-f { stop-color: #9c2d27 !important; }
      .op-anim .x-icon, .op-anim .node-glow { opacity: 1 !important; }
      .op-anim .pulse { opacity: 0 !important; }
    }

    /* ---- loop mode (standalone, continuous) ---- */
    .op-anim.loop .cap-a { animation: loopCapA LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-b { animation: loopCapB LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-c { animation: loopCapC LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-d { animation: loopCapD LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-e { animation: loopCapE LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-f { animation: loopCapF LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-a { animation: loopNodeA LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-b { animation: loopNodeB LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-c { animation: loopNodeC LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-d { animation: loopNodeD LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-e { animation: loopNodeE LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-f { animation: loopNodeF LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .x-icon { animation: loopXIcon LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cap-glow { animation: loopCapGlow LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .node-glow { animation: loopNodeGlow LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .cable { animation: loopCableDim LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .pulse-move { animation: pulseTravel 1.1s linear infinite; }
    .op-anim.loop .pulse-vis { animation: loopPulseVis LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .fail-pulse-move { animation: loopFailPulseMove LOOP_DUR ease-in-out infinite; }
    .op-anim.loop .fail-pulse-vis { animation: loopFailPulseVis LOOP_DUR ease-in-out infinite; }

    /* ---- once mode (website trigger: play through to failure, then hold) ---- */
    .op-anim.once .cap-a { animation: onceCapA ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-b { animation: onceCapB ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-c { animation: onceCapC ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-d { animation: onceCapD ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-e { animation: onceCapE ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-f { animation: onceCapF ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-a { animation: onceNodeA ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-b { animation: onceNodeB ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-c { animation: onceNodeC ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-d { animation: onceNodeD ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-e { animation: onceNodeE ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-f { animation: onceNodeF ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .x-icon { animation: onceXIcon ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cap-glow { animation: onceCapGlow ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .node-glow { animation: onceNodeGlow ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .cable { animation: onceCableDim ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .pulse-move { animation: pulseTravel 1.1s linear infinite, oncePulseStop ONCE_DUR_STEPS steps(1) 1 forwards; }
    .op-anim.once .pulse-vis { animation: oncePulseVis ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .fail-pulse-move { animation: onceFailPulseMove ONCE_DUR ease-in-out 1 forwards; }
    .op-anim.once .fail-pulse-vis { animation: onceFailPulseVis ONCE_DUR ease-in-out 1 forwards; }

    /* ===== LOOP keyframes (0-6s: 0%=0s,25%=1.5s,41.67%=2.5s,75%=4.5s,100%=6s) ===== */
    @keyframes loopCapA{0%,24%{stop-color:#1f8a68}40%,74%{stop-color:#fa8f8b}100%{stop-color:#1f8a68}}
    @keyframes loopCapB{0%,24%{stop-color:#176b50}40%,74%{stop-color:#f2615c}100%{stop-color:#176b50}}
    @keyframes loopCapC{0%,24%{stop-color:#145940}40%,74%{stop-color:#d6473f}100%{stop-color:#145940}}
    @keyframes loopCapD{0%,24%{stop-color:#0e3e2c}40%,74%{stop-color:#b23730}100%{stop-color:#0e3e2c}}
    @keyframes loopCapE{0%,24%{stop-color:#114731}40%,74%{stop-color:#c13c35}100%{stop-color:#114731}}
    @keyframes loopCapF{0%,24%{stop-color:#0a3122}40%,74%{stop-color:#9c2d27}100%{stop-color:#0a3122}}
    @keyframes loopNodeA{0%,40%{stop-color:#a8f5d4}55%,74%{stop-color:#fa8f8b}100%{stop-color:#a8f5d4}}
    @keyframes loopNodeB{0%,40%{stop-color:#73ddb2}55%,74%{stop-color:#f2615c}100%{stop-color:#73ddb2}}
    @keyframes loopNodeC{0%,40%{stop-color:#5ccb9a}55%,74%{stop-color:#d6473f}100%{stop-color:#5ccb9a}}
    @keyframes loopNodeD{0%,40%{stop-color:#3fa377}55%,74%{stop-color:#b23730}100%{stop-color:#3fa377}}
    @keyframes loopNodeE{0%,40%{stop-color:#4bb389}55%,74%{stop-color:#c13c35}100%{stop-color:#4bb389}}
    @keyframes loopNodeF{0%,40%{stop-color:#318f68}55%,74%{stop-color:#9c2d27}100%{stop-color:#318f68}}
    @keyframes loopXIcon{0%,24%{opacity:0}40%,74%{opacity:1}88%,100%{opacity:0}}
    @keyframes loopCapGlow{0%,24%{opacity:0}38%,74%{opacity:.55}100%{opacity:0}}
    @keyframes loopNodeGlow{0%,40%{opacity:0}55%,74%{opacity:.7}100%{opacity:0}}
    @keyframes loopCableDim{0%,24%{opacity:1}30%,74%{opacity:.5}90%,100%{opacity:1}}
    @keyframes loopPulseVis{0%,18%{opacity:1}25%,72%{opacity:0}82%,100%{opacity:1}}
    @keyframes loopFailPulseMove{0%,41%{offset-distance:0%}55%,100%{offset-distance:100%}}
    @keyframes loopFailPulseVis{0%,40%{opacity:0}42%,70%{opacity:1}85%,100%{opacity:0}}

    /* ===== ONCE keyframes (0-4.5s: 0%=0s,33.3%=1.5s,55.6%=2.5s,100%=4.5s, held after) ===== */
    @keyframes onceCapA{0%,32%{stop-color:#1f8a68}50%,100%{stop-color:#fa8f8b}}
    @keyframes onceCapB{0%,32%{stop-color:#176b50}50%,100%{stop-color:#f2615c}}
    @keyframes onceCapC{0%,32%{stop-color:#145940}50%,100%{stop-color:#d6473f}}
    @keyframes onceCapD{0%,32%{stop-color:#0e3e2c}50%,100%{stop-color:#b23730}}
    @keyframes onceCapE{0%,32%{stop-color:#114731}50%,100%{stop-color:#c13c35}}
    @keyframes onceCapF{0%,32%{stop-color:#0a3122}50%,100%{stop-color:#9c2d27}}
    @keyframes onceNodeA{0%,52%{stop-color:#a8f5d4}78%,100%{stop-color:#fa8f8b}}
    @keyframes onceNodeB{0%,52%{stop-color:#73ddb2}78%,100%{stop-color:#f2615c}}
    @keyframes onceNodeC{0%,52%{stop-color:#5ccb9a}78%,100%{stop-color:#d6473f}}
    @keyframes onceNodeD{0%,52%{stop-color:#3fa377}78%,100%{stop-color:#b23730}}
    @keyframes onceNodeE{0%,52%{stop-color:#4bb389}78%,100%{stop-color:#c13c35}}
    @keyframes onceNodeF{0%,52%{stop-color:#318f68}78%,100%{stop-color:#9c2d27}}
    @keyframes onceXIcon{0%,32%{opacity:0}50%,100%{opacity:1}}
    @keyframes onceCapGlow{0%,32%{opacity:0}48%,100%{opacity:.55}}
    @keyframes onceNodeGlow{0%,52%{opacity:0}74%,100%{opacity:.7}}
    @keyframes onceCableDim{0%,32%{opacity:1}40%,100%{opacity:.5}}
    @keyframes oncePulseVis{0%,24%{opacity:1}33%,100%{opacity:0}}
    @keyframes oncePulseStop{0%{visibility:visible}33%,100%{visibility:hidden}}
    @keyframes onceFailPulseMove{0%,54%{offset-distance:0%}78%,100%{offset-distance:100%}}
    @keyframes onceFailPulseVis{0%,53%{opacity:0}56%,100%{opacity:1}}

    @keyframes pulseTravel{0%{offset-distance:0%}100%{offset-distance:100%}}
  </style>

  <g id="platform">
    <ellipse cx="150" cy="128" rx="30" ry="9" fill="url(#gShadow)" filter="url(#opRiskBlur2)"/>
    <ellipse cx="75" cy="146" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <ellipse cx="115" cy="190" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <ellipse id="failure-glow" class="node-glow" cx="185" cy="190" rx="22" ry="7" fill="url(#gGlowRed)" opacity="0"/>
    <ellipse cx="225" cy="146" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <path d="M33.71,138.51 L146.29,91.49 A4,4 0 0 1 153.71,91.49 L266.29,138.51 A4,4 0 0 1 266.29,141.49 L153.71,188.51 A4,4 0 0 1 146.29,188.51 L33.71,141.49 A4,4 0 0 1 33.71,138.51 Z" fill="url(#gPlatformTop)"/>
    <path d="M30,140 L150,190 L150,204 L30,154 Z" fill="url(#gPlatformSideL)"/>
    <path d="M150,190 L270,140 L270,154 L150,204 Z" fill="url(#gPlatformSideR)"/>
  </g>

  <g id="connections">
    <path id="connection-left" d="M150,142 Q100,140 75,102" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-front-left" d="M150,142 Q125,152 115,146" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-front-right" d="M150,142 Q175,152 185,146" class="cable cable-fail" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-right" d="M150,142 Q200,140 225,102" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
  </g>

  <g id="connection-pulses">
    <circle class="pulse pulse-move pulse-vis" r="2.6" fill="#d6fdea" style="offset-path:path('M150,142 Q100,140 75,102'); offset-rotate:0deg"/>
    <circle class="pulse pulse-move pulse-vis" r="2.6" fill="#d6fdea" style="offset-path:path('M150,142 Q125,152 115,146'); offset-rotate:0deg; animation-delay:.35s"/>
    <circle class="pulse pulse-move pulse-vis" r="2.6" fill="#d6fdea" style="offset-path:path('M150,142 Q200,140 225,102'); offset-rotate:0deg; animation-delay:.7s"/>
    <circle class="pulse fail-pulse-move fail-pulse-vis" r="3" fill="#ffb3af" style="offset-path:path('M150,142 Q175,152 185,146'); offset-rotate:0deg" opacity="0"/>
  </g>

  <g id="node-left">
    <path d="M51.6,124.4 L75,111 L98.4,124.4 L75,137.8 Z" fill="url(#gGreenTop)"/>
    <path d="M51.6,124.4 L75,137.8 L75,143.8 L51.6,130.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M75,137.8 L98.4,124.4 L98.4,130.4 L75,143.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M57.23,109.11 L72.77,102.89 A2.4,2.4 0 0 1 77.23,102.89 L92.77,109.11 A2.4,2.4 0 0 1 92.77,110.89 L77.23,117.11 A2.4,2.4 0 0 1 72.77,117.11 L57.23,110.89 A2.4,2.4 0 0 1 57.23,109.11 Z" fill="url(#gMintTop)"/>
    <path d="M55,110 L75,118 L75,131 L55,123 Z" fill="url(#gMintSideL)"/>
    <path d="M75,118 L95,110 L95,123 L75,131 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-front-left">
    <path d="M91.6,168.4 L115,155 L138.4,168.4 L115,181.8 Z" fill="url(#gGreenTop)"/>
    <path d="M91.6,168.4 L115,181.8 L115,187.8 L91.6,174.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M115,181.8 L138.4,168.4 L138.4,174.4 L115,187.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M97.23,153.11 L112.77,146.89 A2.4,2.4 0 0 1 117.23,146.89 L132.77,153.11 A2.4,2.4 0 0 1 132.77,154.89 L117.23,161.11 A2.4,2.4 0 0 1 112.77,161.11 L97.23,154.89 A2.4,2.4 0 0 1 97.23,153.11 Z" fill="url(#gMintTop)"/>
    <path d="M95,154 L115,162 L115,175 L95,167 Z" fill="url(#gMintSideL)"/>
    <path d="M115,162 L135,154 L135,167 L115,175 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-right">
    <path d="M201.6,124.4 L225,111 L248.4,124.4 L225,137.8 Z" fill="url(#gGreenTop)"/>
    <path d="M201.6,124.4 L225,137.8 L225,143.8 L201.6,130.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M225,137.8 L248.4,124.4 L248.4,130.4 L225,143.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M207.23,109.11 L222.77,102.89 A2.4,2.4 0 0 1 227.23,102.89 L242.77,109.11 A2.4,2.4 0 0 1 242.77,110.89 L227.23,117.11 A2.4,2.4 0 0 1 222.77,117.11 L207.23,110.89 A2.4,2.4 0 0 1 207.23,109.11 Z" fill="url(#gMintTop)"/>
    <path d="M205,110 L225,118 L225,131 L205,123 Z" fill="url(#gMintSideL)"/>
    <path d="M225,118 L245,110 L245,123 L225,131 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-front-right">
    <path d="M161.6,168.4 L185,155 L208.4,168.4 L185,181.8 Z" fill="url(#gGreenTop)"/>
    <path d="M161.6,168.4 L185,181.8 L185,187.8 L161.6,174.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M185,181.8 L208.4,168.4 L208.4,174.4 L185,187.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M167.23,153.11 L182.77,146.89 A2.4,2.4 0 0 1 187.23,146.89 L202.77,153.11 A2.4,2.4 0 0 1 202.77,154.89 L187.23,161.11 A2.4,2.4 0 0 1 182.77,161.11 L167.23,154.89 A2.4,2.4 0 0 1 167.23,153.11 Z" fill="url(#gNodeFrTop)"/>
    <path d="M165,154 L185,162 L185,175 L165,167 Z" fill="url(#gNodeFrSideL)"/>
    <path d="M185,162 L205,154 L205,167 L185,175 Z" fill="url(#gNodeFrSideR)"/>
  </g>

  <g id="central-server">
    <path d="M118.22,107.09 L147.78,94.91 A2.4,2.4 0 0 1 152.22,94.91 L181.78,107.09 A2.4,2.4 0 0 1 181.78,108.91 L152.22,121.09 A2.4,2.4 0 0 1 147.78,121.09 L118.22,108.91 A2.4,2.4 0 0 1 118.22,107.09 Z" fill="url(#gMintTop)"/>
    <path d="M116,108 L150,122 L150,142 L116,128 Z" fill="url(#gMintSideL)"/>
    <path d="M150,122 L184,108 L184,128 L150,142 Z" fill="url(#gMintSideR)"/>

    <path d="M122.23,89.11 L147.77,78.89 A2.4,2.4 0 0 1 152.23,78.89 L177.77,89.11 A2.4,2.4 0 0 1 177.77,90.89 L152.23,101.11 A2.4,2.4 0 0 1 147.77,101.11 L122.23,90.89 A2.4,2.4 0 0 1 122.23,89.11 Z" fill="url(#gGreenTop)"/>
    <path d="M120,90 L150,102 L150,118 L120,106 Z" fill="url(#gGreenSideL)"/>
    <path d="M150,102 L180,90 L180,106 L150,118 Z" fill="url(#gGreenSideR)"/>
    <rect x="123" y="97" width="13" height="2.3" rx="1.1" fill="#0a2a1e"/>
    <rect x="123" y="102.2" width="13" height="2.3" rx="1.1" fill="#51c79b"/>

    <path d="M122.23,73.11 L147.77,62.89 A2.4,2.4 0 0 1 152.23,62.89 L177.77,73.11 A2.4,2.4 0 0 1 177.77,74.89 L152.23,85.11 A2.4,2.4 0 0 1 147.77,85.11 L122.23,74.89 A2.4,2.4 0 0 1 122.23,73.11 Z" fill="url(#gGreenTop)"/>
    <path d="M120,74 L150,86 L150,102 L120,90 Z" fill="url(#gGreenSideL)"/>
    <path d="M150,86 L180,74 L180,90 L150,102 Z" fill="url(#gGreenSideR)"/>
    <rect x="123" y="81" width="13" height="2.3" rx="1.1" fill="#0a2a1e"/>

    <g id="server-top">
      <ellipse class="cap-glow" cx="150" cy="54" rx="24" ry="12" fill="url(#gGlowRed)" opacity="0"/>
      <path d="M125.66,53.30 L148.34,43.70 A1.8,1.8 0 0 1 151.66,43.70 L174.34,53.30 A1.8,1.8 0 0 1 174.34,54.70 L151.66,64.30 A1.8,1.8 0 0 1 148.34,64.30 L125.66,54.70 A1.8,1.8 0 0 1 125.66,53.30 Z" fill="url(#gCapTop)"/>
      <path d="M124,54 L150,65 L150,80 L124,69 Z" fill="url(#gCapSideL)"/>
      <path d="M150,65 L176,54 L176,69 L150,80 Z" fill="url(#gCapSideR)"/>
      <g id="server-status-icon" class="x-icon" opacity="0">
        <line x1="144" y1="49.5" x2="156" y2="58.5" stroke="#5c120f" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="156" y1="49.5" x2="144" y2="58.5" stroke="#5c120f" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</svg>
`;

const STATIC_SVG = `<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="opRiskStaticTitle opRiskStaticDesc">
  <title id="opRiskStaticTitle">Operational risk illustration</title>
  <desc id="opRiskStaticDesc">An isometric diagram showing a central server that has failed, shown in red with an X, disrupting one of four connected service nodes, also shown in red.</desc>
  <defs>
    <linearGradient id="gPlatformTop" x1="15%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#0d6b4c"/>
      <stop offset="100%" stop-color="#064631"/>
    </linearGradient>
    <linearGradient id="gPlatformSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#073c2d"/>
      <stop offset="100%" stop-color="#052920"/>
    </linearGradient>
    <linearGradient id="gPlatformSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#063527"/>
      <stop offset="100%" stop-color="#04241b"/>
    </linearGradient>
    <linearGradient id="gMintTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#a8f5d4"/>
      <stop offset="100%" stop-color="#73ddb2"/>
    </linearGradient>
    <linearGradient id="gMintSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5ccb9a"/>
      <stop offset="100%" stop-color="#3fa377"/>
    </linearGradient>
    <linearGradient id="gMintSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4bb389"/>
      <stop offset="100%" stop-color="#318f68"/>
    </linearGradient>
    <linearGradient id="gGreenTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#1f8a68"/>
      <stop offset="100%" stop-color="#176b50"/>
    </linearGradient>
    <linearGradient id="gGreenSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#145940"/>
      <stop offset="100%" stop-color="#0e3e2c"/>
    </linearGradient>
    <linearGradient id="gGreenSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#114731"/>
      <stop offset="100%" stop-color="#0a3122"/>
    </linearGradient>
    <linearGradient id="gCapTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop class="capStopA" offset="0%" stop-color="#fa8f8b"/>
      <stop class="capStopB" offset="100%" stop-color="#f2615c"/>
    </linearGradient>
    <linearGradient id="gCapSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="capStopC" offset="0%" stop-color="#d6473f"/>
      <stop class="capStopD" offset="100%" stop-color="#b23730"/>
    </linearGradient>
    <linearGradient id="gCapSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="capStopE" offset="0%" stop-color="#c13c35"/>
      <stop class="capStopF" offset="100%" stop-color="#9c2d27"/>
    </linearGradient>
    <linearGradient id="gNodeFrTop" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop class="nodeStopA" offset="0%" stop-color="#fa8f8b"/>
      <stop class="nodeStopB" offset="100%" stop-color="#f2615c"/>
    </linearGradient>
    <linearGradient id="gNodeFrSideL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="nodeStopC" offset="0%" stop-color="#d6473f"/>
      <stop class="nodeStopD" offset="100%" stop-color="#b23730"/>
    </linearGradient>
    <linearGradient id="gNodeFrSideR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop class="nodeStopE" offset="0%" stop-color="#c13c35"/>
      <stop class="nodeStopF" offset="100%" stop-color="#9c2d27"/>
    </linearGradient>
    <radialGradient id="gGlowRed" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f35d59" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#f35d59" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#021008" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#021008" stop-opacity="0"/>
    </radialGradient>
    <filter id="opRiskBlur1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="opRiskBlur2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>

  <g id="platform">
    <ellipse cx="150" cy="128" rx="30" ry="9" fill="url(#gShadow)" filter="url(#opRiskBlur2)"/>
    <ellipse cx="75" cy="146" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <ellipse cx="115" cy="190" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <ellipse id="failure-glow" cx="185" cy="190" rx="22" ry="7" fill="url(#gGlowRed)"/>
    <ellipse cx="225" cy="146" rx="18" ry="5.5" fill="url(#gShadow)" filter="url(#opRiskBlur1)"/>
    <path d="M33.71,138.51 L146.29,91.49 A4,4 0 0 1 153.71,91.49 L266.29,138.51 A4,4 0 0 1 266.29,141.49 L153.71,188.51 A4,4 0 0 1 146.29,188.51 L33.71,141.49 A4,4 0 0 1 33.71,138.51 Z" fill="url(#gPlatformTop)"/>
    <path d="M30,140 L150,190 L150,204 L30,154 Z" fill="url(#gPlatformSideL)"/>
    <path d="M150,190 L270,140 L270,154 L150,204 Z" fill="url(#gPlatformSideR)"/>
  </g>

  <g id="connections">
    <path id="connection-left" d="M150,142 Q100,140 75,102" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-front-left" d="M150,142 Q125,152 115,146" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-front-right" d="M150,142 Q175,152 185,146" class="cable cable-fail" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
    <path id="connection-right" d="M150,142 Q200,140 225,102" class="cable" fill="none" stroke="#9aebc6" stroke-width="2.6" stroke-linecap="round"/>
  </g>

  <g id="node-left">
    <path d="M51.6,124.4 L75,111 L98.4,124.4 L75,137.8 Z" fill="url(#gGreenTop)"/>
    <path d="M51.6,124.4 L75,137.8 L75,143.8 L51.6,130.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M75,137.8 L98.4,124.4 L98.4,130.4 L75,143.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M57.23,109.11 L72.77,102.89 A2.4,2.4 0 0 1 77.23,102.89 L92.77,109.11 A2.4,2.4 0 0 1 92.77,110.89 L77.23,117.11 A2.4,2.4 0 0 1 72.77,117.11 L57.23,110.89 A2.4,2.4 0 0 1 57.23,109.11 Z" fill="url(#gMintTop)"/>
    <path d="M55,110 L75,118 L75,131 L55,123 Z" fill="url(#gMintSideL)"/>
    <path d="M75,118 L95,110 L95,123 L75,131 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-front-left">
    <path d="M91.6,168.4 L115,155 L138.4,168.4 L115,181.8 Z" fill="url(#gGreenTop)"/>
    <path d="M91.6,168.4 L115,181.8 L115,187.8 L91.6,174.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M115,181.8 L138.4,168.4 L138.4,174.4 L115,187.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M97.23,153.11 L112.77,146.89 A2.4,2.4 0 0 1 117.23,146.89 L132.77,153.11 A2.4,2.4 0 0 1 132.77,154.89 L117.23,161.11 A2.4,2.4 0 0 1 112.77,161.11 L97.23,154.89 A2.4,2.4 0 0 1 97.23,153.11 Z" fill="url(#gMintTop)"/>
    <path d="M95,154 L115,162 L115,175 L95,167 Z" fill="url(#gMintSideL)"/>
    <path d="M115,162 L135,154 L135,167 L115,175 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-right">
    <path d="M201.6,124.4 L225,111 L248.4,124.4 L225,137.8 Z" fill="url(#gGreenTop)"/>
    <path d="M201.6,124.4 L225,137.8 L225,143.8 L201.6,130.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M225,137.8 L248.4,124.4 L248.4,130.4 L225,143.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M207.23,109.11 L222.77,102.89 A2.4,2.4 0 0 1 227.23,102.89 L242.77,109.11 A2.4,2.4 0 0 1 242.77,110.89 L227.23,117.11 A2.4,2.4 0 0 1 222.77,117.11 L207.23,110.89 A2.4,2.4 0 0 1 207.23,109.11 Z" fill="url(#gMintTop)"/>
    <path d="M205,110 L225,118 L225,131 L205,123 Z" fill="url(#gMintSideL)"/>
    <path d="M225,118 L245,110 L245,123 L225,131 Z" fill="url(#gMintSideR)"/>
  </g>

  <g id="node-front-right">
    <path id="failure-base-top" d="M161.6,168.4 L185,155 L208.4,168.4 L185,181.8 Z" fill="url(#gGreenTop)"/>
    <path d="M161.6,168.4 L185,181.8 L185,187.8 L161.6,174.4 Z" fill="url(#gGreenSideL)"/>
    <path d="M185,181.8 L208.4,168.4 L208.4,174.4 L185,187.8 Z" fill="url(#gGreenSideR)"/>
    <path d="M167.23,153.11 L182.77,146.89 A2.4,2.4 0 0 1 187.23,146.89 L202.77,153.11 A2.4,2.4 0 0 1 202.77,154.89 L187.23,161.11 A2.4,2.4 0 0 1 182.77,161.11 L167.23,154.89 A2.4,2.4 0 0 1 167.23,153.11 Z" fill="url(#gNodeFrTop)"/>
    <path d="M165,154 L185,162 L185,175 L165,167 Z" fill="url(#gNodeFrSideL)"/>
    <path d="M185,162 L205,154 L205,167 L185,175 Z" fill="url(#gNodeFrSideR)"/>
  </g>

  <g id="central-server">
    <path d="M118.22,107.09 L147.78,94.91 A2.4,2.4 0 0 1 152.22,94.91 L181.78,107.09 A2.4,2.4 0 0 1 181.78,108.91 L152.22,121.09 A2.4,2.4 0 0 1 147.78,121.09 L118.22,108.91 A2.4,2.4 0 0 1 118.22,107.09 Z" fill="url(#gMintTop)"/>
    <path d="M116,108 L150,122 L150,142 L116,128 Z" fill="url(#gMintSideL)"/>
    <path d="M150,122 L184,108 L184,128 L150,142 Z" fill="url(#gMintSideR)"/>

    <path d="M122.23,89.11 L147.77,78.89 A2.4,2.4 0 0 1 152.23,78.89 L177.77,89.11 A2.4,2.4 0 0 1 177.77,90.89 L152.23,101.11 A2.4,2.4 0 0 1 147.77,101.11 L122.23,90.89 A2.4,2.4 0 0 1 122.23,89.11 Z" fill="url(#gGreenTop)"/>
    <path d="M120,90 L150,102 L150,118 L120,106 Z" fill="url(#gGreenSideL)"/>
    <path d="M150,102 L180,90 L180,106 L150,118 Z" fill="url(#gGreenSideR)"/>
    <rect x="123" y="97" width="13" height="2.3" rx="1.1" fill="#0a2a1e"/>
    <rect x="123" y="102.2" width="13" height="2.3" rx="1.1" fill="#f2615c"/>

    <path d="M122.23,73.11 L147.77,62.89 A2.4,2.4 0 0 1 152.23,62.89 L177.77,73.11 A2.4,2.4 0 0 1 177.77,74.89 L152.23,85.11 A2.4,2.4 0 0 1 147.77,85.11 L122.23,74.89 A2.4,2.4 0 0 1 122.23,73.11 Z" fill="url(#gGreenTop)"/>
    <path d="M120,74 L150,86 L150,102 L120,90 Z" fill="url(#gGreenSideL)"/>
    <path d="M150,86 L180,74 L180,90 L150,102 Z" fill="url(#gGreenSideR)"/>
    <rect x="123" y="81" width="13" height="2.3" rx="1.1" fill="#0a2a1e"/>

    <g id="server-top">
      <path d="M125.66,53.30 L148.34,43.70 A1.8,1.8 0 0 1 151.66,43.70 L174.34,53.30 A1.8,1.8 0 0 1 174.34,54.70 L151.66,64.30 A1.8,1.8 0 0 1 148.34,64.30 L125.66,54.70 A1.8,1.8 0 0 1 125.66,53.30 Z" fill="url(#gCapTop)"/>
      <path d="M124,54 L150,65 L150,80 L124,69 Z" fill="url(#gCapSideL)"/>
      <path d="M150,65 L176,54 L176,69 L150,80 Z" fill="url(#gCapSideR)"/>
      <g id="server-status-icon">
        <line x1="144" y1="49.5" x2="156" y2="58.5" stroke="#5c120f" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="156" y1="49.5" x2="144" y2="58.5" stroke="#5c120f" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</svg>
`;

export default function OperationalRisk({
  className,
  width = "100%",
  height,
  animate = true,
  loop = false,
  triggerOnView = true,
  duration = 6,
}: OperationalRiskProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playOnce, setPlayOnce] = useState(false);

  useEffect(() => {
    if (!animate || loop || !triggerOnView) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlayOnce(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate, loop, triggerOnView]);

  const markup = useMemo(() => {
    if (!animate) return STATIC_SVG;

    const stateClass = loop ? "loop" : playOnce || !triggerOnView ? "once" : "";
    const loopDur = `${duration}s`;
    const onceDur = `${duration * 0.75}s`;

    return LOOP_SVG_TEMPLATE.replace("CLASS_PLACEHOLDER", stateClass)
      .split("LOOP_DUR")
      .join(loopDur)
      .split("ONCE_DUR_STEPS")
      .join(onceDur)
      .split("ONCE_DUR")
      .join(onceDur);
  }, [animate, loop, playOnce, triggerOnView, duration]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, lineHeight: 0 }}
      // The SVG is fully decorative here; wrap with an accessible label at the
      // call site if it conveys meaning (e.g. aria-label on this div, or swap
      // the inner <title>/<desc> ids via a different instance id when
      // rendering more than one copy on the same page).
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
