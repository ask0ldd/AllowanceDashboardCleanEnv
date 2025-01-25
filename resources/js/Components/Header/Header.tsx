import InfoPanel from "./InfoPanel";
import Nav from "./Nav";

export default function Header(){
    return (
        <header className="flex flex-row justify-between py-5">
            <Nav />
            <InfoPanel/>
        </header>
    )
}