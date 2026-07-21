# Informe de Auditoría Técnica y Legal de Protección de Datos
**Empresa / Plataforma:** SPP Labs (`spplabs.es` / `api.spplabs.es`)  
**Fecha de la Auditoría:** 21 de julio de 2026  
**Versión de la Auditoría:** 1.0  
**Ámbito de Inspección:** Código fuente completo de la aplicación (Next.js, Prisma, PostgreSQL, ClickHouse, Qdrant, SDK de Analítica, API Gateway, Chatbot IA).

---

## AVISO LEGAL Y ALCANCE
El presente informe documenta fielmente el comportamiento técnico y el flujo de datos verificado tras la inspección directa del código fuente del proyecto. Este documento no constituye una certificación ni garantía legal del 100% de cumplimiento, sino una auditoría técnica y legal destinada a fundamentar la redacción de la Política de Privacidad y la Política de Cookies, así como a orientar la subsanación de riesgos antes de su publicación en producción. Se recomienda una revisión legal final por un delegado de protección de datos o jurista especializado antes del lanzamiento comercial.

---

# SECCIÓN A — IMPLEMENTACIÓN VERIFICADA (ESTADO ACTUAL)

### 1. Formularios y Recogida de Datos de Usuarios

#### A. Formulario de Contacto Público (`POST /contacts`)
- **Fichero de implementación:** `src/app/contacts/route.js`
- **Campos recabados:**
  - Nombre completo (`name` - obligatorio)
  - Correo electrónico (`email` - obligatorio)
  - Teléfono (`phone` - opcional)
  - Mensaje (`message` - obligatorio)
  - Dominio de origen (`domain` / `x-website-domain` - obligatorio)
- **Almacenamiento y aislamiento:** Se almacena en la tabla `contact_forms` de PostgreSQL. Las consultas utilizan Row Level Security (RLS) mediante la directiva `SET LOCAL app.current_website_id`.
- **Comprobación en código:** No envía correos electrónicos automatizados ni notificaciones por SMTP a terceros en la versión actual.

#### B. Formulario de Reservas / Citas (`POST /bookings` y `GET /bookings`)
- **Fichero de implementación:** `src/app/bookings/route.js`
- **Campos recabados:**
  - Nombre completo (`name` - obligatorio)
  - Correo electrónico (`email` - obligatorio)
  - Fecha deseada (`date` - obligatorio, formato `YYYY-MM-DD`)
  - Hora deseada (`time` - obligatorio, formato `hh:mm`)
  - Teléfono (`phone` - opcional)
  - Mensaje adicional (`message` - opcional)
- **Almacenamiento:** Guardado en la tabla `bookings` de PostgreSQL con estado inicial `PENDING`.
- **Endpoint público `GET /bookings`:** Permite consultar los huecos ocupados (`occupied`) filtrando por fecha y hora para evitar solapamientos.

#### C. Solicitudes de Soporte Técnico (`POST /api/admin/petitions`)
- **Fichero de implementación:** `src/app/api/admin/petitions/route.js`
- **Campos recabados:** Título (`title`) y Mensaje de soporte (`message`).
- **Almacenamiento:** Guardado en la tabla `support_requests` de PostgreSQL asociado al cliente autenticado.

#### D. Sistema de Inicio de Sesión / Autenticación (`POST /api/auth/login`)
- **Fichero de implementación:** `src/app/api/auth/login/route.js`
- **Campos recabados:** Dominio (`domain`) y Contraseña (`password`).
- **Verificación:** Compara la contraseña en texto plano contra el hash almacenado utilizando **Argon2id**.
- **Resultado:** Genera un token JWT firmado y establece la cookie HttpOnly `spp_session`.

#### E. Sistema de Registro de Clientes (`POST /api/auth/signup`)
- **Fichero de implementación:** `src/app/api/auth/signup/route.js`
- **Campos recabados:** Dominio (`domain`), Token de invitación (`token`), Contraseña (`password`).
- **Mecanismo:** Verifica la existencia previa del dominio y token en la tabla `signup_tokens`. Tras el registro, elimina el token de la base de datos para impedir reutilizaciones y guarda la contraseña hasheada con Argon2id.

#### F. Restablecimiento de Contraseña
- **Estado:** **No determinado / No implementado en el código fuente.** No existen rutas API de recuperación o reseteo de contraseña.

---

### 2. Sistema de Inteligencia Artificial y Chatbot

#### A. Arquitectura y Flujo de Procesamiento
- **Ficheros de implementación:** `src/app/api/chat/route.ts`, `src/core/services/ai/llm.ts`, `src/core/services/ai/rag.ts`, `src/core/services/ai/embeddings.ts`, `src/core/services/ai/qdrant.ts`.
- **Motor de Lenguaje (LLM):** Utiliza un servidor local/dedicado vLLM (`AI_VLLM_URL`, valor por defecto `http://localhost:8000/v1`) con el modelo `qwen3-4b`. No realiza peticiones a la API oficial de OpenAI, Anthropic u otros proveedores en la nube comercial.
- **Motor de Embeddings:** Utiliza la librería `@huggingface/transformers` con el modelo `BAAI/bge-m3` (mapeado localmente a `Xenova/bge-m3` en formato ONNX). El cálculo de vectores se realiza de forma local en el servidor (CPU/Memoria).

#### B. Tratamiento de Conversaciones y Prompts
- **¿Se almacenan las conversaciones en base de datos?** **NO.** La ruta `POST /api/chat` procesa el mensaje de entrada en memoria y lo retransmite en streaming (`text/event-stream`). Ninguna tabla de PostgreSQL, ClickHouse o colección de Qdrant guarda el historial de mensajes o las preguntas del usuario.
- **¿Se almacenan los prompts?** **NO.** Los prompts se construyen al vuelo en memoria (`ragPromptTemplate.formatMessages`) y se descartan tras enviar la respuesta.
- **¿Qué datos guardan las métricas de IA?** La tabla `ai_usage_monthly` de PostgreSQL almacena **únicamente el recuento mensual agregado de tokens** (`prompt_tokens`, `completion_tokens`, `total_tokens`) desglosado por cliente (`website_id`), año y mes. No almacena texto ni datos personales.

#### C. Base de Conocimiento Vectorial (Qdrant)
- **Fichero de almacenamiento:** Colección `chatbot_knowledge` en Qdrant (`src/core/services/ai/qdrant.ts`).
- **Contenido del payload vectorial:** Almacena estrictamente `{ website_id: string, content: string }` y el vector de 1024 dimensiones. Contiene la información corporativa estática subida por el administrador para entrenar el chatbot. No contiene datos personales de los visitantes ni consultas de chat.

---

### 3. Sistema de Analítica de Visitas (ClickHouse y Tracker SDK)

#### A. Captura de Datos en Navegador (`public/tracker.js`)
- **Fichero:** `public/tracker.js` (script de rastreo cliente).
- **Métricas capturadas automáticamente:**
  - URL de la página (`page_url`), Título de la página (`page_title`).
  - Referente u origen de la visita (`referrer`).
  - Parámetros UTM de marketing (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
  - Identificador único de visitante (`visitor_id`, guardado en cookie por 1 año).
  - Identificador de sesión (`session_id`, guardado en cookie por 30 minutos).
  - Dimensiones de la pantalla (`screen_width`, `screen_height`).
  - Profundidad de desplazamiento (`scroll_percent`).
  - Tiempo de permanencia en página (`duration_ms`).
  - Idioma del navegador (`language`).
  - Eventos de interacción: Clics en botones, clics en enlaces telefónicos (`tel:`), correo (`mailto:`), WhatsApp (`wa.me`), descargas de archivos, enlaces salientes, envíos de formularios y reproducción de vídeo.

#### B. Procesamiento en Servidor y Anonimización IP (`src/app/api/analytics/route.js`)
- **Fichero:** `src/app/api/analytics/route.js`
- **Tratamiento de la Dirección IP:** La dirección IP real del visitante se captura de las cabeceras (`cf-connecting-ip` / `x-forwarded-for` / `x-real-ip`). **Se aplica inmediatamente un hashing unidireccional SHA-256 (`crypto.createHash("sha256").update(cleanIp).digest("hex")`)**. La dirección IP en texto plano NUNCA se almacena en la base de datos de analítica ClickHouse.
- **Geolocalización:** Extrae país, región y ciudad de cabeceras Vercel (`x-vercel-ip-country`, etc.). **En caso de ausencia de estas cabeceras, realiza una petición de respaldo a `http://ip-api.com/json/${cleanIp}` enviando la IP pública del visitante.**
- **Inserción en ClickHouse:** Almacena el evento en la tabla `analytics.analytics_events`.

---

### 4. Inventario de Bases de Datos y Retención

| Base de Datos | Tabla / Colección | Campos Almacenados | Finalidad del Tratamiento | Contiene Datos Personales | Periodo de Retención Verificado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | `websites` | `id`, `domain`, `display_name`, `password_hash`, `role`, `registered_at`, `created_at`, `updated_at` | Registro de clientes y autenticación | **SÍ** (Hash de contraseña Argon2id, nombre de dominio) | Indefinido (Hasta eliminación manual de cuenta) |
| **PostgreSQL** | `signup_tokens` | `id`, `token`, `domain`, `created_at` | Control de invitaciones para registro | **NO** (Salvo dominio) | Eliminación automática inmediata tras el registro |
| **PostgreSQL** | `website_api_keys` | `id`, `website_id`, `name`, `key_hash`, `last_used_at`, `expires_at`, `created_at` | Autenticación de peticiones API | **NO** | Indefinido (Hasta revocación) |
| **PostgreSQL** | `contact_forms` | `id`, `website_id`, `name`, `phone`, `email`, `message`, `created_at` | Gestión de contactos y leads | **SÍ** (Nombre, email, teléfono, mensaje) | Indefinido (No hay borrado automático en código) |
| **PostgreSQL** | `bookings` | `id`, `website_id`, `date`, `time`, `name`, `phone`, `email`, `message`, `status`, `created_at` | Gestión de reservas y citas | **SÍ** (Nombre, email, teléfono, detalles de cita) | Indefinido (No hay borrado automático en código) |
| **PostgreSQL** | `notifications` | `id`, `website_id`, `title`, `message`, `created_at` | Avisos en el panel de control | **NO** (Salvo si el mensaje incluye datos) | Indefinido |
| **PostgreSQL** | `support_requests` | `id`, `website_id`, `title`, `message`, `created_at` | Tickets de soporte técnico | **NO** (Salvo texto en mensaje) | Indefinido |
| **PostgreSQL** | `ai_usage_monthly` | `id`, `website_id`, `year`, `month`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `updated_at` | Control de consumo de Tokens IA | **NO** (Métricas numéricas agregadas) | Indefinido |
| **PostgreSQL** | `chatbot_knowledge` | `id`, `website_id`, `content`, `last_synced_at`, `updated_at` | Texto estático de entrenamiento IA | **NO** (Texto corporativo) | Indefinido |
| **PostgreSQL** | `google_calendar_connections` | `id`, `website_id`, `google_account_email`, `google_calendar_id`, `access_token`, `refresh_token`, `token_expires_at`, `created_at`, `updated_at` | Integración OAuth de Google Calendar | **SÍ** (Email de cuenta Google, tokens OAuth) | Indefinido |
| **PostgreSQL** | `website_dashboard_state` | `id`, `viewer_website_id`, `target_website_id`, `last_contact_view`, `last_booking_view`, etc. | Control de lecturas de avisos | **NO** | Indefinido |
| **ClickHouse** | `analytics_events` | `website_id`, `event_time`, `visitor_id`, `session_id`, `event_type`, `page_url`, `page_title`, `referrer`, `utm_*`, `country`, `region`, `city`, `device_type`, `browser`, `os`, `screen_width`, `screen_height`, `duration_ms`, `scroll_percent`, `button_name`, `form_name`, `conversion`, `ip_hash` | Analítica de visitas e interacciones | **SÍ** (Seudónimos: `visitor_id` y `ip_hash` SHA-256) | **2 AÑOS EXACTOS (Verificado TTL: `TTL event_time + INTERVAL 2 YEAR DELETE`)** |
| **Qdrant** | `chatbot_knowledge` | `website_id`, `content`, `vector` (1024 floats) | Búsqueda semántica para RAG | **NO** (Contenido estático de la web) | Indefinido (Se sobrescribe en cada sincronización) |

---

### 5. Inventario de Cookies y Almacenamiento en Navegador

#### A. Cookies Verificadas en Código
1. **`spp_session`**:
   - **Proveedor:** Propio (`spplabs.es` / `api.spplabs.es`).
   - **Clasificación:** **Estrictamente Necesaria**.
   - **Finalidad:** Mantiene la sesión autenticada del cliente en el panel de control mediante un token JWT.
   - **Duración:** 24 horas (`maxAge: 60 * 60 * 24`).
   - **Atributos de seguridad:** `HttpOnly: true`, `Secure: true` (en producción), `SameSite: Lax`, `Path: /`.
   - **Necesita consentimiento:** **NO** (Exenta por el Art. 22.2 LSSI-CE y Directiva ePrivacy).
   - **Ubicación en código:** `src/app/api/auth/login/route.js` (L.52) y `src/app/api/auth/signup/route.js` (L.81).

2. **`spp_visitor_id`**:
   - **Proveedor:** Propio (creada por el script `tracker.js` en el dominio del cliente).
   - **Clasificación:** **Analítica**.
   - **Finalidad:** Identifica de forma persistente a un visitante único para computar usuarios recurrentes en las analíticas.
   - **Duración:** 365 días (1 año).
   - **Atributos:** `SameSite: Lax`, `Secure: true`, `Path: /`.
   - **Necesita consentimiento:** **SÍ** (Requiere consentimiento previo según RGPD, LSSI-CE y Guía de la AEPD).
   - **Ubicación en código:** `public/tracker.js` (L.37).

3. **`spp_session_id`**:
   - **Proveedor:** Propio (creada por `tracker.js`).
   - **Clasificación:** **Analítica**.
   - **Finalidad:** Agrupa las páginas vistas e interacciones dentro de una misma sesión de navegación (se renueva tras 30 minutos de inactividad).
   - **Duración:** 30 minutos.
   - **Atributos:** `SameSite: Lax`, `Secure: true`, `Path: /`.
   - **Necesita consentimiento:** **SÍ** (Parte del sistema de analítica).
   - **Ubicación en código:** `public/tracker.js` (L.47).

#### B. Almacenamiento Local de Navegador (Web Storage)
1. **`localStorage.getItem("spp_lang")`**:
   - **Tipo:** Funcional / Preferencia.
   - **Finalidad:** Recuerda el idioma seleccionado por el usuario (`es` / `en`).
   - **Duración:** Persistente (hasta que el usuario limpie los datos del navegador).
   - **Necesita consentimiento:** **NO**.

2. **`localStorage.getItem("spp_theme")`**:
   - **Tipo:** Funcional / Preferencia.
   - **Finalidad:** Recuerda el tema visual elegido en el panel de control (`light` / `dark`).
   - **Duración:** Persistente.
   - **Necesita consentimiento:** **NO**.

3. **`sessionStorage.getItem("spp_chatbot_conversation_session")`**:
   - **Tipo:** Funcional.
   - **Finalidad:** Almacena temporalmente los mensajes de la ventana de chat mientras el usuario navega entre páginas en la misma pestaña para no perder el contexto de la conversación.
   - **Duración:** Sesión del navegador (se elimina automáticamente al cerrar la pestaña).
   - **Ubicación en código:** `src/components/chatbot/useChat.ts` (L.19 y L.45).
   - **Necesita consentimiento:** **NO**.

---

### 6. Servicios de Terceros e Infraestructura Externa

1. **`ip-api.com` (Geolocalización de IPs)**:
   - **Llamada en código:** `fetch("http://ip-api.com/json/${queryIp}")` en `src/app/api/analytics/route.js` (L.118).
   - **Datos transmitidos:** Dirección IP en texto plano del visitante.
   - **Finalidad:** Obtener país, región y ciudad si no vienen en las cabeceras del proxy.
   - **Evaluación RGPD:** Constituye una cesión de datos personales (IP) a un tercero externo. Requiere contrato de encargado del tratamiento (DPA) o eliminación/sustitución por bases de datos de IP locales (como MaxMind GeoIP2).

2. **Hugging Face Hub (`huggingface.co`)**:
   - **Llamada en código:** `@huggingface/transformers` en `src/core/services/ai/embeddings.ts`.
   - **Datos transmitidos:** Ningún dato de usuario. La aplicación descarga los ficheros de pesos del modelo `Xenova/bge-m3` durante el arranque y los almacena en el directorio `.cache/transformers`.

3. **Google Fonts (vía `next/font/google`)**:
   - **Llamada en código:** `src/app/layout.js`.
   - **Evaluación RGPD:** Next.js aloja automáticamente las fuentes en el propio servidor durante el proceso de compilación (`build`). **No realiza peticiones en tiempo de ejecución a los servidores de Google**, cumpliendo rigurosamente con la doctrina del TJUE sobre Google Fonts.

4. **Proveedores no detectados:** No se han detectado integraciones activas con Stripe, Cloudflare Turnstile, OpenAI Cloud, Anthropic, Mailchimp o servicios de envío de correos por SMTP/Resend en el código fuente de las rutas activas.

---

### 7. Medidas de Seguridad Implementadas Verificables
- **Hash de Contraseñas:** Hashing robusto con **Argon2id** (`@node-rs/argon2`, coste de memoria: 64MB, tiempo: 3 pasadas, paralelismo: 4).
- **Protección de API Keys:** Las claves de API públicas se almacenan exclusivamente en formato hash (Argon2id) en la base de datos `website_api_keys`.
- **Aislamiento Multinquilino:** Uso de **Row Level Security (RLS)** en PostgreSQL mediante `withRLS(websiteId)` que impone la variable de sesión SQL `app.current_website_id`.
- **Limitación de Tasa (Rate Limiting):** Implementado en `src/proxy.js` mediante ventana deslizante en memoria (`isRateLimited`):
  - `/api/chat`: Máximo 15 peticiones por minuto por IP.
  - `/api/admin/*`: Máximo 200 peticiones por minuto por IP.
  - `/contacts`, `/bookings`, `/api/analytics`: Máximo 60 peticiones por minuto por IP.
- **Formato JWT:** Tokens firmados mediante la librería `jose` (algoritmo HS256) con expiración de 24 horas, empaquetados en cookies HttpOnly y Lax.
- **Anonimización IP:** Hashing unidireccional SHA-256 aplicado antes del almacenamiento en ClickHouse.

---

# SECCIÓN B — DEFICIENCIAS Y RECOMENDACIONES DE CUMPLIMIENTO

A continuación se detallan las deficiencias detectadas y las recomendaciones técnicas y legales necesarias antes de la publicación oficial de los documentos en producción.

---

### 1. Ausencia de Banner / Gestor de Consentimiento de Cookies (CMP)
- **Prioridad:** **CRÍTICA**
- **Explicación:** El script `public/tracker.js` instala de forma automática y desatendida la cookie persistente de analítica `spp_visitor_id` (duración 1 año) y `spp_session_id` tan pronto como el usuario entra en la web, sin solicitar permiso previo.
- **Razón y Normativa:** El Artículo 22.2 de la LSSI-CE y las directrices de la AEPD exigen que las cookies no esenciales (como las de analítica de comportamiento que identifican a usuarios) permanezcan bloqueadas hasta que el usuario preste su consentimiento explícito (acción afirmativa/opt-in).
- **Acción requerida:** Implementar un banner de cookies que bloquee la ejecución de `tracker.js` o la escritura de `spp_visitor_id` hasta que el usuario haga clic en "Aceptar".

---

### 2. Transmisión de IP sin Cifrar a Servicio Tercero (`ip-api.com`)
- **Prioridad:** **ALTA**
- **Explicación:** En `src/app/api/analytics/route.js` (L.118), se realiza un `fetch` HTTP (sin cifrar SSL/TLS) a `http://ip-api.com/json/${queryIp}` para geolocalizar la IP del visitante cuando no hay cabeceras de proxy.
- **Razón y Normativa:** La dirección IP es un dato personal bajo el RGPD. Enviar IPs en texto plano por HTTP sin cifrar a un servicio externo no garantizado viola el principio de integridad y confidencialidad (Art. 5.1.f RGPD) y constituye una cesión de datos no regulada sin Contrato de Encargado del Tratamiento (Art. 28 RGPD).
- **Acción requerida:** Modificar el mecanismo de geolocalización para utilizar una base de datos local (ej. MaxMind GeoLite2 descargada en el servidor) o requerir que la geolocalización sea proporcionada por el servidor web / CDN (Vercel/Cloudflare).

---

### 3. Indefinición del Periodo de Retención en PostgreSQL
- **Prioridad:** **ALTA**
- **Explicación:** Las tablas `contact_forms`, `bookings`, `support_requests` y `websites` de PostgreSQL conservan los datos de forma indefinida. No existen scripts de borrado automático ni tareas programadas (*cron*) para purgar registros antiguos.
- **Razón y Normativa:** El principio de limitación del plazo de conservación (Art. 5.1.e RGPD) exige no mantener datos personales más tiempo del necesario para los fines del tratamiento.
- **Acción requerida:** Establecer una política interna de purga (por ejemplo, suprimir solicitudes de contacto y reservas tras 1 o 2 años de inactividad) o habilitar una funcionalidad de eliminación en el panel de control.

---

### 4. Ausencia de Mecanismo de Recuperación de Contraseña
- **Prioridad:** **MEDIA**
- **Explicación:** No existe un flujo técnico de restablecimiento de contraseña (*forgot password*).
- **Razón y Normativa:** Dificulta el ejercicio del derecho de acceso y gestión por parte de los clientes autenticados.
- **Acción requerida:** Implementar un flujo seguro de restablecimiento de contraseña mediante token enviado por correo electrónico o explicitar en la Política de Privacidad que la recuperación requiere contacto directo con soporte.

---

### 5. Falta de Cabeceras de Seguridad HTTP (CSP, HSTS, X-Frame-Options)
- **Prioridad:** **MEDIA**
- **Explicación:** En `next.config.mjs` y `src/proxy.js` no están configuradas expresamente cabeceras de seguridad web como *Content-Security-Policy*, *Strict-Transport-Security* (HSTS) o *X-Frame-Options*.
- **Razón y Normativa:** El Art. 32 del RGPD exige aplicar medidas técnicas apropiadas para garantizar un nivel de seguridad adecuado al riesgo.
- **Acción requerida:** Añadir cabeceras de seguridad estándar en `next.config.mjs` o `src/proxy.js`.

---

# CHECKLIST FINAL PREVIO A LA PUBLICACIÓN

Antes de publicar la Política de Privacidad y la Política de Cookies en producción, complete la siguiente lista de verificación:

### 1. Datos Legales del Titular que debe proporcionar la empresa:
- [ ] Razón social completa o nombre del titular de SPP Labs.
- [ ] Número de Identificación Fiscal (NIF / CIF).
- [ ] Domicilio social o postal completo.
- [ ] Correo electrónico de contacto para protección de datos (ej. `privacidad@spplabs.es`).
- [ ] Datos de inscripción en el Registro Mercantil (si aplica).
- [ ] Identificación y contacto del Delegado de Protección de Datos (DPD / DPO), en caso de haber sido designado.

### 2. Modificaciones Técnicas Requeridas:
- [ ] Integrar un Banner de Consentimiento de Cookies que bloquee `spp_visitor_id` y `spp_session_id` hasta obtener la aceptación del usuario.
- [ ] Eliminar o sustituir la llamada externa a `http://ip-api.com` por geolocalización local o por cabeceras de CDN cifradas.
- [ ] Configurar cabeceras de seguridad HTTP (*Content-Security-Policy*, *X-Content-Type-Options*, *X-Frame-Options*).

### 3. Garantías de Contratación con Terceros:
- [ ] Suscribir un Contrato de Encargado del Tratamiento (DPA) con el proveedor de alojamiento de servidores (ej. Vercel, Hetzner, AWS) acorde al Art. 28 del RGPD.

### 4. Riesgos Identificados a Monitorizar:
- [ ] Mantener actualizado el modelo local de embeddings y vLLM sin desviar consultas a APIs externas no declaradas.
