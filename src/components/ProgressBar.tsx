interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = (current / (total - 1)) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#1A1A1D] z-30">
      <div
        className="h-full bg-[#F4B860] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
