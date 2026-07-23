import Link from "next/link";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.webp" alt="SPP Labs Logo" className="w-6 h-6 object-contain" />
            <SppLabsLogo inline style={{ height: "24px" }} />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-1.5 rounded-full"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
          
          {/* Document Header */}
          <div className="border-b border-zinc-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3 py-1 rounded-full inline-block mb-3">
              Documentación Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
              Política de Privacidad
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
              <span><strong>Última revisión:</strong> 23 de julio de 2026</span>
              <span>•</span>
              <span><strong>Versión:</strong> 1.2</span>
              <span>•</span>
              <span><strong>Ámbito:</strong> spplabs.es</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              1. Información sobre este documento y alcance legal
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              La presente Política de Privacidad describe de manera transparente el tratamiento de datos personales llevado a cabo por la plataforma <strong>SPP Labs</strong>, en cumplimiento del <strong>Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD)</strong> y de la <strong>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</strong>.
            </p>
          </section>

          {/* Section 2 (Categorías de Datos, Finalidades y Base Jurídica) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              2. Categorías de datos, finalidades y base jurídica del tratamiento
            </h2>

            <div className="space-y-3 text-sm text-zinc-700">
              <h3 className="font-bold text-black">2.1. Formulario de Contacto General</h3>
              <p><strong>Datos recabados:</strong> Nombre completo, correo electrónico, teléfono (opcional) y mensaje.</p>
              <p><strong>Finalidad:</strong> Atender las consultas o peticiones formuladas por los usuarios.</p>
              <p><strong>Base jurídica:</strong> Consentimiento del interesado (Art. 6.1.a RGPD).</p>

              <h3 className="font-bold text-black pt-2">2.2. Formulario de Solicitud de Reservas y Citas</h3>
              <p><strong>Datos recabados:</strong> Nombre completo, correo electrónico, teléfono, fecha deseada, hora solicitada y mensaje aclaratorio.</p>
              <p><strong>Finalidad:</strong> Tramitar, agendar y confirmar citas o reuniones comerciales con SPP Labs.</p>
              <p><strong>Base jurídica:</strong> Aplicación de medidas precontractuales (Art. 6.1.b RGPD).</p>

              <h3 className="font-bold text-black pt-2">2.3. Área de Clientes y Gestión de Cuentas</h3>
              <p><strong>Datos recabados:</strong> Nombre de dominio registrado, contraseña de acceso (almacenada mediante hash criptográfico) y tokens de autenticación.</p>
              <p><strong>Finalidad:</strong> Gestionar el alta, la autenticación y el acceso seguro de los clientes al panel de control.</p>
              <p><strong>Base jurídica:</strong> Ejecución del contrato de prestación de servicios (Art. 6.1.b RGPD).</p>

              <h3 className="font-bold text-black pt-2">2.4. Asistente Virtual / Chatbot Inteligente</h3>
              <p><strong>Datos procesados:</strong> Mensajes de texto enviados voluntariamente por el usuario durante la interacción con el asistente.</p>
              <p><strong>Finalidad:</strong> Responder en tiempo real a las dudas de navegación o soporte mediante un sistema RAG (Retrieval-Augmented Generation).</p>
              <p><strong>Declaración explícita sobre el tratamiento en el Asistente Virtual:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Conversaciones:</strong> No se conservan de forma permanente en servidores tras la interacción de sesión.</li>
                <li><strong>Consultas / Prompts:</strong> Se procesan en memoria exclusivamente para generar la respuesta en tiempo real y no se utilizan para entrenar modelos comerciales externos.</li>
              </ul>

              <h3 className="font-bold text-black pt-2">2.5. Analítica de Navegación e Interacción</h3>
              <p><strong>Datos recabados:</strong> Identificador seudónimo de visitante, identificador de sesión, páginas visitadas, sistema operativo, dispositivo, navegador e interacción de eventos.</p>
              <p><strong>Tratamiento de la Dirección IP:</strong> Las direcciones IP no se almacenan en texto plano en los registros analíticos, sino que se transforman mediante un proceso criptográfico irreversible antes de su almacenamiento.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              3. Conservación de los datos
            </h2>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li><strong>Registros Analíticos:</strong> 2 años exactos mediante mecanismo automatizado de supresión.</li>
              <li><strong>Formularios de Contacto y Reservas:</strong> Se conservan hasta que el usuario solicite la supresión de sus datos.</li>
              <li><strong>Datos de Cuenta de Cliente:</strong> Se conservan mientras se mantenga la relación contractual.</li>
              <li><strong>Credenciales de Sesión:</strong> Caducidad automática de 24 horas.</li>
              <li><strong>Datos de Sesión del Chatbot:</strong> Se eliminan al cerrar la pestaña o navegador.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              4. Destinatarios y transferencias internacionales de datos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs no vende, alquila ni cede datos personales a terceros con fines comerciales. Las solicitudes del asistente virtual se procesan en infraestructura propia o dedicada gestionada por SPP Labs.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              5. Medidas de seguridad implementadas
            </h2>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>Protección de credenciales y claves mediante algoritmos criptográficos hash.</li>
              <li>Aislamiento lógico de datos en bases de datos PostgreSQL.</li>
              <li>Protección contra abusos mediante limitación de tasa (<em>rate limiting</em>).</li>
              <li>Transformación criptográfica de direcciones IP para registros de analítica.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              6. Derechos de los interesados y cómo ejercerlos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              De acuerdo con el RGPD y la LOPDGDD, usted puede ejercitar sus derechos de Acceso, Rectificación, Supresión ("Derecho al Olvido"), Oposición, Limitación del Tratamiento, Portabilidad y Retirada del Consentimiento.
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-700 space-y-2">
              <p className="font-bold text-black">Canal para el Ejercicio de Derechos:</p>
              <p>
                Para ejercitar cualquiera de estos derechos, envíe una solicitud escrita acreditando su identidad a:
              </p>
              <p>
                • <strong>Correo electrónico:</strong>{" "}
                <a href="mailto:info@spplabs.es" className="text-brand-blue font-bold hover:underline">
                  info@spplabs.es
                </a>
              </p>
              <p className="text-xs text-zinc-500 pt-1">
                Si considera que sus derechos no han sido atendidos adecuadamente, puede presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">www.aepd.es</a>.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              7. Menores de edad y cambios en la política
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los servicios de SPP Labs están dirigidos a mayores de 18 años. No recabamos a sabiendas datos de menores de 14 años sin el consentimiento de sus padres o tutores legales.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs se reserva el derecho de modificar esta Política de Privacidad para adaptarla a novedades legislativas o técnicas. Cualquier cambio será publicado en esta misma página.
            </p>
          </section>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        © 2026 SPP Labs Inc. Todos los derechos reservados. | <a href="mailto:info@spplabs.es" className="hover:text-black underline">info@spplabs.es</a>
      </footer>
    </div>
  );
}
