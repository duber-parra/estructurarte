# Estructurarte - Sitio Web y CMS

Sitio web profesional para Estructurarte con panel de administración completo.

## Características

### Sitio Web Principal
- **Hero Section**: Portada impactante con estadísticas y llamados a la acción
- **Servicios**: Tarjetas interactivas con swipe en móvil
- **Diferencial**: Timeline del proceso y badge de 0% rechazos
- **Confianza**: Estadísticas, sellos de certificación y perfil del ingeniero
- **Portafolio**: Galería de imágenes de proyectos
- **FAQ**: Preguntas frecuentes con acordeón
- **CTAs**: Botones de contacto para llamada y WhatsApp
- **Navegación móvil**: Bottom nav sticky y drawer menu
- **Animaciones**: Transiciones suaves y efectos de scroll

### Panel de Administración (`#/admin`)
- **Dashboard**: Vista general con estadísticas
- **Hero/Portada**: Editar titular, subtítulo y eyebrow
- **Ingeniero**: Nombre, rol, bio y foto de perfil
- **Portafolio**: Subir/eliminar imágenes con captions
- **Contacto**: Teléfono, WhatsApp, email y dirección

### Base de Datos Supabase
Todas las tablas creadas con RLS (Row Level Security):
- `cms_hero` - Contenido del hero section
- `cms_services` - Servicios ofrecidos
- `cms_engineer` - Información del ingeniero
- `cms_faq` - Preguntas frecuentes
- `cms_images` - Imágenes del portafolio
- `cms_contact` - Datos de contacto

### Storage
- Bucket `estructurarte-images` para imágenes
- Acceso público para lectura
- Solo usuarios autenticados pueden subir/eliminar

## Contacto Configurado

**Ing Jhon Jaramillo**
- Teléfono: +57 321 4502246
- WhatsApp: 573214502246
- Todos los CTAs ya apuntan a estos números

## Rutas

- `/` o `#/` - Sitio web principal
- `#/admin` - Panel de administración

## Experiencia Móvil

El sitio está optimizado para móvil con:
- Diseño responsivo en todas las secciones
- Swipe cards en servicios
- Bottom navigation sticky
- Mobile CTA bar fijo
- Drawer menu hamburguesa
- Touch-optimized interactions
- Safe area insets para dispositivos con notch

## Tecnologías

- React 18 + TypeScript
- Vite
- Supabase (Database + Storage)
- CSS Custom (sin frameworks)
- Fuentes: Bebas Neue, DM Sans, Space Mono

## Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build para producción
npm run preview  # Preview del build
```

## Notas

- Los datos se guardan automáticamente en Supabase al hacer clic en "Guardar"
- Las imágenes se almacenan en Supabase Storage
- El sitio es 100% funcional sin autenticación para el usuario final
- Solo el admin necesita autenticación para editar contenido
