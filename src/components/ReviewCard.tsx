interface ReviewCardProps {
  name: string;
  date: string;
  rating: number;
  body: string;
}

export default function ReviewCard({ name, date, rating, body }: ReviewCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-md border-[0.5px] border-outline-variant flex flex-col hover:shadow-ambient transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-sans font-semibold text-sm text-primary">{name}</span>
        <span
          className="material-symbols-outlined text-primary-container text-[16px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          verified
        </span>
      </div>
      <p className="font-sans text-xs text-on-surface-variant mb-4">{date}</p>
      
      {/* Stars */}
      <div className="flex text-brand-gold-champagne mb-4">
        {Array.from({ length: rating }).map((_, idx) => (
          <span
            key={idx}
            className="material-symbols-outlined text-[18px] text-tertiary"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            star
          </span>
        ))}
      </div>
      
      <p className="font-sans text-sm text-on-surface-variant mb-4 flex-grow leading-relaxed">
        "{body}"
      </p>
    </div>
  );
}
