import Logo from "./Logo";
import Login from "./Login";
import Menu from "./Menu"


export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full h-25 bg-white shadow-sm z-50 flex  gap-6  items-center border-b-2 border-gray-100">
      <Logo />
      <Menu/>
      <Login />
    </header>
  );
}
