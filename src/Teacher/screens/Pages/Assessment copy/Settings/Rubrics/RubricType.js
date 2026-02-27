export const RUBRIC_TYPES = {
    ANALYTIC: 'Analytic Rubric (The "Detailed" approach)',
    HOLISTIC: 'Holistic Rubric (The "Big Picture" approach)',
    SINGLE_POINT: 'Single-Point Rubric (The "Feedback" approach)',
    DEVELOPMENTAL: 'Developmental Rubric (The "Career Growth" approach)'
};



export const BLOOMS_LEVELS = [
    'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'
];

export const CO_MAPPING = [
    'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'
];

export const PO_MAPPING = [
    'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'
];


export const INITIAL_ANALYTIC_STATE = {
    title: 'New Analytic Rubric',
    type: RUBRIC_TYPES.ANALYTIC,

    scoringType: 'Points',
    includeMetadata: true,
    bloomsLevel: [],
    coMapping: [],
    poMapping: [],
    criteria: [
        {
            id: Date.now(),
            name: 'Content & Ideas',
            weight: 1,
            bloomsLevel: [],
            coMapping: [],
            poMapping: [],

            levels: [
                { id: 'al1', score: 4, label: 'Exemplary', description: 'Content is comprehensive, accurate, and persuasive.', image: null },
                { id: 'al2', score: 3, label: 'Proficient', description: 'Content is accurate and mostly persuasive.', image: null },
                { id: 'al3', score: 2, label: 'Developing', description: 'Content has some gaps or is not very persuasive.', image: null },
                { id: 'al4', score: 1, label: 'Beginning', description: 'Content is minimal or inaccurate.', image: null },
            ],
        },
    ],
};

export const INITIAL_HOLISTIC_STATE = {
    title: 'New Holistic Rubric',
    type: RUBRIC_TYPES.HOLISTIC,

    scoringType: 'Points',
    includeMetadata: true,
    bloomsLevel: [],
    coMapping: [],
    poMapping: [],
    levels: [

        { id: 'hl1', score: 4, label: 'Excellent', description: 'Demonstrates deep understanding and mastery of all concepts.', image: null },
        { id: 'hl2', score: 3, label: 'Good', description: 'Demonstrates good understanding with minor errors.', image: null },
        { id: 'hl3', score: 2, label: 'Fair', description: 'Demonstrates basic understanding but has significant gaps.', image: null },
        { id: 'hl4', score: 1, label: 'Poor', description: 'Little to no understanding demonstrated.', image: null },
    ],
};

export const INITIAL_SINGLE_POINT_STATE = {
    title: 'New Single-Point Rubric',
    type: RUBRIC_TYPES.SINGLE_POINT,

    scoringType: 'Points',
    includeMetadata: true,
    bloomsLevel: [],
    coMapping: [],
    criteria: [
        {
            id: Date.now(),
            name: 'Research Quality',
            standard: 'Sources are credible, relevant, and properly cited.',
            weight: 10,
            bloomsLevel: [],
            coMapping: [],
            poMapping: []
        },
    ],
};


export const INITIAL_DEVELOPMENTAL_STATE = {
    title: 'New Developmental Rubric',
    type: RUBRIC_TYPES.DEVELOPMENTAL,

    scoringType: 'Points',
    includeMetadata: true,
    bloomsLevel: [],
    coMapping: [],
    poMapping: [],
    items: [
        { id: Date.now(), label: 'Project includes a title page.', required: true, points: 10, bloomsLevel: [], coMapping: [], poMapping: [] },
        { id: Date.now() + 1, label: 'All sections are properly headed.', required: true, points: 10, bloomsLevel: [], coMapping: [], poMapping: [] },
        { id: Date.now() + 2, label: 'Bibliography is formatted correctly.', required: true, points: 10, bloomsLevel: [], coMapping: [], poMapping: [] }
    ]
};





export const SAMPLE_RUBRICS = [
    {
        id: 101,
        title: 'Final Project Presentation',
        type: RUBRIC_TYPES.ANALYTIC,
        bloomsLevel: 'Create',
        coMapping: ['CO1', 'CO3', 'CO6'],
        criteria: [
            {
                id: 1,
                name: 'Technical Content',
                weight: 1,
                levels: [
                    { id: 11, score: 10, label: 'Excellent', description: 'Deep understanding of technical concepts, zero errors.' },
                    { id: 12, score: 7, label: 'Good', description: 'Good understanding, minor technical errors.' },
                    { id: 13, score: 5, label: 'Average', description: 'Basic understanding, significant errors present.' },
                    { id: 14, score: 2, label: 'Poor', description: 'Lacks technical depth and accuracy.' }
                ]
            },
            {
                id: 2,
                name: 'Communication Skill',
                weight: 1,
                levels: [
                    { id: 21, score: 5, label: 'Professional', description: 'Clear, confident, and professional delivery.' },
                    { id: 22, score: 3, label: 'Adequate', description: 'Mostly clear, but lacks confidence or polish.' },
                    { id: 23, score: 1, label: 'Needs Improvement', description: 'Unclear delivery, poor body language.' }
                ]
            }
        ]
    },
    {
        id: 102,
        title: 'Lab Exercise: Sorting Algorithms',
        type: RUBRIC_TYPES.HOLISTIC,
        bloomsLevel: 'Analyze',
        coMapping: ['CO2', 'CO4'],
        levels: [
            { id: 101, score: 10, label: 'Expert', description: 'Code is efficient (O(n log n)), clean, well-commented, and passes all edge cases.' },
            { id: 102, score: 8, label: 'Proficient', description: 'Code works correctly but may not be fully optimized or lacks some comments.' },
            { id: 103, score: 5, label: 'Developing', description: 'Code works for basic inputs but fails edge cases or is inefficient (O(n^2)).' },
            { id: 104, score: 2, label: 'Novice', description: 'Code does not compile or produce correct results.' }
        ]
    },
    {
        id: 103,
        title: 'Research Paper Review',
        type: RUBRIC_TYPES.SINGLE_POINT,
        bloomsLevel: 'Evaluate',
        coMapping: ['CO5'],
        criteria: [
            { id: 301, name: 'Literature Review', standard: 'Critically analyzes previous work and identifies gaps effectively.' },
            { id: 302, name: 'Methodology', standard: 'Methodology is sound, reproducible, and appropriate for the problem.' },
            { id: 303, name: 'Results Analysis', standard: 'Results are interpreted correctly with statistical significance.' }
        ]
    },
    {
        id: 104,
        title: 'Safety Procedures Portfolio',
        type: RUBRIC_TYPES.DEVELOPMENTAL,
        bloomsLevel: 'Remember',
        coMapping: ['CO1'],
        items: [
            { id: 401, label: 'Wearing protective eyewear', required: true },
            { id: 402, label: 'Workstation is clean and organized', required: true },
            { id: 403, label: 'Equipment turned off after use', required: true }
        ]
    },

];
