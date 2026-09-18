# Digital Break — definición técnica de arquitectura

## 1. Objetivo

Digital Break es una aplicación móvil construida con Expo/React Native. Su responsabilidad principal es ayudar al usuario a reducir el uso de aplicaciones distractoras mediante modos de enfoque, sesiones de concentración y un bloqueo nativo en Android.

La arquitectura combina:

- **React Native/Expo:** interfaz, navegación y lógica de producto.
- **Módulo nativo Android en Kotlin:** detección de la aplicación activa y pantalla de bloqueo.
- **AsyncStorage:** persistencia local para que el producto siga funcionando sin conexión.
- **Supabase:** identidad anónima, respaldo sincronizado, contenido y métricas de producto.

La aplicación es **local-first**: el bloqueo y el estado operativo no dependen de una llamada a Supabase en tiempo real.

## 2. Arquitectura general

```text
Usuario
  ↓
Expo / React Native
  ├─ UI y navegación
  ├─ configuración de modos
  ├─ AsyncStorage (estado local y colas)
  └─ supabase-js
       ↓ HTTPS
     Supabase Auth + Postgres

Android nativo
  ├─ ExpoAppBlockerModule
  ├─ AppBlockerService (Foreground Service)
  ├─ UsageStatsManager
  └─ OverlayManager + WindowManager
```

## 3. Flujo funcional en Android

React Native carga los modos Android y envía al módulo nativo los paquetes que deben bloquearse. El módulo guarda esta configuración localmente y arranca `AppBlockerService`.

`AppBlockerService` permanece activo como `Foreground Service` y consulta `UsageStatsManager` cada 500 ms. El servicio obtiene el último evento `MOVE_TO_FOREGROUND`, identifica el paquete que está en primer plano y lo compara con la configuración local.

Cuando el paquete está bloqueado, `OverlayManager` crea una vista nativa mediante `WindowManager`. Esta vista aparece sobre la aplicación objetivo y muestra la pantalla de bloqueo. No se mata ni se modifica la aplicación objetivo: el bloqueo se consigue interceptando visualmente su uso mientras está en primer plano.

```text
setRewardBlockerPlansConfig()
  ↓
Configuración local
  ↓
AppBlockerService
  ↓ cada 500 ms
UsageStatsManager → paquete en primer plano
  ↓
¿El paquete está bloqueado?
  ├─ No → se elimina el overlay
  └─ Sí → OverlayManager muestra el bloqueo
```

El servicio conserva el último paquete válido cuando Android no entrega un evento nuevo. Esto evita perder el estado mientras el usuario permanece dentro de la misma aplicación.

### Permisos Android

- `PACKAGE_USAGE_STATS`: consultar eventos de uso y detectar la aplicación activa.
- `SYSTEM_ALERT_WINDOW`: mostrar el overlay sobre otras aplicaciones.
- `FOREGROUND_SERVICE`: mantener activo el monitor.
- `POST_NOTIFICATIONS`: informar al usuario cuando se intercepta una aplicación.
- `RECEIVE_BOOT_COMPLETED`: restaurar el servicio después de reiniciar el dispositivo.

El servicio se declara como `foregroundServiceType="specialUse"`. `BootReceiver` permite iniciar nuevamente el monitor al recibir `BOOT_COMPLETED`.

## 4. Modos, sesiones y bloqueo ganado

Un modo contiene una configuración de enfoque y una lista de aplicaciones productivas o bloqueadas. En Android, `RewardBlockerController` administra el ciclo de productividad:

1. El usuario inicia un modo.
2. Durante el horario configurado, las aplicaciones distractoras se bloquean.
3. El tiempo productivo se mide desde el servicio nativo.
4. Al completar el objetivo, el usuario puede recibir una ventana temporal de acceso.
5. Cuando la ventana expira, el servicio vuelve a aplicar el overlay.

El estado del ciclo se mantiene en el dispositivo porque el servicio debe poder continuar aunque React Native esté en segundo plano o el dispositivo esté temporalmente sin conexión.

## 5. Integración con Supabase

La integración se realiza con `@supabase/supabase-js` desde `apps/expo/data/supabase.ts`. El cliente usa variables públicas de Expo:


La sesión se persiste en `AsyncStorage` y se refresca automáticamente. En el primer arranque, `bootstrapSupabase()`:

1. Recupera la sesión existente.
2. Si no existe, crea una identidad anónima con `signInAnonymously()`.
3. Crea o actualiza el perfil del usuario.
4. Registra el evento `app_opened`.
5. Sincroniza modos Android, eventos y respuestas pendientes de onboarding.

Supabase funciona como respaldo y sincronización. No es parte del camino crítico del bloqueo.


## 8. Ejemplo completo de sincronización

```text
Usuario abre la app
  ↓
bootstrapSupabase()
  ↓
sesión anónima o existente
  ↓
profiles upsert
  ↓
eventos pendientes → product_events
modos locales      → modes
onboarding local   → onboarding_responses
  ↓
Android continúa bloqueando desde su estado local
```

## 9. Límites conocidos

- Android no bloquea la aplicación a nivel de sistema; la cubre con un overlay nativo.
- El usuario debe conceder permisos de uso y overlay.
- Fabricantes con ahorro de batería agresivo pueden detener o retrasar el `Foreground Service`.
- La sincronización con Supabase es eventual; una falla de red no debe desactivar el bloqueo local.
- El intervalo de detección actual es de 500 ms, por lo que existe una pequeña ventana entre la apertura de una aplicación y la aparición del overlay.
