import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home } from './Home';

const meta = {
  title: 'Sections/Home',
  component: Home,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The run plays once on mount; remount (toolbar theme toggle, or reselect the story) to replay. */
export const Default: Story = {};
