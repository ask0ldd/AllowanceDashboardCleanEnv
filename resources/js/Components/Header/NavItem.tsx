import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavItem({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <li className={'h-full flex justify-center items-center w-[250px] ' + (active ? 'bg-active-black rounded-[17px] text-offwhite shadow-[0_4px_8px_#5b93ec40,0_8px_16px_#5b93ec40]' : 'text-offblack')}>
            <Link className="h-full w-full flex justify-center items-center" {...props}>
                {children}
            </Link>
        </li>
    );
}
