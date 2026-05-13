import { Button as BitButton } from "@/components/ui/8bit/button";

interface BottomActionBarProps {
  isBoard: boolean;
  onOpenBoard: () => void;
  onOpenMain: () => void;
}

export function BottomActionBar({
  isBoard,
  onOpenBoard,
  onOpenMain,
}: BottomActionBarProps) {
  return (
    <nav className="w-full max-w-[1448px] mt-2 grid grid-cols-2 gap-2" aria-label="bottom navigation">
      <BitButton
        type="button"
        font="retro"
        className={`w-full h-14 text-white rounded-none ${isBoard ? "bg-[#3f8cae]" : "bg-[#4f912b]"}`}
        onClick={isBoard ? onOpenMain : onOpenBoard}
      >
        {isBoard ? "메인으로" : "게시판으로"}
      </BitButton>
      <BitButton
        type="button"
        font="retro"
        className="w-full h-14 bg-[#8a5ca9] text-white rounded-none"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        상단 이동
      </BitButton>
    </nav>
  );
}
