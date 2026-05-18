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
        <h1>Políticas de Privacidad</h1>
        <p class="legal__updated">Última actualización: 08 de mayo de 2026</p>
      </header>

      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          IZZU Estudio de Arquitectura, persona natural con domicilio en Ecuador (datos legales completos:
          <em>[PENDIENTE: nombre legal exacto, RUC/cédula, dirección física]</em>), es responsable del
          tratamiento de los datos personales recogidos a través del sitio
          <strong>izzuestudio.com</strong>.
        </p>
        <p>
          Para consultas sobre privacidad puedes escribir a
          <em>[PENDIENTE: email oficial de contacto]</em>.
        </p>
      </section>

      <section>
        <h2>2. Datos que recogemos</h2>
        <p>Cuando te registras para una sesión de diagnóstico técnico-legal recogemos:</p>
        <ul>
          <li>Nombre y apellido.</li>
          <li>Correo electrónico.</li>
          <li>Número de teléfono y país.</li>
          <li>Respuestas a las preguntas de calificación (situación actual, tipo de inmueble, rango de valor).</li>
          <li>Datos técnicos y de atribución: dirección IP, agente de usuario, parámetros UTM, identificador de clic de Meta (fbclid) y cookies de Meta (_fbp, _fbc) cuando aplican.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades del tratamiento</h2>
        <ul>
          <li>Agendar tu sesión de diagnóstico técnico-legal gratuito y contactarte para coordinar la misma.</li>
          <li>Evaluar tu caso y preparar la estrategia de regularización o división de tu propiedad.</li>
          <li>Medir y optimizar las campañas publicitarias en plataformas como Meta (Facebook / Instagram) usando Meta Pixel y la API de Conversiones de Meta (Conversions API).</li>
          <li>Cumplir obligaciones legales o requerimientos de autoridades competentes.</li>
        </ul>
      </section>

      <section>
        <h2>4. Base legal</h2>
        <p>
          La base legal para tratar tus datos es <strong>tu consentimiento</strong>, otorgado al enviar el formulario de
          registro, así como el interés legítimo en medir el rendimiento de las campañas publicitarias.
        </p>
      </section>

      <section>
        <h2>5. Comunicación a terceros</h2>
        <p>Tus datos pueden ser compartidos con:</p>
        <ul>
          <li><strong>LeadConnectorHQ (GoHighLevel)</strong> — CRM y automatización de comunicaciones.</li>
          <li><strong>Meta Platforms, Inc.</strong> — para atribución y medición publicitaria, mediante Meta Pixel y la API de Conversiones de Meta. Los datos personales (email, teléfono) se envían siempre en formato cifrado SHA-256.</li>
          <li><strong>Cloudflare, Inc.</strong> — proveedor de alojamiento del sitio.</li>
          <li>Autoridades públicas cuando sea legalmente exigible.</li>
        </ul>
      </section>

      <section>
        <h2>6. Plazo de conservación</h2>
        <p>
          Conservaremos tus datos mientras dure tu interés en nuestros servicios y, una vez finalizado, durante el plazo legal
          aplicable para fines tributarios y de defensa de derechos.
        </p>
      </section>

      <section>
        <h2>7. Tus derechos</h2>
        <p>
          Tienes derecho a acceder, rectificar, cancelar o oponerte al tratamiento de tus datos, así como a la portabilidad
          y a retirar el consentimiento en cualquier momento. Puedes ejercer estos derechos escribiendo a
          <em>[PENDIENTE: email oficial de contacto]</em>.
        </p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          Este sitio usa cookies propias y de terceros con fines técnicos y de medición publicitaria (Meta Pixel). Puedes
          desactivar las cookies desde la configuración de tu navegador, pero algunas funcionalidades pueden verse afectadas.
        </p>
      </section>

      <section>
        <h2>9. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios legales o operativos. Publicaremos siempre la fecha de la
          última actualización al inicio de este documento.
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

em {
  background: #fff7d6;
  padding: 0.05rem 0.4rem;
  border-radius: 0.3rem;
  font-style: normal;
  color: #7a5b00;
}
</style>
