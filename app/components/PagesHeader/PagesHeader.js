export default function PagesHeader(props){
    return(
        <div className="mb-6">
            <h1 className="text-2xl font-semibold">{props.header}</h1>
            <h2 className="font-regular text-gray-500">{props.subheader}</h2>
        </div>
    )
}