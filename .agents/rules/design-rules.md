# 2date - Reglas de Diseño y Plataforma

## 1. Nombre de la Plataforma
- El nombre oficial de la plataforma es **2date** (o **2date Atelier**).
- No usar "4-ever" en el branding, textos visibles, pie de página o títulos de usuario.

## 2. Layout & Viewport Width
- **Todas las páginas y vistas (incluyendo la Landing Global/Portal, landings de eventos, invitaciones y paneles) DEBEN ocupar TODO el ancho del viewport (`w-full`, `min-h-screen`)**.
- Evitar contener la página completa dentro de contenedores angostos como `max-w-5xl` o `max-w-7xl` a nivel de sección o fondo. 
- En su lugar, el fondo, la cabecera, los banners y las secciones deben extenderse al 100% del ancho del viewport (`w-full`), utilizando `w-full px-4 sm:px-8 lg:px-12 xl:px-16` para aprovechar pantallas panorámicas y proporcionar una sensación inmersiva y moderna.

## 3. Barras y Controles
- No colocar botones flotantes intrusivos en el centro superior (como el switcher flotante en el centro que tapaba contenido). La navegación debe integrarse armónicamente en el navbar o en los encabezados naturales de cada vista.
- En modo Demo, la barra superior de selección de temas/estilos debe aprovechar todo el ancho del viewport en una sola fila compacta y responsiva (con scroll horizontal suave o dropdown compacto en pantallas estrechas), permitiendo previsualizar sin romper la interfaz ni ocupar múltiples filas.
