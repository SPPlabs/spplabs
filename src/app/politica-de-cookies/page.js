import Link from "next/link";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function PoliticaDeCookiesPage() {
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
              Política de Cookies y Almacenamiento Local
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
              <span><strong>Última revisión:</strong> 23 de julio de 2026</span>
              <span>•</span>
              <span><strong>Versión:</strong> 1.1</span>
              <span>•</span>
              <span><strong>Ámbito:</strong> spplabs.es</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              1. ¿Qué son las cookies y el almacenamiento web?
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador del usuario al visitar una página. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, proporcionar funcionalidades personalizadas y ofrecer datos analíticos a los propietarios del sitio.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Además de las cookies convencionales, existen otras tecnologías de almacenamiento en el navegador, como <strong>Local Storage</strong> y <strong>Session Storage</strong>, que permiten guardar información directamente en el dispositivo del usuario. A efectos de la normativa sobre protección de datos y servicios de la sociedad de la información (Art. 22.2 de la LSSI-CE y directrices de la AEPD), cualquier mecanismo que almacene o recupere información del equipo terminal del usuario se rige por los mismos principios de transparencia y consentimiento.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              2. Inventario completo de cookies utilizadas en SPP Labs
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Conforme a la auditoría técnica realizada sobre el código fuente de la aplicación, el sitio web de SPP Labs utiliza las siguientes cookies:
            </p>

            <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
              <table className="w-full text-xs text-left text-zinc-700 border-collapse">
                <thead className="bg-zinc-50 font-bold text-black border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Proveedor</th>
                    <th className="p-3">Clasificación</th>
                    <th className="p-3">Finalidad Técnica</th>
                    <th className="p-3">Duración</th>
                    <th className="p-3">Consentimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3 font-mono font-bold text-black">spp_session</td>
                    <td className="p-3">Propia</td>
                    <td className="p-3"><span className="bg-zinc-100 text-zinc-800 font-bold px-2 py-0.5 rounded">Técnica</span></td>
                    <td className="p-3">Almacena el token JWT de sesión para mantener autenticado al cliente en el panel de control.</td>
                    <td className="p-3">24 horas</td>
                    <td className="p-3 font-bold text-emerald-600">NO (Exenta)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-black">spp_visitor_id</td>
                    <td className="p-3">Propia</td>
                    <td className="p-3"><span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">Analítica</span></td>
                    <td className="p-3">Guarda un UUID único persistente para distinguir visitantes únicos y calcular usuarios recurrentes.</td>
                    <td className="p-3">365 días</td>
                    <td className="p-3 font-bold text-amber-600">SÍ</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-black">spp_session_id</td>
                    <td className="p-3">Propia</td>
                    <td className="p-3"><span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">Analítica</span></td>
                    <td className="p-3">Registra el identificador de la sesión activa para agrupar las páginas vistas e interacciones dentro de una misma visita.</td>
                    <td className="p-3">30 minutos</td>
                    <td className="p-3 font-bold text-amber-600">SÍ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              3. Inventario de almacenamiento en navegador (Web Storage)
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              La aplicación utiliza mecanismos de almacenamiento web local en el navegador para mejorar la experiencia del usuario y mantener el estado de la navegación.
            </p>

            <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
              <table className="w-full text-xs text-left text-zinc-700 border-collapse">
                <thead className="bg-zinc-50 font-bold text-black border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Mecanismo</th>
                    <th className="p-3">Clave</th>
                    <th className="p-3">Clasificación</th>
                    <th className="p-3">Finalidad</th>
                    <th className="p-3">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3 font-semibold">Local Storage</td>
                    <td className="p-3 font-mono font-bold text-black">spp_lang</td>
                    <td className="p-3">Funcional</td>
                    <td className="p-3">Guarda la preferencia de idioma seleccionada por el usuario (es o en).</td>
                    <td className="p-3">Persistente</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Local Storage</td>
                    <td className="p-3 font-mono font-bold text-black">spp_theme</td>
                    <td className="p-3">Funcional</td>
                    <td className="p-3">Guarda la preferencia del tema visual seleccionado en el panel de control.</td>
                    <td className="p-3">Persistente</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Session Storage</td>
                    <td className="p-3 font-mono font-bold text-black">spp_chatbot_conversation_session</td>
                    <td className="p-3">Funcional</td>
                    <td className="p-3">Mantiene el historial temporal de mensajes del chatbot durante la navegación activa.</td>
                    <td className="p-3">Sesión de pestaña</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              4. Sistema de consentimiento y gestión
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Según el Artículo 22.2 de la LSSI-CE y las directrices de la AEPD, las cookies analíticas que realizan un seguimiento del comportamiento del usuario requieren información transparente y mecanismos de control por parte del visitante.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              5. Cómo gestionar o desactivar las cookies en su navegador
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El usuario puede en cualquier momento permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador o dispositivo móvil:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios</li>
              <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad &amp; Seguridad &gt; Cookies y datos del sitio</li>
              <li><strong>Safari (macOS / iOS):</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies</li>
              <li><strong>Microsoft Edge:</strong> Configuración &gt; Privacidad, búsqueda y servicios &gt; Cookies y permisos del sitio</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              6. Actualizaciones y contacto
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Esta Política de Cookies puede ser modificada en función de nuevas exigencias legislativas o para adaptarla a instrucciones dictadas por la Agencia Española de Protección de Datos (AEPD).
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Para cualquier consulta referente a esta política, puede ponerse en contacto con nosotros a través del correo electrónico:{" "}
              <a href="mailto:info@spplabs.es" className="text-brand-blue font-bold hover:underline">
                info@spplabs.es
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-4 text-center text-xs text-zinc-500 flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>© 2026 SPP Labs Inc. Todos los derechos reservados.</span>
        <span className="hidden sm:inline">|</span>
        <a href="mailto:info@spplabs.es" className="hover:text-black underline">info@spplabs.es</a>
      </footer>
    </div>
  );
}
