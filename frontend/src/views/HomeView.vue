<script setup>
import { onMounted, ref } from 'vue'
import { api, errorMessage } from '../services/api'

const serverState = ref('checking')
const serverMessage = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/health')
    serverState.value = data.database?.connected ? 'online' : 'degraded'
    serverMessage.value = data.database?.connected ? 'Learning platform is ready.' : 'API is reachable, but the database is not connected.'
  } catch (error) {
    serverState.value = 'offline'
    serverMessage.value = errorMessage(error)
  }
})
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="page-container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> Your next chapter starts here</div>
          <h1>Make room for<br /><span>what’s next.</span></h1>
          <p class="hero-lede">Build real skills, find your people, and move toward the work you want — one great course at a time.</p>
          <div class="hero-actions">
            <RouterLink to="/courses" class="button button-primary button-large">Explore courses <span aria-hidden="true">↗</span></RouterLink>
            <RouterLink to="/register" class="button button-quiet button-large">Join for free <span aria-hidden="true">→</span></RouterLink>
          </div>
          <div class="hero-trust"><span class="trust-avatars" aria-hidden="true"><i>A</i><i>M</i><i>J</i></span><span>Learn at your pace. Grow on your terms.</span></div>
        </div>
        <div class="hero-art" aria-label="A creative learning journey illustration">
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-sun"></div>
          <div class="art-card art-card-main">
            <div class="art-card-top"><span class="art-kicker">YOUR LEARNING PATH</span><span class="art-menu">···</span></div>
            <div class="art-progress-title">A little progress,<br />every day.</div>
            <div class="art-path"><span class="path-dot done">✓</span><span class="path-line"></span><span class="path-dot current">✦</span><span class="path-line"></span><span class="path-dot"></span></div>
            <div class="art-path-labels"><span>Start</span><span>Growing</span><span>There</span></div>
          </div>
          <div class="art-note"><span class="note-icon">✷</span><span>Curiosity<br />looks good on you.</span></div>
          <div class="art-star star-one">✳</div><div class="art-star star-two">✦</div>
          <div class="art-small-card"><span class="small-card-icon">↗</span><span>Keep going.<br /><b>You’re doing great.</b></span></div>
        </div>
      </div>
      <div class="hero-bottom-line"></div>
    </section>
    <section class="stats-strip"><div class="page-container stats-inner"><p>For wherever you’re headed</p><span><b>Learn</b> something useful</span><span><b>Build</b> something real</span><span><b>Become</b> more you</span></div></section>
    <section class="home-section page-container">
      <div class="section-heading"><div><p class="section-overline">A learning experience that fits</p><h2>Small steps.<br class="mobile-break" /> Big possibilities.</h2></div><RouterLink to="/courses" class="text-link">Find your next course <span>→</span></RouterLink></div>
      <div class="feature-grid">
        <article class="feature-card feature-peach"><span class="feature-number">01</span><div class="feature-icon">◒</div><h3>Learn in your own rhythm</h3><p>Explore lessons designed to fit around real life, wherever and whenever you’re ready.</p></article>
        <article class="feature-card feature-lilac"><span class="feature-number">02</span><div class="feature-icon">✳</div><h3>Turn ideas into skills</h3><p>Go beyond the theory with practical learning that brings your next big idea closer.</p></article>
        <article class="feature-card feature-mint"><span class="feature-number">03</span><div class="feature-icon">↗</div><h3>See how far you’ve come</h3><p>Keep track of your learning, celebrate each milestone, and stay excited for what’s ahead.</p></article>
      </div>
    </section>
    <section class="home-cta-wrap"><div class="page-container home-cta"><div><p class="section-overline">There’s no perfect time</p><h2>There’s just your<br />next step.</h2></div><div class="cta-right"><p>Start exploring new skills today. Your future self will thank you.</p><RouterLink to="/courses" class="button button-dark button-large">Find your next course <span>↗</span></RouterLink></div><span class="cta-flower" aria-hidden="true">✳</span></div></section>
    <div class="page-container api-status-wrap"><p class="api-status" :class="`status-${serverState}`"><span class="status-indicator"></span>{{ serverState === 'checking' ? 'Checking platform connection…' : serverMessage }}</p></div>
  </div>
</template>
