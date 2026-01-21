import Image from "next/image";
import { cn } from "@/lib/utils";
import { techMappings } from "@/constants/interview";

interface TechIconProps {
    techStack: string[];
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
    const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
    return techMappings[key as keyof typeof techMappings];
};

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    return (
        <div className="flex flex-row">
            {techStack.slice(0, 3).map((tech, index) => {
                const normalized = normalizeTechName(tech);
                const url = normalized
                    ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
                    : null;

                return (
                    <div
                        key={tech}
                        className={cn(
                            "relative group bg-[#1a1a2e] rounded-full p-2 flex items-center justify-center border border-white/10",
                            index >= 1 && "-ml-3"
                        )}
                    >
                        <span className="absolute bottom-full mb-1 hidden group-hover:flex px-2 py-1 text-xs text-white bg-gray-700 rounded-md shadow-md whitespace-nowrap z-10">
                            {tech}
                        </span>

                        {url ? (
                            <Image
                                src={url}
                                alt={tech}
                                width={20}
                                height={20}
                                className="w-5 h-5"
                            />
                        ) : (
                            <div className="w-5 h-5 bg-purple-500/30 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-bold">
                                {tech.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            })}
            {techStack.length > 3 && (
                <div className="relative bg-[#1a1a2e] rounded-full p-2 flex items-center justify-center border border-white/10 -ml-3">
                    <span className="text-xs text-gray-400">+{techStack.length - 3}</span>
                </div>
            )}
        </div>
    );
};

export default DisplayTechIcons;
