interface GreetingCardProps {
  name: string;
  streak: number;
}

export default function GreetingCard({ name, streak }: GreetingCardProps) {
  return (
    <div className="glass-strong mx-5 p-5">
      <div className="relative z-10">
        <p className="text-lg text-white/80">
          👋 Доброе утро,{" "}
          <span className="font-semibold text-white">{name}!</span>
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
          <span className="text-orange-400">🔥</span>
          <span>С вами {streak} дней подряд</span>
          <div className="ml-auto flex items-center gap-1">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-orange-400"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
