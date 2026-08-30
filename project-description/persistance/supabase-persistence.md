# Persistencia y Métricas de Rehabbit

## Decisión base

Rehabbit es **local primero**. El bloqueo, los modos y el contador activo deben funcionar sin internet. Supabase sirve para respaldo y análisis de producto; nunca para decidir si una app se bloquea o se desbloquea. Mientras la persona solo tenga identidad anónima, no puede recuperar datos después de borrar la app o cambiar de teléfono.

| El teléfono debe decidir | Supabase debe guardar |
| --- | --- |
| Modo activo, horario, apps bloqueadas y apps de reemplazo | Copia de respaldo del perfil, onboarding y modos |
| Contador de foco, desbloqueo ganado y overlay | Sesiones terminadas y eventos de producto |
| Cola de cambios pendientes cuando no hay red | Métricas agregadas de intención, activación y retorno |
| Identidad anónima guardada en el dispositivo | Email opcional y su consentimiento |

## Estado actual que hay que corregir

La app ya guarda eventos locales y la configuración Android localmente, pero todavía no sincroniza con Supabase.

El dashboard actual estima “horas ahorradas” multiplicando bloqueos por un tiempo configurado. Esa cifra no es fiable y no debe enviarse ni presentarse como resultado real.

El servicio Android ya sabe cuánto tiempo una app de reemplazo estuvo en primer plano y cuándo se abre una app bloqueada. Falta convertir esas señales en registros locales durables antes de mostrarlas o sincronizarlas.

## Cómo se calculan las estadísticas

No medir ni guardar el historial completo de uso del teléfono. Solo registrar acciones relacionadas con un modo Rehabbit.

| Métrica mostrada | Cálculo correcto | Cuándo se registra |
| --- | --- | --- |
| Tiempo enfocado | Suma de minutos en que una app de reemplazo estuvo en primer plano durante un modo activo | Al pausar, completar o cerrar una sesión de foco |
| Bloqueos | Número de intentos únicos de abrir una app bloqueada durante un modo activo | Cuando aparece el overlay; evitar duplicados del mismo intento |
| Desbloqueos ganados | Número de ciclos completados de foco que liberan tiempo para una app bloqueada | Al completar los minutos de foco del plan |
| Sesiones completadas | Sesiones que terminan por completar el objetivo definido | Al cerrar una sesión con resultado `completed` |
| Retorno | Día distinto en que la persona abre Rehabbit o usa un modo | Al abrir la app o empezar una sesión |

### Dashboard semanal

Las barras semanales representan **minutos enfocados por día**, no una estimación de “tiempo ahorrado”.

El total semanal es la suma de esos minutos. La tendencia compara el total de la semana actual contra la semana anterior. Si todavía no existe un registro válido, se muestra “Estamos recopilando datos”.

No llamar “tiempo recuperado” a una estimación basada en bloqueos. Si se usa ese nombre en producto, debe significar el tiempo enfocado real de la tabla anterior.

## Datos mínimos a guardar

| Grupo | Guardar | No guardar |
| --- | --- | --- |
| Perfil | Identidad anónima, zona horaria, plataforma, versión, primera y última apertura, estado de onboarding | Nombre real, contactos, contenido del teléfono |
| Onboarding | Todas las respuestas: uso declarado, reducción deseada, objetivo, texto “otro”, permisos, apps elegidas, duración y reemplazos | Historial completo de uso de otras apps |
| Modos | Categoría, horario, días, duración, apps bloqueadas y de reemplazo, estado y fecha de edición | Iconos de terceros ni capturas |
| Sesiones | Modo, inicio, fin, minutos enfocados, bloqueos, desbloqueos y resultado | Eventos de primer plano cada pocos segundos |
| Tips | Contenido, categoría, orden, tiempo de lectura, estado publicado y fecha de actualización | Datos privados de la persona dentro del tip |
| Producto | Apertura, onboarding, permisos, modo creado, sesión iniciada/completada e email aceptado/omitido | Texto privado no necesario |

Las apps elegidas pueden guardarse dentro del modo para restaurarlo en el mismo usuario. Los eventos de producto no necesitan incluir el nombre o paquete de cada app.

## Tips administrados desde base de datos

Los tips no deben seguir quemados en la app. Supabase será el catálogo de contenido para que el equipo pueda crear, editar, ordenar, publicar u ocultar un tip sin lanzar una nueva versión Android.

| El catálogo de tips guarda | Uso en la app |
| --- | --- |
| Identificador, título, descripción y categoría | Mostrar la lista y filtros |
| Texto de cada sección, pasos y lista de acciones | Mostrar el detalle del tip |
| Colores, icono, tipo de tarjeta y orden | Mantener el diseño actual definido por la app |
| Estado borrador, publicado o archivado | Solo descargar tips publicados |
| Fecha de publicación y actualización | Actualizar el caché cuando cambie el catálogo |

La app descarga los tips publicados al abrir la pantalla Tips, guarda el último catálogo válido en el teléfono y lo muestra sin red. Si Supabase falla, usa ese caché; si nunca hubo conexión, muestra un estado de contenido no disponible, no una lista inventada.

Los tips son lectura pública: no requieren Auth ni se mezclan con datos de usuarios. El equipo edita el catálogo desde una herramienta interna con permisos administrativos; la app solo puede leer los publicados.

## Flujo local y sincronización

1. Al abrir por primera vez, crear una identidad anónima de Supabase y conservar su sesión en el teléfono.
2. Cada cambio se guarda primero en el teléfono. La app nunca espera una respuesta de red para guardar un modo o bloquear una app.
3. El plan local se copia al almacenamiento nativo Android que usa el servicio de bloqueo. Ese almacenamiento nativo es el que mantiene el overlay funcionando en background y sin red.
4. Cada sesión terminada y cada evento de producto se añade a una cola local con un identificador único.
5. Sincronizar la cola al abrir la app, volver a foreground, guardar un modo y terminar una sesión. Enviar en lote y borrar de la cola solo después de una respuesta exitosa.
6. Si falla la red, conservar la cola y reintentar después. Un mismo identificador no puede crear dos eventos.
7. Si se usa el mismo usuario en dos teléfonos, el modo editado más recientemente gana. El historial de sesiones y eventos solo se agrega, nunca se reemplaza.

## Qué llamadas hacen falta

| Llamada | Tipo | Cuándo | Regla |
| --- | --- | --- | --- |
| Crear o restaurar identidad anónima | Auth | Primera apertura y arranque | Sin pantalla de login |
| Leer respaldo de perfil y modos | API de datos con RLS | Arranque con red | Nunca bloquea el inicio local |
| Guardar onboarding y modos | API de datos con RLS | Al completar un paso o editar | Primero local, luego sincronizar |
| Enviar sesiones y eventos | API de datos con RLS | En lote | Idempotente por `event_id` |
| Capturar email | Edge Function autenticada | Solo cuando la persona lo acepta | Validar, limitar frecuencia y guardar consentimiento |
| Descargar tips publicados | API de datos pública de solo lectura | Al abrir Tips y al actualizar | Usar caché local si falla |
| Consultar métricas internas | Consulta privada o Edge Function | Solo equipo Rehabbit | Datos agregados, no datos personales individuales |

No crear una Edge Function para cada toque ni para el bloqueo. Las tablas privadas con RLS son suficientes para datos del usuario. Reservar Edge Functions para validación de email, operaciones internas y agregados que no deben vivir en el cliente.

## Email sin login

La cuenta anónima identifica el dispositivo sin pedir datos personales. Pedir email no convierte al usuario en una cuenta con login y no debe prometer recuperación entre dispositivos todavía.

Mostrar el pedido una sola vez cuando se cumplan todas estas condiciones:

1. La persona abrió Rehabbit en dos días distintos.
2. Pasaron al menos 24 horas desde la primera apertura.
3. Creó un modo o inició una sesión.
4. No dejó email ni rechazó el pedido en los últimos 14 días.

Mensaje sugerido: “¿Quieres recibir tu progreso semanal? Déjanos tu email.” Debe ser opcional e incluir consentimiento explícito para recibir ese correo.

Guardar email normalizado, fecha de consentimiento, versión del texto de consentimiento y resultado `accepted`, `skipped` o `dismissed`. Si se omite, volver a preguntar solo tras 14 días. Para recuperar datos en otro teléfono se añadirá después un magic link; no es parte de esta primera etapa.

## Métricas Lean Startup

| Pregunta | Métrica |
| --- | --- |
| ¿La persona entiende el valor? | Onboarding completado y modo creado |
| ¿Activa Rehabbit? | Primera sesión iniciada o primer bloqueo real |
| ¿Obtiene valor? | Primera sesión completada o primer desbloqueo ganado |
| ¿Vuelve? | Apertura o sesión en un día distinto: semana 1, 2 y 4 |
| ¿Tiene intención de seguir? | Email aceptado después de haber usado la app |

La métrica principal inicial es: **porcentaje de personas que crean un modo y completan una primera sesión dentro de 24 horas de instalar Rehabbit**. El email es una señal secundaria de intención, no la métrica principal.

## Orden de implementación

1. Registrar localmente sesiones, minutos enfocados, bloqueos y desbloqueos; cambiar el dashboard para leer esas cifras reales.
2. Crear Auth anónimo, perfil privado y reglas RLS por usuario.
3. Sincronizar onboarding, modos y la cola de sesiones/eventos.
4. Mover los tips actuales a Supabase y reemplazar `data/tips.ts` por un catálogo remoto con caché local.
5. Añadir la petición de email bajo las condiciones definidas y la Edge Function protegida.
6. Crear una vista interna con métricas agregadas y gestión de tips para el equipo.
