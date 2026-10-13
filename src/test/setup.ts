import '@testing-library/jest-dom';
import { loadAllLearningContent } from '../modules/core/content/labLearningContent';
// Content coverage tests inspect every authored lesson. Production loads only
// the pack selected by the learner; tests explicitly load the full inventory.
await loadAllLearningContent();
