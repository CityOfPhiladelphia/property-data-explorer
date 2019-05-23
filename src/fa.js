
import * as faComps from '@philly/vue-comps/src/fa.js';
import * as faMapping from '@philly/vue-mapping/src/fa.js';

// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons/faCaretDown';
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons/faCaretUp';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons/faMapMarkerAlt';
library.add(faSpinner, faCaretDown, faCaretUp, faMapMarkerAlt);

export default library;
