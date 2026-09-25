interface ProgressDotsProps {
  current: number
  total: number
}

export default function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            idx === current
              ? 'bg-[#F4B860] w-3'
              : idx < current
                ? 'bg-[#F4B860] opacity-50'
                : 'bg-[#F2F2F0]/20'
          }`}
        />
      ))}
    </div>
  )
}
