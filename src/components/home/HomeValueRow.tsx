import { PackageAssistant } from "./PackageAssistant";
import { WhyYSim } from "./WhyYSim";

export function HomeValueRow() {
  return (
    <section className="bg-white px-5 pt-0 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-stretch gap-3 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <PackageAssistant />
        <WhyYSim />
      </div>
    </section>
  );
}
