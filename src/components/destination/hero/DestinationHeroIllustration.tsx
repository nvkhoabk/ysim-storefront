import Image from "next/image";

export function DestinationHeroIllustration() {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/images/hero/hero-destination.png"
        alt="Khám phá điểm đến eSIM trên toàn thế giới"
        fill
        priority
        sizes="(max-width:1024px) 100vw, 50vw"
        className="object-contain object-bottom"
      />
    </div>
  );
}