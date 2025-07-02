import { Label } from "@/components/ui/label";

interface FinalStepProps {
  done: boolean;
}

export default function FinalStep({ done }: FinalStepProps) {

  return (
    <>
      <div className="flex gap-x-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mt-2 ${done ? "bg-green-500" : "bg-gray-400"
            }`}
        >4</div>
        <div className="flex flex-col gap-2">
          <Label className="text-lg">Congratulations! 🎉</Label>
          <div className="md:flex-row">
            <Label className="text-base">You can now interact with your AI-powered financial agent on Telegram.</Label>
          </div>
        </div>
      </div >
    </>
  );
}