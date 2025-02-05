import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavItem({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <li className={'h-full flex justify-center items-center w-[250px] rounded-[17px] hover:border-[3px] hover:border-solid hover:shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] ' + (active ? 'bg-orange-gradient rounded-[17px] text-offwhite shadow-[0_2px_4px_#5B93EC40,0_4px_8px_#5B93EC40] border-[3px] border-solid border-offwhite hover:border-offwhite hover:saturate-50' : 'text-offblack hover:border-offblack')}> {/*43484C shadow-[0_4px_8px_#F7644140]*/}
            <Link className="h-full w-full flex justify-center items-center" {...props}>
                {children}
            </Link>
        </li>
    );
}
