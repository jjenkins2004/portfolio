import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';
import { stepper } from './stepper';
import { ticker } from './ticker';

export const pages: Record<string, ProjectPageData> = { stepper, ticker };
