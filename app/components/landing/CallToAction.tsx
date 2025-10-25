import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="w-3/4 rounded-[20px] py-24 my-24 bg-[#2f2a25] text-[#f4e9d8]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands collaborating smarter. Start your first room today—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button className="cursor-pointer text-[#2f2a25] font-semibold px-8 py-5 rounded-xl bg-[#f4e9d8] hover:bg-white text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[#f4e9d8]/80">
            <CheckCircle className="w-5 h-5" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;