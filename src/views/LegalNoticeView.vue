<script setup lang="ts">
import { onMounted } from 'vue'
import IzzuHeader from '@/components/IzzuHeader.vue'

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
})
</script>

<template>
  <IzzuHeader variant="light" />
  <main class="legal">
    <article class="legal__container">
      <header class="legal__header">
        <RouterLink to="/" class="legal__back">
          <i class="fa-solid fa-arrow-left" aria-hidden="true" />
          Volver al sitio
        </RouterLink>
        <h1>Aviso Legal</h1>
        <p class="legal__updated">Última actualización: 08 de mayo de 2026</p>
      </header>

      <section>
        <h2>1. Titularidad del sitio</h2>
        <p>
          El presente sitio web <strong>izzuestudio.com</strong> es titularidad de IZZU Estudio de Arquitectura,
          persona natural con domicilio en Ecuador
          (<em>[PENDIENTE: nombre legal exacto, RUC/cédula, dirección física]</em>).
        </p>
        <p>
          Email de contacto: <em>[PENDIENTE: email oficial de contacto]</em>.
        </p>
      </section>

      <section>
        <h2>2. Objeto del sitio</h2>
        <p>
          izzuestudio.com es el sitio oficial de IZZU Estudio de Arquitectura para gestionar las
          <strong>sesiones de diagnóstico técnico-legal gratuito</strong>. El sitio captura datos
          de contacto de propietarios, inversionistas y desarrolladores interesados en regularización
          de edificaciones, propiedad horizontal, división de solares y urbanismo estratégico.
        </p>
      </section>

      <section>
        <h2>3. Naturaleza de la oferta</h2>
        <p>
          Este sitio anuncia <strong>sesiones de diagnóstico gratuito</strong>. El registro no implica
          una compra ni un compromiso económico. La contratación de servicios de arquitectura se realiza
          únicamente después del diagnóstico y con el consentimiento expreso del cliente.
        </p>
        <p>
          Las imágenes, descripciones y casos de éxito mostrados son referenciales. Los resultados
          de cada caso dependen de las circunstancias particulares de cada propiedad y cliente.
        </p>
      </section>

      <section>
        <h2>4. Propiedad intelectual</h2>
        <p>
          Todos los contenidos del sitio (textos, fotografías, diseño, marca y materiales audiovisuales) son
          propiedad de IZZU Estudio de Arquitectura o de terceros con licencia para su uso, y están protegidos por la
          legislación de propiedad intelectual aplicable. Queda prohibida su reproducción total o parcial sin
          autorización previa por escrito.
        </p>
      </section>

      <section>
        <h2>5. Uso del sitio</h2>
        <p>La persona usuaria se compromete a:</p>
        <ul>
          <li>Proveer información veraz al registrarse para el diagnóstico.</li>
          <li>No utilizar el sitio para fines ilícitos o que perjudiquen a terceros.</li>
          <li>No intentar acceder, alterar o dañar la infraestructura tecnológica del sitio.</li>
        </ul>
      </section>

      <section>
        <h2>6. Limitación de responsabilidad</h2>
        <p>
          IZZU Estudio de Arquitectura no garantiza la disponibilidad ininterrumpida del sitio y no será responsable
          por daños derivados de fallas técnicas, interrupciones del servicio o acciones de terceros.
        </p>
      </section>

      <section>
        <h2>7. Privacidad y protección de datos</h2>
        <p>
          El tratamiento de datos personales se rige por las
          <RouterLink to="/politicas-privacidad">Políticas de Privacidad</RouterLink>
          publicadas en este sitio.
        </p>
      </section>

      <section>
        <h2>8. Legislación aplicable</h2>
        <p>
          Este aviso legal se rige por la legislación de la República del Ecuador. Para cualquier
          controversia, las partes se someten a los tribunales competentes del domicilio del titular del
          sitio, salvo que la normativa imperativa disponga otra cosa.
        </p>
      </section>
    </article>
  </main>
</template>

<style lang="scss" scoped>
.legal {
  background: #ffffff;
  color: #0d1117;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  padding: 2.5rem 1.5rem 4rem;
  min-height: 100vh;
}

.legal__container {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.legal__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legal__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #A0784F;
  text-decoration: none;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  width: max-content;

  &:hover {
    text-decoration: underline;
  }
}

h1 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.85rem, 4vw, 2.4rem);
  margin: 0.25rem 0 0;
}

.legal__updated {
  color: #6b7280;
  font-size: 0.85rem;
  margin: 0;
}

section {
  border-top: 1px solid #e5e9ec;
  padding-top: 1.25rem;
}

h2 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
}

p,
li {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
}

ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

a {
  color: #A0784F;
  text-decoration: underline;

  &:hover {
    color: #0d1117;
  }
}

em {
  background: #fff7d6;
  padding: 0.05rem 0.4rem;
  border-radius: 0.3rem;
  font-style: normal;
  color: #7a5b00;
}
</style>
