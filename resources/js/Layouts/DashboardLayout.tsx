import Header from "@/Components/Header/Header";
import { Head } from "@inertiajs/react";
import { PropsWithChildren, ReactNode } from "react";

export default function DashboardLayout({
    mainStyle,
    children,
}: PropsWithChildren<{ mainStyle? : string/*header?: ReactNode*/ }>) {

    return(
        <div className='bg-dash-grey w-full h-full min-h-full flex flex-col font-jost'>
            <Head title="Dashboard" />
            <Header/>
            <main className="flex flex-row justify-between gap-x-[30px]">
                {children}
            </main>
        </div>
    )
}