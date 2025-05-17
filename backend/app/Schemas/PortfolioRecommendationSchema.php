<?php

namespace App\Schemas;

use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Prism\Prism\Schema\ArraySchema;

class PortfolioRecommendationSchema
{
    public function __construct()
    {
        //
    }

    public static function createSchema()
    {
        $schema = new ObjectSchema(
            name: "portfolio_recommendation",
            description: "Investment portfolio recommendations based on user's current investments",
            properties: [
                new StringSchema(
                    name: "portfolio_assessment",
                    description: "Brief assessment of the user's current portfolio"
                ),
                new StringSchema(
                    name: "diversification_strategy",
                    description: "Suggested diversification strategy for the user"
                ),
                new ArraySchema(
                    name: "recommended_videos",
                    description: "Videos recommended for investment",
                    items: new ObjectSchema(
                        name: "video_recommendation",
                        description: "A single video recommendation",
                        properties: [
                            new StringSchema(
                                name: "video_id",
                                description: "ID of the recommended video"
                            ),
                            new StringSchema(
                                name: "reason",
                                description: "Reason for recommending this video"
                            )
                        ],
                        requiredFields: ["video_id", "reason"]
                    )
                )
            ],
            requiredFields: ["portfolio_assessment", "diversification_strategy", "recommended_videos"]
        );

        return $schema;
    }
}