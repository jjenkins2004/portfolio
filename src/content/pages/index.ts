import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';
import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';
import { clipirl } from './clipirl';
import { handshake } from './handshake';
import { knowledgehub } from './knowledgehub';
import { recallia } from './recallia';
import { stepper } from './stepper';
import { ticker } from './ticker';

export const pages: Record<string, ProjectPageData> = { stepper, ticker, knowledgehub, clipirl };

export const experiencePages: Record<string, ExperiencePageData> = { handshake, recallia };
