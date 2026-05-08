<script setup lang="ts">
/**
 * NoSpaceView.vue — /sin-cupo
 *
 * Página de rechazo empático cuando no califica en QualifyModal.
 * Mantiene cooldown 24h y deriva al usuario a Instagram.
 */
</script>

<template>
  <main class="ns">
    <section class="ns__container">
      <span class="ns__icon" aria-hidden="true">
        <i class="fa-solid fa-heart" />
      </span>

      <h1 class="ns__title">Esta cohorte no es para ti — y está bien.</h1>

      <p class="ns__lead">
        La comunidad anual de Luisa Pita Bejarano está hecha para mujeres que pueden invertir
        <strong>capital tres cifras</strong> y comprometerse <strong>un año entero</strong>.
        Si hoy no es tu momento, no fuerces algo que no calza con tu vida real.
      </p>

      <div class="ns__card">
        <h2>Mientras tanto, no te quedes lejos.</h2>
        <p>
          Sigue el trabajo de Luisa en Instagram. Ahí compartirá rutinas, reflexiones y novedades de la
          comunidad. Cuando sientas que es tu momento, vuelves y aplicas a la próxima cohorte.
        </p>
        <a
          href="https://www.instagram.com/luisapitabejarano/"
          target="_blank"
          rel="noopener noreferrer"
          class="ns__link"
        >
          <i class="fa-brands fa-instagram" aria-hidden="true" />
          Seguir a @luisapitabejarano
        </a>
      </div>

      <p class="ns__small">
        Podrás volver a registrarte después de 24 horas si tu situación cambia.
      </p>

      <nav class="ns__legal">
        <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
        <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
      </nav>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.ns {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5fffa 0%, #ffffff 100%);
  display: grid;
  place-items: center;
  padding: 3rem 1.5rem;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #0d1117;
}

.ns__container {
  max-width: 640px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.ns__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #16c784;
  color: #0d1117;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.ns__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.6rem, 4vw, 2.3rem);
  margin: 0;
  line-height: 1.15;
}

.ns__lead {
  font-size: 1rem;
  color: #41484f;
  line-height: 1.6;
  margin: 0;

  strong {
    color: #0d1117;
    font-weight: 700;
  }
}

.ns__card {
  margin-top: 1rem;
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  text-align: left;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    margin: 0 0 0.5rem;
    text-align: center;
  }

  p {
    color: #4b5563;
    margin: 0 0 1.25rem;
    line-height: 1.55;
    text-align: center;
  }
}

.ns__link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: #0d1117;
  color: #16c784;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  margin: 0 auto;
  width: max-content;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: #16c784;
    color: #0d1117;
  }
}

.ns__small {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.ns__legal {
  display: flex;
  gap: 1.25rem;
  margin-top: 1rem;
  font-size: 0.85rem;

  a {
    color: #4b5563;
    text-decoration: none;

    &:hover {
      color: #0a9e68;
      text-decoration: underline;
    }
  }
}
</style>
