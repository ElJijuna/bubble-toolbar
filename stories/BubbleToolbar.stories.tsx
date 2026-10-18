import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BubbleToolbar } from '../src/BubbleToolbar';
import { BubbleArea } from '../src/components/BubbleArea';
import { BubbleIconButton } from '../src/components/BubbleIconButton';

const meta: Meta<typeof BubbleToolbar> = {
  title: 'Components/BubbleToolbar',
  component: BubbleToolbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['glass', 'light', 'dark', 'auto'],
      description: 'Visual theme of the toolbar',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 64],
      description: 'Height / circle diameter of bubbles',
    },
    position: {
      control: 'select',
      options: ['bottom', 'top', 'static', 'custom'],
      description: 'Placement behavior on the screen',
    },
    blurred: {
      control: 'boolean',
      description: 'Enable/disable frosted glass backdrop filter',
    },
    bordered: {
      control: 'boolean',
      description: 'Enable/disable subtle borders',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BubbleToolbar>;

const Logo = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6366f1"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

/**
 * Caso principal solicitado por el usuario:
 * [<Logo />]
 * [<IconButton name="search">, <ToolbarArea />], [<IconButton name="theme" />], [<IconButton name="chat" />], [<IconButton name="notifications" />]
 */
export const Default: Story = {
  render: (args) => (
    <div style={{ minHeight: '100vh', padding: '40px', boxSizing: 'border-box' }}>
      <div
        style={{
          maxWidth: '650px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Bubble Toolbar Example</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
          Barra flotante inferior con efecto <strong>frosted glass</strong>. Observa cómo el grupo 1
          y los grupos 3, 4 y 5 son círculos perfectos, mientras que el grupo 2 (búsqueda + área) se
          expande como rectángulo redondeado simétrico (cápsula).
        </p>
      </div>

      <BubbleToolbar
        {...args}
        groups={[
          [<Logo key="logo" />],
          [
            <BubbleIconButton key="search" name="search" />,
            <BubbleArea key="area" minWidth={140}>
              <input
                placeholder="Buscar o escribir /"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: 'inherit',
                  fontSize: '14px',
                  width: '100%',
                }}
              />
            </BubbleArea>,
          ],
          [<BubbleIconButton key="theme" name="theme" />],
          [<BubbleIconButton key="chat" name="chat" />],
          [<BubbleIconButton key="notif" name="notifications" badge={4} />],
        ]}
      />
    </div>
  ),
  args: {
    position: 'bottom',
    theme: 'glass',
    size: 'md',
    blurred: true,
  },
};

/**
 * Tema Oscuro Glass (Dark frosted glass)
 */
export const DarkTheme: Story = {
  ...Default,
  args: {
    position: 'bottom',
    theme: 'dark',
    size: 'md',
    blurred: true,
  },
};

/**
 * Tema Claro (Light theme)
 */
export const LightTheme: Story = {
  ...Default,
  args: {
    position: 'bottom',
    theme: 'light',
    size: 'md',
    blurred: true,
  },
};

/**
 * Demostración interactiva de la morfología adaptativa:
 * Al alternar entre 1 y 2 nodos, el grupo pasa fluidamente de Círculo a Rectángulo redondeado (Pill).
 */
export const AdaptiveMorphology: Story = {
  render: function AdaptiveMorphologyDemo() {
    const [hasSecondItem, setHasSecondItem] = useState(true);

    return (
      <div style={{ minHeight: '100vh', padding: '40px', boxSizing: 'border-box' }}>
        <div
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: '0 0 12px 0' }}>Morfología Adaptativa Dinámica</h2>
          <p style={{ color: '#475569', marginBottom: '16px' }}>
            Estado actual del Grupo 2:{' '}
            <strong>{hasSecondItem ? '2 Nodos (Rectángulo Pill)' : '1 Nodo (Círculo)'}</strong>
          </p>
          <button
            type="button"
            onClick={() => setHasSecondItem(!hasSecondItem)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {hasSecondItem
              ? 'Eliminar 2do nodo (Convertir en Círculo)'
              : 'Agregar 2do nodo (Convertir en Cápsula)'}
          </button>
        </div>

        <BubbleToolbar
          position="bottom"
          theme="glass"
          groups={[
            [<Logo key="logo" />],
            hasSecondItem
              ? [
                  <BubbleIconButton key="search" name="search" />,
                  <BubbleArea key="area" minWidth={120}>
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>Área activa</span>
                  </BubbleArea>,
                ]
              : [<BubbleIconButton key="search" name="search" />],
            [<BubbleIconButton key="theme" name="theme" />],
            [<BubbleIconButton key="chat" name="chat" />],
          ]}
        />
      </div>
    );
  },
};

/**
 * Uso con Componentes Compuestos (BubbleToolbar.Group)
 */
export const CompoundComponents: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', padding: '40px' }}>
      <BubbleToolbar position="bottom" theme="glass">
        <BubbleToolbar.Group>
          <Logo />
        </BubbleToolbar.Group>

        <BubbleToolbar.Group>
          <BubbleIconButton name="search" />
          <BubbleArea minWidth={160}>
            <input
              placeholder="Escribe un comando..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'inherit',
                fontSize: '14px',
                width: '100%',
              }}
            />
          </BubbleArea>
        </BubbleToolbar.Group>

        <BubbleToolbar.Group>
          <BubbleIconButton name="theme" />
        </BubbleToolbar.Group>
      </BubbleToolbar>
    </div>
  ),
};

/**
 * Comparación de Tamaños ('sm', 'md', 'lg')
 */
export const SizeComparison: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'center',
        padding: '60px 20px',
      }}
    >
      <div>
        <h4 style={{ color: 'white', marginBottom: '8px', textAlign: 'center' }}>
          Tamaño 'sm' (40px)
        </h4>
        <BubbleToolbar
          position="static"
          size="sm"
          theme="glass"
          groups={[
            [<Logo key="l" />],
            [
              <BubbleIconButton key="s" name="search" />,
              <BubbleArea key="a" minWidth={100}>
                <span>Buscar</span>
              </BubbleArea>,
            ],
            [<BubbleIconButton key="t" name="theme" />],
          ]}
        />
      </div>

      <div>
        <h4 style={{ color: 'white', marginBottom: '8px', textAlign: 'center' }}>
          Tamaño 'md' (48px - Default)
        </h4>
        <BubbleToolbar
          position="static"
          size="md"
          theme="glass"
          groups={[
            [<Logo key="l" />],
            [
              <BubbleIconButton key="s" name="search" />,
              <BubbleArea key="a" minWidth={120}>
                <span>Buscar</span>
              </BubbleArea>,
            ],
            [<BubbleIconButton key="t" name="theme" />],
          ]}
        />
      </div>

      <div>
        <h4 style={{ color: 'white', marginBottom: '8px', textAlign: 'center' }}>
          Tamaño 'lg' (56px)
        </h4>
        <BubbleToolbar
          position="static"
          size="lg"
          theme="glass"
          groups={[
            [<Logo key="l" />],
            [
              <BubbleIconButton key="s" name="search" />,
              <BubbleArea key="a" minWidth={140}>
                <span>Buscar</span>
              </BubbleArea>,
            ],
            [<BubbleIconButton key="t" name="theme" />],
          ]}
        />
      </div>
    </div>
  ),
};
