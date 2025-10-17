module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // Archivo de configuración que se ejecuta antes de cada test
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // ✅ Mapeo de módulos corregido
  moduleNameMapper: {
    // SCSS/CSS files
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Image files
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",

    // Alias paths (si los usas)
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Configuración de ts-jest
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
        isolatedModules: false,
      },
    ],
  },

  // Patrones para encontrar archivos de test
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/__test__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)",
  ],

  // Archivos a incluir en el reporte de cobertura
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/__tests__/**",
    "!src/**/__test__/**",
  ],

  // Configuración de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Directorios a ignorar
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // Extensiones de archivos que Jest debe procesar
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Configuración para ver errores más detallados
  verbose: true,

  // Limpiar mocks automáticamente entre tests
  clearMocks: true,

  // Restablecer mocks automáticamente entre tests
  resetMocks: false,

  // Timeout para tests
  testTimeout: 10000,

  // Resolver módulos desde node_modules y src
  modulePaths: ["<rootDir>/src"],

  // ✅ NO transformar node_modules excepto los que usan ESM
  transformIgnorePatterns: [
    "node_modules/(?!(@testing-library|identity-obj-proxy)/)",
  ],

  // Configuración del entorno de test
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
