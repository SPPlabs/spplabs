import Link from "next/link";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function TerminosYCondicionesPage() {
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
              Términos y Condiciones de Uso y Contratación de SPP Labs
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
              <span><strong>Última actualización:</strong> 23 de julio de 2026</span>
              <span>•</span>
              <span><strong>Versión:</strong> 1.0</span>
              <span>•</span>
              <span><strong>Ámbito:</strong> spplabs.es</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              1. Objeto
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los presentes Términos y Condiciones regulan el acceso, navegación y utilización del sitio web de SPP Labs, así como la contratación y prestación de los servicios tecnológicos ofrecidos por la empresa.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs desarrolla soluciones tecnológicas que pueden incluir, entre otras:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>Desarrollo de sitios web.</li>
              <li>Desarrollo de aplicaciones web.</li>
              <li>Plataformas Software como Servicio (SaaS).</li>
              <li>Automatización de procesos.</li>
              <li>Sistemas basados en Inteligencia Artificial.</li>
              <li>Chatbots.</li>
              <li>Integraciones con servicios de terceros.</li>
              <li>Servicios de alojamiento y mantenimiento.</li>
              <li>Consultoría tecnológica.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El acceso al sitio web o la contratación de cualquiera de los servicios implica la aceptación íntegra de las presentes condiciones.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              2. Aceptación de las condiciones
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Al acceder al sitio web o contratar cualquier servicio ofrecido por SPP Labs, el usuario declara haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Si el usuario no está de acuerdo con cualquiera de las disposiciones aquí establecidas, deberá abstenerse de utilizar el sitio web o contratar los servicios.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              3. Requisitos para utilizar los servicios
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los servicios únicamente podrán ser contratados por personas físicas o jurídicas con capacidad legal suficiente para celebrar contratos conforme a la legislación aplicable.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El usuario se compromete a proporcionar información veraz, exacta y actualizada durante cualquier proceso de contratación o registro.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              4. Uso permitido del sitio web
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El usuario se compromete a utilizar el sitio web y los servicios de forma diligente, responsable y conforme a la legislación vigente.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Queda expresamente prohibido:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>utilizar el sitio con fines ilícitos;</li>
              <li>intentar acceder a sistemas internos sin autorización;</li>
              <li>interferir en el funcionamiento de la infraestructura;</li>
              <li>distribuir malware o software malicioso;</li>
              <li>realizar ataques informáticos;</li>
              <li>utilizar herramientas automatizadas para perjudicar el servicio;</li>
              <li>copiar, reproducir o distribuir contenidos sin autorización expresa;</li>
              <li>realizar ingeniería inversa sobre cualquier software cuando no esté legalmente permitido.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs podrá suspender o bloquear el acceso cuando detecte actividades que puedan comprometer la seguridad o el correcto funcionamiento de los servicios.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              5. Servicios ofrecidos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los servicios prestados por SPP Labs podrán incluir soluciones personalizadas o servicios estandarizados mediante suscripción.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Las características, funcionalidades, precios, plazos y condiciones específicas de cada servicio podrán detallarse en presupuestos, contratos particulares o documentación adicional que prevalecerá sobre estas condiciones en caso de contradicción.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              6. Registro de usuarios
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Algunos servicios podrán requerir la creación de una cuenta.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El usuario será responsable de:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>mantener la confidencialidad de sus credenciales;</li>
              <li>todas las actividades realizadas desde su cuenta;</li>
              <li>comunicar inmediatamente cualquier acceso no autorizado.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs podrá suspender temporal o definitivamente cuentas que incumplan estas condiciones.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              7. Contratación, precios y pagos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los precios serán los publicados o los expresamente aceptados mediante presupuesto.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Salvo indicación en contrario:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>todos los importes se expresarán en euros;</li>
              <li>los impuestos aplicables podrán añadirse cuando corresponda;</li>
              <li>los servicios de suscripción se facturarán de forma periódica según el plan contratado.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El impago podrá dar lugar a:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>suspensión temporal del servicio;</li>
              <li>limitación de funcionalidades;</li>
              <li>cancelación definitiva del servicio.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              8. Renovaciones y cancelaciones
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Las suscripciones se mantendrán activas mientras continúen siendo abonadas.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El cliente podrá solicitar la cancelación de la renovación conforme al procedimiento indicado por SPP Labs.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              La cancelación impedirá futuras renovaciones, pero no generará el reembolso de periodos ya abonados, salvo obligación legal o acuerdo expreso.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              9. Disponibilidad del servicio
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs realizará esfuerzos razonables para mantener la disponibilidad de sus servicios.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              No obstante, no garantiza una disponibilidad continua e ininterrumpida.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Podrán producirse interrupciones derivadas de:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>tareas de mantenimiento;</li>
              <li>actualizaciones;</li>
              <li>incidencias técnicas;</li>
              <li>fallos de hardware;</li>
              <li>cortes eléctricos;</li>
              <li>problemas de conectividad;</li>
              <li>fallos de proveedores externos;</li>
              <li>ataques informáticos;</li>
              <li>causas de fuerza mayor.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Salvo que exista un acuerdo específico de nivel de servicio (SLA), SPP Labs no garantiza un porcentaje mínimo de disponibilidad.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              10. Mantenimiento
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs podrá realizar tareas de mantenimiento preventivo o correctivo cuando resulte necesario.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Siempre que sea razonablemente posible, los mantenimientos programados que puedan afectar significativamente a la disponibilidad del servicio serán comunicados con antelación.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              11. Propiedad intelectual
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Todos los contenidos del sitio web, incluyendo, entre otros:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>código fuente;</li>
              <li>software;</li>
              <li>bases de datos;</li>
              <li>textos;</li>
              <li>diseños;</li>
              <li>logotipos;</li>
              <li>imágenes;</li>
              <li>documentación;</li>
              <li>interfaces;</li>
              <li>elementos gráficos;</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              son propiedad de SPP Labs o de sus respectivos titulares y se encuentran protegidos por la legislación sobre propiedad intelectual e industrial.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              La contratación de un servicio no implica la cesión de dichos derechos salvo acuerdo expreso por escrito.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              12. Propiedad del contenido del cliente
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El cliente conservará en todo momento la titularidad sobre los contenidos, documentos, imágenes, bases de datos y demás información que facilite para la prestación de los servicios.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs únicamente utilizará dichos contenidos en la medida necesaria para prestar el servicio contratado.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              13. Servicios basados en Inteligencia Artificial
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Algunos servicios podrán incorporar modelos de Inteligencia Artificial.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El usuario reconoce que:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>las respuestas generadas pueden contener errores o imprecisiones;</li>
              <li>los resultados son probabilísticos y no constituyen asesoramiento profesional;</li>
              <li>corresponde al usuario verificar la información obtenida antes de adoptar decisiones basadas en ella.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs no garantiza la exactitud absoluta de los resultados generados mediante sistemas de IA.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              14. Servicios de terceros
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los servicios podrán integrarse con plataformas, APIs o proveedores externos.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs no será responsable de:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>modificaciones realizadas por dichos proveedores;</li>
              <li>interrupciones ajenas a su control;</li>
              <li>cambios en las condiciones de uso de terceros;</li>
              <li>indisponibilidad de servicios externos.</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              15. Obligaciones del cliente
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El cliente se compromete a:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>facilitar información veraz;</li>
              <li>colaborar cuando sea necesario para la prestación del servicio;</li>
              <li>efectuar los pagos correspondientes;</li>
              <li>utilizar los servicios conforme a la legislación vigente;</li>
              <li>mantener protegidas sus credenciales.</li>
            </ul>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              16. Limitación de responsabilidad
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs responderá únicamente en los supuestos previstos por la legislación aplicable.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              En la máxima medida permitida por la ley, no será responsable de:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>pérdidas indirectas;</li>
              <li>lucro cesante;</li>
              <li>pérdida de oportunidades comerciales;</li>
              <li>pérdida de beneficios;</li>
              <li>daños derivados del uso incorrecto del servicio;</li>
              <li>incidencias provocadas por terceros;</li>
              <li>fallos de Internet;</li>
              <li>ataques informáticos;</li>
              <li>fuerza mayor.</li>
            </ul>
            <p className="text-sm text-zinc-700 leading-relaxed">
              En ningún caso estas limitaciones afectarán a los derechos irrenunciables reconocidos por la legislación vigente.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              17. Suspensión o terminación del servicio
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs podrá suspender temporalmente o cancelar definitivamente el acceso a los servicios cuando el usuario:
            </p>
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>incumpla estos términos;</li>
              <li>incumpla obligaciones de pago;</li>
              <li>realice actividades ilícitas;</li>
              <li>comprometa la seguridad de la infraestructura;</li>
              <li>utilice el servicio de forma fraudulenta.</li>
            </ul>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              18. Cese de la actividad
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs se reserva el derecho a cesar total o parcialmente la prestación de sus servicios o finalizar su actividad empresarial.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Siempre que resulte razonablemente posible, SPP Labs notificará el cese de la actividad con una antelación suficiente para que los clientes puedan adoptar las medidas oportunas, salvo que dicho cese venga motivado por causas legales, fuerza mayor o circunstancias técnicas que impidan realizar dicho preaviso.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Finalizado el cese de actividad o la relación contractual, SPP Labs podrá eliminar de forma permanente las cuentas, archivos, bases de datos y demás información asociada a los servicios, salvo que exista una obligación legal de conservación.
            </p>
          </section>

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              19. Protección de datos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El tratamiento de los datos personales se realizará conforme a la{" "}
              <Link href="/politica-de-privacidad" className="text-brand-blue font-bold hover:underline">
                Política de Privacidad
              </Link>{" "}
              publicada por SPP Labs.
            </p>
          </section>

          {/* Section 20 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              20. Cookies
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El uso de cookies se regula mediante la correspondiente{" "}
              <Link href="/politica-de-cookies" className="text-brand-blue font-bold hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </section>

          {/* Section 21 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              21. Enlaces a sitios externos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              El sitio web podrá contener enlaces hacia páginas de terceros.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs no controla ni asume responsabilidad alguna respecto a los contenidos, servicios o políticas de privacidad de dichos sitios.
            </p>
          </section>

          {/* Section 22 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              22. Modificaciones de los términos
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs podrá modificar los presentes Términos y Condiciones cuando resulte necesario para adaptarlos a cambios legales, técnicos o comerciales.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Las modificaciones serán publicadas en el sitio web y entrarán en vigor desde su publicación, salvo que se indique otra fecha.
            </p>
          </section>

          {/* Section 23 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              23. Fuerza mayor
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              SPP Labs no será responsable del incumplimiento de sus obligaciones cuando éste derive de circunstancias imprevisibles o inevitables, incluyendo, entre otras, desastres naturales, conflictos armados, pandemias, fallos generalizados de telecomunicaciones, cortes de suministro eléctrico, ataques informáticos de gran escala o decisiones de autoridades competentes.
            </p>
          </section>

          {/* Section 24 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              24. Nulidad parcial
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Si alguna de las disposiciones de estos Términos fuera declarada nula o inaplicable por una autoridad competente, dicha circunstancia no afectará a la validez del resto de las disposiciones, que permanecerán plenamente vigentes.
            </p>
          </section>

          {/* Section 25 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              25. Legislación aplicable y jurisdicción
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Los presentes Términos y Condiciones se regirán e interpretarán de conformidad con la legislación española.
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              En caso de controversia, las partes se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable, especialmente cuando el usuario tenga la condición de consumidor.
            </p>
          </section>

          {/* Section 26 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-black border-b border-zinc-100 pb-2">
              26. Contacto
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Para cualquier consulta relacionada con los presentes Términos y Condiciones o con los servicios ofrecidos por SPP Labs, los usuarios podrán ponerse en contacto a través del siguiente correo electrónico:
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              <a href="mailto:info@spplabs.es" className="text-brand-blue font-bold hover:underline">
                info@spplabs.es
              </a>
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
