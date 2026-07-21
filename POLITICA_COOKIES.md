# POLÍTICA DE COOKIES Y ALMACENAMIENTO LOCAL

**Última revisión:** 21 de julio de 2026  
**Versión:** 1.0  
**Ámbito de aplicación:** Sitio web y plataforma de servicios de SPP Labs (`spplabs.es` y subdominios asociados)

---

## 1. ¿QUÉ SON LAS COOKIES Y EL ALMACENAMIENTO WEB?

Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador del usuario al visitar una página. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, proporcionar funcionalidades personalizadas y ofrecer datos analíticos a los propietarios del sitio.

Además de las cookies convencionales, existen otras tecnologías de almacenamiento en el navegador, como **Local Storage** y **Session Storage**, que permiten guardar información directamente en el dispositivo del usuario. A efectos de la normativa sobre protección de datos y servicios de la sociedad de la información (Art. 22.2 de la LSSI-CE y directrices de la AEPD), cualquier mecanismo que almacene o recupere información del equipo terminal del usuario se rige por los mismos principios de transparencia y consentimiento.

---

## 2. INVENTARIO COMPLETO DE COOKIES UTILIZADAS EN SPP LABS

Conforme a la auditoría técnica realizada sobre el código fuente de la aplicación, el sitio web de SPP Labs utiliza las siguientes cookies:

### 2.1. Cuadro Descriptivo de Cookies

| Nombre de la Cookie | Proveedor | Tipo / Clasificación | Finalidad Técnica | Duración | Atributos de Seguridad | ¿Requiere Consentimiento? | Ubicación Verificada en Código |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`spp_session`** | Propia (Primera Parte) | **Estrictamente Necesaria** (Técnica) | Almacena el token JWT de sesión para mantener autenticado al cliente en el panel de control. | 24 horas (`maxAge: 86400s`) | `HttpOnly: true`, `Secure: true` (en producción), `SameSite: Lax` | **NO** (Exenta por Art. 22.2 LSSI-CE) | `src/app/api/auth/login/route.js` (L.52) y `src/app/api/auth/signup/route.js` (L.81) |
| **`spp_visitor_id`** | Propia (Primera Parte) | **Analítica** | Guarda un UUID único persistente para distinguir visitantes únicos y calcular usuarios recurrentes en la analítica de ClickHouse. | 365 días (1 año) | `SameSite: Lax`, `Secure: true` | **SÍ** | `public/tracker.js` (L.37) |
| **`spp_session_id`** | Propia (Primera Parte) | **Analítica** | Registra el identificador de la sesión activa para agrupar las páginas vistas e interacciones dentro de una misma visita (se renueva tras 30 min de inactividad). | 30 minutos | `SameSite: Lax`, `Secure: true` | **SÍ** | `public/tracker.js` (L.47) |

---

## 3. INVENTARIO DE ALMACENAMIENTO EN NAVEGADOR (WEB STORAGE)

La aplicación utiliza mecanismos de almacenamiento web local en el navegador para mejorar la experiencia del usuario y mantener el estado de la navegación.

| Mecanismo de Almacenamiento | Clave / Nombre | Tipo / Clasificación | Finalidad | Duración | ¿Requiere Consentimiento? | Ubicación Verificada en Código |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Local Storage** | `spp_lang` | Funcional / Preferencia | Guarda la preferencia de idioma seleccionada por el usuario (`es` o `en`) para aplicar la traducción en la interfaz. | Persistente (hasta borrado manual) | **NO** (Exención funcional por preferencia del usuario) | `src/app/page.js`, `src/app/login/page.js`, `src/app/signup/page.js`, `src/app/dashboard/DashboardClient.js` |
| **Local Storage** | `spp_theme` | Funcional / Preferencia | Guarda la preferencia del tema visual seleccionado en el panel de control (`light` o `dark`). | Persistente (hasta borrado manual) | **NO** (Exención funcional) | `src/app/dashboard/DashboardClient.js` |
| **Session Storage** | `spp_chatbot_conversation_session` | Funcional | Mantiene el historial temporal de mensajes del chatbot durante la navegación activa en la pestaña para evitar que la conversación se borre al cambiar de página. | Sesión activa del navegador (se elimina al cerrar la pestaña) | **NO** (Estrechamente ligado a la interacción solicitada por el usuario) | `src/components/chatbot/useChat.ts` (L.19 y L.45) |

---

## 4. ADVERTENCIA LEGAL Y RECOMENDACIÓN DE CUMPLIMIENTO (SISTEMA DE CONSENTIMIENTO)

> [!WARNING]
> **Deficiencia identificada en la auditoría del código fuente:**  
> Actualmente, el script de analítica `public/tracker.js` se ejecuta automáticamente e instala las cookies analíticas `spp_visitor_id` y `spp_session_id` sin verificar previamente si el visitante ha otorgado su consentimiento.

### Fundamento Jurídico (LSSI-CE y AEPD)
Según el **Artículo 22.2 de la Ley 34/2002 (LSSI-CE)** y la **Guía sobre el uso de cookies de la AEPD**, las cookies analíticas que realizan un seguimiento del comportamiento del usuario no pueden ser instaladas de forma desatendida. La normativa exige que:
1. Las cookies no esenciales permanezcan bloqueadas por defecto antes de la primera interacción.
2. Se muestre un banner o aviso claro de cookies que informe sobre las finalidades y el titular.
3. El usuario pueda otorgar su consentimiento explícito ("Aceptar todas") o rechazar/configurar su uso de forma tan sencilla como aceptarlas.

**Recomendación prioritaria:** Se recomienda implementar un Banner de Consentimiento de Cookies (CMP) que mantenga en pausa el script `public/tracker.js` hasta que el usuario preste su consentimiento explícito.

---

## 5. CÓMO GESTIONAR O DESACTIVAR LAS COOKIES EN SU NAVEGADOR

El usuario puede en cualquier momento permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador o dispositivo móvil:

- **Google Chrome:** `Configuración > Privacidad y seguridad > Cookies y otros datos de sitios`
- **Mozilla Firefox:** `Ajustes > Privacidad & Seguridad > Cookies y datos del sitio`
- **Safari (macOS / iOS):** `Preferencias > Privacidad > Bloquear todas las cookies`
- **Microsoft Edge:** `Configuración > Privacidad, búsqueda y servicios > Cookies y permisos del sitio`

Tenga en cuenta que si inhabilita la cookie estrictamente necesaria `spp_session`, no podrá iniciar sesión ni acceder al panel de control de cliente de SPP Labs.

---

## 6. ACTUALIZACIONES DE LA POLÍTICA DE COOKIES

Esta Política de Cookies puede ser modificada en función de nuevas exigencias legislativas o para adaptarla a instrucciones dictadas por la Agencia Española de Protección de Datos (AEPD). Se aconseja a los usuarios visitar periódicamente esta página para conocer cualquier actualización.
