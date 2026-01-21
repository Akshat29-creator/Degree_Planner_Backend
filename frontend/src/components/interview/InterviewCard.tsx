"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/interview.action";
import DisplayTechIcons from "./DisplayTechIcons";

interface InterviewCardProps {
    interviewId?: string;
    odId?: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt?: string;
}

interface Feedback {
    totalScore: number;
    finalAssessment: string;
    createdAt: string;
}

const InterviewCard = ({
    interviewId,
    odId,
    role,
    type,
    techstack,
    createdAt,
}: InterviewCardProps) => {
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        async function fetchFeedback() {
            if (!odId || !interviewId) return;

            const result = await getFeedbackByInterviewId({
                interviewId,
                odId,
            });

            if (result) {
                setFeedback(result as Feedback);
            }
        }

        fetchFeedback();
    }, [odId, interviewId]);

    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    const badgeColor =
        {
            Behavioral: "bg-blue-500/20 text-blue-300",
            Mixed: "bg-purple-500/20 text-purple-300",
            Technical: "bg-teal-500/20 text-teal-300",
        }[normalizedType] || "bg-gray-500/20 text-gray-300";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");

    return (
        <div className="interview-card-border w-[360px] max-sm:w-full min-h-96">
            <div className="interview-card">
                <div>
                    {/* Type Badge */}
                    <div
                        className={cn(
                            "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg font-medium text-sm",
                            badgeColor
                        )}
                    >
                        {normalizedType}
                    </div>

                    {/* Cover Image */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
                        <Image
                            src="/interview/ai-avatar.png"
                            alt="Interview"
                            width={50}
                            height={50}
                            className="object-cover"
                        />
                    </div>

                    {/* Interview Role */}
                    <h3 className="mt-5 text-xl font-semibold text-white capitalize">
                        {role} Interview
                    </h3>

                    {/* Date & Score */}
                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2 items-center">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="text-gray-400 text-sm">{formattedDate}</p>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            <svg
                                className="w-5 h-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm">
                                {feedback?.totalScore || "---"}/100
                            </p>
                        </div>
                    </div>

                    {/* Feedback or Placeholder Text */}
                    <p className="line-clamp-2 mt-5 text-gray-400 text-sm">
                        {feedback?.finalAssessment ||
                            "You haven't taken this interview yet. Take it now to improve your skills."}
                    </p>
                </div>

                <div className="flex flex-row justify-between items-end mt-6">
                    <DisplayTechIcons techStack={techstack} />

                    <Link
                        href={
                            feedback
                                ? `/interview/${interviewId}/feedback`
                                : `/interview/${interviewId}`
                        }
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-full transition-colors"
                    >
                        {feedback ? "View Feedback" : "Start Interview"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;
