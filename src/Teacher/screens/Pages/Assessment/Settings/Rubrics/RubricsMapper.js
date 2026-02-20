// rubricPayloadMapper.js
import { RUBRIC_TYPES } from './RubricsType';

/* ------------------ helper ------------------ */
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
      return null;
  }
};

/* ------------------ main mapper ------------------ */
export function mapRubricToApiPayload(rubric) {
  const apiRubricType = normalizeRubricType(rubric.type);

  if (!apiRubricType) {
    throw new Error(`Unsupported Rubric Type: ${rubric.type}`);
  }

  const basePayload = {
    college_id: rubric.collegeId || 16,
    subject_id: rubric.subjectId || 84,
    subject_name: rubric.subjectName || '',
    rubric_name: rubric.title,
    description: rubric.description || '',
    rubric_type: apiRubricType,
    rubric_category: rubric.category || 'STANDARD',
    scoring_type: rubric.scoringType?.toUpperCase() || 'POINTS',
    total_points: rubric.totalPoints || 0
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
      throw new Error(`Unsupported Rubric Type: ${apiRubricType}`);
  }
}

/* ------------------ analytic ------------------ */
// function mapAnalyticRubric(rubric) {
//   const criteria = (rubric.criteria || []).map((c, index) => ({
//     criterion_name: c.name,
//     criterion_description: c.description || '',
//     criterion_order: index + 1,
//     weight_percentage: c.weight || 0,
//     blooms_level_ids: c.bloomsLevel || [],
//     course_outcome_ids: c.coMapping || [],
//     feedback_fields: []
//   }));

//   const performance_levels =
//     rubric.criteria?.[0]?.levels?.map((l, index) => ({
//       level_name: l.label,
//       level_order: index + 1,
//       points: l.score,
//       description: l.description || '',
//       image_url: l.image || null,
//       criterion_id: null
//     })) || [];

//   const cells = [];
//   rubric.criteria?.forEach((criterion, ci) => {
//     criterion.levels?.forEach((level, li) => {
//       cells.push({
//         criterion_id: ci + 1,
//         level_id: li + 1,
//         cell_description: level.description || '',
//         cell_image_url: level.image || null
//       });
//     });
//   });

//   return { criteria, performance_levels, cells, portfolios: [] };
// }
function mapAnalyticRubric(rubric) {
  const defaultLevels = [
    { label: 'Beginning', score: 1 },
    { label: 'Developing', score: 2 },
    { label: 'Proficient', score: 3 },
    { label: 'Exemplary', score: 4 }
  ];

  // Map criteria
  const criteria = (rubric.criteria || []).map((c, index) => ({
    criterion_name: c.name,
    criterion_description: c.description || '',
    criterion_order: index + 1,
    weight_percentage: c.weight || 0,
    blooms_level_ids: c.bloomsLevel || [],
    course_outcome_ids: c.coMapping || [],
    feedback_fields: [] // backend expects empty array
  }));

  // Map performance_levels (use rubric.levels or default)
  const levelsSource = rubric.levels && rubric.levels.length ? rubric.levels : defaultLevels;
  const performance_levels = levelsSource.map((l, index) => ({
    level_name: l.label,
    level_order: l.order || index + 1,
    points: l.score || (index + 1),
    description: l.description || '',
    image_url: l.image || null,
    criterion_id: null,
    criterion_order: null,
    blooms_level_ids: l.bloomsLevel || [],
    course_outcome_ids: l.coMapping || []
  }));

  // Map cells for each criterion × level
  const cells = [];
  criteria.forEach((criterion, ci) => {
    const criterionLevels = rubric.criteria?.[ci]?.levels?.length
      ? rubric.criteria[ci].levels
      : defaultLevels;

    criterionLevels.forEach((level, li) => {
      cells.push({
        criterion_id: null,
        criterion_order: ci + 1,
        level_id: null,
        level_order: li + 1,
        cell_description: level.description || '',
        cell_image_url: level.image || null
      });
    });
  });

  return {
    criteria,
    performance_levels,
    cells,
    portfolios: [] // backend expects empty array
  };
}



/* ------------------ holistic ------------------ */
function mapHolisticRubric(rubric) {
  return {
    criteria: [],
    performance_levels: (rubric.levels || []).map((l, index) => ({
      level_name: l.label,
      level_order: index + 1,
      points: l.score, // FIXED
      description: l.description || '',
      image_url: l.image || null,
      criterion_id: null,
      blooms_level_ids: l.bloomsLevel || [],
      course_outcome_ids: l.coMapping || []
    })),
    cells: [],
    portfolios: []
  };
}

/* ------------------ single point ------------------ */
function mapSinglePointRubric(rubric) {
  const criteria = (rubric.criteria || []).map((c, index) => ({
    criterion_name: c.name,
    criterion_description: c.standard || '',
    criterion_order: index + 1,
    weight_percentage: null,
    blooms_level_ids: c.bloomsLevel || [],
    course_outcome_ids: c.coMapping || [],
    feedback_fields: (c.feedbackFields && c.feedbackFields.length > 0
      ? c.feedbackFields
      : [{ name: 'Default Feedback', type: 'STANDARD_FEEDBACK' }]
    ).map((f, fi) => ({
      field_name: f.name || 'Default Feedback',
      field_type: f.type || 'STANDARD_FEEDBACK',
      field_order: fi + 1
    }))
  }));

  return {
    criteria,
    performance_levels: [], // backend expects empty array
    cells: [],              // backend expects empty array
    portfolios: []
  };
}


// function mapSinglePointRubric(rubric) {
//   const criteria = (rubric.criteria || []).map((c, index) => ({
//     criterion_name: c.name,
//     criterion_description: c.standard || '',
//     criterion_order: index + 1,
//     weight_percentage: null,
//     blooms_level_ids: c.bloomsLevel || [],
//     course_outcome_ids: c.coMapping || [],
//     feedback_fields: (c.feedbackFields || []).map((f, fi) => ({
//       field_name: f.name,
//       field_type: f.type,
//       field_order: fi + 1
//     }))
//   }));

//   // 🔥 Default performance levels (mandatory by BE)
//   const performance_levels = [
//     { level_name: 'Below Expectations', level_order: 1, points: 0, description: '', image_url: null, criterion_id: null },
//     { level_name: 'Meets Expectations', level_order: 2, points: 0, description: '', image_url: null, criterion_id: null },
//     { level_name: 'Above Expectations', level_order: 3, points: 0, description: '', image_url: null, criterion_id: null },
//   ];

//   // 🔥 Generate cells for each criterion × level
//   const cells = [];
//   criteria.forEach((c, ci) => {
//     performance_levels.forEach((level, li) => {
//       cells.push({
//         criterion_id: ci + 1, // order-based
//         level_id: li + 1,
//         cell_description: '', // single-point me description optional
//         cell_image_url: null
//       });
//     });
//   });

//   return {
//     criteria,
//     performance_levels,
//     cells,
//     portfolios: []
//   };
// }


/* ------------------ developmental ------------------ */
function mapDevelopmentalRubric(rubric) {
  return {
    criteria: [],
    performance_levels: [],
    cells: [],
    portfolios: (rubric.items || []).map((item, index) => ({
      portfolio_name: item.label, // FIXED
      portfolio_description: item.description || '',
      portfolio_order: index + 1,
      is_required: item.required,
      blooms_level_ids: item.bloomsLevel || [],
      course_outcome_ids: item.coMapping || []
    }))
  };
}
