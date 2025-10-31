# Aplicación de Registro de Seguros - Rimac

## Descripción del Proyecto

Aplicación web desarrollada con **React** y **TypeScript** para el proceso de registro y selección de planes de seguros. El proyecto implementa un flujo de dos páginas: un formulario de registro de usuario y una página de selección de planes de seguro.

La aplicación utiliza **React Context** para la gestión de estado global y consume datos de APIs externas para obtener información del usuario y planes disponibles.

## Tecnologías Utilizadas

- **React.js** - Biblioteca para la construcción de interfaces de usuario
- **TypeScript** - Superset de JavaScript con tipado estático
- **Vite** - Herramienta de construcción y desarrollo
- **React Router DOM** - Navegación y enrutamiento
- **SCSS** - Preprocesador CSS para estilos
- **Jest** - Framework de pruebas unitarias
- **React Testing Library** - Utilidades de testing para componentes React
- **ESLint** - Linter para calidad de código
- **Prettier** - Formateador de código

## Características Principales

### 1. Formulario de Registro
- Validación de datos del usuario (número de documento, teléfono)
- Aceptación de políticas de privacidad y comerciales
- Consumo de API para obtener datos del usuario
- Almacenamiento en contexto global

### 2. Selección de Planes
- Ruta protegida que verifica datos completos del formulario
- Filtrado de planes según la edad del usuario
- Opciones de selección: "para mí" o "para otra persona"
- Aplicación de descuento del 5% para opción "para mí"
- Visualización de planes con precios y detalles

### 3. Gestión de Estado
- Context API para estado global
- Datos de usuario y formulario compartidos entre componentes
- Hook personalizado `useUserContext()` para acceso al contexto

## Instalación y Configuración

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/athenasaint01/test-interview
   ```

2. Navegar al directorio del proyecto:
   ```bash
   cd test-interview
   ```

3. Instalar dependencias:
   ```bash
   npm install
   ```

## Comandos Disponibles

### Desarrollo

```bash
npm run dev           # Iniciar servidor de desarrollo (Vite)
npm run build         # Compilar para producción
npm run preview       # Previsualizar build de producción
```

### Pruebas

```bash
npm test              # Ejecutar todas las pruebas
npm run test:watch    # Ejecutar pruebas en modo watch
npm run test:coverage # Ejecutar pruebas con reporte de cobertura
npm run test:verbose  # Ejecutar pruebas con salida detallada
npm run test:debug    # Ejecutar pruebas en modo debug
```

### Calidad de Código

```bash
npm run lint          # Ejecutar ESLint con auto-corrección
npm run format        # Formatear código con Prettier
```

## Estructura del Proyecto

```
test-interview/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Encabezado de la aplicación
│   │   │   └── Footer.tsx        # Pie de página
│   │   ├── ui/
│   │   │   ├── Button/           # Componente de botón reutilizable
│   │   │   └── Form/             # Componentes de formulario
│   │   ├── RegistrationForm.tsx  # Página principal de registro
│   │   └── InsurancePage.tsx     # Página de selección de seguros
│   ├── context/
│   │   └── UserContext.tsx       # Gestión de estado global
│   ├── services/
│   │   ├── userApi.ts            # Servicio API de usuario
│   │   └── plansApi.ts           # Servicio API de planes
│   ├── styles/                   # Hojas de estilo SCSS
│   ├── types/                    # Definiciones de tipos TypeScript
│   ├── helpers/                  # Funciones auxiliares
│   ├── hooks/                    # Hooks personalizados
│   ├── constants/                # Constantes de la aplicación
│   ├── __test__/                 # Archivos de pruebas
│   ├── App.tsx                   # Componente raíz
│   └── main.tsx                  # Punto de entrada
├── public/
│   └── assets/                   # Recursos estáticos (iconos, imágenes)
├── coverage/                     # Reportes de cobertura de pruebas
└── dist/                         # Build de producción
```

## Arquitectura de la Aplicación

### Flujo de Navegación

1. **Página de Inicio (`/`)**: `RegistrationForm`
   - Obtiene datos del usuario desde la API al cargar
   - Valida entradas del formulario
   - Almacena datos en el contexto
   - Navega a `/plans` tras envío exitoso

2. **Página de Planes (`/plans`)**: `InsurancePage`
   - Ruta protegida - redirige a `/` si faltan datos
   - Obtiene planes de seguro desde la API
   - Filtra planes según edad del usuario
   - Aplica descuentos según la selección del usuario

### Servicios API

#### userApi.ts
- **Endpoint**: `https://rimac-front-end-challenge.netlify.app/api/user.json`
- **Función**: `fetchUserData()`
- **Retorna**: `{ name, lastName, birthDay }`

#### plansApi.ts
- **Funciones**:
  - `fetchPlans()`: Obtiene todos los planes disponibles
  - `filterPlansByAge(plans, userAge)`: Filtra planes por edad mínima
  - `applyDiscountToPlan(plan, discountRate)`: Aplica descuento a un plan
  - `applyDiscountToPlans(plans, discountRate)`: Aplica descuento a múltiples planes
- **Tasa de descuento**: 0.95 (5% de descuento)

### Gestión de Estado (Context)

```typescript
interface UserContextType {
  userData: {
    name: string;
    lastName: string;
    birthDay: string;
  };
  formData: {
    documentType: string;
    documentNumber: string;
    cellphone: string;
    privacyPolicy: boolean;
    commercialPolicy: boolean;
  };
}
```

### Rutas Protegidas

El componente `ProtectedRoute` valida que todos los campos requeridos estén completos antes de permitir acceso a `/plans`:
- documentNumber
- cellphone
- privacyPolicy
- commercialPolicy

Si la validación falla, redirige automáticamente a `/`.

## Pruebas

### Configuración
- Framework: **Jest**
- Entorno: **jsdom**
- Librería: **React Testing Library**
- Ubicación: `src/__test__/`
- Patrón: `*.test.tsx`

### Cobertura
Los umbrales de cobertura están configurados al 70% para:
- Branches (ramas)
- Functions (funciones)
- Lines (líneas)
- Statements (sentencias)

### Mocks
- Assets estáticos: `__mocks__/fileMock.js`
- Importaciones SCSS: `identity-obj-proxy`

## Variables de Entorno

El archivo `.env` contiene los endpoints de las APIs:

```bash
VITE_API_USER=https://rimac-front-end-challenge.netlify.app/api/user.json
VITE_API_PLAN=https://rimac-front-end-challenge.netlify.app/api/plans.json
```

**Nota**: Estos endpoints son públicos y están incluidos en el repositorio.

## Configuración de Build

- **Bundler**: Vite con plugin de React
- **TypeScript**: Configuración composite con archivos separados:
  - `tsconfig.app.json` - Configuración de la aplicación
  - `tsconfig.node.json` - Configuración de Node
  - `tsconfig.jest.json` - Configuración de Jest
- **Estilos**: SCSS con hojas de estilo por componente en `src/styles/`
- **Assets**: Organizados en `public/assets/` (iconos, imágenes)

## Lógica de Negocio

### Cálculo de Edad
La aplicación calcula la edad del usuario a partir del campo `birthDay` (formato: DD-MM-YYYY) y la utiliza para filtrar planes elegibles. Cada plan tiene una propiedad `age` que representa la edad mínima requerida.

### Sistema de Descuentos
- **Opción "Para mí"**: Aplica 5% de descuento (`DISCOUNT_RATE = 0.95`)
- **Opción "Para otra persona"**: Muestra precios completos sin descuento

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Notas Adicionales

- Se ignoraron varios archivos en `.gitignore` para mantener el repositorio limpio
- El proyecto sigue las mejores prácticas de React y TypeScript
- El código está formateado con Prettier y lintado con ESLint
- Todos los componentes son funcionales con hooks de React

## Licencia

Este proyecto fue desarrollado como parte de un desafío técnico para Rimac.

## Contacto

Para más información sobre el proyecto, visita el repositorio: [https://github.com/athenasaint01/test-interview](https://github.com/athenasaint01/test-interview)
