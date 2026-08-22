# FocusGuard - Sistema visual de referencia

## Alcance

Este documento define las pantallas y componentes que permanecen como referencia para la aplicacion. El tema objetivo es unico: claro/blanco.

## Fuentes activas

- `ui-references/Screenshot 2026-08-17 at 16.19.59.png` - flujo de onboarding.
- `ui-references/Screenshot 2026-08-17 at 16.19.50.png` - estado vacio `Start Your Journey` del dashboard.
- `ui-references/modes.png` - radial, duracion, categorias y estado activo.
- `ui-references/card-time.png` - tarjeta de horario y dias de repeticion.
- `ui-references/card-time-selector.png` - selector horario de iOS.
- `ui-references/blocked_replaceapps.png` - resumen de aplicaciones bloqueadas mediante avatares circulares.
- `ui-references/dashboard_card_mode.png` - tarjeta de modo en el dashboard.
- `ui-references/modes-white.png` - referencia de color, gradiente, superficies claras y jerarquia del editor de modo.

## Tema claro unico

- Fondo principal: blanco azulado `#F8FDFE`.
- Tarjetas elevadas: blanco `#FDFFFF`.
- Borde tenue: azul muy claro `#CFEBF0`.
- Texto principal: azul marino `#003B5C`.
- Texto secundario: gris azulado `#36586F`.
- Halo o malla de fondo: `#67DDFC` y `#A2E4FA` con opacidad baja.
- No se implementa tema oscuro por ahora.
- Las referencias visuales oscuras se interpretan solo como estructura, jerarquia y composicion; sus superficies se implementan claras.

## Marca y gradiente

- Gradiente de marca diagonal: `#1AE1FE` -> `#2CCEFE` -> `#4BB7FE`.
- Usar el gradiente en CTA principales, progreso radial, chips seleccionados, dias activos y resplandores suaves de iconos.
- El trazo inactivo del radial usa `#CFEBF0`.
- No usar violeta ni azul marino como relleno de accion principal.
- Los elementos inactivos usan tarjetas `#FDFFFF`, borde `#CFEBF0` y texto `#003B5C`.

## Componentes reutilizables

### Estructura y navegacion

- Pantalla de altura completa, fondo `#F8FDFE` y contenido en una columna vertical con espaciado generoso.
- Aplicar halos cian/azul de baja opacidad solo como profundidad ambiental, nunca como superficie principal.
- Barra inferior `#FDFFFF` con borde superior `#CFEBF0`.
- La navegacion queda limitada a las rutas que existan en la aplicacion.

### Tarjeta clara

- Fondo `#FDFFFF` o vidrio blanco semitransparente, borde `#CFEBF0` y esquinas redondeadas grandes.
- Espaciado interno consistente.
- Se usa para modos, horario, grupos de apps, resumen semanal, metricas y estados vacios.

### CTA principal

- Boton de ancho completo y esquinas redondeadas.
- Relleno con `#1AE1FE` -> `#2CCEFE` -> `#4BB7FE`.
- Etiqueta e icono blancos.

### Controles secundarios

- Chips y botones `#FDFFFF` con borde `#CFEBF0`.
- El control seleccionado usa el gradiente de marca y texto blanco.
- Las acciones terciarias usan texto `#003B5C`, sin superficie de boton.

### Avatar circular de app

- Icono de aplicacion recortado en un circulo.
- Los avatares se superponen en una fila horizontal.
- Si hay mas aplicaciones que avatares visibles, el ultimo circulo muestra `+N`.
- Al tocar el grupo se abre la lista de apps para seleccionar o quitar aplicaciones.

## Pantallas

### 1. Onboarding: bienvenida

Referencia: `Screenshot 2026-08-17 at 16.19.59.png`.

- Icono geometrico de escudo azul centrado, con resplandor `#67DDFC` suave.
- Titulo grande centrado y texto descriptivo debajo.
- Indicador de progreso del flujo de onboarding.
- Boton de gradiente `Continue` de ancho completo en el pie.

### Patron de pantallas de pregunta

Referencia: `Screenshot 2026-08-17 at 16.19.59.png`.

- Desde la pantalla 2 hasta la pantalla 9, cada paso usa una sola pregunta por pantalla.
- Cada pantalla contiene titulo de pregunta, texto auxiliar cuando sea necesario, un unico bloque de seleccion y CTA `Continue` de ancho completo en el pie.
- El indicador de progreso refleja el paso actual del onboarding.
- Los controles seleccionados usan el gradiente de marca y texto blanco.

### 2. Onboarding: uso actual del telefono

Referencia: `Screenshot 2026-08-17 at 16.19.59.png`.

- Pregunta: cuanto tiempo pasas en tu telefono.
- Cuatro chips de seleccion: `1`, `2`, `4` y `8`.
- El usuario elige un unico valor antes de continuar.

### 3. Onboarding: tiempo que quiere dejar de usar el telefono

- Pregunta: cuanto tiempo quieres dejar de usar el telefono.
- El bloque de seleccion usa chips de duracion.
- Las opciones de duracion quedan por definir; no se infieren valores adicionales en esta especificacion.

### 4. Onboarding: que quiere lograr

- Pregunta: que quieres lograr.
- Chips en una sola columna vertical, uno debajo de otro.
- Opciones: `Dejar redes`, `Concentrar mas`, `Dormir`, `Hacer otra actividad` y `Otro`.
- Al seleccionar `Otro`, aparece un campo de texto para que la persona escriba su objetivo.

### 5. Onboarding: permisos

Referencia: `Screenshot 2026-08-17 at 16.19.59.png`.

- Icono de candado/escudo centrado.
- Titulo y explicacion centrados.
- Dos tarjetas apiladas para permisos de uso de pantalla y notificaciones.
- Cada tarjeta tiene icono inicial, titulo, descripcion y chevron/control final.
- Nota secundaria indicando que los permisos se pueden cambiar despues.

### 6. Onboarding: seleccion de objetivos

Referencia: `Screenshot 2026-08-17 at 16.19.59.png`.

- Titulo de pregunta e instruccion breve, centrados.
- Seis chips redondeados seleccionables en una cuadricula de dos columnas y tres filas.
- El chip seleccionado usa el gradiente de marca y texto blanco.

### 7. Onboarding: apps que quiere dejar de usar

- Pregunta: que apps quisieras dejar de usar mas.
- Lista seleccionable de aplicaciones instaladas con icono y nombre.
- Cada aplicacion seleccionada muestra su estado activo usando el gradiente de marca.
- La seleccion se convierte en el grupo `Apps bloqueadas` del plan.

### 8. Onboarding: tiempo sin usar las apps

- Pregunta: cuanto tiempo quieres dejar de usar las apps seleccionadas.
- El bloque de seleccion usa chips de duracion.
- Las opciones de duracion quedan por definir; no se infieren valores adicionales en esta especificacion.

### 9. Onboarding: app de reemplazo

- Pregunta: con que app te gustaria reemplazar.
- Lista seleccionable de aplicaciones instaladas con icono y nombre.
- La seleccion se convierte en el grupo `Apps Rehabbit` del plan.

### 10. Onboarding: creando el plan

- Pantalla intermedia sin acciones de usuario.
- Muestra un loader centrado durante un segundo mientras se crea el plan.
- Mantiene fondo `#F8FDFE` y usa el gradiente de marca para el indicador de carga.

### 11. Onboarding: revision del plan creado

- Muestra el plan creado a partir de las opciones seleccionadas, pero permanece inactivo.
- La pantalla presenta el modo, la duracion, las apps bloqueadas, las apps Rehabbit y cualquier horario seleccionado.
- Incluye una accion para confirmar el plan y otra para volver a cambiar sus opciones.
- El plan no empieza ni libera redes hasta que la persona lo confirme o lo active despues.

### 12. Crear y editar un modo

Referencia: `modes.png`.

- Esta pantalla reemplaza la tarjeta actual de plan como lugar principal para crear y editar estados.
- El titulo identifica el modo que se esta creando o editando.
- Un radial central muestra la duracion elegida. El tiempo dentro del radial indica cuanto debe durar el estado antes de liberar las redes.
- El anillo radial usa `#1AE1FE` -> `#2CCEFE` -> `#4BB7FE`; el trazo restante usa `#CFEBF0`.
- Debajo del radial aparece un grupo `Duration` con accesos rapidos de duracion y un boton de ajuste para un valor personalizado.
- Debajo aparece `Category`, en una cuadricula de dos columnas con botones de icono y etiqueta.
- Las categorias disponibles son: Focus, Exercise, Sleep, Meditation y Hobby.
- La categoria seleccionada usa el gradiente de marca y texto blanco.
- El modo activo conserva el radial, el tiempo restante, una accion `Pause` delineada y una accion secundaria para terminarlo.

### 13. Horario del modo

Referencia: `card-time.png`.

- Tarjeta clara titulada `Hora` dentro del editor de modo.
- Dos filas: `Inicio` y `Fin`.
- Cada fila muestra el valor horario dentro de una pildora redondeada alineada a la derecha.
- Un divisor tenue separa Inicio y Fin.
- Debajo se muestra una fila de siete botones circulares para los dias L, M, M, J, V, S y D.
- Debajo de los dias se muestra el resumen de repeticion, por ejemplo `Todos los dias`.
- El valor seleccionado, los dias activos y el foco de interaccion usan el gradiente de marca.

### 14. Selector de hora

Referencia: `card-time-selector.png`.

- Al tocar la pildora de Inicio o Fin se abre un selector horario encima de la tarjeta.
- El selector usa tres columnas de rueda: hora, minutos y a.m./p.m.
- La fila seleccionada queda centrada sobre una banda redondeada semitransparente.
- La hora seleccionada de la tarjeta usa `#003B5C`; el estado activo del selector usa el gradiente de marca.
- En iOS se debe usar el selector nativo tipo rueda, no una simulacion manual.

#### Implementacion del selector

- La dependencia no esta instalada actualmente en `apps/expo/package.json`.
- Para Expo SDK 54, instalar `@react-native-community/datetimepicker` con `npx expo install @react-native-community/datetimepicker`.
- En iOS usar modo de hora y `display="spinner"` para obtener la rueda nativa de columnas como la referencia.
- En Android usar el selector nativo de hora de la plataforma; no se debe forzar una copia visual del spinner de iOS.
- No instalar `@expo/ui` para esta tarea mientras el proyecto permanezca en Expo SDK 54; la documentacion actual de ese paquete requiere una version mas reciente de Expo.

Referencia tecnica: [Expo DateTimePicker para SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/date-time-picker/).

### 15. Apps bloqueadas y apps Rehabbit

Referencia: `blocked_replaceapps.png`.

- El editor de modo contiene dos secciones separadas: `Apps bloqueadas` y `Apps Rehabbit`.
- Cada seccion se representa con una tarjeta clara y el resumen de sus apps mediante avatares circulares superpuestos.
- El ultimo avatar muestra `+N` cuando existen aplicaciones adicionales.
- Al tocar una tarjeta se abre una lista para seleccionar apps nuevas o eliminar las ya incluidas.
- Ambas secciones mantienen la misma estructura; solo cambia la etiqueta y el conjunto de aplicaciones.

### 16. Dashboard: sin modos

Referencia: `Screenshot 2026-08-17 at 16.19.50.png`.

- El estado vacio `Start Your Journey` solo se muestra cuando no existe ningun modo creado.
- La tarjeta contiene icono de destellos, titulo, texto explicativo y CTA para crear el primer modo.
- Al crear el primer modo, esta tarjeta desaparece y es reemplazada por la lista de tarjetas de modo.

### 17. Dashboard: tarjetas de modo

Referencia: `dashboard_card_mode.png`.

- Cada modo creado aparece como una tarjeta nueva e independiente en el dashboard.
- La tarjeta muestra el nombre del modo como titulo.
- Debajo del titulo aparecen los avatares circulares de sus aplicaciones.
- La tarjeta muestra el horario del modo y los dias de repeticion.
- Incluir las etiquetas `Bloqueadas` y `Rehabbit` para identificar los dos grupos de apps.
- La tarjeta debe poder abrir la edicion del modo al tocarla.
- El dashboard puede conservar sus metricas y resumen semanal actuales, pero las tarjetas por app individuales se sustituyen visualmente por estas tarjetas por modo.

## Reglas para revision con un LLM grafico

- Priorizar onboarding, editor de modo, horario, selector horario y tarjetas de modo.
- Mantener el tema blanco en todas las pantallas.
- Aplicar `#1AE1FE` -> `#2CCEFE` -> `#4BB7FE` en los elementos activos, no como fondo permanente de toda la aplicacion.
- Los avatares de Apps bloqueadas y Apps Rehabbit se muestran como grupos circulares superpuestos y abren una lista de seleccion al tocarlos.
