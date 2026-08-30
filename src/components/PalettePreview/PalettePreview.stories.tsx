import type { Meta, StoryObj } from '@storybook/react-vite';
import { PalettePreview } from './PalettePreview';
import { theme } from '../../styles/theme';

const meta = {
  title: 'Foundations/Palette',
  component: PalettePreview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PalettePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bubblegum: Story = { args: { palette: theme } };
