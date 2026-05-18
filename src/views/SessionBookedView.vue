<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IzzuHeader from '@/components/IzzuHeader.vue'

const contactName = ref('')
const steps = [
  { icon: 'fa-envelope', title: 'Revisa tu correo', body: 'Te enviamos la confirmación con los detalles de tu sesión de diagnóstico.' },
  { icon: 'fa-file-lines', title: 'Ten tus documentos listos', body: 'Si tienes escrituras o documentos catastrales, tenlos a mano. Si no, igual podemos orientarte.' },
  { icon: 'fa-video', title: 'Conéctate a la sesión', body: 'El día acordado te contactamos para la sesión de 20 minutos. Sin compromiso, 100% enfocado en tu caso.' },
]

onMounted(() => {
  try {
    const raw = localStorage.getItem('izzu_contact')
    if (raw) {
      const data = JSON.parse(raw) as { nombre?: string }
      if (data?.nombre) contactName.value = data.nombre.split(' ')[0]
    }
  } catch { /* ignore */ }
})
</script>

<template>
  <IzzuHeader variant="light" />
  <main class="izsbook">
    <section class="izsbook__hero">
      <div class="izsbook__container">
        <div class="izsbook__icon-wrap">
          <span class="izsbook__icon">
            <i class="fa-solid fa-circle-check" />
          </span>
          <svg class="izsbook__icon-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#C4956A" stroke-width="2" stroke-dasharray="277" stroke-dashoffset="277">
              <animate attributeName="stroke-dashoffset" from="277" to="0" dur="1.2s" fill="freeze" />
            </circle>
          </svg>
        </div>
        <h1 class="izsbook__title">
          <template v-if="contactName">{{ contactName }}, tu cita</template>
          <template v-else>Tu cita</template>
          ha sido <span>agendada</span>
        </h1>
        <p class="izsbook__sub">
          Recibirás un correo con los detalles de tu sesión de diagnóstico técnico-legal.
          Agendamos tu espacio; ahora solo falta que llegues.
        </p>
      </div>
    </section>

    <section class="izsbook__steps">
      <div class="izsbook__container">
        <div class="izsbook__steps-grid">
          <article v-for="(s, i) in steps" :key="i" class="izsbook__card">
            <span class="izsbook__card-num">{{ i + 1 }}</span>
            <span class="izsbook__card-icon"><i :class="['fa-solid', s.icon]" /></span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="izsbook__brand">
      <div class="izsbook__container">
        <div class="izsbook__brand-card">
          <div class="izsbook__brand-info">
            <i class="fa-solid fa-building-architecture" />
            <div>
              <strong>IZZU Estudio de Arquitectura</strong>
              <span>Regularización · Propiedad Horizontal · Urbanismo</span>
            </div>
          </div>
          <a href="https://www.instagram.com/izzuestudio/" target="_blank" rel="noopener noreferrer" class="izsbook__ig">
            <i class="fa-brands fa-instagram" />
            @izzuestudio
          </a>
        </div>
      </div>
    </section>

    <footer class="izsbook__foot">
      <div class="izsbook__container">
        <span>© IZZU Estudio de Arquitectura</span>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>
  </main>
</template>

<style lang="scss" scoped>
$primary: #1B365D;
$accent:  #C4956A;
$accent-d:#A0784F;
$dark:    #0D1117;
$light:   #F5F7FA;

.izsbook {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: $dark; min-height: 100vh;
  background: linear-gradient(180deg, $light 0%, #ffffff 40%, $light 100%);
}

.izsbook__container {
  max-width: 900px; margin: 0 auto; padding: 0 1.25rem;
  @media (min-width: 768px) { padding: 0 2rem; }
}

// ── HERO ────────────────────────────────────────────────────────
.izsbook__hero {
  padding: 3rem 0 1.5rem; text-align: center;
  @media (min-width: 768px) { padding: 4rem 0 2rem; }
}

.izsbook__icon-wrap {
  position: relative; width: 5.5rem; height: 5.5rem;
  margin: 0 auto 1.25rem; display: grid; place-items: center;
}
.izsbook__icon {
  width: 5rem; height: 5rem; border-radius: 999px;
  background: linear-gradient(135deg, $primary, #2a4a7a);
  color: $accent;
  display: grid; place-items: center;
  font-size: 2rem;
  box-shadow: 0 16px 40px rgba(27, 54, 93, 0.25);
  position: relative; z-index: 1;
}
.izsbook__icon-ring {
  position: absolute; inset: 0; width: 100%; height: 100%;
}

.izsbook__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.75rem, 4.5vw, 2.6rem);
  line-height: 1.12; margin: 0 0 0.6rem;
  span { color: $accent-d; }
}

.izsbook__sub {
  max-width: 580px; margin: 0 auto;
  color: #4b5563; font-size: 1rem; line-height: 1.6;
}

// ── STEPS ────────────────────────────────────────────────────────
.izsbook__steps {
  padding: 2rem 0 3rem;
}
.izsbook__steps-grid {
  display: grid; gap: 1rem;
  @media (min-width: 640px) { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

.izsbook__card {
  background: #ffffff; border-radius: 1.25rem;
  padding: 2rem 1.5rem; text-align: center;
  border: 1px solid rgba(27, 54, 93, 0.06);
  box-shadow: 0 12px 30px rgba(13, 17, 23, 0.05);
  position: relative; overflow: hidden;
  transition: transform 240ms ease, box-shadow 240ms ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(13, 17, 23, 0.1);
  }
}

.izsbook__card-num {
  position: absolute; top: 0.5rem; right: 0.75rem;
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: 3rem; color: rgba(27, 54, 93, 0.04);
  line-height: 1;
}

.izsbook__card-icon {
  width: 3.2rem; height: 3.2rem; border-radius: 999px;
  background: $primary; color: $accent;
  display: inline-grid; place-items: center;
  font-size: 1.25rem; margin-bottom: 1rem;
  box-shadow: 0 8px 20px rgba(27, 54, 93, 0.15);
}

.izsbook__card h3 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 700; font-size: 1.05rem; margin: 0 0 0.5rem; color: $primary;
}

.izsbook__card p {
  font-size: 0.9rem; color: #4b5563; line-height: 1.55; margin: 0;
}

// ── BRAND ────────────────────────────────────────────────────────
.izsbook__brand {
  padding: 1.5rem 0 2rem;
}
.izsbook__brand-card {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: #ffffff; border: 1px solid rgba(27, 54, 93, 0.06);
  border-radius: 1rem; padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 24px rgba(13, 17, 23, 0.04);
  flex-wrap: wrap;
}
.izsbook__brand-info {
  display: flex; align-items: center; gap: 0.85rem;
  i { font-size: 1.8rem; color: $accent; }
  strong { display: block; font-family: 'Outfit', system-ui, sans-serif; font-weight: 700; color: $primary; font-size: 1rem; }
  span { font-size: 0.78rem; color: #6b7280; }
}
.izsbook__ig {
  display: inline-flex; align-items: center; gap: 0.45rem;
  background: $dark; color: $accent;
  padding: 0.55rem 1.05rem; border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.85rem; text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
  &:hover { background: $accent; color: $dark; }
}

// ── FOOTER ───────────────────────────────────────────────────────
.izsbook__foot {
  padding: 1.5rem 0 2.5rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  .izsbook__container {
    display: flex; flex-direction: column; gap: 0.75rem; align-items: center; text-align: center;
    font-size: 0.82rem; color: #6b7280;
    @media (min-width: 640px) { flex-direction: row; justify-content: space-between; }
  }
  nav { display: flex; gap: 1rem; }
  a { color: #4b5563; text-decoration: none; &:hover { color: $accent; text-decoration: underline; } }
}
</style>
