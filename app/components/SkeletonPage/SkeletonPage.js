import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPage(){
    return(
        <div className="">
            <div className="">
                <div className="flex items-center space-x-4 my-6">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[525px] w-[50vw] rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[450px] rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[450px] rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[450px] rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}