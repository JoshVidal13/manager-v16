# Gestor de Gastos e Ingresos - Sincronizado en la Nube

Una aplicación web moderna para gestionar gastos e ingresos personales con sincronización en tiempo real entre dispositivos.

## 🚀 Características

- **Sincronización en Tiempo Real**: Los datos se sincronizan automáticamente entre todos tus dispositivos
- **Base de Datos en la Nube**: Powered by Supabase para máxima confiabilidad
- **Dashboard Principal**: Resumen financiero con totales y formulario de entrada
- **Vista de Calendario**: Visualización mensual con código de colores
- **Reportes Detallados**: Análisis por categorías y semanas
- **Indicador de Conexión**: Estado visual de la conexión a la base de datos
- **Responsive Design**: Optimizado para móviles y desktop

## 🛠️ Configuración

### 1. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - Project URL
   - Anon public key

### 2. Variables de Entorno

Crea un archivo `.env.local` con:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
\`\`\`

### 3. Configurar Base de Datos

1. Ve a SQL Editor en Supabase
2. Ejecuta el script `scripts/create-tables.sql` para crear las tablas necesarias

### 4. Deployment en Cloudflare Pages

1. **Variables de entorno en Cloudflare**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Configuración de build**:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node.js version: `18.x`

## 🔧 Desarrollo Local

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
\`\`\`

## 📱 Uso

1. **Agregar Entradas**: Los datos se guardan automáticamente en la nube
2. **Sincronización**: Los cambios aparecen instantáneamente en todos los dispositivos
3. **Estado de Conexión**: El indicador muestra el estado de la conexión
4. **Análisis**: Reportes detallados con insights inteligentes

## 🎨 Categorías Disponibles

**Gastos**: Carne, Agua, Gas, Salarios, Insumos, Transporte, Servicios, Refresco, Otros
**Ingresos**: Efectivo, Transferencia, Ventas, Servicios, Otros

## 🔧 Tecnologías

- Next.js 14 (App Router)
- React 18 con Hooks personalizados
- TypeScript
- Supabase (Base de datos + Real-time)
- Tailwind CSS
- shadcn/ui
- date-fns

## 🔄 Sincronización en Tiempo Real

La aplicación utiliza Supabase Realtime para:
- Sincronizar datos entre dispositivos instantáneamente
- Mostrar cambios en tiempo real sin recargar la página
- Mantener consistencia de datos entre usuarios

## 🛡️ Seguridad

- Row Level Security (RLS) habilitado
- Políticas de acceso configuradas
- Validación de datos en cliente y servidor
\`\`\`

## 🎉 ¡Aplicación Actualizada con Sincronización en la Nube!

### ✨ **Nuevas Características**

1. **🔄 Sincronización en Tiempo Real**
   - Los datos se guardan automáticamente en Supabase
   - Cambios instantáneos entre todos los dispositivos
   - No más problemas de datos perdidos

2. **📡 Indicador de Conexión**
   - Estado visual de la conexión a internet y base de datos
   - Alertas cuando hay problemas de conectividad
   - Reconexión automática

3. **🔧 Hooks Personalizados**
   - `useEntries`: Manejo completo de entradas con estado
   - Carga automática y suscripción a cambios
   - Manejo de errores integrado

4. **🛡️ Seguridad y Confiabilidad**
   - Base de datos PostgreSQL en la nube
   - Row Level Security habilitado
   - Validación de datos robusta

### 🚀 **Para Configurar**

1. **Crear cuenta en Supabase** (gratis)
2. **Ejecutar el script SQL** para crear las tablas
3. **Configurar variables de entorno**
4. **Deploy en Cloudflare Pages**

### 📱 **Beneficios**

- ✅ **Acceso desde cualquier dispositivo**
- ✅ **Datos siempre sincronizados**
- ✅ **Sin pérdida de información**
- ✅ **Actualizaciones en tiempo real**
- ✅ **Backup automático en la nube**

¡Ahora puedes usar la aplicación desde tu teléfono, tablet o computadora y todos los datos estarán siempre actualizados! 🎯
