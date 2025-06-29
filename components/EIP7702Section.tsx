import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";

export default function EIP7702Section() {

  return (
    <div className="w-full py-4 text-sm items-center text-muted-foreground">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl font-bold">EIP-7702 Work in Progress!</h2>
            <Separator />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <h2 className='mt-[4px] text-lg text-muted-foreground'>
              EIP-7702 is not yet supported on most mainnets or testnets.
              This feature is under active development and will be available once ecosystem support improves.
            </h2>
            <h2 className="text-xl mt-4">Benefit of using EIP-7702</h2>
            <h2 className='text-lg text-muted-foreground'>
              With EIP-7702 and MetaMask Delegation, it will be possible to manage a user's funds securely and flexibly, without needing to move assets between wallets.
            </h2>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Notify Me</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
