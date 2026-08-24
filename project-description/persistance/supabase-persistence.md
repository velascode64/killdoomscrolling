# Persistencia de Rehabbit

## Objetivo

La app funciona localmente y sincroniza con Supabase cuando hay internet. El usuario entra de forma anónima en la primera apertura; puede vincular una cuenta después.

Guardar datos permite recuperar sus modos, mostrar el dashboard y medir si Rehabbit crea un hábito.

## Qué guardamos y dónde

| Dónde se guarda | Qué guardamos | Cuándo |
| --- | --- | --- |
| Perfil del usuario | Cuenta anónima, zona horaria, plataforma, versión, última actividad y estado de onboarding | Primera apertura y cada sincronización |
| Perfil del usuario | Respuestas de onboarding: tiempo actual en teléfono, tiempo que quiere reducir, objetivo, texto libre de “otro”, permisos, apps a reducir, duración del bloqueo, apps de reemplazo y plan final | Al responder cada paso |
| Modos | Nombre, categoría, horario, días, apps bloqueadas, apps de reemplazo, duración y estado | Crear, editar, activar, desactivar o eliminar un modo |
| Sesiones de enfoque | Modo usado, inicio, fin, duración planeada, resultado, tiempo de reemplazo e intentos bloqueados | Iniciar y finalizar una sesión |
| Eventos de producto | Acción, fecha, pantalla o modo relacionado y contexto mínimo | Acciones importantes de la app |

No guardar capturas, contenido de otras apps ni un historial detallado de actividad dentro de ellas.

## Eventos mínimos para Lean Startup

| Evento | Qué permite medir |
| --- | --- |
| Inicio, avance y abandono de onboarding | Intención y punto de abandono |
| Permiso aceptado o rechazado | Capacidad de activar el bloqueo |
| Plan creado, editado o descartado | Conversión de intención a plan |
| Modo activado | Activación del producto |
| Sesión iniciada, completada, cancelada o interrumpida | Valor real para el usuario |
| Intento de abrir una app bloqueada | Dificultad del cambio de hábito |
| App de reemplazo abierta | Uso de la conducta alternativa |
| Dashboard abierto | Retorno a la app |

Métrica principal inicial: **persona que completa una primera sesión de enfoque durante las primeras 24 horas tras instalar Rehabbit**.

Retención: personas que vuelven a abrir la app o completar una sesión en semana 1, 2 y 4.

## Funciones necesarias

| Función | Cuándo se usa | Responsabilidad |
| --- | --- | --- |
| Preparar cuenta | Abrir app o recuperar conexión | Crear o actualizar perfil y recuperar modos |
| Guardar onboarding | Cada respuesta y al finalizar | Guardar progreso, respuestas y plan creado |
| Sincronizar modos | Crear o editar un modo | Guardar cambios locales y recuperar su versión final |
| Iniciar sesión | Activar un modo | Crear una única sesión activa |
| Registrar actividad | Volver a la app, terminar sesión o recuperar red | Enviar eventos por lotes y actualizar progreso |
| Finalizar sesión | Completar, cancelar o interrumpir | Guardar resultado final |
| Resumen dashboard | Abrir o actualizar dashboard | Devolver estadísticas semanales |
| Métricas internas | Consulta del equipo | Ver intención, activación y retención agregadas |

## Reglas de implementación

1. Crear una cuenta anónima en la primera apertura.
2. Guardar todo primero en el teléfono y sincronizar después.
3. Sincronizar al abrir, volver a foreground, guardar un modo y terminar una sesión.
4. Cada usuario solo puede acceder a sus propios datos.
5. Usar identificadores únicos para que los reintentos no dupliquen eventos.
6. Si no hay internet, los modos y el bloqueo Android deben seguir funcionando.
7. Para el MVP, si hay conflicto entre dispositivos conserva la edición más reciente.

## Orden de trabajo

1. Configurar Supabase, Auth anónimo y acceso privado por usuario.
2. Persistir perfil, onboarding y modos.
3. Persistir sesiones y eventos.
4. Conectar el dashboard.
5. Crear la vista interna de métricas Lean Startup.
