import type { Meta, StoryObj } from '@storybook/react-vite';
import { gsscKorea } from '../../content/pages/gssc-korea';
import ElsewherePage from './ElsewherePage';

const meta: Meta<typeof ElsewherePage> = {
  title: 'Pages/Elsewhere',
  component: ElsewherePage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const GsscKorea: StoryObj<typeof ElsewherePage> = { name: 'GSSC Korea', args: { p: gsscKorea } };
