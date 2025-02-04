import { IAllowance } from "@/types/IAllowance";
import { IPaginatedResponse } from "@/types/IPaginatedResponse";
import { Link, usePage } from "@inertiajs/react";

export default function Pagination({ allowances } : {allowances : IPaginatedResponse<IAllowance>}) {

    console.log(allowances)

    return (
        <div>aaaaaa
            {allowances.meta.links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || ''}
                    className={link.active ? 'active' : ''}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}