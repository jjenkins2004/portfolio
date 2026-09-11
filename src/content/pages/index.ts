import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';
import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';
import { clipirl } from './clipirl';
import { handshake } from './handshake';
import { knowledgehub } from './knowledgehub';
import { memoir } from './memoir';
import { recallia } from './recallia';
import { silky } from './silky';
import { stepper } from './stepper';
import { ticker } from './ticker';
import { tuCrete } from './tu-crete';

export const pages: Record<string, ProjectPageData> = { stepper, ticker, knowledgehub, clipirl };

export const experiencePages: Record<string, ExperiencePageData> = { handshake, recallia, silky, 'tu-crete': tuCrete, memoir };
