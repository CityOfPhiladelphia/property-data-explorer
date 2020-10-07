
import * as faComps from '@phila/vue-comps/src/fa.js';
import * as faMapping from '@phila/vue-mapping/src/fa.js';
// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faHandRock } from '@fortawesome/free-regular-svg-icons/faHandRock';
import { faHexagon } from '@fortawesome/pro-solid-svg-icons/faHexagon';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faLocationArrow } from '@fortawesome/pro-solid-svg-icons/faLocationArrow';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import { faMoneyCheckAlt } from '@fortawesome/pro-solid-svg-icons/faMoneyCheckAlt';
import { faWrench } from '@fortawesome/pro-solid-svg-icons/faWrench';
library.add(faWrench, faMoneyCheckAlt, faSpinner, faBars, faCircle, faDownload, faEnvelope, faHandRock, faHexagon, faInfoCircle, faLocationArrow, faPrint);

export default library;
