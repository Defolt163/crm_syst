import { Progress } from "@/components/ui/progress";

export default function ReportProgress(props){
    return(
        <div className="w-1/4 mt-4">
            <div className="flex items-center">
                <h2 className="text-3xl font-semibold mr-6">{props.percentProgress != NaN ? props.percentProgress : "Загрузка"}%</h2>
                <Progress className={'h-4'} value={props.percentProgress != NaN ? props.percentProgress : 0}/>
            </div>
            <h3 className="text-gray-700">В срок завершенных задач</h3>
        </div>
    )
}