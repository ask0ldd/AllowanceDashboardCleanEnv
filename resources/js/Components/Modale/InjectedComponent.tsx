import { ReactNode } from "react";

export default function InjectedComponent({child} : {child : ReactNode}){
    return(
        <div className="my-auto p-[20px] flex flex-col gap-y-[35px] w-full">
            {child}
        </div>
    )
}