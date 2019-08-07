
import * as faComps from '@philly/vue-comps/src/fa.js';
import * as faMapping from '@philly/vue-mapping/src/fa.js';

// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons/faCaretDown';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons/faCaretUp';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons/faMapMarkerAlt';
import { faCircle } from '@fortawesome/pro-solid-svg-icons/faCircle';
import { faInfoCircle } from '@fortawesome/pro-solid-svg-icons/faInfoCircle';
library.add(faSpinner, faBars, faCaretDown, faCaretUp, faMapMarkerAlt, faCircle, faInfoCircle);

export default library;
