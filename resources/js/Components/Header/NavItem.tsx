import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavItem({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <li className={'h-full flex justify-center items-center w-[250px] ' + (active ? 'bg-orange-gradient rounded-[17px] text-offwhite shadow-[0_4px_8px_#F7644140] border-[3px] border-solid border-[#43484C]' : 'text-offblack')}>
            <Link className="h-full w-full flex justify-center items-center" {...props}>
                {children}
            </Link>
        </li>
    );
}
