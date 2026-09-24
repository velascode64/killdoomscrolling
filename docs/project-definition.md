# Rehabbit — Product Definition

## Problema

Muchas personas sienten que pasan más tiempo del que quisieran en redes sociales y otras aplicaciones, pero el problema no siempre ocurre porque conscientemente decidan hacerlo.

Una parte importante del uso sucede de forma automática: abrir Instagram, TikTok, X o YouTube por costumbre, quedarse más tiempo del esperado y repetirlo varias veces durante el día.

El problema que Rehabbit quiere atacar no es simplemente **“usar demasiado el teléfono”**, sino quedarse atrapado en aplicaciones que compiten constantemente por la atención y desplazan actividades que la persona sí quería hacer.

Leer, entrenar, dormir, estudiar o simplemente hacer otra cosa termina perdiendo contra la opción que requiere menos esfuerzo inmediato: abrir una app y seguir consumiendo contenido.

---

## Contexto de investigación

La investigación inicial de Rehabbit se ha concentrado en entender por qué las personas que quieren reducir su uso del teléfono siguen teniendo dificultades para hacerlo.

En entrevistas y exploración de conversaciones alrededor de screen time, doomscrolling y app blockers aparecen varios patrones:

- Muchas personas ya saben que están usando demasiado ciertas aplicaciones.
- Algunas ya han probado límites de tiempo, bloqueadores o herramientas de Digital Wellbeing.
- El problema no siempre es falta de awareness; muchas veces saben que quieren parar y aun así vuelven.
- Las soluciones demasiado restrictivas pueden ser fáciles de ignorar, desactivar o abandonar.
- Una motivación recurrente no es solamente “usar menos el teléfono”, sino **recuperar tiempo para algo que la persona siente que está dejando atrás**.

Esto lleva a Rehabbit a explorar un enfoque diferente:

**no solamente bloquear una conducta, sino ayudar a reemplazarla.**

---

## Nichos iniciales

Rehabbit está explorando grupos donde el contraste entre **“lo que termino haciendo”** y **“lo que realmente quería hacer”** es especialmente claro.

### Lectores

Personas que quieren leer más, compran libros o tienen Kindle, pero terminan usando parte de ese tiempo en redes sociales.

La idea es transformar:

**“abrí Instagram otra vez”**

en:

**“abre Kindle y lee primero”.**

### Fitness y bienestar

Personas que quieren entrenar, caminar, meditar o realizar alguna actividad física, pero terminan posponiéndola mientras consumen contenido.

### Concentración y estudio

Personas que necesitan periodos de concentración y encuentran difícil evitar interrupciones recurrentes provocadas por redes sociales o aplicaciones de entretenimiento.

### Sueño

Personas que quieren dejar el teléfono antes de dormir pero continúan consumiendo contenido durante más tiempo del que habían planeado.

---

## Goal del producto

El objetivo de Rehabbit es ayudar a una persona a **recuperar tiempo de aplicaciones que utiliza automáticamente y redirigirlo hacia actividades que conscientemente quiere hacer más**.

El producto no busca que el usuario deje permanentemente sus redes sociales ni controlar el teléfono de forma agresiva.

Busca intervenir en el momento en que aparece el hábito automático y crear una oportunidad para elegir otra cosa.

El resultado que queremos observar no es solamente:

**“¿usó menos Instagram?”**

sino también:

**“¿leyó más?, ¿entrenó?, ¿meditó?, ¿durmió antes?, ¿hizo algo que llevaba tiempo queriendo hacer?”**

---

## Hipótesis de producto

Nuestra hipótesis principal es:

> Si interrumpimos el momento automático en el que una persona abre una aplicación que quiere reducir y, en ese mismo momento, le ofrecemos una actividad alternativa que ella misma eligió, podremos ayudarla a salir del ciclo en el que actualmente se queda estancada.

Rehabbit quiere probar si **otras aplicaciones y actividades pueden competir con las aplicaciones que actualmente capturan la atención**, siempre que aparezcan en el momento correcto.

Por ejemplo:

**Instagram → Rehabbit interviene → Kindle → leer 10 minutos.**

En lugar de depender únicamente de fuerza de voluntad o de un bloqueo absoluto, Rehabbit intenta cambiar qué opción aparece primero en ese momento.

También queremos explorar si este cambio puede reforzarse con incentivos externos.

Una hipótesis adicional es que **recompensas, beneficios o publicidad patrocinada** podrían ayudar a que una persona complete la actividad alternativa y reduzca la probabilidad de volver inmediatamente a la aplicación que quería evitar.

La primera validación, sin embargo, es más simple:

> **¿Puede la redirección hacia algo que la persona realmente quiere hacer sacarla del comportamiento en el que hoy se queda atrapada?**

---

# Cómo funciona Rehabbit

La unidad principal del producto es un **Plan**.

Un Plan representa un periodo del día en el que el usuario quiere evitar ciertas aplicaciones y dedicar su tiempo a otra actividad.

Un Plan define:

- Qué aplicaciones quiere evitar.
- Qué aplicación o aplicaciones quiere usar en su lugar.
- Durante cuánto tiempo quiere utilizar la actividad alternativa.
- En qué horario aplica el Plan.
- Qué tipo de actividad representa.

Ejemplos:

- Dormir.
- Leer.
- Entrenar.
- Concentrarse.
- Meditar.

Rehabbit funciona también como una especie de **day planner de hábitos**.

Ejemplo:

- 7:00 AM – 9:00 AM → Meditación.
- 2:00 PM – 5:00 PM → Concentración.
- 12:00 AM – 7:00 AM → Dormir.

Fuera de estos periodos, el usuario puede dejar tiempo libre para utilizar sus redes sociales sin restricciones.

---

# 1. Onboarding

El onboarding ayuda al usuario a configurar Rehabbit por primera vez y crear su primer Plan.

Cada pantalla hace una sola pregunta o solicita una acción concreta.

## 1.1 Bienvenida

Presenta Rehabbit y explica brevemente el objetivo del producto.

El usuario continúa para empezar la configuración.


---
## 1.2 Nombre

Solicitar el nombre para personalizar la experiencia.

**Pregunta:**

¿Cómo quieres que te llamemos?

Placeholder: `Alicia`

Utilizarlo posteriormente en los mensajes del onboarding

## 1.3 Uso actual del teléfono

Pregunta cuánto tiempo pasa aproximadamente usando su teléfono.

El usuario selecciona una opción y continúa.

Esta información sirve como referencia inicial sobre su uso actual.

---

## 1.4 Tiempo que quiere recuperar

Pregunta: $Nombre cuánto tiempo le gustaría dejar de perder usando el teléfono o aplicaciones que lo distraen.

El usuario selecciona una duración.

---

## 1.5 Qué quiere lograr

Pregunta: $Nmbre Que objetivo quieres lograr con Rehabbit?

Opciones actuales:

- Dejar redes sociales.
- Concentrarse más.
- Dormir mejor.
- Hacer otra actividad.
- Otro.

Si selecciona `Otro`, puede escribir su propio objetivo.

---

## 1.6 Permisos

Solicita los permisos necesarios para que Rehabbit pueda detectar el uso de aplicaciones y aplicar sus bloqueos.

Opcional puede pasar al siguiente steip

Si posteriormente el usuario elimina uno de los permisos necesarios o no ha agregado, Rehabbit muestra un modal solicitando que lo vuelva a habilitar o habilite para continuar utilizando las funciones que dependen de de los permisos.

Este modal se muestra cada vez que ingrese nuevamente a la app y tambén es opcional

O cuando vaya a editar su plan aquí si es obligatorio por que sino no puede editar o crear un nuevo plan esto referente a la pantalla # 3. Crear o editar un Plan
---

## 1.7 Actividades que quiere hacer más

Pregunta qué tipo de actividades le gustaría recuperar.

Estas respuestas ayudan a definir qué tipo de Plan quiere crear.

---

## 1.8 Apps que quiere dejar de usar

Pregunta qué aplicaciones quiere reducir o evitar durante su primer Plan.

Para reducir fricción, Rehabbit debe mostrar primero una selección de aplicaciones instaladas que probablemente sean relevantes para este objetivo, priorizando inicialmente:

- Redes sociales instaladas.
- Juegos instalados.

El objetivo es que el usuario pueda seleccionar directamente las aplicaciones que quiere reducir sin tener que buscarlas manualmente ni navegar primero por categorías.

Cada aplicación debe mostrarse con su icono y nombre y poder seleccionarse directamente desde esta primera lista.

El usuario también debe tener una opción como **Ver todas las apps** para explorar el resto de aplicaciones instaladas si la que busca no aparece en la selección inicial.

Las aplicaciones seleccionadas se convierten en las **Apps bloqueadas** de su primer Plan.

---

## 1.9 Tiempo de actividad alternativa

Pregunta cuánto tiempo quiere dedicar a la aplicación o actividad que reemplaza el uso de las Apps bloqueadas.

El usuario puede seleccionar una duración como:

- 5 minutos.
- 10 minutos.
- 15 minutos.
- 20 minutos.
- 25 minutos.
- Tiempo personalizado.

Este tiempo es el que posteriormente debe completar utilizando la App de reemplazo para obtener acceso temporal a la App bloqueada.

---

## 1.10 Apps de reemplazo

El usuario selecciona aplicaciones que le gustaría usar en lugar de las aplicaciones que quiere evitar.

Por ejemplo:

- Kindle.
- Balance.
- Spotify.
- Una app de ejercicio.
- Una app de concentración.
- Una herramienta de trabajo.

Estas aplicaciones se convierten en las **Apps de reemplazo** del Plan.

---

## 1.11 Horarios sin restricciones

El onboarding también puede preguntar en qué momentos del día el usuario quiere utilizar sus redes sociales sin restricciones.

La intención es que Rehabbit no bloquee las redes durante todo el día, sino únicamente en los periodos que el propio usuario ha decidido proteger.

---



## 1.12 Revisión del plan

El usuario revisa el Plan que Rehabbit creó para él.

Puede:

- Confirmarlo.
- Modificarlo antes de usarlo.

Si el usuario abandona el onboarding antes de terminar, debe poder retomarlo desde el punto donde lo dejó.

## 1.13 Creando el plan

Rehabbit utiliza las respuestas anteriores para crear el primer Plan.
Muestra una patalla de Success Screen, usa su $Nombre

Pregunta al usaurio para dejarnos unos datos más para mejorar su experiencia

---

## 1.14 Segunda apertura de la aplicación

Cuando el usuario abre Rehabbit por segunda vez, se inicia una secuencia corta de post-onboarding.

### Guardar progreso / Email

Mostrar un modal simple explicando el beneficio antes de solicitar el correo.

Ejemplo:

**Guarda tu progreso**

Agrega tu email para guardar tu progreso y poder continuar con tus Planes.

se lo lleva a la pantalla de profile, para que actualice sus datos

Incluyedo 
- email
- Edad o rango de edad.
- Género.
- A qué se dedica.

El usuario puede omitir esta sección sin afectar el funcionamiento de Rehabbit.


**Guardar progreso**

`Ahora no`

El email no debe ser obligatorio para continuar utilizando la aplicación.

### Rating

Después de completar o cerrar el modal anterior, Rehabbit puede preguntar brevemente:

**¿Cómo te ha ido con Rehabbit?**

El usuario puede indicar cómo ha sido su experiencia hasta el momento.

Si corresponde, Rehabbit puede continuar con la solicitud de calificación de la aplicación.

La solicitud debe poder cerrarse y no debe impedir continuar usando Rehabbit.

---

# 2. Dashboard

El Dashboard es la pantalla principal de Rehabbit.

Desde aquí el usuario puede:

- Ver sus Planes.
- Crear nuevos Planes.
- Entrar a editar un Plan.
- Pausar o reanudar un Plan.
- Ver sus estadísticas.
- Ver su progreso reciente.

---

## 2.1 Dashboard sin Planes

Si el usuario todavía no tiene ningún Plan, se muestra una invitación para crear el primero.

Cuando ya existe al menos un Plan, este estado desaparece.

---

## 2.2 Planes

Cada Plan creado aparece de forma independiente.

El usuario puede identificar:

- El nombre del Plan.
- Las Apps bloqueadas.
- Las Apps de reemplazo.
- El horario.

Al seleccionar un Plan se abre la pantalla de edición.

---

## 2.3 Plan pausado

Cuando el usuario pausa un Plan, este deja de aplicar temporalmente sus restricciones.

La tarjeta del Plan permanece visible, pero aparece desactivada para indicar que está pausado.

El usuario puede volver a activarlo mediante el botón **Reanudar**.

Mientras el Plan está pausado, sus Apps bloqueadas están disponibles.

---

## 2.4 Estadísticas

Las estadísticas ayudan al usuario a entender si realmente está recuperando tiempo y cambiando su comportamiento.

Actualmente esta parte del producto necesita revisión porque los datos no están funcionando correctamente.

### Tiempo recuperado

Rehabbit no considera como tiempo recuperado el tiempo que la persona pasa dentro de Rehabbit.

El tiempo recuperado proviene de dos comportamientos:

- Tiempo utilizando una App de reemplazo.
- Tiempo dentro del horario del Plan durante el cual el usuario evita utilizar la App bloqueada.

El objetivo es medir cuánto tiempo que antes podía terminar en una red social fue utilizado en otra actividad o simplemente dejado libre.

Esta métrica debe evitar inflar artificialmente el resultado. Por ejemplo, dormir siete horas con Instagram bloqueado no debería necesariamente presentarse como siete horas completas de tiempo recuperado si eso no representa un cambio real de comportamiento.

### Intentos bloqueados

Cuántas veces Rehabbit intervino cuando el usuario intentó abrir una App bloqueada durante un Plan activo.

### Redirecciones

Cuántas veces, después de un bloqueo, el usuario decidió abrir la App de reemplazo.

### Tiempo en Apps de reemplazo

Cuánto tiempo acumuló el usuario utilizando las aplicaciones que había elegido como alternativas.

### Planes realizados

Permite entender qué periodos y actividades programadas está siguiendo el usuario.

Un Plan no se considera “realizado” simplemente por haber sido creado.

Representa un periodo del día que el usuario había programado para una actividad concreta.

### Resumen semanal

Debe ayudar al usuario a responder preguntas simples como:

- ¿Cuánto tiempo recuperé esta semana?
- ¿Cuántas veces intenté abrir una app que quería evitar?
- ¿Cuántas veces elegí una alternativa?
- ¿Qué actividades hice más?
- ¿Estoy utilizando menos las aplicaciones que quería reducir?

Las estadísticas deben representar actividad que realmente ocurrió.

Editar posteriormente un Plan no debería modificar el historial anterior.

---

# 3. Crear o editar un Plan

Esta pantalla permite crear un nuevo Plan o modificar uno existente.

Es el lugar principal donde el usuario define cómo quiere organizar un periodo de su día.

El usuario puede configurar:

- Nombre.
- Categoría.
- Duración.
- Horario.
- Apps bloqueadas.
- Apps de reemplazo.

Al guardar:

- Si es un Plan nuevo, se agrega al Dashboard.
- Si ya existía, se actualiza.

---

## 3.1 Duración

La duración define cuánto tiempo debe utilizar el usuario la App de reemplazo para obtener acceso temporal a la App bloqueada.

Opciones:

- 5 minutos.
- 10 minutos.
- 15 minutos.
- 20 minutos.
- 25 minutos.
- Tiempo personalizado.

Ejemplo:

El usuario configura:

**Instagram → Kindle → 20 minutos**

Para desbloquear Instagram durante ese Plan, debe acumular 20 minutos utilizando Kindle.

---

## 3.2 Categoría

La categoría describe el tipo de actividad asociada al Plan.

Categorías actuales:

- Concentración.
- Ejercicio.
- Sueño.
- Meditación.
- Hobby.

La categoría sirve principalmente para identificar el propósito del Plan.

La categoría interna `focus` se muestra siempre como **Concentración**. El usuario no debe ver el nombre “Foco” en el onboarding, en el Dashboard ni al editar un Plan.

---

## 3.3 Horario

Un Plan tiene un horario en el que aplica.

El usuario define:

- Hora de inicio.
- Hora de finalización.
- Días de la semana.

Ejemplo:

**Meditación**  
Lunes a viernes  
7:00 AM – 9:00 AM

Durante ese periodo, las Apps bloqueadas configuradas para ese Plan quedan restringidas.

---

## 3.4 Conflictos de horario

No se debe permitir que dos Planes tengan horarios que se solapen.

Rehabbit funciona como un planner de actividades y cada bloque del día debe representar una intención clara.

Ejemplo válido:

- 7:00 AM – 9:00 AM → Meditación.
- 2:00 PM – 5:00 PM → Concentración.
- 12:00 AM – 7:00 AM → Dormir.

Esto también permite que existan periodos en los que las redes sociales estén disponibles sin restricciones.

---

## 3.5 Apps bloqueadas

Son las aplicaciones que el usuario quiere evitar durante ese Plan.

El usuario puede:

- Agregar aplicaciones.
- Eliminar aplicaciones.
- Cambiar la selección.

Cuando el Plan está activo y el usuario intenta abrir una de estas aplicaciones, Rehabbit muestra la pantalla de bloqueo.

---

## 3.6 Apps de reemplazo

Son las aplicaciones que el usuario quiere utilizar en lugar de las Apps bloqueadas.

Ejemplos:

- Instagram → Kindle.
- Instagram → Balance.
- TikTok → Spotify.
- X → una aplicación de trabajo.

Rehabbit no decide qué aplicación debe utilizar el usuario.

La alternativa es elegida por el propio usuario según lo que quiere hacer durante ese periodo.

---

# 4. Pantalla de bloqueo

Esta pantalla aparece cuando el usuario intenta abrir una **App bloqueada** durante el horario activo de un Plan.

Es uno de los puntos centrales de Rehabbit.

Su función es interrumpir el comportamiento automático y recordarle al usuario qué había decidido hacer en ese momento.

Ejemplo:

**Plan:** Meditación  
**Horario:** 7:00 AM – 9:00 AM  
**App bloqueada:** Instagram  
**App de reemplazo:** Balance  
**Duración:** 10 minutos

Si el usuario intenta abrir Instagram a las 7:30 AM, Rehabbit muestra esta pantalla en lugar de permitir el acceso inmediato.

La pantalla le recuerda que está dentro de su periodo de meditación y le ofrece abrir Balance.

---

## 4.1 Información que muestra

La pantalla debe dejar claro:

- Qué App bloqueada intentó abrir.
- Qué Plan está activo.
- Qué App de reemplazo configuró.
- Cuánto tiempo necesita completar.
- Cuánto progreso lleva.

---

## 4.2 App de reemplazo

La pantalla muestra la App de reemplazo seleccionada para ese Plan.

El usuario puede abrirla directamente desde aquí.

Por ejemplo:

**Instagram está bloqueado → abrir Kindle.**

---

## 4.3 Progreso en la App de reemplazo

El tiempo necesario para desbloquear la App bloqueada se acumula mientras el usuario utiliza realmente la App de reemplazo.

No tiene que completarse de forma continua.

Ejemplo:

Duración configurada: **20 minutos**

El usuario:

- Usa Kindle durante 5 minutos.
- Sale.
- Más tarde usa Kindle durante otros 10 minutos.
- Después utiliza Kindle otros 5 minutos.

Total acumulado:

**20 minutos**

Una vez completado el tiempo configurado, obtiene acceso temporal a la App bloqueada.

---

## 4.4 Si abandona la App de reemplazo

Si el usuario sale de la App de reemplazo antes de completar el tiempo necesario, no pierde el progreso acumulado.

El contador simplemente deja de avanzar.

Cuando vuelve a utilizar la App de reemplazo, continúa acumulando desde donde quedó.

---

## 4.5 Desbloqueo como recompensa

Cuando el usuario completa la duración configurada utilizando la App de reemplazo, obtiene la misma cantidad de tiempo disponible para utilizar la App bloqueada.

Ejemplo:

**20 minutos de Kindle → 20 minutos disponibles en Instagram.**

Esto funciona de forma similar a un ciclo PoPlanro:

**actividad intencional → recompensa → volver al periodo protegido.**

---

## 4.6 Consumo del tiempo de recompensa

El tiempo disponible para la App bloqueada solamente se consume mientras esa aplicación está realmente en uso.

Ejemplo:

El usuario ha ganado:

**20 minutos de Instagram**

Luego:

- Usa Instagram durante 7 minutos.
- Sale de Instagram.
- Le quedan 13 minutos.

El contador se detiene mientras Instagram no está abierta.

Si vuelve posteriormente durante el mismo Plan, todavía dispone de esos 13 minutos.

---

## 4.7 Volver a bloquear

Cuando el usuario consume todo su tiempo disponible, la App bloqueada vuelve a quedar restringida si el horario del Plan todavía continúa activo.

Ejemplo:

Plan:

**Concentración · 2:00 PM – 5:00 PM**

El usuario:

1. Completa 20 minutos en su App de reemplazo.
2. Obtiene 20 minutos de Instagram.
3. Consume esos 20 minutos.
4. Son las 3:10 PM.

Como el Plan continúa activo hasta las 5:00 PM, Instagram vuelve a quedar bloqueado.

Para volver a acceder deberá completar nuevamente el tiempo requerido en la App de reemplazo.

---

## 4.8 No utilizar la App bloqueada

El usuario no está obligado a desbloquear la App bloqueada.

Puede simplemente salir de la pantalla y continuar sin utilizarla.

Esto también forma parte del objetivo de Rehabbit:

**recordarle la decisión que había tomado antes de caer nuevamente en el comportamiento automático.**

---

# Ejemplos completos

## Meditación

El usuario sabe que al despertarse suele abrir Instagram automáticamente.

Configura:

- Plan: Meditación.
- Lunes a viernes.
- 7:00 AM – 9:00 AM.
- App bloqueada: Instagram.
- App de reemplazo: Balance.
- Duración: 10 minutos.

A las 7:30 intenta abrir Instagram.

Rehabbit interviene y le propone abrir Balance.

Si utiliza Balance durante 10 minutos, obtiene 10 minutos disponibles en Instagram.

Cuando esos 10 minutos se terminan, Instagram vuelve a bloquearse porque el Plan continúa hasta las 9:00 AM.

---

## Dormir

El usuario quiere evitar quedarse viendo redes sociales antes de dormir.

Configura:

- Plan: Dormir.
- 12:00 AM – 7:00 AM.
- App bloqueada: Instagram.
- App de reemplazo: una app para dormir.

Si intenta abrir Instagram durante la madrugada, Rehabbit le recuerda que había decidido descansar y le ofrece su aplicación de reemplazo.

El objetivo principal en este caso puede ser simplemente que decida no continuar usando la red social.

---

## Concentración

El usuario quiere concentrarse durante su jornada de trabajo.

Configura:

- Plan: Concentración.
- 2:00 PM – 5:00 PM.
- Apps bloqueadas: Instagram y TikTok.
- App de reemplazo: una app de concentración, Spotify o una herramienta de trabajo.
- Duración: 20 minutos.

Si intenta abrir Instagram, Rehabbit interviene.

Después de utilizar la App de reemplazo durante 20 minutos, obtiene 20 minutos disponibles para Instagram.

Si utiliza Instagram durante 8 minutos y vuelve al trabajo, conserva 12 minutos.

Cuando consume todos los minutos disponibles, las redes vuelven a bloquearse mientras siga dentro del horario de Concentración.

---

# Principio central del producto

Rehabbit no premia al usuario por estar dentro de Rehabbit.

Rehabbit es únicamente el medio que:

**detecta → interrumpe → recuerda → redirige → mide.**

El cambio ocurre cuando el usuario:

- Utiliza la actividad alternativa que había elegido.
- O decide simplemente no utilizar la aplicación que quería reducir.

El objetivo final es que la persona pueda mirar atrás y decir:

**“Este tiempo antes terminaba en scroll. Ahora lo estoy usando para algo que realmente quería hacer.”**
