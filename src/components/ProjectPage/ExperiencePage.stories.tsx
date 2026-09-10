import type { Meta, StoryObj } from '@storybook/react-vite';
import { handshake } from '../../content/pages/handshake';
import { recallia } from '../../content/pages/recallia';
import { silky } from '../../content/pages/silky';
import ExperiencePage from './ExperiencePage';

const meta: Meta<typeof ExperiencePage> = {
  title: 'Pages/Experience',
  component: ExperiencePage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Handshake: StoryObj<typeof ExperiencePage> = { args: { p: handshake } };

export const Recallia: StoryObj<typeof ExperiencePage> = { args: { p: recallia } };

export const Silky: StoryObj<typeof ExperiencePage> = { args: { p: silky } };
