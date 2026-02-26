import { RUBRIC_TYPES } from './RubricType';

const normalizeRubricType = (type) => {
  switch (type) {
    case RUBRIC_TYPES.ANALYTIC:
      return 'ANALYTIC';
    case RUBRIC_TYPES.HOLISTIC:
      return 'HOLISTIC';
    case RUBRIC_TYPES.SINGLE_POINT:
      return 'SINGLE_POINT';
    case RUBRIC_TYPES.DEVELOPMENTAL:
      return 'DEVELOPMENTAL';
    default:
      return type;
  }
};

export function mapRubricToApiPayload(rubric) {
  const apiRubricType = normalizeRubricType(rubric.type);

  const basePayload = {
    college_id: rubric.collegeId || rubric.college_id,
    subject_id: rubric.subjectId || rubric.subject_id || null,
    subject_name: rubric.subjectName || rubric.subject_name || '',
    rubric_name: rubric.title || rubric.rubric_name,
    description: rubric.description || '',
    rubric_type: apiRubricType,
    rubric_category: rubric.category || rubric.rubric_category || 'STANDARD',
    scoring_type: (rubric.scoringType || rubric.scoring_type || 'POINTS').toUpperCase(),
    total_points: rubric.totalPoints || rubric.total_points || 0
  };

  switch (apiRubricType) {
    case 'ANALYTIC':
      return { ...basePayload, ...mapAnalyticRubric(rubric) };
    case 'HOLISTIC':
      return { ...basePayload, ...mapHolisticRubric(rubric) };
    case 'SINGLE_POINT':
      return { ...basePayload, ...mapSinglePointRubric(rubric) };
    case 'DEVELOPMENTAL':
      return { ...basePayload, ...mapDevelopmentalRubric(rubric) };
    default:
      return basePayload;
  }
}

// Helper: check if an id is a real server-assigned numeric ID (not a local timestamp id)
// Timestamps are > 1_000_000_000_000 (13 digits), server IDs are typically small integers
const isServerId = (id) => typeof id === 'number' && id < 1_000_000_000_000;

function mapAnalyticRubric(rubric) {
  // Map criteria — include criterion_id when editing (server-assigned numeric IDs)
  const criteria = (rubric.criteria || []).map((c, index) => {
    const criterionId = c.id || c.criterion_id;
    const entry = {
      criterion_name: c.name || c.criterion_name,
      criterion_description: c.description || c.criterion_description || '',
      criterion_order: index + 1,
      weight_percentage: c.weight || c.weight_percentage || 0,
      blooms_level_ids: c.bloomsLevel || c.blooms_level_ids || [],
      course_outcome_ids: c.coMapping || c.course_outcome_ids || [],
      feedback_fields: []
    };
    // ✅ Include criterion_id only for edit (real server IDs are small integers)
    if (isServerId(criterionId)) entry.criterion_id = criterionId;
    return entry;
  });

  const performance_levels = [];
  const cells = [];

  (rubric.criteria || []).forEach((c, ci) => {
    const criterionOrder = ci + 1;
    const criterionId = c.id || c.criterion_id;

    (c.levels || []).forEach((l, li) => {
      const levelOrder = li + 1;
      const levelId = l.id || l.level_id;

      // ✅ performance_levels — include criterion_id + level_id for edit
      const perfLevel = {
        level_name: l.label || l.level_name,
        level_order: levelOrder,
        points: l.score ?? l.points ?? 0,
        description: l.description || '',
        image_url: l.image || l.image_url || null,
        criterion_id: isServerId(criterionId) ? criterionId : null,
        criterion_order: criterionOrder,
        blooms_level_ids: l.bloomsLevel || l.blooms_level_ids || [],
        course_outcome_ids: l.coMapping || l.course_outcome_ids || []
      };
      if (isServerId(levelId)) perfLevel.level_id = levelId;
      performance_levels.push(perfLevel);

      // ✅ cells — include criterion_id + level_id for edit
      const cell = {
        criterion_id: isServerId(criterionId) ? criterionId : null,
        criterion_order: criterionOrder,
        level_id: isServerId(levelId) ? levelId : null,
        level_order: levelOrder,
        cell_description: l.description || l.cell_description || '',
        cell_image_url: l.image || l.cell_image_url || null
      };
      cells.push(cell);
    });
  });

  return {
    criteria,
    performance_levels,
    cells,
    portfolios: []
  };
}

function mapHolisticRubric(rubric) {
  return {
    criteria: [],
    performance_levels: (rubric.levels || rubric.performance_levels || []).map((l, index) => ({
      level_name: l.label || l.level_name,
      level_order: index + 1,
      points: l.score || l.points || 0,
      description: l.description || '',
      image_url: l.image || l.image_url || null,
      criterion_id: null,
      blooms_level_ids: l.bloomsLevel || l.blooms_level_ids || [],
      course_outcome_ids: l.coMapping || l.course_outcome_ids || []
    })),
    cells: [],
    portfolios: []
  };
}

function mapSinglePointRubric(rubric) {
  const criteria = (rubric.criteria || []).map((c, index) => ({
    criterion_name: c.name || c.criterion_name,
    criterion_description: c.standard || c.criterion_description || '',
    criterion_order: index + 1,
    weight_percentage: c.weight || c.weight_percentage || null,
    blooms_level_ids: c.bloomsLevel || c.blooms_level_ids || [],
    course_outcome_ids: c.coMapping || c.course_outcome_ids || [],
    feedback_fields: (c.feedbackFields || c.feedback_fields || [
      { field_name: 'Strengths', field_type: 'STANDARD_FEEDBACK' },
      { field_name: 'Areas for Improvement', field_type: 'CUSTOM_FEEDBACK' }
    ]).map((f, fi) => ({
      field_name: f.name || f.field_name,
      field_type: f.type || f.field_type || 'STANDARD_FEEDBACK',
      field_order: fi + 1
    }))
  }));

  return {
    criteria,
    performance_levels: [],
    cells: [],
    portfolios: []
  };
}

function mapDevelopmentalRubric(rubric) {
  return {
    criteria: [],
    performance_levels: [],
    cells: [],
    portfolios: (rubric.items || rubric.portfolios || []).map((item, index) => ({
      portfolio_name: item.label || item.portfolio_name,
      portfolio_description: item.description || item.portfolio_description || '',
      portfolio_order: index + 1,
      is_required: item.required ?? item.is_required ?? true,
      points: item.points || 0,
      blooms_level_ids: item.bloomsLevel || item.blooms_level_ids || [],
      course_outcome_ids: item.coMapping || item.course_outcome_ids || []
    }))
  };
}
