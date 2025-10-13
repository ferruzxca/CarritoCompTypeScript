# 🛒 Proyecto: Carrito de Compras con TypeScript + Vite

![Tienda](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite&style=flat-square)
![Estado](https://img.shields.io/badge/Estado-Completado-success?style=flat-square)

> 🚀 **Proyecto académico** que demuestra cómo desarrollar una aplicación web multipágina (MPA) de carrito de compras utilizando **TypeScript**, **HTML**, **CSS** y **Vite**, con almacenamiento local mediante `localStorage` y despliegue en **Cloudflare Pages**.

---

## 📘 Descripción general

Este proyecto simula una tienda en línea de productos electrónicos, donde el usuario puede:

- 👀 Ver productos en un catálogo interactivo.  
- 🛍️ Agregar productos al carrito y modificar cantidades.  
- 👤 Iniciar sesión antes de proceder al pago.  
- 💳 Realizar un proceso de compra dividido en pasos (checkout).  
- 🧾 Generar una **factura imprimible en PDF** con el resumen de la compra.

La aplicación está construida completamente en **TypeScript**, con una arquitectura modular y componentes reutilizables, lo que garantiza claridad y mantenimiento sencillo del código.

---

## ⚙️ Tecnologías utilizadas

| Tecnología | Uso |
|-------------|-----|
| 🧩 **TypeScript** | Tipado estático, modularización, manejo seguro del estado. |
| ⚡ **Vite** | Servidor de desarrollo rápido y empaquetado de producción. |
| 🎨 **HTML + CSS** | Interfaz visual con tema oscuro, morado y azul. |
| 💾 **localStorage** | Persistencia local del carrito, usuario y órdenes. |
| ☁️ **Cloudflare Pages** | Hosting gratuito para despliegue estático. |

---

## 📂 Estructura del proyecto

```
CarritoCompTypeScript/
├── index.html
├── products.html
├── cart.html
├── login.html
├── checkout.html
├── thanks.html
├── public/
│   └── data/
│       ├── productos.json
│       └── ubicaciones.json
├── src/
│   ├── components/
│   │   ├── navbar.ts
│   │   ├── product-card.ts
│   │   └── toast.ts
│   ├── pages/
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   ├── login.ts
│   │   └── thanks.ts
│   ├── state/
│   │   └── store.ts
│   ├── styles/
│   │   ├── base.css
│   │   ├── variables.css
│   │   └── components/
│   └── utils/
│       ├── format.ts
│       └── storage.ts
└── vite.config.ts
```

---

## 🧠 Fundamento técnico

El proyecto usa un **store central (`store.ts`)** para manejar el estado global del sistema:  
- Usuario actual  
- Carrito de compras  
- Datos de pago  
- Dirección y opciones de envío  
- Última orden generada  

Cada página `.ts` es un módulo independiente que importa el store y los componentes necesarios.  
El tipado de TypeScript evita errores de tipo y asegura que los objetos `Product`, `CartItem`, `Payment` y `Order` se mantengan consistentes en todo el flujo.

---

## 🪄 Instalación y ejecución local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/ferruzxca/CarritoCompTypeScript.git
cd CarritoCompTypeScript
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Ejecutar en modo desarrollo
```bash
npm run dev
```
👉 Esto abrirá el proyecto en [http://localhost:5173](http://localhost:5173)

### 4️⃣ Compilar para producción
```bash
npm run build
```
El resultado estará en la carpeta `/dist`.

---

## 🧩 Tutorial paso a paso

### 🏠 Página principal – `products.html`
- Se cargan los productos desde `public/data/productos.json`.
- Puedes buscar 🔍, filtrar por categoría y ordenar por precio.
- Haz clic en **“Agregar al carrito”** para sumar artículos.

### 🛒 Carrito – `cart.html`
- Muestra todos los artículos agregados.
- Puedes editar cantidades o eliminar productos.
- El botón **“Vaciar carrito”** borra todo.
- Al presionar **“Checkout”**, si no has iniciado sesión ➡️ te redirige al **login**.

### 👤 Login – `login.html`
- Ingresa nombre o correo (simulado).
- Al iniciar sesión, regresa automáticamente a `checkout.html`.

### 💳 Checkout – `checkout.html`
Proceso dividido en tres pasos:
1. **Método de pago:** tarjeta o transferencia (validación Luhn incluida 💡).
2. **Dirección y envío:** calcula costo y tiempo según `ubicaciones.json`.
3. **Revisión final:** muestra tabla con resumen total e impuestos (IVA 16%).

### 🧾 Factura – `thanks.html`
- Genera una **factura digital imprimible** con todos los datos de la compra.
- Puedes usar el botón 🖨️ **“Imprimir factura”** o guardar como PDF.

---

## 📤 Despliegue gratuito en Cloudflare Pages

1. Crea una cuenta en [Cloudflare Pages](https://pages.cloudflare.com/).  
2. Conecta tu repositorio GitHub.  
3. Configura:
   - **Framework preset:** Vite  
   - **Build command:** `npm run build`  
   - **Build output directory:** `dist`  
   - **Node version:** 20  
4. Publica el sitio y obtén tu dominio gratuito `https://tu-proyecto.pages.dev`.

---

## 🧱 Objetivos técnicos con TypeScript

- Garantizar tipado estático para todos los datos.  
- Mantener un flujo de estado consistente con `store.ts`.  
- Desarrollar módulos independientes y reutilizables.  
- Implementar validaciones estrictas (Luhn, números, campos requeridos).  
- Simular un flujo de e-commerce real sin backend.

---

## 💡 Funcionalidades extra
- ✅ Generación automática de factura con datos dinámicos.  
- ✅ Opción de impresión o guardado en PDF.  
- ✅ Persistencia total de datos entre sesiones.  
- ✅ Diseño responsive en tonos oscuros con acentos morados.

---

## 👨‍💻 Autor

**👋 Ferruzca**  
Estudiante de Ingeniería en Sistemas Computacionales  
📍 Proyecto creado como práctica para la materia *Internet Avanzado III*  

---

## 🌐 Demo en línea

🔗 [Ver sitio desplegado en Cloudflare Pages]([https://carrcomptype.pages.dev/products])

---

## 🧠 Créditos y agradecimientos

Este proyecto fue desarrollado con fines educativos y de práctica profesional, aplicando conceptos de:
- Programación modular en TypeScript  
- Diseño estructurado de aplicaciones MPA  
- Persistencia local y manipulación del DOM  
- Validación de datos y renderizado dinámico
