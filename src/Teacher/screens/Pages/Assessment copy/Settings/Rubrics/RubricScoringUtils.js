/**
 * Calculates the final total score for a rubric assessment question.
 * 
 * Formula for each criteria:
 * Criteria Score = totalMarks * (criteriaWeight / 100) * (selectedLevelPercentage / 100)
 * 
 * @param {number} totalMarks - The maximum marks for the question.
 * @param {Array<{criteriaWeight: number, selectedLevelPercentage: number}>} criteriaList - List of criteria with weights and selected levels.
 * @returns {number} The final total score rounded to 2 decimal places.
 * @throws {Error} If the total weight of criteria does not equal 100%.
 */
export const calculateRubricScore = (totalMarks, criteriaList) => {
    // 1. Validate Total Weight
    const totalWeight = criteriaList.reduce((sum, item) => sum + item.criteriaWeight, 0);

    // Allow small floating point error tolerance
    if (Math.abs(totalWeight - 100) > 0.01) {
        throw new Error(`Total criteria weight must be 100%. Current total: ${totalWeight}%`);
    }

    // 2. Calculate Score per Criteria
    let finalScore = 0;

    criteriaList.forEach(criteria => {
        const criteriaScore = totalMarks * (criteria.criteriaWeight / 100) * (criteria.selectedLevelPercentage / 100);
        finalScore += criteriaScore;
    });

    // 3. Return rounded score
    return parseFloat(finalScore.toFixed(2));
};

// Test function meant to be called manually or via a separate test runner if needed.
export const testRubricScore = () => {
    try {
        const totalMarks = 10;
        const criteriaList = [
            { criteriaWeight: 50, selectedLevelPercentage: 75 },  // 10 * 0.5 * 0.75 = 3.75
            { criteriaWeight: 30, selectedLevelPercentage: 100 }, // 10 * 0.3 * 1.0 = 3.00
            { criteriaWeight: 20, selectedLevelPercentage: 50 }   // 10 * 0.2 * 0.5 = 1.00
        ];

        console.log("Running Test Case...");
        console.log(`Total Marks: ${totalMarks}`);
        console.log("Criteria List:", criteriaList);

        const result = calculateRubricScore(totalMarks, criteriaList);
        console.log(`Calculated Final Score: ${result}`);

        const expected = 7.75;
        if (result === expected) {
            console.log("✅ Test Passed!");
            return true;
        } else {
            console.error(`❌ Test Failed! Expected ${expected}, but got ${result}`);
            return false;
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
};
