import Schemev2 from "../models/scheme.model.js";
import User from "../models/user.model.js";

const schemePublicFilter = () => ({
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
});

export const generateRecommendations = async (userId, options) => {
    try {
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw new Error('User not found');
        }

        const query = { $and: [schemePublicFilter()] };

        if (userProfile.state) {
            query.$and.push({ state: userProfile.state });
        }

        if (userProfile.interests && userProfile.interests.length > 0) {
            query.$and.push({
                schemeCategory: { $in: userProfile.interests },
            });
        }

        const paginationOptions = {
            page: options.page || 1,
            limit: options.limit || 9,
            sort: { createdAt: -1 },
            lean: true,
            select: 'schemeName schemeShortTitle state level nodalMinistryName schemeCategory tags detailedDescription_md'
        };

        let recommendations = await Schemev2.paginate(query, paginationOptions);

        // If no recommendations found with filters, return random 9 schemes
        if (!recommendations.docs.length) {
            console.log('No recommendations found with filters. Returning random 9 schemes...');
            const randomSchemes = await Schemev2.aggregate([
                { $match: schemePublicFilter() },
                { $sample: { size: 9 } },
                {
                    $project: {
                        schemeName: 1,
                        schemeShortTitle: 1,
                        state: 1,
                        level: 1,
                        nodalMinistryName: 1,
                        schemeCategory: 1,
                        tags: 1,
                        detailedDescription_md: 1
                    }
                }
            ]);

            return {
                schemes: randomSchemes,
                totalPages: 1,
                currentPage: 1,
                totalSchemes: 9,
                hasNextPage: false,
                hasPrevPage: false
            };
        }

        return {
            schemes: recommendations.docs,
            totalPages: recommendations.totalPages,
            currentPage: recommendations.page,
            totalSchemes: recommendations.totalDocs,
            hasNextPage: recommendations.hasNextPage,
            hasPrevPage: recommendations.hasPrevPage
        };

    } catch (error) {
        console.error('Error generating recommendations:', error.stack);
        throw new Error('Could not generate recommendations: ' + error.message);
    }
};
