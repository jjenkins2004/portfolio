import type { Meta, StoryObj } from '@storybook/react-vite';
import { stepper } from '../../content/pages/stepper';
import ProjectPage from './ProjectPage';

const meta: Meta<typeof ProjectPage> = {
  title: 'Pages/Project',
  component: ProjectPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Stepper: StoryObj<typeof ProjectPage> = { args: { p: stepper } };
