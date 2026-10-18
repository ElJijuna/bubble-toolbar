# 🫧 Bubble Toolbar

> Componente de barra flotante responsiva con efecto **blurred glass** (glassmorphism) para **React 18 y 19** con **TypeScript**, organizado por grupos y con morfología adaptativa inteligente (círculo ↔ cápsula).

![Bubble Toolbar Morphology](https://raw.githubusercontent.com/ElJijuna/bubble-toolbar/main/assets/banner.png)

---

## ✨ Características

- ⚛️ **Compatibilidad Total**: Diseñado y probado con **React 18** y **React 19** usando `forwardRef` y tipado estricto en TypeScript.
- 🔮 **Definición por Grupos**: Define la barra pasando arreglos de nodos o mediante sintaxis de componentes compuestos (`BubbleToolbar.Group`).
- 🔘 **Morfología Adaptativa Dinámica**:
  - **1 solo nodo** $\rightarrow$ se renderiza como un **círculo** perfecto (`aspect-ratio: 1/1`).
  - **Más de 1 nodo** $\rightarrow$ se convierte en un **rectángulo redondeado (cápsula / pill)**, respetando la curvatura en los extremos para mantener el equilibrio visual exacto con las burbujas circulares.
- 🪟 **Blurred Glass (Frosted Glassmorphism)**: Efecto translúcido con desenfoque de fondo (`backdrop-filter: blur(16px)`), bordes frosted, sombras suaves y soporte para temas claro, oscuro o automático.
- 📱 **Flotante y Responsivo**: Posicionamiento fijo o relativo, centrado automático y desplazamiento horizontal suave sin barras de scroll invasivas en pantallas móviles.
- 🧪 **100% Testeado con Jest**: Suite integral de pruebas unitarias y de integración con `@testing-library/react`.

---

## 📦 Instalación

```bash
npm install bubble-toolbar
# o con yarn / pnpm / bun
pnpm add bubble-toolbar
```

---

## 🚀 Uso Rápido

### Ejemplo con definición por grupos (prop `groups`)

Tal como en tu especificación:

```tsx
import React from 'react';
import { BubbleToolbar, BubbleIconButton, BubbleArea } from 'bubble-toolbar';
import 'bubble-toolbar/styles.css'; // Opcional, los estilos inline glass ya vienen incluidos

function App() {
  return (
    <BubbleToolbar
      position="bottom"
      theme="glass"
      groups={[
        // Grupo 1: 1 solo nodo => Círculo
        [<Logo key="logo" />],

        // Grupo 2: Múltiples nodos => Rectángulo redondeado (Pill)
        [
          <BubbleIconButton key="search" name="search" />,
          <BubbleArea key="area">
            <input placeholder="Buscar o escribir /" />
          </BubbleArea>,
        ],

        // Grupos 3, 4 y 5: 1 solo nodo cada uno => Círculos
        [<BubbleIconButton key="theme" name="theme" />],
        [<BubbleIconButton key="chat" name="chat" />],
        [<BubbleIconButton key="notif" name="notifications" badge={3} />],
      ]}
    />
  );
}
```

### Ejemplo con Componentes Compuestos (`BubbleToolbar.Group`)

```tsx
import { BubbleToolbar, BubbleIconButton, BubbleArea } from 'bubble-toolbar';

function FloatingMenu() {
  return (
    <BubbleToolbar position="bottom" theme="glass">
      {/* 1 nodo: Círculo */}
      <BubbleToolbar.Group>
        <Logo />
      </BubbleToolbar.Group>

      {/* 2 nodos: Rectángulo redondeado (Cápsula) */}
      <BubbleToolbar.Group>
        <BubbleIconButton name="search" />
        <BubbleArea>
          <input placeholder="Buscar..." />
        </BubbleArea>
      </BubbleToolbar.Group>

      {/* 1 nodo: Círculo */}
      <BubbleToolbar.Group>
        <BubbleIconButton name="theme" />
      </BubbleToolbar.Group>
    </BubbleToolbar>
  );
}
```

---

## 📐 Morfología Visual

| Contenido del Grupo | Forma Resultante | Comportamiento |
| :--- | :---: | :--- |
| **1 Nodo** (`[<Logo />]`) | 🟡 **Círculo** | Ancho y alto fijados a `--bubble-size` (por defecto `48px`). `aspect-ratio: 1 / 1`. Contenido centrado. |
| **> 1 Nodo** (`[<Search />, <Area />]`) | 💊 **Cápsula / Pill** | Altura fijada a `--bubble-size`, ancho dinámico según contenido con padding lateral. Los extremos redondeados coinciden exactamente con el diámetro de las burbujas circulares adyacentes para una armonía visual simétrica. |

---

## 🛠️ API Reference

### `<BubbleToolbar />`

| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :---: | :--- |
| `groups` | `ReactNode[][]` | `undefined` | Arreglo de arreglos con los nodos agrupados. |
| `children` | `ReactNode` | `undefined` | Elementos JSX hijos (ej. `<BubbleToolbar.Group>`). |
| `position` | `'bottom' \| 'top' \| 'static' \| 'custom'` | `'bottom'` | Posicionamiento de la barra en pantalla. |
| `theme` | `'glass' \| 'light' \| 'dark' \| 'auto'` | `'glass'` | Estilo visual y translucidez. |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Altura de la barra / diámetro de los círculos (40px, 48px, 56px o px numérico). |
| `blurred` | `boolean` | `true` | Activa el efecto frosted glass (`backdrop-filter: blur`). |
| `blurAmount`| `number \| string` | `16` | Cantidad de desenfoque en píxeles. |
| `groupGap` | `number \| string` | `8` | Espacio entre cada burbuja/grupo. |
| `itemGap` | `number \| string` | `8` | Espacio entre elementos dentro de un grupo cápsula. |
| `bordered` | `boolean` | `true` | Muestra bordes sutiles con brillo frosted. |
| `shadow` | `boolean \| string` | `true` | Sombra flotante proyectada. |

### `<BubbleGroup />` (o `<BubbleToolbar.Group />`)

| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :---: | :--- |
| `children` | `ReactNode` | `undefined` | Nodos que contiene el grupo. |
| `shape` | `'circle' \| 'pill'` | Automático | Fuerza una forma específica omitiendo el cálculo automático por cantidad de nodos. |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | Heredado | Permite sobrescribir el tamaño para este grupo. |
| `itemGap` | `number \| string` | Heredado | Espaciado entre elementos del grupo. |

### `<BubbleIconButton />`

| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :---: | :--- |
| `name` | `'search' \| 'theme' \| 'chat' \| 'notifications' \| 'logo' \| 'close'` | `undefined` | Nombre del icono vectorial SVG pre-integrado. |
| `icon` | `ReactNode` | `undefined` | Icono SVG personalizado. |
| `badge` | `ReactNode \| number \| string` | `undefined` | Indicador o contador de notificación. |
| `active` | `boolean` | `false` | Estado activo / seleccionado. |
| `tooltip` | `string` | `undefined` | Texto emergente y accesible. |

---

## 🧪 Pruebas con Jest

Ejecutar la suite completa de pruebas:

```bash
npm test
```

Ejecutar con reporte de cobertura de código:

```bash
npm run test:coverage
```

Ejecutar chequeo de tipos en TypeScript:

```bash
npm run typecheck
```

Compilar la librería para distribución (ESM, CJS y `.d.ts`):

```bash
npm run build
```

---

## 📄 Licencia

MIT © ElJijuna

