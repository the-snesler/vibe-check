import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { html } from "hono/html";
import { AppEnv } from "./lib/types";
import { BlankEnv } from "hono/types";

// ---------------------------------------------------------------------------
// Inline SVG icon components (Dinkie Icons — pixel-art, 12x12 grid)
// ---------------------------------------------------------------------------

function IconSpaceInvader({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M3 9h1V7h1v2h1V7h1V6h1V5H7V3H6V2H3v1H2v2H1v1h1v1h1ZM1 9h1V7H1ZM0 5h1V2H0Zm3 0V4h1v1Zm4 4h1V7H7ZM5 5V4h1v1ZM2 2h1V1H2Zm4 0h1V1H6Zm2 3h1V2H8Zm0 0" />
    </svg>
  );
}

function IconLocationPin({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M3 2H2v1h1Zm0 0h5V1H3Zm2 10h1v-1H5Zm-1-1h1v-1H4Zm-1-1h1V9H3ZM2 9h1V7H2Zm4 2h1v-1H6ZM1 7h1V3H1Zm6 3h1V9H7ZM3 6h1V4H3Zm1 1h3V6H4Zm4 2h1V7H8ZM4 4h3V3H4Zm3 2h1V4H7Zm2 1h1V3H9ZM8 3h1V2H8Zm0 0" />
    </svg>
  );
}

function IconGlobe({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M3 12h5v-1H7v-1h1v1h1v-1h1V9H8V7h2v2h1V4h-1v2H8V4h2V3H9V2H8v1H7V2h1V1H3v1h1v1H3V2H2v1H1v1h2v2H1V4H0v5h1V7h2v2H1v1h1v1h1v-1h1v1H3Zm2-1v-1h1v1ZM4 9V7h3v2Zm0-3V4h3v2Zm1-3V2h1v1Zm0 0" />
    </svg>
  );
}

function IconRobot({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M2 12h7v-1H8V9H3v2H2Zm-1-1h1V5H1v1H0v3h1Zm3 0v-1h3v1ZM3 8h2V6H3Zm3 0h2V6H6ZM2 5h7V4H6V3H5v1H2Zm7 6h1V9h1V6h-1V5H9ZM4 3h1V2h1v1h1V1H4Zm0 0" />
    </svg>
  );
}

function IconCode({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M6 5H5v3h1Zm0 0h1V2H6ZM0 7h1V6H0Zm1 1h1V7H1Zm1 1h1V8H2Zm2 2h1V8H4ZM1 6h1V5H1Zm1-1h1V4H2Zm6 4h1V8H8Zm1-1h1V7H9Zm0-2h1V5H9Zm1 1h1V6h-1ZM8 5h1V4H8Zm0 0" />
    </svg>
  );
}

function IconShield({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M9 8H8v2h1Zm0 0h1V3H8V2H6v4h3Zm-6 3h1v-1H3Zm-1-1h1V8H2Zm2 2h3v-1H6V6H5v5H4Zm3-1h1v-1H7ZM1 8h1V6h3V2H3v1H1Zm4-6h1V1H5Zm0 0" />
    </svg>
  );
}

function IconMusicalNote({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M0 12h3v-1h1V5h2V4h3v4H7v1h1v1H7V9H6v2h3v-1h1V1H7v1H3v7H1v1h1v1H1v-1H0Zm0 0" />
    </svg>
  );
}

function IconSatellite({ class: className }: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      class={className}
      fill="currentColor"
      style="image-rendering:pixelated"
    >
      <path d="M6 10H5v1H4v1h6v-2H9v1H6Zm0 0h1V8h1V5h1V1H8v2H7v2H6v1H5v1H3v1H1v1h4V8h1ZM0 8h1V5H0Zm1-3h1V3H1Zm7 5h1V8H8ZM3 4h1V3H3Zm1 1h1V4H4ZM1 2h1V1H1Zm2 0h2V1H3Zm2-1h3V0H5Zm0 0" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CTA Button (reused in hero + footer)
// ---------------------------------------------------------------------------

function CtaButton({ hasSession }: { hasSession: boolean }) {
  return hasSession ? (
    <a
      href="/dashboard"
      class="group relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02]"
    >
      Go to Dashboard
      <span class="inline-block transition-transform group-hover:translate-x-0.5">
        &rarr;
      </span>
    </a>
  ) : (
    <a
      href="/auth/google"
      class="group relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02]"
    >
      Get Started
      <span class="inline-block transition-transform group-hover:translate-x-0.5">
        &rarr;
      </span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Starfield (decorative floating dots)
// ---------------------------------------------------------------------------

function Starfield() {
  const stars = [
    { top: "8%", left: "15%", delay: "0s", large: false },
    { top: "12%", left: "72%", delay: "1.2s", large: true },
    { top: "20%", left: "40%", delay: "2.4s", large: false },
    { top: "28%", left: "85%", delay: "0.6s", large: false },
    { top: "35%", left: "10%", delay: "1.8s", large: true },
    { top: "42%", left: "55%", delay: "3s", large: false },
    { top: "50%", left: "25%", delay: "0.3s", large: false },
    { top: "58%", left: "78%", delay: "2.1s", large: true },
    { top: "65%", left: "45%", delay: "1.5s", large: false },
    { top: "72%", left: "8%", delay: "0.9s", large: false },
    { top: "18%", left: "58%", delay: "3.3s", large: false },
    { top: "80%", left: "65%", delay: "2.7s", large: false },
    { top: "45%", left: "92%", delay: "1s", large: true },
    { top: "6%", left: "30%", delay: "2s", large: false },
    { top: "88%", left: "20%", delay: "0.5s", large: false },
    { top: "15%", left: "90%", delay: "3.6s", large: false },
  ];
  return (
    <>
      {stars.map((s) => (
        <div
          class={`star ${s.large ? "star-lg" : ""}`}
          style={`top:${s.top};left:${s.left};animation-delay:${s.delay}`}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Hero
// ---------------------------------------------------------------------------

function HeroSection({ hasSession }: { hasSession: boolean }) {
  return (
    <section class="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0f0d2e] via-[#120f35] to-[#1a1145] overflow-hidden px-4">
      <Starfield />

      {/* Radial glow behind logo */}
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/[0.07] blur-3xl pointer-events-none" />

      <div class="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <img src="/logo.webp" alt="Vibe Check Logo" class="w-64 h-64 mb-4" />

        <h1 class="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          Vibe Check
        </h1>

        <p class="text-xl md:text-2xl text-gray-300 mb-3 max-w-lg">
          Give your AI assistants eyes on the real world.
        </p>

        <p class="text-gray-500 mb-10 max-w-md leading-relaxed">
          Share your real-time location and Discord presence with personal AI
          assistants&mdash;securely and on your terms.
        </p>

        <CtaButton hasSession={hasSession} />
      </div>

      {/* Scroll hint */}
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <div class="w-px h-6 bg-gradient-to-b from-gray-600 to-transparent" />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: How It Works
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  const steps = [
    {
      icon: <IconLocationPin class="w-7 h-7" />,
      title: "Track",
      desc: "The Overland iOS app sends your GPS location in the background. Set it and forget it.",
      color: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      icon: <IconGlobe class="w-7 h-7" />,
      title: "Aggregate",
      desc: "Vibe Check combines your location with Discord presence via Lanyard into a single status.",
      color: "text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      icon: <IconRobot class="w-7 h-7" />,
      title: "Assist",
      desc: "Your AI assistants query the REST API or MCP server and get your full context instantly.",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <section class="relative bg-[#13102e] py-16 md:py-24 px-4 overflow-hidden">
      {/* Subtle top border glow */}
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16 reveal">
          <span class="inline-block text-xs tracking-[0.2em] uppercase text-purple-400 mb-3 font-medium font-[JetBrains_Mono]">
            How it works
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-white">
            Three steps to context
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
          {steps.map((step, i) => (
            <div class={`reveal reveal-delay-${i + 1}`}>
              <div
                class={`h-full relative bg-white/[0.03] border ${step.borderColor} rounded-xl p-6 text-center hover:bg-white/[0.06] transition-colors duration-300`}
              >
                {/* Step number */}
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#13102e] px-3">
                  <span class="text-xs text-gray-600 font-[JetBrains_Mono]">{`0${i + 1}`}</span>
                </div>
                <div
                  class={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 ${step.color} mb-4`}
                >
                  {step.icon}
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Features
// ---------------------------------------------------------------------------

function FeaturesSection() {
  const features = [
    {
      icon: <IconCode class="w-6 h-6" />,
      title: "REST API",
      desc: "Simple GET request returns your full status as JSON. Cache-friendly with 30s TTL.",
      color: "text-blue-400",
    },
    {
      icon: <IconSatellite class="w-6 h-6" />,
      title: "MCP Server",
      desc: "Native Model Context Protocol support. AI assistants get a get_status tool out of the box.",
      color: "text-purple-400",
    },
    {
      icon: <IconMusicalNote class="w-6 h-6" />,
      title: "Discord Presence",
      desc: "Status, current activity, and Spotify track — all included automatically via Lanyard.",
      color: "text-pink-400",
    },
    {
      icon: <IconLocationPin class="w-6 h-6" />,
      title: "GPS Tracking",
      desc: "Background location from Overland iOS. One-tap setup from the dashboard.",
      color: "text-emerald-400",
    },
  ];

  return (
    <section class="relative bg-gradient-to-b from-[#13102e] to-[#110e28] py-16 md:py-24 px-4">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16 reveal">
          <span class="inline-block text-xs tracking-[0.2em] uppercase text-purple-400 mb-3 font-medium font-[JetBrains_Mono]">
            Features
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-white">
            Everything your AI needs
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div class={`reveal reveal-delay-${i + 1}`}>
              <div class="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                <div
                  class={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 ${f.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {f.icon}
                </div>
                <h3 class="text-base font-semibold text-white mb-1.5">
                  {f.title}
                </h3>
                <p class="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: API Preview (Terminal Mockup)
// ---------------------------------------------------------------------------

function ApiPreviewSection() {
  return (
    <section class="relative bg-[#110e28] py-16 md:py-24 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12 reveal">
          <span class="inline-block text-xs tracking-[0.2em] uppercase text-purple-400 mb-3 font-medium font-[JetBrains_Mono]">
            API Response
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-white">
            See what your AI sees
          </h2>
        </div>

        <div class="reveal reveal-delay-1">
          <div class="rounded-xl border border-white/10 overflow-hidden bg-[#0a0820] shadow-2xl shadow-purple-900/10">
            {/* Title bar */}
            <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div class="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span class="text-xs text-gray-500 font-[JetBrains_Mono] ml-2">
                GET /api/status/:apiKey
              </span>
            </div>

            {/* Code content */}
            <pre class="p-5 text-[13px] leading-relaxed font-[JetBrains_Mono] overflow-x-auto">
              <code>
                <span class="text-gray-500">{"{"}</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"ok"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-amber-400">true</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"user"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>{" "}
                <span class="text-purple-400">"name"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"Sam"</span>{" "}
                <span class="text-gray-500">{"}"}</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"location"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"coordinates"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>{" "}
                <span class="text-purple-400">"lat"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-blue-400">37.78</span>
                <span class="text-gray-500">,</span>{" "}
                <span class="text-purple-400">"lng"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-blue-400">-122.41</span>{" "}
                <span class="text-gray-500">{"}"}</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"speed"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-blue-400">0</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"motion"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">[</span>
                <span class="text-emerald-400">"stationary"</span>
                <span class="text-gray-500">]</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"battery_level"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-blue-400">85</span>
                {"\n"}
                {"  "}
                <span class="text-gray-500">{"}"}</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"address"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"place"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"San Francisco"</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"region"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"California"</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"country"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"United States"</span>
                {"\n"}
                {"  "}
                <span class="text-gray-500">{"}"}</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"discord"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"status"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"online"</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"    "}
                <span class="text-purple-400">"spotify"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>{" "}
                <span class="text-purple-400">"song"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"Redbone"</span>
                <span class="text-gray-500">,</span>{" "}
                <span class="text-purple-400">"artist"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-emerald-400">"Childish Gambino"</span>{" "}
                <span class="text-gray-500">{"}"}</span>
                {"\n"}
                {"  "}
                <span class="text-gray-500">{"}"}</span>
                <span class="text-gray-500">,</span>
                {"\n"}
                {"  "}
                <span class="text-purple-400">"_meta"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-gray-500">{"{"}</span>{" "}
                <span class="text-purple-400">"data_age_seconds"</span>
                <span class="text-gray-500">:</span>{" "}
                <span class="text-blue-400">30</span>{" "}
                <span class="text-gray-500">{"}"}</span>
                {"\n"}
                <span class="text-gray-500">{"}"}</span>
                <span class="inline-block w-2 h-4 bg-purple-400/80 ml-0.5 align-middle animate-[caret-blink_1s_ease-in-out_infinite]" />
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Privacy
// ---------------------------------------------------------------------------

function PrivacySection() {
  const levels = [
    { label: "Exact", desc: "Raw coords", active: true },
    { label: "City", desc: "~1 km", active: false },
    { label: "Region", desc: "~11 km", active: false },
    { label: "Hidden", desc: "Omitted", active: false },
  ];

  return (
    <section class="relative bg-gradient-to-b from-[#110e28] to-[#0f0d2e] py-16 md:py-24 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <div class="reveal">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 mb-6">
            <IconShield class="w-7 h-7" />
          </div>

          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Your data, your rules.
          </h2>

          <p class="text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
            Control exactly how much location precision your AI assistants
            receive. Change it anytime from the dashboard.
          </p>
        </div>

        {/* Precision level pills */}
        <div class="reveal reveal-delay-1">
          <div class="inline-flex flex-wrap justify-center gap-2 mb-8">
            {levels.map((l) => (
              <div
                class={`px-4 py-2 rounded-lg border text-sm font-[JetBrains_Mono] transition-colors ${
                  l.active
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-500"
                }`}
              >
                <span class="font-medium">{l.label}</span>
                <span class="text-xs ml-1.5 opacity-60">{l.desc}</span>
              </div>
            ))}
          </div>

          <p class="text-sm text-gray-600 max-w-sm mx-auto">
            Plus per-field controls: hide speed, altitude, battery, WiFi, device
            ID, and more.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Footer
// ---------------------------------------------------------------------------

function FooterSection({ hasSession }: { hasSession: boolean }) {
  return (
    <footer class="relative bg-[#0f0d2e] pt-20 pb-12 px-4">
      {/* Top border glow */}
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div class="max-w-3xl mx-auto text-center">
        {/* Final CTA */}
        <div class="mb-16 reveal">
          <p class="text-xl text-gray-300 mb-6">
            Ready to give your AI some context?
          </p>
          <CtaButton hasSession={hasSession} />
        </div>

        {/* Links */}
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-8">
          <a
            href="https://github.com/the-snesler/vibe-check"
            class="hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <a
            href="https://overland.p3k.app/"
            class="hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener"
          >
            Overland
          </a>
          <a
            href="https://github.com/Phineas/lanyard"
            class="hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener"
          >
            Lanyard
          </a>
          <a
            href="https://samnesler.com/posts/privacy-policy/"
            class="hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener"
          >
            Privacy Policy
          </a>
          <a
            href="https://samnesler.com/posts/terms-of-service/"
            class="hover:text-gray-400 transition-colors"
            target="_blank"
            rel="noopener"
          >
            Terms of Service
          </a>
        </div>

        {/* Cloudflare badge + mascot */}
        <div class="flex items-center justify-center gap-2 text-gray-700 text-xs">
          <IconSpaceInvader class="w-4 h-4 text-gray-700" />
          <span>Built on Cloudflare Workers</span>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Route: Landing Page
// ---------------------------------------------------------------------------

export const home = new Hono<AppEnv>();

home.get("/", async (c) => {
  const sessionId = getCookie(c, "sid");
  const hasSession = sessionId
    ? !!(await c.env.SESSIONS.get(`session:${sessionId}`))
    : false;

  return c.render(
    <>
      <HeroSection hasSession={hasSession} />
      <HowItWorksSection />
      <FeaturesSection />
      <ApiPreviewSection />
      <PrivacySection />
      <FooterSection hasSession={hasSession} />

      {html`<script>
        document.addEventListener("DOMContentLoaded", function () {
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (e) {
                if (e.isIntersecting) {
                  e.target.classList.add("visible");
                  io.unobserve(e.target);
                }
              });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
          );
          document.querySelectorAll(".reveal").forEach(function (el) {
            io.observe(el);
          });
        });
      </script>`}
    </>,
  );
});
