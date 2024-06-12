import React from "react";
import { useUser } from "@/context/UserContext";

function Sidebar() {
  const { totalUsers, user } = useUser();
  const colorSchemes = [
    { bgColor: 'bg-green-300', textColor: 'text-green-700' },
    { bgColor: 'bg-red-300', textColor: 'text-red-700' },
    { bgColor: 'bg-blue-300', textColor: 'text-blue-700' },
    { bgColor: 'bg-yellow-300', textColor: 'text-yellow-700' },
    { bgColor: 'bg-purple-300', textColor: 'text-purple-700' },
    { bgColor: 'bg-pink-300', textColor: 'text-pink-700' },
    { bgColor: 'bg-indigo-300', textColor: 'text-indigo-700' },
    { bgColor: 'bg-teal-300', textColor: 'text-teal-700' },
    { bgColor: 'bg-orange-300', textColor: 'text-orange-700' },
    { bgColor: 'bg-gray-300', textColor: 'text-gray-700' },
    { bgColor: 'bg-lime-300', textColor: 'text-lime-700' },
    { bgColor: 'bg-emerald-300', textColor: 'text-emerald-700' },
    { bgColor: 'bg-rose-300', textColor: 'text-rose-700' },
    { bgColor: 'bg-cyan-300', textColor: 'text-cyan-700' },
    { bgColor: 'bg-amber-300', textColor: 'text-amber-700' },
    { bgColor: 'bg-fuchsia-300', textColor: 'text-fuchsia-700' },
    { bgColor: 'bg-violet-300', textColor: 'text-violet-700' },
    { bgColor: 'bg-sky-300', textColor: 'text-sky-700' },
    { bgColor: 'bg-yellow-300', textColor: 'text-yellow-700' },
    { bgColor: 'bg-lime-300', textColor: 'text-lime-700' }
  ];
  
  const getRandomColorScheme = (ind:number) => {
    const randomIndex = Math.floor(ind % colorSchemes.length);
    return colorSchemes[randomIndex];
  };
  return (
    <aside
      className={`p-4  h-[100dvh]  opacity-100 bg-[white] w-[255px]  relative z-20  overflow-y-scroll`}
      style={{
        transition: "transform 0.9s ease",
        boxShadow:
          "10px 20px 45px -1px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 className="uppercase text-blue-600 font-semibold pb-3 text-lg">Users</h3>
      <ul
        className=" space-y-3  text-slate-800 text-xs md:text-base"
        style={{ fontFamily: "'Source Sans', sans-serif" }}
      >
        <li></li>
        {totalUsers.map((usr, ind) => {
        const { bgColor, textColor } = getRandomColorScheme(ind);
        return (
            <li
            key={ind}
            className={`${bgColor} ${textColor} hover:scale-105 flex justify-start items-center gap-3 cursor-pointer rounded-2xl category p-2 px-3 transform transition-transform ease-in duration-200`}
            >
            <p className="">{usr.name} {user && user.userID === usr.userID && "(You)"}</p>
            </li>
            );
        })}
      </ul>
    </aside>
  );
}

export default Sidebar;
