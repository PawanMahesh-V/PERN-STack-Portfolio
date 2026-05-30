/**
 * Centralised Font Awesome icon library.
 * Import this file ONCE in main.jsx so icons are registered app-wide.
 */
import { library } from '@fortawesome/fontawesome-svg-core';

// ── Solid ──────────────────────────────────────────────────
import {
  faHouse, faUser, faBriefcase, faFolderOpen, faCertificate,
  faEnvelope, faGear, faTableCells, faPlus, faPencil, faTrash,
  faEye, faEyeSlash, faBars, faXmark, faChevronLeft, faChevronRight,
  faChevronUp, faChevronDown, faArrowUpRightFromSquare, faDownload,
  faUpload, faImage, faFilePdf, faCheck, faCircleCheck, faCircleXmark,
  faSpinner, faLock, faUnlock, faShieldHalved, faStar, faLocationDot,
  faPhone, faPaperPlane, faCode, faServer, faDatabase, faMagnifyingGlass,
  faArrowLeft, faArrowRight, faBolt, faLayerGroup, faToggleOn, faToggleOff,
  faClockRotateLeft, faInbox, faReply, faCircleDot, faInfo, faTriangleExclamation,
  faCloud, faHandshake, faRocket, faLightbulb, faSun, faMoon, faGripVertical,
  faBuilding, faBars as faBarsIcon, faSliders,
} from '@fortawesome/free-solid-svg-icons';

// ── Brands ─────────────────────────────────────────────────
import {
  faGithub, faLinkedin, faTwitter, faReact, faNodeJs, faPython,
  faJs, faHtml5, faCss3Alt, faDocker, faAws, faFigma,
} from '@fortawesome/free-brands-svg-icons';

// ── Regular ────────────────────────────────────────────────
import {
  faEnvelope as faEnvelopeReg,
  faCalendar, faClock, faBookmark, faCircle,
} from '@fortawesome/free-regular-svg-icons';

library.add(
  // Solid
  faHouse, faUser, faBriefcase, faFolderOpen, faCertificate,
  faEnvelope, faGear, faTableCells, faPlus, faPencil, faTrash,
  faEye, faEyeSlash, faBars, faXmark, faChevronLeft, faChevronRight,
  faChevronUp, faChevronDown, faArrowUpRightFromSquare, faDownload,
  faUpload, faImage, faFilePdf, faCheck, faCircleCheck, faCircleXmark,
  faSpinner, faLock, faUnlock, faShieldHalved, faStar, faLocationDot,
  faPhone, faPaperPlane, faCode, faServer, faDatabase, faMagnifyingGlass,
  faArrowLeft, faArrowRight, faBolt, faLayerGroup, faToggleOn, faToggleOff,
  faClockRotateLeft, faInbox, faReply, faCircleDot, faInfo, faTriangleExclamation,
  faCloud, faHandshake, faRocket, faLightbulb, faSun, faMoon, faGripVertical,
  faBuilding, faBarsIcon, faSliders,
  // Brands
  faGithub, faLinkedin, faTwitter, faReact, faNodeJs, faPython,
  faJs, faHtml5, faCss3Alt, faDocker, faAws, faFigma,
  // Regular
  faEnvelopeReg, faCalendar, faClock, faBookmark, faCircle,
);
