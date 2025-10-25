'use client';

import { Brain, Users, BookOpen, Zap } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Create & Join Rooms",
      description: "Instantly set up group discussion rooms for learning topics. Invite peers and start collaborating in seconds.",
    },
    {
      icon: Brain,
      title: "Real-Time AI Doubt Solver",
      description: "AI joins as a participant—speaks solutions aloud, listens to queries, and helps everyone in the room simultaneously.",
    },
    {
      icon: BookOpen,
      title: "Auto-Generated Notes",
      description: "Conversations are analyzed on-the-fly to create concise, shareable notes. No data stored post-session for privacy.",
    },
    {
      icon: Zap,
      title: "Interactive Quizzes",
      description: "End sessions with topic-based quizzes to reinforce learning. Track progress and identify knowledge gaps.",
    },
  ];

  return (
    <section className="w-full py-24 bg-gradient-to-b from-[#f8f6f3] to-[#f0ece7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#2f2a25] mb-4">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built for group discussions with AI assistance, ensuring productive, private, and engaging sessions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/30 backdrop-blur-lg rounded-2xl p-6 sm:p-8  transition-all duration-300 border border-[#f4e9d8]/20 hover:border-[#f4e9d8]/50"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#2f2a25]/90 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(244,233,216,0.5)] transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-[#f4e9d8] group-hover:animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2f2a25] mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;