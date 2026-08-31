import type { Meta, StoryObj } from '@storybook/react-vite';
import App from './App';

const meta: Meta = {
  title: 'Pages/Site',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj = { render: () => <App /> };
