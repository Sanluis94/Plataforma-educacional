import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../modules/core/constants/dashboardConstants';

describe('72 Specialized Virtual Laboratories - Mode Methodology Verification', () => {
  it('should have exactly 12 subjects configured', () => {
    expect(ALL_MODULES).toHaveLength(12);
  });

  it('should have exactly 6 specialized labs per subject (72 labs total)', () => {
    let totalLabs = 0;
    ALL_MODULES.forEach(module => {
      expect(module.labs).toBeDefined();
      expect(module.labs).toHaveLength(6);
      totalLabs += module.labs.length;
    });
    expect(totalLabs).toBe(72);
  });

  it('should have unique IDs for all 72 labs', () => {
    const labIds = new Set<string>();
    ALL_MODULES.forEach(module => {
      module.labs.forEach(lab => {
        expect(labIds.has(lab.id)).toBe(false);
        labIds.add(lab.id);
      });
    });
    expect(labIds.size).toBe(72);
  });

  it('should provide a valid mode prop and component for all 72 labs', () => {
    ALL_MODULES.forEach(module => {
      module.labs.forEach(lab => {
        expect(lab.title).toBeTruthy();
        expect(lab.component).toBeDefined();
        expect(lab.props).toBeDefined();
        expect(lab.props.mode).toBeDefined();
        expect(typeof lab.props.mode).toBe('string');
        expect(lab.props.mode.length).toBeGreaterThan(0);
      });
    });
  });

  it('should verify correct mode keys for each discipline', () => {
    const math = ALL_MODULES.find(m => m.id === 'matematica')!;
    expect(math.labs.map(l => l.props.mode)).toEqual([
      'linear', 'quadratic', 'trigonometric', 'spatial', 'statistics', 'matrices'
    ]);

    const physics = ALL_MODULES.find(m => m.id === 'fisica')!;
    expect(physics.labs.map(l => l.props.mode)).toEqual([
      'pendulum', 'collisions', 'optics', 'electromagnetism', 'thermodynamics', 'modern_physics'
    ]);

    const chemistry = ALL_MODULES.find(m => m.id === 'quimica')!;
    expect(chemistry.labs.map(l => l.props.mode)).toEqual([
      'ph_scale', 'titration', 'stoichiometry', 'organic', 'electrochemistry', 'gases'
    ]);

    const biology = ALL_MODULES.find(m => m.id === 'biologia')!;
    expect(biology.labs.map(l => l.props.mode)).toEqual([
      'microscopy', 'genetics', 'anatomy', 'ecosystems', 'evolution', 'biochemistry'
    ]);

    const portuguese = ALL_MODULES.find(m => m.id === 'portugues')!;
    expect(portuguese.labs.map(l => l.props.mode)).toEqual([
      'syntax', 'morphology', 'literature', 'figures', 'comprehension', 'phonetics'
    ]);

    const essay = ALL_MODULES.find(m => m.id === 'redacao')!;
    expect(essay.labs.map(l => l.props.mode)).toEqual([
      'structure', 'cohesion', 'intervention', 'theme_analysis', 'repertoire', 'correction'
    ]);

    const history = ALL_MODULES.find(m => m.id === 'historia')!;
    expect(history.labs.map(l => l.props.mode)).toEqual([
      'timeline', 'brazil_colony', 'industrial_rev', 'world_wars', 'greece_rome', 'cold_war'
    ]);

    const languages = ALL_MODULES.find(m => m.id === 'idiomas')!;
    expect(languages.labs.map(l => l.props.mode)).toEqual([
      'vocabulary', 'grammar', 'listening', 'idioms', 'conversation', 'false_friends'
    ]);

    const softSkills = ALL_MODULES.find(m => m.id === 'softskills')!;
    expect(softSkills.labs.map(l => l.props.mode)).toEqual([
      'communication', 'leadership', 'time_management', 'emotional_intelligence', 'conflict_resolution', 'teamwork'
    ]);

    const hardSkills = ALL_MODULES.find(m => m.id === 'hardskills')!;
    expect(hardSkills.labs.map(l => l.props.mode)).toEqual([
      'programming', 'data_structures', 'databases', 'web_dev', 'algorithms', 'networks'
    ]);

    const geography = ALL_MODULES.find(m => m.id === 'geografia')!;
    expect(geography.labs.map(l => l.props.mode)).toEqual([
      'tectonics', 'relief', 'climate', 'cartography', 'hydrography', 'biomes'
    ]);

    const philosophy = ALL_MODULES.find(m => m.id === 'filosofia')!;
    expect(philosophy.labs.map(l => l.props.mode)).toEqual([
      'ethics', 'cave_myth', 'contractualism', 'logic', 'political_philosophy', 'epistemology'
    ]);
  });
});
