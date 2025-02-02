import NavItem from "./NavItem";

export default function Nav(){
    return(
        <nav>
            <ul className="text-[18px] font-semibold flex flex-row h-20 bg-component-white rounded-3xl overflow-hidden p-3 border border-solid border-dashcomponent-border gap-x-2.5">
                {/*<li className="h-full flex justify-center items-center w-[250px]">Overview</li>
                <li className="h-full flex justify-center items-center w-[250px]">New Allowance</li>*/}
                <NavItem children={"Overview"} href={route('dashboard')} active={route().current('dashboard') || route().current('editallowance') || route().current('page404')} />
                <NavItem children={"New Allowance"} href={route('newallowance')} active={route().current('newallowance')} />
            </ul>
        </nav>
    )
}