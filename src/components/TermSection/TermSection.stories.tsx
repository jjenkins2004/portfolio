import type { Meta, StoryObj } from '@storybook/react-vite';
import { elsewhere } from '../../content/elsewhere';
import { experience } from '../../content/experience';
import { projects } from '../../content/projects';
import TermSection from './TermSection';

const meta: Meta<typeof TermSection> = {
  title: 'Sections/TermSection',
  component: TermSection,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof TermSection>;

export const Projects: Story = { args: { dir: 'projects', items: projects } };
export const Experience: Story = { args: { dir: 'experience', items: experience } };
export const Elsewhere: Story = { args: { dir: 'elsewhere', items: elsewhere } };
