<script setup lang="ts">
defineProps<{
  variant?: 'dark' | 'light'
  ctaLabel?: string
}>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <header class="izheader" :class="[`izheader--${variant ?? 'dark'}`]">
    <div class="izheader__inner">
      <RouterLink to="/" class="izheader__brand" aria-label="IZZU Estudio de Arquitectura">
        <img src="/izzu-logo.jpeg" alt="IZZU Estudio de Arquitectura" />
        <span class="izheader__brand-text">
          <strong>IZZU</strong>
          <em>Estudio de Arquitectura</em>
        </span>
      </RouterLink>

      <button
        v-if="ctaLabel"
        class="izheader__cta"
        type="button"
        @click="emit('cta')"
      >
        {{ ctaLabel }}
        <i class="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.izheader {
  position: relative;
  z-index: 100;
  width: 100%;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: background 200ms ease, border-color 200ms ease;
}

.izheader--dark {
  background: rgba(13, 17, 23, 0.78);
  border-color: rgba(196, 149, 106, 0.18);
  color: #ffffff;
}

.izheader--light {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(13, 17, 23, 0.08);
  color: #0d1117;
}

.izheader__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (min-width: 768px) {
    padding: 0.75rem 2rem;
  }
}

.izheader__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: inherit;

  img {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    object-fit: cover;
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);

    @media (min-width: 768px) {
      width: 48px;
      height: 48px;
    }
  }
}

.izheader__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;

  strong {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: 0.18em;

    .izheader--dark & { color: #ffffff; }
    .izheader--light & { color: #0d1117; }
  }

  em {
    font-style: normal;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 500;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 0.25rem;
    color: #C4956A;

    @media (max-width: 420px) { display: none; }
  }
}

.izheader__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #C4956A;
  color: #0D1117;
  border: 0;
  border-radius: 999px;
  padding: 0.55rem 1.05rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(196, 149, 106, 0.35);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease;

  &:hover {
    transform: translateY(-1px);
    background: #ffffff;
    color: #1B365D;
  }

  i { font-size: 0.7rem; }

  @media (max-width: 480px) {
    padding: 0.5rem 0.85rem;
    font-size: 0.74rem;
  }
}
</style>
