# ModernShop - E-commerce App

Una aplicación de e-commerce moderna construida con Next.js 14, React 18 y Tailwind CSS.

## Características

- 🛒 Carrito de compras completo
- 👤 Sistema de autenticación
- 🔍 Búsqueda de productos
- 💳 Proceso de checkout
- 📱 Diseño responsive
- 🌙 Modo oscuro
- ⭐ Sistema de favoritos
- 💬 Chat de soporte
- 🎨 Interfaz moderna con Tailwind CSS

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <tu-repositorio>
cd modernshop
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Ejecuta el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

\`\`\`
modernshop/
├── app/                    # App Router de Next.js
├── components/            # Componentes reutilizables
├── contexts/             # Context providers
├── public/               # Archivos estáticos
├── styles/               # Estilos globales
└── ...
\`\`\`

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **React 18** - Biblioteca de UI
- **Tailwind CSS** - Framework de CSS
- **Lucide React** - Iconos
- **Context API** - Gestión de estado

## Funcionalidades Principales

### Carrito de Compras
- Agregar/eliminar productos
- Actualizar cantidades
- Persistencia en localStorage
- Cálculo automático de totales

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Gestión de perfil
- Direcciones de envío

### Productos
- Catálogo de productos
- Filtros y búsqueda
- Detalles de producto
- Sistema de valoraciones

### Checkout
- Proceso paso a paso
- Información de envío
- Métodos de pago
- Confirmación de pedido

## Personalización

### Colores
Los colores se pueden personalizar en `tailwind.config.js`:

\`\`\`javascript
colors: {
  primary: {...},
  secondary: {...},
  // Agrega tus colores personalizados
}
\`\`\`

### Componentes
Los componentes UI están en `components/ui/` y pueden ser personalizados según tus necesidades.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
\`\`\`

Para ejecutar la aplicación en tu entorno local:

1. **Descarga el código** usando el botón "Download Code" en la esquina superior derecha
2. **Extrae el archivo** en tu directorio deseado
3. **Abre una terminal** en el directorio del proyecto
4. **Instala las dependencias**:
   \`\`\`bash
   npm install
   \`\`\`
5. **Ejecuta el servidor de desarrollo**:
   \`\`\`bash
   npm run dev
   \`\`\`
6. **Abre tu navegador** en `http://localhost:3000`

## Errores Corregidos:

1. **Configuración de Next.js**: Agregué `next.config.js` con configuración de imágenes
2. **Tailwind CSS**: Configuración completa con colores personalizados
3. **Verificaciones de `window`**: Agregué verificaciones `typeof window !== 'undefined'` para evitar errores de SSR
4. **Imágenes**: Reemplazé placeholders con imágenes reales de Unsplash
5. **Dependencias**: Package.json con todas las dependencias necesarias
6. **Componentes faltantes**: Agregué todos los componentes UI necesarios
7. **Contextos**: Corregí los contextos para manejar correctamente el estado
8. **Rutas**: Configuración correcta de rutas de Next.js

La aplicación ahora debería funcionar perfectamente en tu entorno local sin errores.
