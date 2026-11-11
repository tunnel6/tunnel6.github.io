<script setup>
defineProps({
  badge: { type: String, required: true },
  title: { type: String, required: true },
  titleAccent: { type: String, required: true },
  description: { type: String, required: true },
  primaryAction: { type: Object, required: true },
  secondaryAction: { type: Object, required: true },
  githubAction: { type: String, required: true },
  heroChips: { type: Array, required: true },
  capabilityEyebrow: { type: String, required: true },
  capabilityTitle: { type: String, required: true },
  capabilities: { type: Array, required: true },
  workflowEyebrow: { type: String, required: true },
  workflowTitle: { type: String, required: true },
  workflowDescription: { type: String, required: true },
  workflowSteps: { type: Array, required: true },
  terminalTitle: { type: String, required: true },
  terminalLines: { type: Array, required: true },
  useCaseEyebrow: { type: String, required: true },
  useCaseTitle: { type: String, required: true },
  useCases: { type: Array, required: true },
  architectureEyebrow: { type: String, required: true },
  architectureTitle: { type: String, required: true },
  architectureDescription: { type: String, required: true },
  tunnelMode: { type: Object, required: true },
  wireguardMode: { type: Object, required: true },
  ctaTitle: { type: String, required: true },
  ctaDescription: { type: String, required: true },
  ctaAction: { type: Object, required: true },
  docsAction: { type: Object, required: true }
})
</script>

<template>
  <main class="home">
    <section class="home-hero">
      <div class="home-container home-hero-grid">
        <div class="home-hero-copy">
          <p class="home-badge">
            <span aria-hidden="true">●</span>
            {{ badge }}
          </p>
          <h1>
            {{ title }}
            <span>{{ titleAccent }}</span>
          </h1>
          <p class="home-hero-lede">{{ description }}</p>

          <div class="home-actions">
            <a class="home-button primary" :href="primaryAction.link">
              {{ primaryAction.text }}
            </a>
            <a class="home-button secondary" :href="secondaryAction.link">
              {{ secondaryAction.text }}
            </a>
            <a
              class="home-button ghost"
              href="https://github.com/tunnel6/yat"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ githubAction }}
            </a>
          </div>

          <ul class="home-hero-chips" aria-label="YAT">
            <li v-for="chip in heroChips" :key="chip">{{ chip }}</li>
          </ul>
        </div>

        <div class="home-product">
          <div class="home-browser">
            <div class="home-browser-bar">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <p>app.yat.local</p>
            </div>
            <img src="/images/snapshot-index-01.png" alt="YAT tunnel management dashboard" />
          </div>
          <div class="home-floating-card">
            <span class="home-status-dot" aria-hidden="true"></span>
            <div>
              <strong>https://api.example.com</strong>
              <small>mTLS · Edge relay · Active</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="home-section capability-section">
      <div class="home-container">
        <div class="home-section-head">
          <p>{{ capabilityEyebrow }}</p>
          <h2>{{ capabilityTitle }}</h2>
        </div>
        <div class="home-capability-grid">
          <article v-for="capability in capabilities" :key="capability.title" class="home-card">
            <span aria-hidden="true">{{ capability.icon }}</span>
            <h3>{{ capability.title }}</h3>
            <p>{{ capability.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="home-section architecture-section">
      <div class="home-container">
        <div class="home-section-head">
          <p>{{ architectureEyebrow }}</p>
          <h2>{{ architectureTitle }}</h2>
          <p class="home-section-description">{{ architectureDescription }}</p>
        </div>
        <div class="home-architecture-grid">
          <article class="home-architecture-card">
            <div class="home-architecture-head">
              <span aria-hidden="true">{{ tunnelMode.icon }}</span>
              <div>
                <p>{{ tunnelMode.eyebrow }}</p>
                <h3>{{ tunnelMode.title }}</h3>
              </div>
            </div>
            <p>{{ tunnelMode.description }}</p>
            <ul>
              <li v-for="item in tunnelMode.points" :key="item">{{ item }}</li>
            </ul>
            <a class="home-architecture-link" :href="tunnelMode.guideLink">
              {{ tunnelMode.guideLabel }}
            </a>
          </article>
          <article class="home-architecture-card wireguard">
            <div class="home-architecture-head">
              <span aria-hidden="true">{{ wireguardMode.icon }}</span>
              <div>
                <p>{{ wireguardMode.eyebrow }}</p>
                <h3>{{ wireguardMode.title }}</h3>
              </div>
            </div>
            <p>{{ wireguardMode.description }}</p>
            <ul>
              <li v-for="item in wireguardMode.points" :key="item">{{ item }}</li>
            </ul>
            <a class="home-architecture-link" :href="wireguardMode.guideLink">
              {{ wireguardMode.guideLabel }}
            </a>
          </article>
        </div>
      </div>
    </section>

    <section class="home-section workflow-section">
      <div class="home-container home-workflow-grid">
        <div>
          <div class="home-section-head left">
            <p>{{ workflowEyebrow }}</p>
            <h2>{{ workflowTitle }}</h2>
          </div>
          <p class="home-workflow-lede">{{ workflowDescription }}</p>
          <ol class="home-steps">
            <li v-for="(step, index) in workflowSteps" :key="step.title">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="home-terminal">
          <div class="home-terminal-bar">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <p>{{ terminalTitle }}</p>
          </div>
          <pre><code><span
            v-for="line in terminalLines"
            :key="line"
            :class="{ command: line.startsWith('$') }"
          >{{ line }}
</span></code></pre>
        </div>
      </div>
    </section>

    <section class="home-section use-case-section">
      <div class="home-container">
        <div class="home-section-head">
          <p>{{ useCaseEyebrow }}</p>
          <h2>{{ useCaseTitle }}</h2>
        </div>
        <div class="home-use-case-grid">
          <article v-for="useCase in useCases" :key="useCase.title" class="home-card use-case">
            <span aria-hidden="true">{{ useCase.icon }}</span>
            <h3>{{ useCase.title }}</h3>
            <p>{{ useCase.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="home-cta">
      <div class="home-container home-cta-inner">
        <div>
          <h2>{{ ctaTitle }}</h2>
          <p>{{ ctaDescription }}</p>
        </div>
        <div class="home-actions">
          <a class="home-button primary" :href="ctaAction.link">{{ ctaAction.text }}</a>
          <a class="home-button secondary" :href="docsAction.link">{{ docsAction.text }}</a>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  overflow: hidden;
}

.home-container {
  width: 100%;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .home-container {
    padding: 0 32px;
  }
}

.home-hero {
  position: relative;
  padding: 88px 0 112px;
  color: #eaf4ff;
  background:
    radial-gradient(circle at 15% 10%, rgba(132, 204, 22, 0.22), transparent 30rem),
    radial-gradient(circle at 90% 5%, rgba(56, 189, 248, 0.16), transparent 30rem),
    linear-gradient(180deg, #050a10 0%, #071527 72%, #0b1d31 100%);
}

.home-hero::after {
  position: absolute;
  right: -120px;
  bottom: -180px;
  width: 500px;
  height: 500px;
  border: 1px solid rgba(148, 197, 255, 0.08);
  border-radius: 50%;
  content: "";
  box-shadow: inset 0 0 100px rgba(148, 197, 255, 0.04);
}

.home-hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(0, 1.02fr);
  gap: 56px;
  align-items: center;
}

.home-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 24px;
  padding: 6px 13px;
  border: 1px solid rgba(132, 204, 22, 0.35);
  border-radius: 999px;
  color: #b8f23d;
  background: rgba(132, 204, 22, 0.1);
  font-size: 0.8125rem;
  font-weight: 650;
}

.home-badge span {
  font-size: 0.55rem;
}

.home-hero h1 {
  margin: 0 0 22px;
  font-size: clamp(2.15rem, 3.35vw, 2.5rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.04em;
}

.home-hero h1 span {
  color: #a3e635;
}

.home-hero-lede {
  max-width: 34rem;
  margin: 0 0 32px;
  color: rgba(226, 238, 252, 0.76);
  font-size: 1.1875rem;
  line-height: 1.7;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.home-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.home-button.primary {
  color: #07120a;
  background: #a3e635;
  box-shadow: 0 14px 34px rgba(132, 204, 22, 0.24);
}

.home-button.primary:hover {
  background: #b8f23d;
  transform: translateY(-1px);
}

.home-button.secondary,
.home-button.ghost {
  border: 1px solid rgba(197, 224, 255, 0.25);
  color: #eaf4ff;
  background: rgba(255, 255, 255, 0.04);
}

.home-button.secondary:hover,
.home-button.ghost:hover {
  border-color: rgba(197, 224, 255, 0.5);
  transform: translateY(-1px);
}

.home-hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 38px 0 0;
  padding: 0;
  list-style: none;
}

.home-hero-chips li {
  padding: 6px 11px;
  border: 1px solid rgba(197, 224, 255, 0.14);
  border-radius: 8px;
  color: rgba(226, 238, 252, 0.68);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.875rem;
}

.home-product {
  position: relative;
}

.home-browser,
.home-terminal {
  overflow: hidden;
  border: 1px solid rgba(197, 224, 255, 0.16);
  border-radius: 16px;
  background: rgba(5, 12, 20, 0.82);
  box-shadow: 0 42px 110px rgba(2, 8, 20, 0.42);
  backdrop-filter: blur(12px);
}

.home-browser-bar,
.home-terminal-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(197, 224, 255, 0.11);
  background: rgba(255, 255, 255, 0.035);
}

.home-browser-bar span,
.home-terminal-bar span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(197, 224, 255, 0.22);
}

.home-browser-bar span:nth-child(1),
.home-terminal-bar span:nth-child(1) {
  background: #ff5f57;
}

.home-browser-bar span:nth-child(2),
.home-terminal-bar span:nth-child(2) {
  background: #febc2e;
}

.home-browser-bar span:nth-child(3),
.home-terminal-bar span:nth-child(3) {
  background: #28c840;
}

.home-browser-bar p,
.home-terminal-bar p {
  margin: 0 auto;
  color: rgba(226, 238, 252, 0.52);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}

.home-browser img {
  width: 100%;
  display: block;
  border-radius: 0 0 15px 15px;
}

.home-floating-card {
  position: absolute;
  bottom: 24px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 17px;
  border: 1px solid rgba(132, 204, 22, 0.3);
  border-radius: 12px;
  color: #eaf4ff;
  background: rgba(6, 16, 27, 0.94);
  box-shadow: 0 20px 50px rgba(2, 8, 20, 0.38);
}

.home-floating-card div {
  display: grid;
  gap: 3px;
}

.home-floating-card strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
}

.home-floating-card small {
  color: rgba(226, 238, 252, 0.6);
  font-size: 0.75rem;
}

.home-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a3e635;
  box-shadow: 0 0 16px rgba(132, 204, 22, 0.8);
}

.home-section {
  padding: 96px 0;
}

.capability-section {
  background: var(--vp-c-bg);
}

.workflow-section {
  background: var(--vp-c-bg-alt);
}

.use-case-section {
  background: var(--vp-c-bg);
}

.architecture-section {
  background: var(--vp-c-bg-alt);
}

.home-section-head {
  max-width: none;
  margin: 0 auto 56px;
  text-align: center;
}

.home-section-head.left {
  margin: 0 0 24px;
  text-align: left;
}

.home-section-head p {
  margin: 0 0 10px;
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-section-head h2 {
  max-width: none;
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(1.75rem, 2.85vw, 2.2rem);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.03em;
}

.home-capability-grid,
.home-use-case-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.home-use-case-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.home-card {
  padding: 27px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.05);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.home-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.09);
}

.workflow-section .home-card {
  background: var(--vp-c-bg);
}

.home-card > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 19px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-brand-soft);
  font-size: 1.25rem;
}

.home-card h3 {
  margin: 0 0 9px;
  color: var(--vp-c-text-1);
  font-size: 1.125rem;
  white-space: nowrap;
  line-height: 1.35;
}

.home-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 1.65;
}

.home-section-description {
  max-width: 46rem;
  margin: 18px auto 0;
  color: var(--vp-c-text-2);
  font-size: 1.0625rem;
  line-height: 1.7;
}

.home-architecture-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.home-architecture-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.05);
}

.home-architecture-card.wireguard {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent);
  background: linear-gradient(180deg, var(--vp-c-brand-soft), var(--vp-c-bg) 70%);
}

.home-architecture-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.home-architecture-head span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: var(--vp-c-brand-soft);
  font-size: 1.35rem;
}

.home-architecture-head p {
  margin: 0 0 4px;
  color: var(--vp-c-brand-1);
  font-size: 0.8125rem;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.home-architecture-head h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.35rem;
  line-height: 1.25;
}

.home-architecture-card > p {
  margin: 0 0 22px;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 1.7;
}

.home-architecture-card ul {
  display: grid;
  gap: 11px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-architecture-card li {
  position: relative;
  padding-left: 23px;
  color: var(--vp-c-text-1);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.home-architecture-card li::before {
  position: absolute;
  top: 0.55em;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  content: "";
}

.home-architecture-link {
  margin-top: auto;
  padding-top: 26px;
  color: var(--vp-c-brand-1);
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
}

.home-architecture-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.home-workflow-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 52px;
  align-items: center;
}

.home-workflow-lede {
  max-width: 34rem;
  margin: 0 0 36px;
  color: var(--vp-c-text-2);
  font-size: 1.125rem;
  line-height: 1.7;
}

.home-steps {
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-steps li {
  display: flex;
  gap: 18px;
  padding: 22px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.home-steps span {
  color: var(--vp-c-brand-1);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
  font-weight: 750;
}

.home-steps h3 {
  margin: 0 0 6px;
  color: var(--vp-c-text-1);
  font-size: 1.0625rem;
  white-space: nowrap;
}

.home-steps p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.home-terminal {
  color: #d8e9ff;
  background: rgba(6, 15, 26, 0.96);
}

.home-terminal pre {
  margin: 0;
  padding: 26px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.85;
}

.home-terminal code {
  display: block;
  color: rgba(216, 233, 255, 0.72);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre;
}

.home-terminal .command {
  color: #b8f23d;
}

.home-cta {
  padding: 96px 0;
  color: #eaf4ff;
  background:
    radial-gradient(circle at 85% 20%, rgba(132, 204, 22, 0.2), transparent 28rem),
    linear-gradient(135deg, #061324, #0b2237);
}

.home-cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 36px;
}

.home-cta h2 {
  max-width: none;
  margin: 0 0 10px;
  font-size: clamp(1.8rem, 2.85vw, 2.25rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.home-cta p {
  max-width: 38rem;
  margin: 0;
  color: rgba(226, 238, 252, 0.72);
  font-size: 1.0625rem;
  line-height: 1.7;
}

@media (min-width: 768px) {
  .home-hero h1,
  .home-section-head h2,
  .home-cta h2 {
    white-space: nowrap;
  }
}

@media (max-width: 1100px) {
  .home-use-case-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .home-cta-inner {
    display: grid;
  }

  .home-hero {
    padding: 62px 0 86px;
  }

  .home-hero-grid,
  .home-workflow-grid,
  .home-cta-inner {
    grid-template-columns: 1fr;
  }

  .home-hero-grid {
    gap: 46px;
  }

  .home-product {
    margin: 0 -6px;
  }

  .home-capability-grid {
    grid-template-columns: 1fr;
  }

  .home-architecture-grid {
    grid-template-columns: 1fr;
  }

  .home-section {
    padding: 72px 0;
  }

  .home-cta-inner {
    align-items: flex-start;
  }

  .home-cta .home-actions {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .home-container {
    padding: 0 18px;
  }

  .home-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .home-button {
    width: 100%;
  }

  .home-use-case-grid {
    grid-template-columns: 1fr;
  }

  .home-floating-card {
    right: 14px;
    left: 14px;
    bottom: 13px;
  }
}
</style>
