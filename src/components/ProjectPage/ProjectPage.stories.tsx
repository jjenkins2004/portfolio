import type { Meta, StoryObj } from '@storybook/react-vite';
import { clipirl } from '../../content/pages/clipirl';
import { knowledgehub } from '../../content/pages/knowledgehub';
import { stepper } from '../../content/pages/stepper';
import { ticker } from '../../content/pages/ticker';
import ProjectPage from './ProjectPage';

const meta: Meta<typeof ProjectPage> = {
  title: 'Pages/Project',
  component: ProjectPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Stepper: StoryObj<typeof ProjectPage> = { args: { p: stepper } };

export const Ticker: StoryObj<typeof ProjectPage> = { args: { p: ticker } };

export const KnowledgeHub: StoryObj<typeof ProjectPage> = { args: { p: knowledgehub } };

export const ClipIRL: StoryObj<typeof ProjectPage> = { args: { p: clipirl } };
