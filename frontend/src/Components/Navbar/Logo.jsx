import logo from "../../assets/MainLogo.jpg"

export default function Logo() {
  return (
    
      <div className="flex h-18 ml-[8%] w-1/5 mr-10  basis-[13rem]  justify-end items-center">
        <img
          src={logo}
          alt="Main-logo"
          className="h-16 w-[210px]  object-contain"
        />
      </div>
    
  );
}
